/**
 * @file Repositorio para Evaluaciones
 * @description Define la interfaz del repositorio para las evaluaciones de desempeño
 */

import { Evaluacion, CrearEvaluacionDTO, ActualizarEvaluacionDTO, FiltrosEvaluacion } from '../entities/Evaluacion';
import { TipoEvaluacion, EstadoEvaluacion } from '@shared/schema';

/**
 * Interfaz del repositorio para evaluaciones de desempeño
 */
export interface EvaluacionRepository {
  /**
   * Obtiene todas las evaluaciones según filtros opcionales
   */
  listar(filtros?: FiltrosEvaluacion): Promise<Evaluacion[]>;
  
  /**
   * Obtiene una evaluación por su ID
   */
  obtenerPorId(id: number): Promise<Evaluacion | null>;
  
  /**
   * Obtiene evaluaciones por ID de empleado
   */
  obtenerPorEmpleadoId(empleadoId: number): Promise<Evaluacion[]>;
  
  /**
   * Crea una nueva evaluación
   */
  crear(evaluacion: CrearEvaluacionDTO): Promise<Evaluacion>;
  
  /**
   * Actualiza una evaluación existente
   */
  actualizar(evaluacion: ActualizarEvaluacionDTO): Promise<Evaluacion>;
  
  /**
   * Elimina una evaluación por su ID
   */
  eliminar(id: number): Promise<boolean>;
  
  /**
   * Cambia el estado de una evaluación
   */
  cambiarEstado(id: number, nuevoEstado: EstadoEvaluacion): Promise<Evaluacion>;
  
  /**
   * Obtiene estadísticas de evaluaciones por departamento
   */
  obtenerEstadisticasPorDepartamento(): Promise<any>;
  
  /**
   * Obtiene estadísticas de evaluaciones por cargo/posición
   */
  obtenerEstadisticasPorCargo(): Promise<any>;
  
  /**
   * Obtiene las últimas evaluaciones
   */
  obtenerUltimasEvaluaciones(limite: number): Promise<Evaluacion[]>;
}