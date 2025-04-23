// Importar db 
import { db } from '@/../../server/db';
import { and, asc, desc, eq, gte, lte, sql } from 'drizzle-orm';
import { 
  Payroll, InsertPayroll, Employee,
  payrolls, employees, users, financialAudits
} from '@shared/schema';

import { 
  CambiarEstadoParams, 
  EstadoNomina, 
  MarcarComoPagadaParams, 
  ProcesarNominaParams 
} from '../../domain/entities/Nomina';
import { INominaRepository } from '../../domain/interfaces/INominaRepository';
import { 
  CalculoPagoEmpleado, 
  ResultadoCalculoPago 
} from '../../domain/services/CalculoPagoEmpleado';

/**
 * Implementación PostgreSQL del repositorio de nómina
 */
export class NominaRepository implements INominaRepository {
  private calculoService: CalculoPagoEmpleado;

  constructor() {
    this.calculoService = new CalculoPagoEmpleado();
  }

  /**
   * Obtiene todas las nóminas, con filtros opcionales
   */
  async obtenerNominas(filtros?: { 
    empleadoId?: number; 
    desde?: Date; 
    hasta?: Date; 
    estado?: string; 
    page?: number; 
    limit?: number; 
  }): Promise<{ nominas: Payroll[]; total: number }> {
    try {
      let query = db.select().from(payrolls);
      
      // Aplicar filtros si existen
      if (filtros) {
        const conditions = [];
        
        if (filtros.empleadoId) {
          conditions.push(eq(payrolls.employeeId, filtros.empleadoId));
        }
        
        if (filtros.desde) {
          conditions.push(gte(payrolls.periodStart, filtros.desde));
        }
        
        if (filtros.hasta) {
          conditions.push(lte(payrolls.periodEnd, filtros.hasta));
        }
        
        if (filtros.estado) {
          conditions.push(eq(payrolls.status, filtros.estado));
        }
        
        if (conditions.length > 0) {
          query = query.where(and(...conditions));
        }
      }
      
      // Obtener el total de registros para la paginación
      const totalQuery = db.select({ count: sql<number>`count(*)` }).from(payrolls);
      const [{ count }] = await totalQuery;
      
      // Aplicar paginación
      const page = filtros?.page || 1;
      const limit = filtros?.limit || 10;
      const offset = (page - 1) * limit;
      
      query = query.orderBy(desc(payrolls.periodStart))
                  .limit(limit)
                  .offset(offset);
      
      const nominas = await query;
      
      return {
        nominas,
        total: count
      };
    } catch (error) {
      console.error('Error al obtener nóminas:', error);
      throw new Error('Error al obtener las nóminas');
    }
  }

  /**
   * Obtiene una nómina específica por su ID
   */
  async obtenerNominaPorId(id: number): Promise<Payroll | undefined> {
    try {
      const [nomina] = await db.select()
        .from(payrolls)
        .where(eq(payrolls.id, id));
      
      return nomina;
    } catch (error) {
      console.error(`Error al obtener nómina con ID ${id}:`, error);
      throw new Error(`Error al obtener nómina con ID ${id}`);
    }
  }

  /**
   * Obtiene todos los empleados activos
   */
  async obtenerEmpleados(): Promise<Employee[]> {
    try {
      const result = await db.select()
        .from(employees)
        .where(eq(employees.contractStatus, 'active'))
        .orderBy(asc(employees.id));
      
      return result;
    } catch (error) {
      console.error('Error al obtener empleados:', error);
      throw new Error('Error al obtener los empleados');
    }
  }

  /**
   * Obtiene un empleado específico por su ID
   */
  async obtenerEmpleadoPorId(id: number): Promise<Employee | undefined> {
    try {
      const [empleado] = await db.select()
        .from(employees)
        .where(eq(employees.id, id));
      
      return empleado;
    } catch (error) {
      console.error(`Error al obtener empleado con ID ${id}:`, error);
      throw new Error(`Error al obtener empleado con ID ${id}`);
    }
  }

  /**
   * Procesa la nómina para un grupo de empleados y un periodo específico
   */
  async procesarNomina(params: ProcesarNominaParams): Promise<Payroll[]> {
    try {
      // Obtener los empleados para procesar
      let empleadosAProcesar: Employee[];
      
      if (params.empleadoIds && params.empleadoIds.length > 0) {
        // Procesar solo los empleados especificados
        empleadosAProcesar = await Promise.all(
          params.empleadoIds.map(id => this.obtenerEmpleadoPorId(id))
        ).then(results => results.filter(e => e !== undefined) as Employee[]);
      } else {
        // Procesar todos los empleados activos
        empleadosAProcesar = await this.obtenerEmpleados();
      }
      
      // Calcular la nómina para cada empleado
      const resultadosCalculo: ResultadoCalculoPago[] = [];
      const nominasCreadas: Payroll[] = [];
      
      for (const empleado of empleadosAProcesar) {
        // Verificar que el empleado tenga salario definido
        if (!empleado.salary) {
          console.warn(`Empleado ${empleado.id} no tiene salario definido, omitiendo cálculo`);
          continue;
        }
        
        // Calcular el pago para el empleado
        const resultado = this.calculoService.calcularPago(empleado);
        resultadosCalculo.push(resultado);
        
        // Crear registro de nómina en la BD
        const nuevaNomina: InsertPayroll = {
          employeeId: empleado.id,
          periodStart: params.periodoInicio,
          periodEnd: params.periodoFin,
          grossSalary: resultado.sueldoBruto.toString(),
          netSalary: resultado.sueldoNeto.toString(),
          deductions: (resultado.deduccionesFijas + resultado.deduccionesAdicionales).toString(),
          benefits: (resultado.beneficiosFijos + resultado.beneficiosAdicionales).toString(),
          taxes: resultado.impuestos.toString(),
          status: EstadoNomina.PENDIENTE,
          createdBy: params.usuarioId,
          calculationDetails: JSON.stringify(resultado.detalles)
        };
        
        const nominaCreada = await this.crearNomina(nuevaNomina);
        nominasCreadas.push(nominaCreada);
      }
      
      return nominasCreadas;
    } catch (error) {
      console.error('Error al procesar nómina:', error);
      throw new Error('Error al procesar la nómina');
    }
  }

