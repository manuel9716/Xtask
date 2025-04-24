import { employees, users } from '@shared/schema';
import { db } from 'server/db';
import { eq, like, and, or, desc, sql } from 'drizzle-orm';
import { Employee } from '@shared/schema';
import { IEmpleadoRepository } from '../../domain/interfaces/IEmpleadoRepository';
import { FiltrosEmpleado, ResultadoPaginadoEmpleados, CrearEmpleadoParams } from '../../domain/entities/Empleado';

/**
 * Implementación del repositorio de empleados para PostgreSQL
 */
export class EmpleadoPgRepository implements IEmpleadoRepository {
  /**
   * Obtiene todos los empleados con filtros opcionales
   */
  async obtenerEmpleados(filtros?: FiltrosEmpleado): Promise<ResultadoPaginadoEmpleados> {
    try {
      // Valores por defecto para paginación
      const page = filtros?.page || 1;
      const pageSize = filtros?.pageSize || 10;
      const offset = (page - 1) * pageSize;
      
      // Condiciones de filtrado
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
      
      if (filtros?.search) {
        // Búsqueda en usuarios y empleados
        conditions.push(
          or(
            like(users.fullName, `%${filtros.search}%`),
            like(employees.identification, `%${filtros.search}%`),
            like(employees.position, `%${filtros.search}%`)
          )
        );
      }

      // Consulta para obtener empleados con información de usuarios
      const query = db
        .select({
          id: employees.id,
          userId: employees.userId,
          position: employees.position,
          department: employees.department,
          hireDate: employees.hireDate,
          salary: employees.salary,
          phoneNumber: employees.phoneNumber,
          address: employees.address,
          emergencyContact: employees.emergencyContact,
          contractStatus: employees.contractStatus,
          contractType: employees.contractType,
          identification: employees.identification,
          baseBenefits: employees.baseBenefits,
          baseDeductions: employees.baseDeductions,
          taxRate: employees.taxRate,
          fullName: users.fullName,
          email: users.email
        })
        .from(employees)
        .leftJoin(users, eq(employees.userId, users.id));
      
      // Aplicar condiciones de filtrado
      const filteredQuery = conditions.length > 0
        ? query.where(and(...conditions))
        : query;
        
      // Obtener total de registros para paginación
      const totalCountResult = await db
        .select({ count: sql`count(*)` })
        .from(employees)
        .leftJoin(users, eq(employees.userId, users.id));
      
      const totalItems = Number(totalCountResult[0].count) || 0;
      const totalPages = Math.ceil(totalItems / pageSize);
      
      // Aplicar paginación y ordenación
      const resultados = await filteredQuery
        .orderBy(desc(employees.id))
        .limit(pageSize)
        .offset(offset);
      
      return {
        empleados: resultados,
        pagination: {
          page,
          pageSize,
          totalItems,
          totalPages
        }
      };
    } catch (error) {
      console.error('Error en obtenerEmpleados:', error);
      throw new Error('Error al obtener los empleados');
    }
  }
  
  /**
   * Obtiene un empleado por su ID
   */
  async obtenerEmpleadoPorId(id: number): Promise<Employee> {
    try {
      const [empleado] = await db
        .select({
          id: employees.id,
          userId: employees.userId,
          position: employees.position,
          department: employees.department,
          hireDate: employees.hireDate,
          salary: employees.salary,
          phoneNumber: employees.phoneNumber,
          address: employees.address,
          emergencyContact: employees.emergencyContact,
          contractStatus: employees.contractStatus,
          contractType: employees.contractType,
          identification: employees.identification,
          baseBenefits: employees.baseBenefits,
          baseDeductions: employees.baseDeductions,
          taxRate: employees.taxRate,
          fullName: users.fullName,
          email: users.email
        })
        .from(employees)
        .leftJoin(users, eq(employees.userId, users.id))
        .where(eq(employees.id, id));
      
      if (!empleado) {
        throw new Error(`No se encontró el empleado con ID ${id}`);
      }
      
      return empleado;
    } catch (error) {
      console.error(`Error en obtenerEmpleadoPorId para id ${id}:`, error);
      throw error instanceof Error ? error : new Error('Error al obtener el empleado');
    }
  }
  
