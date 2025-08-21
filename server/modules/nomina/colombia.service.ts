import { db } from "../../db";
import { employees, historialContratos, prestacionesSociales, novedadesNomina, parametrosLegales, calendarioPagos } from "@shared/schema";
import { eq, and, gte, lte, desc } from "drizzle-orm";
import type { InsertEmployee, Employee, HistorialContrato, PrestacionesSociales, NovedadNomina, ParametrosLegales } from "@shared/schema";

export class ColombiaService {
  // ========== GESTIÓN DE EMPLEADOS ==========
  
  async getAllEmpleados() {
    return await db.select().from(employees).where(eq(employees.activo, true));
  }

  async getEmpleado(id: number) {
    const [empleado] = await db.select().from(employees).where(
      and(eq(employees.id, id), eq(employees.activo, true))
    );
    return empleado;
  }

  async createEmpleado(empleadoData: InsertEmployee) {
    // Validar datos según tipo de contrato
    await this.validarDatosEmpleado(empleadoData);
    
    const [empleado] = await db.insert(employees).values({
      ...empleadoData,
      activo: true,
      createdAt: new Date(),
      updatedAt: new Date()
    }).returning();

    // Crear registro inicial en historial de contratos
    await this.createHistorialContrato(empleado.id, {
      tipoContrato: empleadoData.tipoContrato!,
      salarioAnterior: null,
      salarioNuevo: empleadoData.salary?.toString(),
      horasAnterior: null,
      horasNuevo: empleadoData.horasPorSemana,
      bonificacionesAnterior: null,
      bonificacionesNuevo: empleadoData.baseBenefits?.toString(),
      observaciones: "Contrato inicial",
      creadoPor: 1 // TODO: Obtener del contexto de usuario actual
    });

    return empleado;
  }

  async updateEmpleado(id: number, empleadoData: Partial<InsertEmployee>) {
    const empleadoActual = await this.getEmpleado(id);
    if (!empleadoActual) {
      throw new Error("Empleado no encontrado");
    }

    // Si hay cambios en contrato, crear historial
    if (this.hayCambiosContrato(empleadoActual, empleadoData)) {
      await this.createHistorialContrato(id, {
        tipoContrato: empleadoData.tipoContrato || empleadoActual.tipoContrato!,
        salarioAnterior: empleadoActual.salary?.toString(),
        salarioNuevo: empleadoData.salary?.toString(),
        horasAnterior: empleadoActual.horasPorSemana,
        horasNuevo: empleadoData.horasPorSemana,
        bonificacionesAnterior: empleadoActual.baseBenefits?.toString(),
        bonificacionesNuevo: empleadoData.baseBenefits?.toString(),
        observaciones: "Modificación de contrato",
        creadoPor: 1 // TODO: Obtener del contexto de usuario actual
      });
    }

    const [empleado] = await db.update(employees)
      .set({ ...empleadoData, updatedAt: new Date() })
      .where(eq(employees.id, id))
      .returning();

    return empleado;
  }

  async deleteEmpleado(id: number) {
    // Soft delete
    const [empleado] = await db.update(employees)
      .set({ activo: false, updatedAt: new Date() })
      .where(eq(employees.id, id))
      .returning();

    return empleado;
  }

  // ========== HISTORIAL DE CONTRATOS ==========
  
  async getHistorialContratos(empleadoId: number) {
    return await db.select()
      .from(historialContratos)
      .where(eq(historialContratos.empleadoId, empleadoId))
      .orderBy(desc(historialContratos.fechaCambio));
  }

  async createHistorialContrato(empleadoId: number, cambio: any) {
    const [historial] = await db.insert(historialContratos).values({
      empleadoId,
      ...cambio,
      fechaCambio: new Date()
    }).returning();

    return historial;
  }

  // ========== PRESTACIONES SOCIALES ==========
  
  async getPrestacionesSociales(empleadoId: number, año?: number) {
    const currentYear = año || new Date().getFullYear();
    
    return await db.select()
      .from(prestacionesSociales)
      .where(
        and(
          eq(prestacionesSociales.empleadoId, empleadoId),
          eq(prestacionesSociales.año, currentYear)
        )
      )
      .orderBy(prestacionesSociales.mes);
  }

