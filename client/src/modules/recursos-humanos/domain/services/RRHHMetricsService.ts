/**
 * Servicio de Métricas de RRHH
 * Proporciona cálculos y estadísticas para el módulo de Recursos Humanos
 */

import { Empleado, EstadoEmpleado } from "../entities/Empleado";

// Interfaces para métricas

export interface MetricasDepartamento {
  nombre: string;
  cantidadEmpleados: number;
  porcentajeTotal: number;
  salarioPromedio: number;
  activos: number;
  inactivos: number;
}

export interface MetricasEstado {
  nombre: string;
  cantidad: number;
  porcentaje: number;
  color?: string;
}

export interface MetricasGeneralesRRHH {
  totalEmpleados: number;
  empleadosActivos: number;
  nuevosDelMes: number;
  porcentajeActividad: number;
  departamentos: MetricasDepartamento[];
  estados: MetricasEstado[];
  salarioPromedio: number;
  totalNomina: number;
  rotacionMensual?: number;
  antiguedadPromedio?: number;
}

export interface MetricasEvolucionEmpleados {
  periodo: string;
  contrataciones: number;
  bajas: number;
  rotacion: number;
}

export class RRHHMetricsService {
  /**
   * Calcula métricas generales de recursos humanos
   */
  calcularMetricasGenerales(empleados: Empleado[]): MetricasGeneralesRRHH {
    if (!empleados || empleados.length === 0) {
      return {
        totalEmpleados: 0,
        empleadosActivos: 0,
        nuevosDelMes: 0,
        porcentajeActividad: 0,
        departamentos: [],
        estados: [],
        salarioPromedio: 0,
        totalNomina: 0
      };
    }

    // Total empleados
    const totalEmpleados = empleados.length;
    
    // Empleados activos
    const empleadosActivos = empleados.filter(e => e.estado === EstadoEmpleado.ACTIVO).length;
    
    // Porcentaje de actividad
    const porcentajeActividad = (empleadosActivos / totalEmpleados) * 100;
    
    // Nuevos del mes
    const fechaActual = new Date();
    const primerDiaMes = new Date(fechaActual.getFullYear(), fechaActual.getMonth(), 1);
    const nuevosDelMes = empleados.filter(e => e.fechaContratacion >= primerDiaMes).length;
    
    // Métricas por departamento
    const departamentoMap = new Map<string, {
      cantidadEmpleados: number;
      sumaSalarios: number;
      activos: number;
      inactivos: number;
    }>();
    
    // Agrupar por departamento
    empleados.forEach(empleado => {
      const depto = departamentoMap.get(empleado.departamento) || {
        cantidadEmpleados: 0,
        sumaSalarios: 0,
        activos: 0,
        inactivos: 0
      };
      
      depto.cantidadEmpleados++;
      depto.sumaSalarios += empleado.salario;
      
      if (empleado.estado === EstadoEmpleado.ACTIVO) {
        depto.activos++;
      } else {
        depto.inactivos++;
      }
      
      departamentoMap.set(empleado.departamento, depto);
    });
    
    // Convertir a array
    const departamentos: MetricasDepartamento[] = [];
    departamentoMap.forEach((value, nombre) => {
      departamentos.push({
        nombre,
        cantidadEmpleados: value.cantidadEmpleados,
        porcentajeTotal: (value.cantidadEmpleados / totalEmpleados) * 100,
        salarioPromedio: value.sumaSalarios / value.cantidadEmpleados,
        activos: value.activos,
        inactivos: value.inactivos
      });
    });
    
    // Ordenar por cantidad de empleados (descendente)
    departamentos.sort((a, b) => b.cantidadEmpleados - a.cantidadEmpleados);
    
    // Métricas por estado
    const estadosMap = new Map<EstadoEmpleado, number>();
    
    // Inicializar todos los estados con 0
    Object.values(EstadoEmpleado).forEach(estado => {
      estadosMap.set(estado, 0);
    });
    
    // Contar por estado
    empleados.forEach(empleado => {
      const cantidad = estadosMap.get(empleado.estado) || 0;
      estadosMap.set(empleado.estado, cantidad + 1);
    });
    
    // Convertir a array
    const estados: MetricasEstado[] = [];
    estadosMap.forEach((cantidad, nombre) => {
      estados.push({
        nombre,
        cantidad,
        porcentaje: (cantidad / totalEmpleados) * 100
      });
    });
    
    // Ordenar por cantidad (descendente)
    estados.sort((a, b) => b.cantidad - a.cantidad);
    
    // Asignar colores a los estados
    const coloresEstados: Record<string, string> = {
      [EstadoEmpleado.ACTIVO]: "#10b981", // verde
      [EstadoEmpleado.INACTIVO]: "#ef4444", // rojo
      [EstadoEmpleado.VACACIONES]: "#3b82f6", // azul
      [EstadoEmpleado.PERMISO]: "#f59e0b", // ámbar
      [EstadoEmpleado.BAJA_MEDICA]: "#8b5cf6" // violeta
    };
    
    estados.forEach(estado => {
      estado.color = coloresEstados[estado.nombre] || "#6b7280"; // gris por defecto
    });
    
    // Calcular salario promedio
    const sumaSalarios = empleados.reduce((sum, empleado) => sum + empleado.salario, 0);
    const salarioPromedio = sumaSalarios / totalEmpleados;
    
    // Calcular total nómina (solo empleados activos)
    const totalNomina = empleados
      .filter(e => e.estado === EstadoEmpleado.ACTIVO)
      .reduce((sum, empleado) => sum + empleado.salario, 0);
    
    // Calcular rotación mensual (bajas del mes / promedio de empleados)
    // Asumimos que los inactivos en el último mes son bajas
    const empleadosInactivosUltimoMes = empleados.filter(
      e => e.estado === EstadoEmpleado.INACTIVO && 
      e.updatedAt && 
      e.updatedAt >= primerDiaMes
    ).length;
    
    const rotacionMensual = empleadosInactivosUltimoMes / 
      ((totalEmpleados + (totalEmpleados - nuevosDelMes + empleadosInactivosUltimoMes)) / 2) * 100;
    
    // Calcular antigüedad promedio
    const sumaAntiguedad = empleados.reduce((sum, empleado) => sum + empleado.antiguedad, 0);
    const antiguedadPromedio = sumaAntiguedad / totalEmpleados;
    
    return {
      totalEmpleados,
      empleadosActivos,
      nuevosDelMes,
      porcentajeActividad,
      departamentos,
      estados,
      salarioPromedio,
      totalNomina,
      rotacionMensual,
      antiguedadPromedio
    };
  }

