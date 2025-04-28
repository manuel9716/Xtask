/**
 * @file Entidad de dominio para Capacitaciones
 * @description Define la entidad de dominio para las capacitaciones y programas de formación
 */

import { TipoCapacitacion, EstadoCapacitacion } from '@shared/schema';

/**
 * Entidad de dominio para las capacitaciones
 */
export class Capacitacion {
  id?: number;
  titulo: string;
  descripcion?: string;
  tipo: TipoCapacitacion;
  estado: EstadoCapacitacion;
  responsableId: number;
  fechaInicio: Date;
  fechaFin: Date;
  duracionHoras: number;
  ubicacion?: string;
  modalidad: string;
  proveedor?: string;
  costo?: number;
  objetivos?: string;
  contenido?: string;
  materialUrl?: string;
  capacidadMaxima?: number;
  createdAt?: Date;
  updatedAt?: Date;

  constructor(props: {
    id?: number;
    titulo: string;
    descripcion?: string;
    tipo: TipoCapacitacion;
    estado?: EstadoCapacitacion;
    responsableId: number;
    fechaInicio: Date;
    fechaFin: Date;
    duracionHoras: number;
    ubicacion?: string;
    modalidad: string;
    proveedor?: string;
    costo?: number;
    objetivos?: string;
    contenido?: string;
    materialUrl?: string;
    capacidadMaxima?: number;
    createdAt?: Date;
    updatedAt?: Date;
  }) {
    this.id = props.id;
    this.titulo = props.titulo;
    this.descripcion = props.descripcion;
    this.tipo = props.tipo;
    this.estado = props.estado || EstadoCapacitacion.PROGRAMADA;
    this.responsableId = props.responsableId;
    this.fechaInicio = props.fechaInicio;
    this.fechaFin = props.fechaFin;
    this.duracionHoras = props.duracionHoras;
    this.ubicacion = props.ubicacion;
    this.modalidad = props.modalidad;
    this.proveedor = props.proveedor;
    this.costo = props.costo;
    this.objetivos = props.objetivos;
    this.contenido = props.contenido;
    this.materialUrl = props.materialUrl;
    this.capacidadMaxima = props.capacidadMaxima;
    this.createdAt = props.createdAt;
    this.updatedAt = props.updatedAt;
  }

  /**
   * Cambia el estado de una capacitación
   */
  cambiarEstado(nuevoEstado: EstadoCapacitacion): Capacitacion {
    this.estado = nuevoEstado;
    this.updatedAt = new Date();
    return this;
  }

  /**
   * Verifica si la capacitación ha finalizado (fecha actual mayor a fecha de fin)
   */
  haFinalizado(): boolean {
    return new Date() > this.fechaFin;
  }

  /**
   * Marca una capacitación como completada
   */
  completar(): Capacitacion {
    if (!this.haFinalizado()) {
      throw new Error('No se puede marcar como completada una capacitación que aún no ha finalizado');
    }
    
    this.estado = EstadoCapacitacion.COMPLETADA;
    this.updatedAt = new Date();
    return this;
  }

  /**
   * Pospone una capacitación para una nueva fecha
   */
  posponer(nuevaFechaInicio: Date, nuevaFechaFin: Date): Capacitacion {
    if (nuevaFechaInicio >= nuevaFechaFin) {
      throw new Error('La fecha de inicio debe ser anterior a la fecha de fin');
    }
    
    this.fechaInicio = nuevaFechaInicio;
    this.fechaFin = nuevaFechaFin;
    this.estado = EstadoCapacitacion.POSPUESTA;
    this.updatedAt = new Date();
    return this;
  }

  /**
   * Calcula la duración en días de la capacitación
   */
  obtenerDuracionDias(): number {
    const diff = this.fechaFin.getTime() - this.fechaInicio.getTime();
    return Math.ceil(diff / (1000 * 3600 * 24));
  }
}

/**
 * DTO para la relación Empleado-Capacitación (inscripción y asistencia)
 */
export class EmpleadoCapacitacion {
  id?: number;
  empleadoId: number;
  capacitacionId: number;
  asistencia: boolean;
  calificacion?: number;
  completado: boolean;
  comentarios?: string;
  fechaInscripcion: Date;
  certificadoUrl?: string;

  constructor(props: {
    id?: number;
    empleadoId: number;
    capacitacionId: number;
    asistencia?: boolean;
    calificacion?: number;
    completado?: boolean;
    comentarios?: string;
    fechaInscripcion?: Date;
    certificadoUrl?: string;
  }) {
    this.id = props.id;
    this.empleadoId = props.empleadoId;
    this.capacitacionId = props.capacitacionId;
    this.asistencia = props.asistencia || false;
    this.calificacion = props.calificacion;
    this.completado = props.completado || false;
    this.comentarios = props.comentarios;
    this.fechaInscripcion = props.fechaInscripcion || new Date();
    this.certificadoUrl = props.certificadoUrl;
  }

  /**
   * Marca la asistencia de un empleado a la capacitación
   */
  marcarAsistencia(): EmpleadoCapacitacion {
    this.asistencia = true;
    return this;
  }

  /**
   * Marca la capacitación como completada por el empleado
   */
  marcarCompletada(calificacion?: number): EmpleadoCapacitacion {
    this.completado = true;
    if (calificacion !== undefined) {
      this.calificacion = calificacion;
    }
    return this;
  }
}

/**
 * DTO para crear una capacitación
 */
export interface CrearCapacitacionDTO {
  titulo: string;
  descripcion?: string;
  tipo: TipoCapacitacion;
  responsableId: number;
  fechaInicio: Date;
  fechaFin: Date;
  duracionHoras: number;
  ubicacion?: string;
  modalidad: string;
  proveedor?: string;
  costo?: number;
  objetivos?: string;
  contenido?: string;
  materialUrl?: string;
  capacidadMaxima?: number;
}

/**
 * DTO para actualizar una capacitación
 */
export interface ActualizarCapacitacionDTO {
  id: number;
  titulo?: string;
  descripcion?: string;
  tipo?: TipoCapacitacion;
  estado?: EstadoCapacitacion;
  responsableId?: number;
  fechaInicio?: Date;
  fechaFin?: Date;
  duracionHoras?: number;
  ubicacion?: string;
  modalidad?: string;
  proveedor?: string;
  costo?: number;
  objetivos?: string;
  contenido?: string;
  materialUrl?: string;
  capacidadMaxima?: number;
}

/**
 * DTO para inscribir a un empleado en una capacitación
 */
export interface InscribirEmpleadoDTO {
  empleadoId: number;
  capacitacionId: number;
  comentarios?: string;
}

/**
 * DTO para los filtros de búsqueda de capacitaciones
 */
export interface FiltrosCapacitacion {
  responsableId?: number;
  tipo?: TipoCapacitacion;
  estado?: EstadoCapacitacion;
  fechaDesde?: Date;
  fechaHasta?: Date;
  modalidad?: string;
  proveedor?: string;
  busqueda?: string;
}