import { Employee } from '@shared/schema';
import { FiltrosEmpleado, ResultadoPaginadoEmpleados, CrearEmpleadoParams } from '../entities/Empleado';

/**
 * Interfaz para el repositorio de empleados
 */
export interface IEmpleadoRepository {
  /**
   * Obtiene todos los empleados con filtros opcionales
   */
  obtenerEmpleados(filtros?: FiltrosEmpleado): Promise<ResultadoPaginadoEmpleados>;
  
  /**
   * Obtiene un empleado por su ID
   */
  obtenerEmpleadoPorId(id: number): Promise<Employee>;
  
  /**
   * Crea un nuevo empleado
   */
  crearEmpleado(datos: CrearEmpleadoParams): Promise<Employee>;
  
  /**
   * Actualiza un empleado existente
   */
  actualizarEmpleado(id: number, datos: Partial<CrearEmpleadoParams>): Promise<Employee>;
  
  /**
   * Cambia el estado del contrato de un empleado
   */
  cambiarEstadoEmpleado(id: number, nuevoEstado: string): Promise<Employee>;
  
  /**
   * Elimina un empleado (lo marca como terminado)
   */
  eliminarEmpleado(id: number): Promise<{ message: string; empleado: Employee }>;
}