  /**
   * Genera datos para evolución de personal en el tiempo
   */
  generarEvolucionEmpleados(
    empleados: Empleado[], 
    periodos: number = 6, 
    tipoPeriodo: 'mes' | 'trimestre' | 'año' = 'mes'
  ): MetricasEvolucionEmpleados[] {
    if (!empleados || empleados.length === 0) {
      return [];
    }

    const result: MetricasEvolucionEmpleados[] = [];
    const fechaActual = new Date();
    
    // Ordenar empleados por fecha de contratación
    const empleadosOrdenados = [...empleados].sort(
      (a, b) => a.fechaContratacion.getTime() - b.fechaContratacion.getTime()
    );
    
    // Calcular periodos
    for (let i = 0; i < periodos; i++) {
      let fechaInicio: Date;
      let fechaFin: Date;
      let etiquetaPeriodo: string;
      
      if (tipoPeriodo === 'mes') {
        fechaInicio = new Date(
          fechaActual.getFullYear(),
          fechaActual.getMonth() - i,
          1
        );
        fechaFin = new Date(
          fechaActual.getFullYear(),
          fechaActual.getMonth() - i + 1,
          0
        );
        etiquetaPeriodo = `${fechaInicio.toLocaleString('default', { month: 'short' })} ${fechaInicio.getFullYear()}`;
      } else if (tipoPeriodo === 'trimestre') {
        const trimestre = Math.floor((fechaActual.getMonth() - (i * 3)) / 3);
        const anio = fechaActual.getFullYear() - Math.floor((fechaActual.getMonth() - (i * 3)) / 12);
        const trimestreAjustado = ((trimestre % 4) + 4) % 4; // Asegura que sea 0-3
        
        fechaInicio = new Date(anio, trimestreAjustado * 3, 1);
        fechaFin = new Date(anio, (trimestreAjustado + 1) * 3, 0);
        etiquetaPeriodo = `Q${trimestreAjustado + 1} ${anio}`;
      } else { // año
        fechaInicio = new Date(fechaActual.getFullYear() - i, 0, 1);
        fechaFin = new Date(fechaActual.getFullYear() - i, 11, 31);
        etiquetaPeriodo = `${fechaInicio.getFullYear()}`;
      }
      
      // Contar contrataciones en el periodo
      const contrataciones = empleados.filter(
        e => e.fechaContratacion >= fechaInicio && e.fechaContratacion <= fechaFin
      ).length;
      
      // Contar bajas en el periodo (empleados inactivos cuya actualización fue en ese periodo)
      const bajas = empleados.filter(
        e => e.estado === EstadoEmpleado.INACTIVO && 
        e.updatedAt && 
        e.updatedAt >= fechaInicio && 
        e.updatedAt <= fechaFin
      ).length;
      
      // Empleados al inicio del periodo
      const empleadosAlInicio = empleadosOrdenados.filter(
        e => e.fechaContratacion < fechaInicio
      ).length - empleados.filter(
        e => e.estado === EstadoEmpleado.INACTIVO && 
        e.updatedAt && 
        e.updatedAt < fechaInicio
      ).length;
      
      // Calcular rotación
      const rotacion = empleadosAlInicio > 0 ? (bajas / empleadosAlInicio) * 100 : 0;
      
      result.unshift({
        periodo: etiquetaPeriodo,
        contrataciones,
        bajas,
        rotacion
      });
    }
    
    return result;
  }

