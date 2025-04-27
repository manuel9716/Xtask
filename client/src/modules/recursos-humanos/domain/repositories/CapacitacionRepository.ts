/**
 * Interfaz del Repositorio de Capacitaciones
 * Define las operaciones disponibles para gestionar capacitaciones en el sistema
 */

import { Capacitacion, CrearCapacitacionDTO, ActualizarCapacitacionDTO, EstadoCapacitacion, TipoCapacitacion, ModalidadCapacitacion, AsistenciaCapacitacion } from "../entities/Capacitacion";
import { PaginatedResponse, PaginationOptions } from "./EmpleadoRepository";

export interface FiltrosCapacitacion {
  nombre?: string;
  tipo?: TipoCapacitacion;
  modalidad?: ModalidadCapacitacion;
  estado?: EstadoCapacitacion;
  responsableId?: number;
  participanteId?: number;
  fechaDesde?: Date;
  fechaHasta?: Date;
}

export interface CapacitacionRepository {
  // Obtener todas las capacitaciones con filtros y paginación opcional
  listarCapacitaciones(
    filtros?: FiltrosCapacitacion,
    paginacion?: PaginationOptions
  ): Promise<PaginatedResponse<Capacitacion>>;
  
  // Obtener una capacitación por su ID
  obtenerCapacitacionPorId(id: number): Promise<Capacitacion | null>;
  
  // Crear una nueva capacitación
  crearCapacitacion(capacitacion: CrearCapacitacionDTO): Promise<Capacitacion>;
  
  // Actualizar una capacitación existente
  actualizarCapacitacion(capacitacion: ActualizarCapacitacionDTO): Promise<Capacitacion>;
  
  // Eliminar una capacitación
  eliminarCapacitacion(id: number): Promise<boolean>;
  
  // Cambiar el estado de una capacitación
  cambiarEstadoCapacitacion(id: number, estado: EstadoCapacitacion): Promise<Capacitacion>;
  
  // Agregar un participante a la capacitación
  agregarParticipante(capacitacionId: number, empleadoId: number): Promise<boolean>;
  
  // Eliminar un participante de la capacitación
  eliminarParticipante(capacitacionId: number, empleadoId: number): Promise<boolean>;
  
  // Registrar asistencia a una capacitación
  registrarAsistencia(
    capacitacionId: number, 
    asistencia: AsistenciaCapacitacion
  ): Promise<boolean>;
  
  // Obtener capacitaciones por participante
  obtenerCapacitacionesPorParticipante(empleadoId: number): Promise<Capacitacion[]>;
  
  // Obtener capacitaciones por responsable
  obtenerCapacitacionesPorResponsable(responsableId: number): Promise<Capacitacion[]>;
  
  // Obtener estadísticas básicas de capacitaciones
  obtenerEstadisticasCapacitaciones(): Promise<{
    total: number;
    planificadas: number;
    enCurso: number;
    finalizadas: number;
    canceladas: number;
    participantesPromedio: number;
  }>;
  
  // Obtener lista de asistencias para una capacitación
  obtenerAsistencias(capacitacionId: number): Promise<AsistenciaCapacitacion[]>;
  
  // Obtener registro de asistencias por empleado para una capacitación
  obtenerAsistenciasPorEmpleado(
    capacitacionId: number, 
    empleadoId: number
  ): Promise<AsistenciaCapacitacion[]>;
}