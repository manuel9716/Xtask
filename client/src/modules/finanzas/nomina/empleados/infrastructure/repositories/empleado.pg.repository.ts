import { db } from '@/../../server/db';
import { and, asc, desc, eq, like } from 'drizzle-orm';
import { 
  Employee, InsertEmployee,
  employees, users 
} from '@shared/schema';

import { 
  CrearEmpleadoParams,
  FiltrosEmpleado,
  ResultadoPaginadoEmpleados
} from '../../domain/entities/Empleado';
import { IEmpleadoRepository } from '../../domain/interfaces/IEmpleadoRepository';

/**
 * Implementación PostgreSQL del repositorio de empleados
 */
export class EmpleadoRepository implements IEmpleadoRepository {
  /**
   * Obtiene todos los empleados, con filtros opcionales
   */
  async obtenerEmpleados(filtros?: FiltrosEmpleado): Promise<ResultadoPaginadoEmpleados> {
    try {
      // Aplicar filtros si existen
      const conditions = [];
      
      if (filtros?.contractStatus) {
        conditions.push(eq(employees.contractStatus, filtros.contractStatus));
      }
      
      if (filtros?.department) {
        conditions.push(eq(employees.department, filtros.department));
      }
      
      if (filtros?.userId) {
        conditions.push(eq(employees.userId, filtros.userId));
      }
      
      // Obtener el total de registros para la paginación
      const totalQuery = db.select({ count: db.fn.count() }).from(employees);
      
      if (conditions.length > 0) {
        totalQuery.where(and(...conditions));
      }
      
      const [totalResult] = await totalQuery;
      const totalItems = Number(totalResult.count);
      
      // Aplicar paginación
      const page = filtros?.page || 1;
      const pageSize = filtros?.pageSize || 10;
      const totalPages = Math.ceil(totalItems / pageSize);
      const offset = (page - 1) * pageSize;
      
      // Realizar la consulta paginada
      let query = db.select().from(employees);
      
      if (conditions.length > 0) {
        query = query.where(and(...conditions));
      }
      
      query = query
        .orderBy(asc(employees.id))
        .limit(pageSize)
        .offset(offset);
      
      const empleados = await query;
      
      return {
        empleados,
        pagination: {
          page,
          pageSize,
          totalItems,
          totalPages
        }
      };
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
   * Obtiene un empleado por su identificación
   */
  async obtenerEmpleadoPorIdentificacion(identificacion: string): Promise<Employee | undefined> {
    try {
      const [empleado] = await db.select()
        .from(employees)
        .where(eq(employees.identification, identificacion));
      
      return empleado;
    } catch (error) {
      console.error(`Error al obtener empleado con identificación ${identificacion}:`, error);
      throw new Error(`Error al obtener empleado con identificación ${identificacion}`);
    }
  }

  /**
   * Crea un nuevo empleado
   */
  async crearEmpleado(params: CrearEmpleadoParams): Promise<Employee> {
    try {
      // Verificar que el usuario existe
      const [usuario] = await db.select()
        .from(users)
        .where(eq(users.id, params.userId));
      
      if (!usuario) {
        throw new Error(`No se encontró el usuario con ID ${params.userId}`);
      }
      
      // Verificar que no exista un empleado con la misma identificación
      const empleadoExistente = await this.obtenerEmpleadoPorIdentificacion(params.identification);
      
      if (empleadoExistente) {
        throw new Error(`Ya existe un empleado con la identificación ${params.identification}`);
      }
      
      // Crear el empleado
      const [empleadoCreado] = await db.insert(employees)
        .values({
          userId: params.userId,
          position: params.position,
          department: params.department,
          hireDate: params.hireDate,
          salary: params.salary,
          phoneNumber: params.phoneNumber,
          address: params.address,
          emergencyContact: params.emergencyContact,
          contractStatus: params.contractStatus,
          contractType: params.contractType,
          identification: params.identification,
          baseBenefits: params.baseBenefits,
          baseDeductions: params.baseDeductions,
          taxRate: params.taxRate
        })
        .returning();
      
      return empleadoCreado;
    } catch (error) {
      console.error('Error al crear empleado:', error);
      if (error instanceof Error) {
        throw new Error(`Error al crear empleado: ${error.message}`);
      }
      throw new Error('Error al crear el empleado');
    }
  }

  /**
   * Actualiza un empleado existente
   */
  async actualizarEmpleado(id: number, params: Partial<CrearEmpleadoParams>): Promise<Employee | undefined> {
    try {
      // Verificar que el empleado existe
      const empleadoActual = await this.obtenerEmpleadoPorId(id);
      
      if (!empleadoActual) {
        throw new Error(`No se encontró el empleado con ID ${id}`);
      }
      
      // Si se actualiza la identificación, verificar que no exista otro empleado con esa identificación
      if (params.identification && params.identification !== empleadoActual.identification) {
        const empleadoExistente = await this.obtenerEmpleadoPorIdentificacion(params.identification);
        
        if (empleadoExistente && empleadoExistente.id !== id) {
          throw new Error(`Ya existe un empleado con la identificación ${params.identification}`);
        }
      }
      
      // Actualizar el empleado
      const [empleadoActualizado] = await db.update(employees)
        .set(params)
        .where(eq(employees.id, id))
        .returning();
      
      return empleadoActualizado;
    } catch (error) {
      console.error(`Error al actualizar empleado con ID ${id}:`, error);
      if (error instanceof Error) {
        throw new Error(`Error al actualizar empleado: ${error.message}`);
      }
      throw new Error(`Error al actualizar el empleado con ID ${id}`);
    }
  }

  /**
   * Cambia el estado del contrato de un empleado
   */
  async cambiarEstadoEmpleado(id: number, nuevoEstado: string): Promise<Employee | undefined> {
    try {
      // Verificar que el empleado existe
      const empleadoActual = await this.obtenerEmpleadoPorId(id);
      
      if (!empleadoActual) {
        throw new Error(`No se encontró el empleado con ID ${id}`);
      }
      
      // Estados válidos
      const estadosValidos = ['active', 'inactive', 'on_leave', 'terminated'];
      
      if (!estadosValidos.includes(nuevoEstado)) {
        throw new Error(`Estado no válido. Los estados permitidos son: ${estadosValidos.join(', ')}`);
      }
      
      // Actualizar el estado
      const [empleadoActualizado] = await db.update(employees)
        .set({ contractStatus: nuevoEstado })
        .where(eq(employees.id, id))
        .returning();
      
      return empleadoActualizado;
    } catch (error) {
      console.error(`Error al cambiar estado del empleado con ID ${id}:`, error);
      if (error instanceof Error) {
        throw new Error(`Error al cambiar estado del empleado: ${error.message}`);
      }
      throw new Error(`Error al cambiar el estado del empleado con ID ${id}`);
    }
  }
}