  /**
   * Crea un nuevo empleado
   */
  async crearEmpleado(datos: CrearEmpleadoParams): Promise<Employee> {
    try {
      // Verificar que el usuario existe
      const [usuario] = await db
        .select()
        .from(users)
        .where(eq(users.id, datos.userId));
      
      if (!usuario) {
        throw new Error(`El usuario con ID ${datos.userId} no existe`);
      }
      
      // Crear el empleado en la base de datos
      const [empleado] = await db
        .insert(employees)
        .values({
          userId: datos.userId,
          position: datos.position,
          department: datos.department,
          hireDate: datos.hireDate,
          salary: datos.salary,
          phoneNumber: datos.phoneNumber || null,
          address: datos.address || null,
          emergencyContact: datos.emergencyContact || null,
          contractStatus: datos.contractStatus,
          contractType: datos.contractType,
          identification: datos.identification,
          baseBenefits: datos.baseBenefits || "0",
          baseDeductions: datos.baseDeductions || "0",
          taxRate: datos.taxRate || "0"
        })
        .returning();
      
      // Obtener el empleado con información del usuario
      return this.obtenerEmpleadoPorId(empleado.id);
    } catch (error) {
      console.error('Error en crearEmpleado:', error);
      throw error instanceof Error ? error : new Error('Error al crear el empleado');
    }
  }
  
  /**
   * Actualiza un empleado existente
   */
  async actualizarEmpleado(id: number, datos: Partial<CrearEmpleadoParams>): Promise<Employee> {
    try {
      // Verificar que el empleado existe
      const [empleadoExistente] = await db
        .select()
        .from(employees)
        .where(eq(employees.id, id));
      
      if (!empleadoExistente) {
        throw new Error(`El empleado con ID ${id} no existe`);
      }
      
      // Actualizar el empleado
      await db
        .update(employees)
        .set({
          ...(datos.position && { position: datos.position }),
          ...(datos.department && { department: datos.department }),
          ...(datos.hireDate && { hireDate: datos.hireDate }),
          ...(datos.salary && { salary: datos.salary }),
          ...(datos.phoneNumber !== undefined && { phoneNumber: datos.phoneNumber || null }),
          ...(datos.address !== undefined && { address: datos.address || null }),
          ...(datos.emergencyContact !== undefined && { emergencyContact: datos.emergencyContact || null }),
          ...(datos.contractStatus && { contractStatus: datos.contractStatus }),
          ...(datos.contractType && { contractType: datos.contractType }),
          ...(datos.identification && { identification: datos.identification }),
          ...(datos.baseBenefits && { baseBenefits: datos.baseBenefits }),
          ...(datos.baseDeductions && { baseDeductions: datos.baseDeductions }),
          ...(datos.taxRate && { taxRate: datos.taxRate }),
        })
        .where(eq(employees.id, id));
      
      // Obtener el empleado actualizado
      return this.obtenerEmpleadoPorId(id);
    } catch (error) {
      console.error(`Error en actualizarEmpleado para id ${id}:`, error);
      throw error instanceof Error ? error : new Error('Error al actualizar el empleado');
    }
  }
  
  /**
   * Cambia el estado del contrato de un empleado
   */
  async cambiarEstadoEmpleado(id: number, nuevoEstado: string): Promise<Employee> {
    try {
      // Verificar que el empleado existe
      const [empleadoExistente] = await db
        .select()
        .from(employees)
        .where(eq(employees.id, id));
      
      if (!empleadoExistente) {
        throw new Error(`El empleado con ID ${id} no existe`);
      }
      
      // Actualizar el estado
      await db
        .update(employees)
        .set({ contractStatus: nuevoEstado })
        .where(eq(employees.id, id));
      
      // Obtener el empleado actualizado
      return this.obtenerEmpleadoPorId(id);
    } catch (error) {
      console.error(`Error en cambiarEstadoEmpleado para id ${id}:`, error);
      throw error instanceof Error ? error : new Error('Error al cambiar el estado del empleado');
    }
  }
  
  /**
   * Elimina un empleado (lo marca como terminado)
   */
  async eliminarEmpleado(id: number): Promise<{ message: string; empleado: Employee }> {
    try {
      // Verificar que el empleado existe
      const [empleadoExistente] = await db
        .select()
        .from(employees)
        .where(eq(employees.id, id));
      
      if (!empleadoExistente) {
        throw new Error(`El empleado con ID ${id} no existe`);
      }
      
      // Obtener los datos del empleado antes de marcarlo como terminado
      const empleado = await this.obtenerEmpleadoPorId(id);
      
      // Actualizar el estado a "terminated"
      await db
        .update(employees)
        .set({ contractStatus: 'terminated' })
        .where(eq(employees.id, id));
      
      return {
        message: `El empleado con ID ${id} ha sido marcado como terminado`,
        empleado
      };
    } catch (error) {
      console.error(`Error en eliminarEmpleado para id ${id}:`, error);
      throw error instanceof Error ? error : new Error('Error al eliminar el empleado');
    }
  }
}