  /**
   * Crea un registro de nómina individual
   */
  async crearNomina(nomina: InsertPayroll): Promise<Payroll> {
    try {
      const [nominaCreada] = await db.insert(payrolls)
        .values(nomina)
        .returning();
      
      return nominaCreada;
    } catch (error) {
      console.error('Error al crear nómina:', error);
      throw new Error('Error al crear el registro de nómina');
    }
  }

  /**
   * Marca una nómina como pagada
   */
  async marcarComoPagada(params: MarcarComoPagadaParams): Promise<Payroll> {
    try {
      // Obtener la nómina actual
      const nominaActual = await this.obtenerNominaPorId(params.nominaId);
      
      if (!nominaActual) {
        throw new Error(`No se encontró la nómina con ID ${params.nominaId}`);
      }
      
      // Actualizar el estado a pagado
      const [nominaActualizada] = await db.update(payrolls)
        .set({
          status: EstadoNomina.PAGADO,
          paymentDate: params.fechaPago,
          paymentMethod: params.metodoPago,
          paymentReference: params.referenciaPago,
          updatedAt: new Date()
        })
        .where(eq(payrolls.id, params.nominaId))
        .returning();
      
      // Registrar la acción en la auditoría
      await this.registrarAuditoria(
        params.nominaId,
        'marcar_pagado',
        { status: nominaActual.status },
        { status: nominaActualizada.status },
        params.usuarioId
      );
      
      return nominaActualizada;
    } catch (error) {
      console.error(`Error al marcar nómina ${params.nominaId} como pagada:`, error);
      throw new Error(`Error al marcar la nómina como pagada`);
    }
  }

  /**
   * Cambia el estado de una nómina
   */
  async cambiarEstadoNomina(params: CambiarEstadoParams): Promise<Payroll> {
    try {
      // Obtener la nómina actual
      const nominaActual = await this.obtenerNominaPorId(params.nominaId);
      
      if (!nominaActual) {
        throw new Error(`No se encontró la nómina con ID ${params.nominaId}`);
      }
      
      // Actualizar el estado
      const [nominaActualizada] = await db.update(payrolls)
        .set({
          status: params.nuevoEstado,
          updatedAt: new Date()
        })
        .where(eq(payrolls.id, params.nominaId))
        .returning();
      
      // Registrar la acción en la auditoría
      await this.registrarAuditoria(
        params.nominaId,
        'cambiar_estado',
        { status: nominaActual.status },
        { status: params.nuevoEstado, motivo: params.motivo },
        params.usuarioId
      );
      
      return nominaActualizada;
    } catch (error) {
      console.error(`Error al cambiar estado de nómina ${params.nominaId}:`, error);
      throw new Error(`Error al cambiar el estado de la nómina`);
    }
  }

  /**
   * Obtiene el historial de nóminas de un empleado
   */
  async obtenerHistorialPorEmpleado(
    empleadoId: number, 
    filtros?: { desde?: Date; hasta?: Date; estado?: string }
  ): Promise<Payroll[]> {
    try {
      let query = db.select()
        .from(payrolls)
        .where(eq(payrolls.employeeId, empleadoId));
      
      // Aplicar filtros si existen
      if (filtros) {
        if (filtros.desde) {
          query = query.where(gte(payrolls.periodStart, filtros.desde));
        }
        
        if (filtros.hasta) {
          query = query.where(lte(payrolls.periodEnd, filtros.hasta));
        }
        
        if (filtros.estado) {
          query = query.where(eq(payrolls.status, filtros.estado));
        }
      }
      
      // Ordenar por fecha
      query = query.orderBy(desc(payrolls.periodStart));
      
      const historial = await query;
      
      return historial;
    } catch (error) {
      console.error(`Error al obtener historial del empleado ${empleadoId}:`, error);
      throw new Error(`Error al obtener el historial de nóminas del empleado`);
    }
  }

  /**
   * Registra una actividad de auditoría relacionada con la nómina
   */
  async registrarAuditoria(
    entidadId: number, 
    accion: string, 
    datosAnteriores: any, 
    datosNuevos: any, 
    usuarioId: number
  ): Promise<void> {
    try {
      await db.insert(financialAudits)
        .values({
          entityType: 'payroll',
          entityId: entidadId,
          action: accion,
          previousData: JSON.stringify(datosAnteriores),
          newData: JSON.stringify(datosNuevos),
          performedBy: usuarioId,
          performedAt: new Date(),
          notes: `Acción de nómina: ${accion}`
        });
    } catch (error) {
      console.error('Error al registrar auditoría:', error);
      // No lanzamos error para evitar interrumpir la operación principal
    }
  }
}