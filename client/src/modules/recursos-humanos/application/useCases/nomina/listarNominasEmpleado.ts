/**
 * Caso de uso: Listar Nóminas de Empleado
 * Permite obtener los registros de nómina de un empleado específico
 */

import { EmpleadoRepository } from "../../../domain/repositories/EmpleadoRepository";
import { 
  NominaRepository, 
  RegistroNomina, 
  FiltrosNomina 
} from "../../../domain/repositories/NominaRepository";
import { PaginatedResponse, PaginationOptions } from "../../../domain/repositories/EmpleadoRepository";

export class ListarNominasEmpleadoUseCase {
  constructor(
    private nominaRepository: NominaRepository,
    private empleadoRepository: EmpleadoRepository
  ) {}

  /**
   * Ejecuta el caso de uso para obtener las nóminas de un empleado específico
   * @param empleadoId ID del empleado
   * @param paginacion Opciones de paginación
   * @returns Lista paginada de registros de nómina del empleado
   */
  async execute(
    empleadoId: number,
    paginacion?: PaginationOptions
  ): Promise<PaginatedResponse<RegistroNomina>> {
    // Validar que el empleado exista
    const empleado = await this.empleadoRepository.obtenerEmpleadoPorId(empleadoId);
    if (!empleado) {
      throw new Error(`No se encontró el empleado con ID: ${empleadoId}`);
    }
    
    // Configurar paginación por defecto si no se proporciona
    const paginacionDefault: PaginationOptions = {
      page: 1,
      pageSize: 10,
      ...paginacion
    };
    
    // Definir filtros para buscar nóminas del empleado
    const filtros: FiltrosNomina = {
      empleadoId
    };
    
    // Obtener nóminas del empleado
    return this.nominaRepository.listarNominas(filtros, paginacionDefault);
  }

  /**
   * Ejecuta el caso de uso para obtener todas las nóminas de un empleado sin paginación
   * @param empleadoId ID del empleado
   * @returns Lista completa de registros de nómina del empleado
   */
  async executeGetAll(empleadoId: number): Promise<RegistroNomina[]> {
    // Validar que el empleado exista
    const empleado = await this.empleadoRepository.obtenerEmpleadoPorId(empleadoId);
    if (!empleado) {
      throw new Error(`No se encontró el empleado con ID: ${empleadoId}`);
    }
    
    // Usar el método optimizado del repositorio
    return this.nominaRepository.obtenerNominasPorEmpleado(empleadoId);
  }

  /**
   * Ejecuta el caso de uso para obtener nóminas filtradas
   * @param filtros Filtros a aplicar
   * @param paginacion Opciones de paginación
   * @returns Lista paginada de registros de nómina que cumplen los filtros
   */
  async executeFiltrado(
    filtros: FiltrosNomina,
    paginacion?: PaginationOptions
  ): Promise<PaginatedResponse<RegistroNomina>> {
    // Configurar paginación por defecto si no se proporciona
    const paginacionDefault: PaginationOptions = {
      page: 1,
      pageSize: 10,
      ...paginacion
    };
    
    // Obtener nóminas filtradas
    return this.nominaRepository.listarNominas(filtros, paginacionDefault);
  }
}