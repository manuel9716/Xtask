/**
 * Caso de uso: Listar Evaluaciones de Empleado
 * Permite obtener las evaluaciones asociadas a un empleado específico
 */

import { Evaluacion } from "../../../domain/entities/Evaluacion";
import { EvaluacionRepository, FiltrosEvaluacion } from "../../../domain/repositories/EvaluacionRepository";
import { EmpleadoRepository } from "../../../domain/repositories/EmpleadoRepository";
import { PaginatedResponse, PaginationOptions } from "../../../domain/repositories/EmpleadoRepository";

export class ListarEvaluacionesEmpleadoUseCase {
  constructor(
    private evaluacionRepository: EvaluacionRepository,
    private empleadoRepository: EmpleadoRepository
  ) {}

  /**
   * Ejecuta el caso de uso para obtener las evaluaciones de un empleado específico
   * @param empleadoId ID del empleado cuyas evaluaciones se quieren obtener
   * @param paginacion Opciones de paginación
   * @returns Lista paginada de evaluaciones del empleado
   * @throws Error si el empleado no existe
   */
  async execute(
    empleadoId: number,
    paginacion?: PaginationOptions
  ): Promise<PaginatedResponse<Evaluacion>> {
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
    
    // Definir filtros para buscar evaluaciones del empleado
    const filtros: FiltrosEvaluacion = {
      empleadoId
    };
    
    // Obtener evaluaciones del empleado
    return this.evaluacionRepository.listarEvaluaciones(filtros, paginacionDefault);
  }

  /**
   * Ejecuta el caso de uso para obtener todas las evaluaciones de un empleado sin paginación
   * @param empleadoId ID del empleado
   * @returns Lista completa de evaluaciones del empleado
   */
  async executeGetAll(empleadoId: number): Promise<Evaluacion[]> {
    // Validar que el empleado exista
    const empleado = await this.empleadoRepository.obtenerEmpleadoPorId(empleadoId);
    if (!empleado) {
      throw new Error(`No se encontró el empleado con ID: ${empleadoId}`);
    }
    
    // Usar el método optimizado del repositorio
    return this.evaluacionRepository.obtenerEvaluacionesPorEmpleado(empleadoId);
  }

  /**
   * Ejecuta el caso de uso para obtener las evaluaciones realizadas por un evaluador
   * @param evaluadorId ID del empleado evaluador
   * @param paginacion Opciones de paginación
   * @returns Lista paginada de evaluaciones realizadas por el evaluador
   */
  async executeByEvaluador(
    evaluadorId: number,
    paginacion?: PaginationOptions
  ): Promise<PaginatedResponse<Evaluacion>> {
    // Validar que el evaluador exista
    const evaluador = await this.empleadoRepository.obtenerEmpleadoPorId(evaluadorId);
    if (!evaluador) {
      throw new Error(`No se encontró el evaluador con ID: ${evaluadorId}`);
    }
    
    // Configurar paginación por defecto si no se proporciona
    const paginacionDefault: PaginationOptions = {
      page: 1,
      pageSize: 10,
      ...paginacion
    };
    
    // Definir filtros para buscar evaluaciones realizadas por el evaluador
    const filtros: FiltrosEvaluacion = {
      evaluadorId
    };
    
    // Obtener evaluaciones realizadas por el evaluador
    return this.evaluacionRepository.listarEvaluaciones(filtros, paginacionDefault);
  }
}