  async calcularPrestaciones(empleadoId: number, año: number, mes: number) {
    const empleado = await this.getEmpleado(empleadoId);
    if (!empleado) {
      throw new Error("Empleado no encontrado");
    }

    const parametros = await this.getParametrosLegalesVigentes(año);
    const salarioBase = Number(empleado.salary || 0);

    // Cálculos según normativa colombiana
    const prima = this.calcularPrima(salarioBase, año, mes);
    const cesantias = this.calcularCesantias(salarioBase, año, mes);
    const interesesCesantias = this.calcularInteresesCesantias(cesantias);
    const vacaciones = this.calcularVacaciones(salarioBase, año, mes);

    // Verificar si ya existe registro para este período
    const existente = await db.select()
      .from(prestacionesSociales)
      .where(
        and(
          eq(prestacionesSociales.empleadoId, empleadoId),
          eq(prestacionesSociales.año, año),
          eq(prestacionesSociales.mes, mes)
        )
      );

    if (existente.length > 0) {
      // Actualizar existente
      const [prestaciones] = await db.update(prestacionesSociales)
        .set({
          prima: prima.toString(),
          cesantias: cesantias.toString(),
          interesesCesantias: interesesCesantias.toString(),
          vacaciones: vacaciones.toString(),
          calculadoAt: new Date()
        })
        .where(
          and(
            eq(prestacionesSociales.empleadoId, empleadoId),
            eq(prestacionesSociales.año, año),
            eq(prestacionesSociales.mes, mes)
          )
        )
        .returning();

      return prestaciones;
    } else {
      // Crear nuevo
      const [prestaciones] = await db.insert(prestacionesSociales).values({
        empleadoId,
        año,
        mes,
        prima: prima.toString(),
        cesantias: cesantias.toString(),
        interesesCesantias: interesesCesantias.toString(),
        vacaciones: vacaciones.toString(),
        calculadoAt: new Date()
      }).returning();

      return prestaciones;
    }
  }

  // ========== NOVEDADES DE NÓMINA ==========
  
  async getNovedades(empleadoId: number) {
    return await db.select()
      .from(novedadesNomina)
      .where(eq(novedadesNomina.empleadoId, empleadoId))
      .orderBy(desc(novedadesNomina.createdAt));
  }

  async createNovedad(empleadoId: number, novedad: any) {
    const [nuevaNovedad] = await db.insert(novedadesNomina).values({
      empleadoId,
      ...novedad,
      creadaPor: 1, // TODO: Obtener del contexto de usuario actual
      createdAt: new Date()
    }).returning();

    return nuevaNovedad;
  }

  async updateNovedad(empleadoId: number, novedadId: number, novedad: any) {
    const [novedadActualizada] = await db.update(novedadesNomina)
      .set(novedad)
      .where(
        and(
          eq(novedadesNomina.id, novedadId),
          eq(novedadesNomina.empleadoId, empleadoId)
        )
      )
      .returning();

    return novedadActualizada;
  }

  async deleteNovedad(empleadoId: number, novedadId: number) {
    await db.delete(novedadesNomina)
      .where(
        and(
          eq(novedadesNomina.id, novedadId),
          eq(novedadesNomina.empleadoId, empleadoId)
        )
      );

    return { success: true };
  }

  // ========== VALIDACIONES LEGALES ==========
  