  /**
   * Calcula distribución de salarios por departamento
   */
  calcularDistribucionSalarios(empleados: Empleado[]): Record<string, number[]> {
    if (!empleados || empleados.length === 0) {
      return {};
    }

    const distribucion: Record<string, number[]> = {};
    
    // Agrupar salarios por departamento
    empleados.forEach(empleado => {
      if (!distribucion[empleado.departamento]) {
        distribucion[empleado.departamento] = [];
      }
      
      distribucion[empleado.departamento].push(empleado.salario);
    });
    
    // Ordenar salarios en cada departamento
    Object.keys(distribucion).forEach(depto => {
      distribucion[depto].sort((a, b) => a - b);
    });
    
    return distribucion;
  }

  /**
   * Genera datos de proyección de costos de nómina
   */
  proyectarCostosNomina(
    empleados: Empleado[], 
    meses: number = 12, 
    incrementoPorcentual: number = 0
  ): { mes: string; costo: number }[] {
    if (!empleados || empleados.length === 0) {
      return [];
    }

    const resultado: { mes: string; costo: number }[] = [];
    const fechaActual = new Date();
    const empleadosActivos = empleados.filter(e => e.estado === EstadoEmpleado.ACTIVO);
    
    // Costo base mensual (nómina actual)
    const costoBaseMensual = empleadosActivos.reduce(
      (sum, empleado) => sum + empleado.salario, 
      0
    );
    
    // Generar proyecciones mensuales
    for (let i = 0; i < meses; i++) {
      const fecha = new Date(
        fechaActual.getFullYear(),
        fechaActual.getMonth() + i,
        1
      );
      
      const etiquetaMes = `${fecha.toLocaleString('default', { month: 'short' })} ${fecha.getFullYear()}`;
      
      // Aplicar incremento porcentual si corresponde (cada 12 meses)
      const factorIncremento = 1 + (Math.floor(i / 12) * incrementoPorcentual / 100);
      
      resultado.push({
        mes: etiquetaMes,
        costo: costoBaseMensual * factorIncremento
      });
    }
    
    return resultado;
  }
}