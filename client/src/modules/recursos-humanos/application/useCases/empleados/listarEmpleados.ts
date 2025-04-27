/**
 * Caso de uso: Listar Empleados
 * Permite obtener la lista de empleados con filtros y paginación
 */

import { Empleado, FiltrosEmpleadoRRHH } from "../../../domain/entities/Empleado";
import { EmpleadoRepository, PaginatedResponse, PaginationOptions } from "../../../domain/repositories/EmpleadoRepository";

export class ListarEmpleadosUseCase {
  constructor(private empleadoRepository: EmpleadoRepository) {}

  /**
   * Ejecuta el caso de uso para listar empleados con filtros y paginación
   * @param filtros Filtros a aplicar en la búsqueda de empleados
   * @param paginacion Opciones de paginación
   * @returns Lista paginada de empleados
   */
  async execute(
    filtros?: FiltrosEmpleadoRRHH,
    paginacion?: PaginationOptions
  ): Promise<PaginatedResponse<Empleado>> {
    // Configurar paginación por defecto si no se proporciona
    const paginacionDefault: PaginationOptions = {
      page: 1,
      pageSize: 10,
      ...paginacion
    };
    
    // Aplicar filtros y obtener datos paginados
    return this.empleadoRepository.listarEmpleados(filtros, paginacionDefault);
  }

  /**
   * Ejecuta el caso de uso para obtener todos los empleados sin paginación
   * Útil para exportación de datos o reportes
   * @param filtros Filtros a aplicar en la búsqueda de empleados
   * @returns Lista completa de empleados
   */
  async executeGetAll(filtros?: FiltrosEmpleadoRRHH): Promise<Empleado[]> {
    // Si hay filtros, aún necesitamos aplicarlos sin paginación
    if (filtros) {
      // Esta es una implementación alternativa que depende del repositorio
      // Podríamos crear un método separado en el repositorio para esto
      const resultado = await this.empleadoRepository.listarEmpleados(filtros, {
        page: 1,
        pageSize: Number.MAX_SAFE_INTEGER // Un número muy grande para obtener todos
      });
      return resultado.data;
    }
    
    // Si no hay filtros, usar el método optimizado para obtener todos
    return this.empleadoRepository.obtenerTodosEmpleados();
  }

  /**
   * Busca empleados por texto (nombre, cargo, etc.)
   * @param termino Término de búsqueda
   * @returns Lista de empleados que coinciden con el término de búsqueda
   */
  async buscar(termino: string): Promise<Empleado[]> {
    if (!termino || termino.trim() === '') {
      return [];
    }
    
    return this.empleadoRepository.buscarEmpleados(termino);
  }
}