  async validarSalarioMinimo(tipoContrato: string, valor: number, horas?: number) {
    const parametros = await this.getParametrosLegalesVigentes();
    const salarioMinimo = Number(parametros.salarioMinimo);

    let resultado = {
      valido: false,
      mensaje: "",
      salarioMinimo,
      valorCalculado: valor
    };

    switch (tipoContrato) {
      case "indefinido":
      case "fijo":
        resultado.valido = valor >= salarioMinimo;
        resultado.mensaje = resultado.valido 
          ? "Salario cumple con el mínimo legal"
          : `El salario debe ser mínimo ${salarioMinimo.toLocaleString('es-CO', { style: 'currency', currency: 'COP' })}`;
        break;

      case "por_horas":
        if (!horas) {
          resultado.mensaje = "Debe especificar las horas para validar el salario por horas";
          break;
        }
        const salarioPorHoraMinimo = salarioMinimo / (30 * 8); // Aprox por día laboral
        const salarioMensualCalculado = valor * horas * 4.33; // Promedio semanas por mes
        
        resultado.valorCalculado = salarioMensualCalculado;
        resultado.valido = salarioMensualCalculado >= salarioMinimo;
        resultado.mensaje = resultado.valido
          ? "Salario por horas cumple con el mínimo legal"
          : `El salario calculado (${salarioMensualCalculado.toLocaleString('es-CO', { style: 'currency', currency: 'COP' })}) es menor al mínimo legal`;
        break;

      case "prestacion_servicios":
        // Para prestación de servicios no aplica salario mínimo, pero sí límites para aportes
        resultado.valido = true;
        resultado.mensaje = "Prestación de servicios - sin restricción de salario mínimo";
        break;
    }

    return resultado;
  }

  async getParametrosLegales(año?: number) {
    const currentYear = año || new Date().getFullYear();
    
    const [parametros] = await db.select()
      .from(parametrosLegales)
      .where(
        and(
          eq(parametrosLegales.año, currentYear),
          eq(parametrosLegales.activo, true)
        )
      );

    return parametros;
  }

  // ========== CÁLCULOS DE NÓMINA ==========
  
  async calcularNomina(empleadoId: number, periodo: { inicio: string, fin: string }) {
    const empleado = await this.getEmpleado(empleadoId);
    if (!empleado) {
      throw new Error("Empleado no encontrado");
    }

    const parametros = await this.getParametrosLegalesVigentes();
    const novedades = await this.getNovedadesPeriodo(empleadoId, periodo);

    return this.procesarCalculoNomina(empleado, parametros, novedades, periodo);
  }

  async simularNomina(empleadoId: number, periodo: { inicio: string, fin: string }, novedadesSimulacion?: any[]) {
    const empleado = await this.getEmpleado(empleadoId);
    if (!empleado) {
      throw new Error("Empleado no encontrado");
    }

    const parametros = await this.getParametrosLegalesVigentes();
    const novedades = novedadesSimulacion || [];

    return this.procesarCalculoNomina(empleado, parametros, novedades, periodo, true);
  }

  // ========== MÉTODOS PRIVADOS ==========
  
  private async validarDatosEmpleado(empleadoData: InsertEmployee) {
    // Validaciones según tipo de contrato
    switch (empleadoData.tipoContrato) {
      case "indefinido":
      case "fijo":
        if (!empleadoData.salary) {
          throw new Error("El salario base es requerido para contratos indefinidos/fijos");
        }
        break;

      case "por_horas":
        if (!empleadoData.salarioPorHora || !empleadoData.horasPorSemana) {
          throw new Error("El salario por hora y horas por semana son requeridos para contratos por horas");
        }
        break;

      case "prestacion_servicios":
        if (!empleadoData.honorarios) {
          throw new Error("Los honorarios son requeridos para contratos de prestación de servicios");
        }
        break;
    }

    // Validar salario mínimo
    const validacion = await this.validarSalarioMinimo(
      empleadoData.tipoContrato!,
      Number(empleadoData.salary || empleadoData.salarioPorHora || empleadoData.honorarios || 0),
      empleadoData.horasPorSemana
    );

    if (!validacion.valido && empleadoData.tipoContrato !== "prestacion_servicios") {
      throw new Error(validacion.mensaje);
    }
  }

  private hayCambiosContrato(empleadoActual: Employee, empleadoData: Partial<InsertEmployee>): boolean {
    return !!(
      empleadoData.tipoContrato && empleadoData.tipoContrato !== empleadoActual.tipoContrato ||
      empleadoData.salary && empleadoData.salary?.toString() !== empleadoActual.salary ||
      empleadoData.horasPorSemana && empleadoData.horasPorSemana !== empleadoActual.horasPorSemana ||
      empleadoData.baseBenefits && empleadoData.baseBenefits?.toString() !== empleadoActual.baseBenefits
    );
  }

  private async getParametrosLegalesVigentes(año?: number) {
    const parametros = await this.getParametrosLegales(año);
    if (!parametros) {
      throw new Error("No se encontraron parámetros legales vigentes para el año especificado");
    }
    return parametros;
  }

