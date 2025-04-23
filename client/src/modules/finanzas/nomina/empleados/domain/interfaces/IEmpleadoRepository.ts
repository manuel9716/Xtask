import { Employee, InsertEmployee } from '@shared/schema';
import { CrearEmpleadoParams, FiltrosEmpleado, ResultadoPaginadoEmpleados } from '../entities/Empleado';

/**
 * Interfaz para el Repositorio de Empleados - sigue el patrón Repository
 * Define las operaciones disponibles para acceder y manipular datos de empleados
 */
export interface IEmpleadoRepository {
  /**
   * Obtiene todos los empleados, con posibles filtros
   */
  obtenerEmpleados(filtros?: FiltrosEmpleado): Promise<ResultadoPaginadoEmpleados>;

  /**
   * Obtiene un empleado específico por su ID
   */
  obtenerEmpleadoPorId(id: number): Promise<Employee | undefined>;
  
  /**
   * Obtiene un empleado por su identificación
   */
  obtenerEmpleadoPorIdentificacion(identificacion: string): Promise<Employee | undefined>;

  /**
   * Crea un nuevo empleado
   */
  crearEmpleado(params: CrearEmpleadoParams): Promise<Employee>;

  /**
   * Actualiza un empleado existente
   */
  actualizarEmpleado(id: number, params: Partial<CrearEmpleadoParams>): Promise<Employee | undefined>;

  /**
   * Cambia el estado del contrato de un empleado
   */
  cambiarEstadoEmpleado(id: number, nuevoEstado: string): Promise<Employee | undefined>;
}