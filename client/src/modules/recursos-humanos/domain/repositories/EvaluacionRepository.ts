/**
 * Interfaz del Repositorio de Evaluaciones
 * Define las operaciones disponibles para gestionar evaluaciones en el sistema
 */

import { Evaluacion, CrearEvaluacionDTO, ActualizarEvaluacionDTO, TipoEvaluacion, EstadoEvaluacion } from "../entities/Evaluacion";
import { PaginatedResponse, PaginationOptions } from "./EmpleadoRepository";

export interface FiltrosEvaluacion {
  empleadoId?: number;
  evaluadorId?: number;
  tipo?: TipoEvaluacion;
  estado?: EstadoEvaluacion;
  periodo?: string;
  fechaDesde?: Date;
  fechaHasta?: Date;
}

export interface EvaluacionRepository {
  // Obtener todas las evaluaciones con filtros y paginación opcional
  listarEvaluaciones(
    filtros?: FiltrosEvaluacion,
    paginacion?: PaginationOptions
  ): Promise<PaginatedResponse<Evaluacion>>;
  
  // Obtener una evaluación por su ID
  obtenerEvaluacionPorId(id: number): Promise<Evaluacion | null>;
  
  // Crear una nueva evaluación
  crearEvaluacion(evaluacion: CrearEvaluacionDTO): Promise<Evaluacion>;
  
  // Actualizar una evaluación existente
  actualizarEvaluacion(evaluacion: ActualizarEvaluacionDTO): Promise<Evaluacion>;
  
  // Eliminar una evaluación
  eliminarEvaluacion(id: number): Promise<boolean>;
  
  // Cambiar el estado de una evaluación
  cambiarEstadoEvaluacion(id: number, estado: EstadoEvaluacion): Promise<Evaluacion>;
  
  // Obtener evaluaciones por empleado
  obtenerEvaluacionesPorEmpleado(empleadoId: number): Promise<Evaluacion[]>;
  
  // Obtener evaluaciones por evaluador
  obtenerEvaluacionesPorEvaluador(evaluadorId: number): Promise<Evaluacion[]>;
  
  // Obtener estadísticas básicas de evaluaciones
  obtenerEstadisticasEvaluaciones(): Promise<{
    total: number;
    pendientes: number;
    enProceso: number;
    completadas: number;
    promedioCalificacion: number;
  }>;
  
  // Asignar calificación a una evaluación
  asignarCalificacion(id: number, calificacion: number): Promise<Evaluacion>;
  
  // Agregar retroalimentación a una evaluación
  agregarRetroalimentacion(id: number, retroalimentacion: string): Promise<Evaluacion>;
}