  private calcularPrima(salarioBase: number, año: number, mes: number): number {
    // Prima = (Salario + auxilio transporte) * días trabajados / 360
    // Simplificado: salarioBase * mes / 12
    return (salarioBase * mes) / 12;
  }

  private calcularCesantias(salarioBase: number, año: number, mes: number): number {
    // Cesantías = (Salario + auxilio transporte) * días trabajados / 360
    return (salarioBase * mes) / 12;
  }

  private calcularInteresesCesantias(cesantias: number): number {
    // Intereses de cesantías = cesantías * 12% anual
    return cesantias * 0.12;
  }

  private calcularVacaciones(salarioBase: number, año: number, mes: number): number {
    // Vacaciones = Salario * días trabajados / 720
    return (salarioBase * mes) / 24; // 12 meses = 15 días hábiles
  }

  private async getNovedadesPeriodo(empleadoId: number, periodo: { inicio: string, fin: string }) {
    return await db.select()
      .from(novedadesNomina)
      .where(
        and(
          eq(novedadesNomina.empleadoId, empleadoId),
          eq(novedadesNomina.estado, "pendiente")
        )
      );
  }

  private procesarCalculoNomina(empleado: Employee, parametros: ParametrosLegales, novedades: any[], periodo: any, esSimulacion = false) {
    const salarioBase = Number(empleado.salary || empleado.salarioPorHora || empleado.honorarios || 0);
    
    // Calcular devengados
    let devengados = {
      salarioBase,
      horasExtras: 0,
      bonificaciones: Number(empleado.baseBenefits || 0),
      auxilioTransporte: empleado.auxilioTransporte ? Number(parametros.auxilioTransporte) : 0
    };

    // Aplicar novedades
    novedades.forEach(novedad => {
      switch (novedad.tipo) {
        case "horas_extras":
          devengados.horasExtras += Number(novedad.valor);
          break;
        case "bono_especial":
          devengados.bonificaciones += Number(novedad.valor);
          break;
      }
    });

    const totalDevengado = Object.values(devengados).reduce((a, b) => a + b, 0);

    // Calcular deducciones
    const deducciones = {
      salud: totalDevengado * (Number(parametros.salud) / 100),
      pension: totalDevengado * (Number(parametros.pension) / 100),
      retencionFuente: totalDevengado * (Number(empleado.retencionFuente || 0) / 100),
      otros: Number(empleado.baseDeductions || 0)
    };

    const totalDeducido = Object.values(deducciones).reduce((a, b) => a + b, 0);

    // Neto a pagar
    const netoAPagar = totalDevengado - totalDeducido;

    // Aportes patronales (costo empleador)
    const aportesPatronales = {
      salud: totalDevengado * 0.085, // 8.5%
      pension: totalDevengado * 0.12, // 12%
      arl: totalDevengado * this.getArlPorcentaje(empleado.claseRiesgoARL || "1"),
      cajaCompensacion: totalDevengado * 0.04, // 4%
      icbf: totalDevengado * 0.03, // 3%
      sena: totalDevengado * 0.02 // 2%
    };

    const totalAportesPatronales = Object.values(aportesPatronales).reduce((a, b) => a + b, 0);
    const costoTotalEmpleador = totalDevengado + totalAportesPatronales;

    return {
      empleado: {
        id: empleado.id,
        nombre: `${empleado.firstName} ${empleado.lastName}`,
        tipoContrato: empleado.tipoContrato,
        identificacion: empleado.identification
      },
      periodo,
      devengados,
      totalDevengado,
      deducciones,
      totalDeducido,
      netoAPagar,
      aportesPatronales,
      totalAportesPatronales,
      costoTotalEmpleador,
      novedades: novedades.length,
      esSimulacion
    };
  }

  private getArlPorcentaje(claseRiesgo: string): number {
    const porcentajes = {
      "1": 0.00522,
      "2": 0.01044,
      "3": 0.02436,
      "4": 0.04350,
      "5": 0.06960
    };
    return porcentajes[claseRiesgo as keyof typeof porcentajes] || 0.00522;
  }
}

export const colombiaService = new ColombiaService();