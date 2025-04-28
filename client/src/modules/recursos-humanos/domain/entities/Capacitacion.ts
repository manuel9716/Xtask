/**
 * @file Entidad Capacitacion
 * @description Define la estructura de datos de capacitaciones y formaciones
 */

import { EstadoCapacitacion, TipoCapacitacion, ModalidadCapacitacion } from '@shared/schema';

/**
 * Entidad Capacitación
 */
export interface Capacitacion {
  id: number;
  titulo: string;
  descripcion?: string;
  fechaInicio: Date;
  fechaFin: Date;
  tipo: TipoCapacitacion;
  modalidad: ModalidadCapacitacion;
  estado: EstadoCapacitacion;
  duracionHoras: number;
  responsableId: number;
  ubicacion?: string;
  enlaceVirtual?: string;
  costo: number;
  proveedor?: string;
  materialUrl?: string;
  certificado?: boolean;
  objetivos?: string;
  contenido?: string;
  cupoMaximo?: number;
  notas?: string;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Relación entre Empleado y Capacitación (inscripción)
 */
export interface EmpleadoCapacitacion {
  empleadoId: number;
  capacitacionId: number;
  asistencia: boolean;
  completado: boolean;
  calificacion?: number;
  comentarios?: string;
  fechaInscripcion: Date;
}

/**
 * DTO para crear una Capacitación
 */
export interface CrearCapacitacionDTO {
  titulo: string;
  descripcion?: string;
  fechaInicio: Date;
  fechaFin: Date;
  tipo: TipoCapacitacion;
  modalidad: ModalidadCapacitacion;
  estado?: EstadoCapacitacion;
  duracionHoras: number;
  responsableId: number;
  ubicacion?: string;
  enlaceVirtual?: string;
  costo: number;
  proveedor?: string;
  materialUrl?: string;
  certificado?: boolean;
  objetivos?: string;
  contenido?: string;
  cupoMaximo?: number;
  notas?: string;
}

/**
 * DTO para actualizar una Capacitación
 */
export interface ActualizarCapacitacionDTO {
  id: number;
  titulo?: string;
  descripcion?: string;
  fechaInicio?: Date;
  fechaFin?: Date;
  tipo?: TipoCapacitacion;
  modalidad?: ModalidadCapacitacion;
  estado?: EstadoCapacitacion;
  duracionHoras?: number;
  responsableId?: number;
  ubicacion?: string;
  enlaceVirtual?: string;
  costo?: number;
  proveedor?: string;
  materialUrl?: string;
  certificado?: boolean;
  objetivos?: string;
  contenido?: string;
  cupoMaximo?: number;
  notas?: string;
}

/**
 * DTO para inscribir un empleado en una capacitación
 */
export interface InscribirEmpleadoDTO {
  empleadoId: number;
  capacitacionId: number;
  comentarios?: string;
}

/**
 * Filtros para listar capacitaciones
 */
export interface FiltrosCapacitacion {
  responsableId?: number;
  tipo?: TipoCapacitacion;
  estado?: EstadoCapacitacion;
  modalidad?: ModalidadCapacitacion;
  fechaDesde?: Date;
  fechaHasta?: Date;
  proveedor?: string;
  busqueda?: string;
}

/**
 * Mapeo de estados de capacitación para mostrar en la interfaz
 */
export const ESTADOS_CAPACITACION_LABELS: Record<EstadoCapacitacion, string> = {
  [EstadoCapacitacion.PROGRAMADA]: 'Programada',
  [EstadoCapacitacion.EN_CURSO]: 'En Curso',
  [EstadoCapacitacion.COMPLETADA]: 'Completada',
  [EstadoCapacitacion.CANCELADA]: 'Cancelada',
  [EstadoCapacitacion.POSPUESTA]: 'Pospuesta'
};

/**
 * Mapeo de tipos de capacitación para mostrar en la interfaz
 */
export const TIPOS_CAPACITACION_LABELS: Record<TipoCapacitacion, string> = {
  [TipoCapacitacion.TECNICA]: 'Técnica',
  [TipoCapacitacion.HABILIDADES_BLANDAS]: 'Habilidades Blandas',
  [TipoCapacitacion.SEGURIDAD]: 'Seguridad',
  [TipoCapacitacion.LEGAL]: 'Legal/Normativa',
  [TipoCapacitacion.TECNOLOGIA]: 'Tecnología',
  [TipoCapacitacion.LIDERAZGO]: 'Liderazgo',
  [TipoCapacitacion.ONBOARDING]: 'Onboarding'
};

/**
 * Mapeo de modalidades de capacitación para mostrar en la interfaz
 */
export const MODALIDADES_CAPACITACION_LABELS: Record<ModalidadCapacitacion, string> = {
  [ModalidadCapacitacion.PRESENCIAL]: 'Presencial',
  [ModalidadCapacitacion.VIRTUAL]: 'Virtual',
  [ModalidadCapacitacion.HIBRIDA]: 'Híbrida',
  [ModalidadCapacitacion.AUTOAPRENDIZAJE]: 'Autoaprendizaje'
};