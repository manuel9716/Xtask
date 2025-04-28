/**
 * @file Repositorio para Capacitaciones
 * @description Define la interfaz del repositorio para las capacitaciones y formaciones
 */

import { Capacitacion, EmpleadoCapacitacion, CrearCapacitacionDTO, ActualizarCapacitacionDTO, InscribirEmpleadoDTO, FiltrosCapacitacion } from '../entities/Capacitacion';
import { TipoCapacitacion, EstadoCapacitacion } from '@shared/schema';

/**
 * Interfaz del repositorio para capacitaciones
 */
export interface CapacitacionRepository {
  /**
   * Obtiene todas las capacitaciones según filtros opcionales
   */
  listar(filtros?: FiltrosCapacitacion): Promise<Capacitacion[]>;
  
  /**
   * Obtiene una capacitación por su ID
   */
  obtenerPorId(id: number): Promise<Capacitacion | null>;
  
  /**
   * Obtiene capacitaciones programadas (futuras)
   */
  obtenerCapacitacionesProgramadas(): Promise<Capacitacion[]>;
  
  /**
   * Obtiene capacitaciones en curso
   */
  obtenerCapacitacionesEnCurso(): Promise<Capacitacion[]>;
  
  /**
   * Obtiene capacitaciones finalizadas
   */
  obtenerCapacitacionesFinalizadas(): Promise<Capacitacion[]>;
  
  /**
   * Crea una nueva capacitación
   */
  crear(capacitacion: CrearCapacitacionDTO): Promise<Capacitacion>;
  
  /**
   * Actualiza una capacitación existente
   */
  actualizar(capacitacion: ActualizarCapacitacionDTO): Promise<Capacitacion>;
  
  /**
   * Elimina una capacitación por su ID
   */
  eliminar(id: number): Promise<boolean>;
  
  /**
   * Cambia el estado de una capacitación
   */
  cambiarEstado(id: number, nuevoEstado: EstadoCapacitacion): Promise<Capacitacion>;
  
  /**
   * Inscribe un empleado en una capacitación
   */
  inscribirEmpleado(datos: InscribirEmpleadoDTO): Promise<EmpleadoCapacitacion>;
  
  /**
   * Cancela la inscripción de un empleado en una capacitación
   */
  cancelarInscripcion(empleadoId: number, capacitacionId: number): Promise<boolean>;
  
  /**
   * Obtiene las inscripciones a una capacitación
   */
  obtenerInscripciones(capacitacionId: number): Promise<EmpleadoCapacitacion[]>;
  
  /**
   * Registra la asistencia de un empleado a una capacitación
   */
  registrarAsistencia(empleadoId: number, capacitacionId: number, asistio: boolean): Promise<EmpleadoCapacitacion>;
  
  /**
   * Marca una capacitación como completada para un empleado
   */
  marcarCompletada(empleadoId: number, capacitacionId: number, calificacion?: number): Promise<EmpleadoCapacitacion>;
  
  /**
   * Obtiene las capacitaciones de un empleado
   */
  obtenerCapacitacionesPorEmpleado(empleadoId: number): Promise<Capacitacion[]>;
  
  /**
   * Obtiene estadísticas de capacitaciones
   */
  obtenerEstadisticasCapacitaciones(): Promise<any>;
}