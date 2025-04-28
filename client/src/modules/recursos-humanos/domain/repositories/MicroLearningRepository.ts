/**
 * @file Interfaz de repositorio para MicroLearning
 * @description Define el contrato para acceder a los datos de micro-aprendizaje
 */

import {
  MicroLearningContenido,
  MicroLearningRecomendacion,
  MicroLearningHistorial,
  FiltrosMicroLearning,
  ContextoRecomendacion,
  ActualizacionProgresoMicroLearning
} from '../entities/MicroLearning';

/**
 * Interfaz que define las operaciones del repositorio de micro-aprendizaje
 */
export interface MicroLearningRepository {
  /**
   * Obtiene todo el contenido de micro-aprendizaje disponible con filtros opcionales
   */
  obtenerTodoContenido(filtros?: FiltrosMicroLearning): Promise<MicroLearningContenido[]>;

  /**
   * Obtiene un contenido específico por su ID
   */
  obtenerContenidoPorId(id: number): Promise<MicroLearningContenido | null>;

  /**
   * Obtiene recomendaciones personalizadas según el contexto del empleado
   */
  obtenerRecomendaciones(contexto: ContextoRecomendacion): Promise<MicroLearningRecomendacion[]>;

  /**
   * Obtiene el historial de micro-aprendizaje completado por un empleado
   */
  obtenerHistorialEmpleado(empleadoId: number): Promise<MicroLearningHistorial[]>;

  /**
   * Marca un contenido como visto o completado por un empleado
   */
  actualizarProgresoContenido(actualizacion: ActualizacionProgresoMicroLearning): Promise<MicroLearningRecomendacion>;

  /**
   * Registra la valoración y comentarios de un empleado sobre un contenido
   */
  registrarValoracion(
    empleadoId: number, 
    contenidoId: number, 
    valoracion: number, 
    comentario?: string
  ): Promise<MicroLearningHistorial>;

  /**
   * Obtiene estadísticas de uso y progreso de micro-aprendizaje para un empleado
   */
  obtenerEstadisticasEmpleado(empleadoId: number): Promise<any>;

  /**
   * Obtiene estadísticas de uso y progreso de micro-aprendizaje para la organización
   */
  obtenerEstadisticasGlobales(): Promise<any>;
}