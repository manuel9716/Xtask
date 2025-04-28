/**
 * @file Entidad de dominio para Evaluaciones de Desempeño
 * @description Define la entidad de dominio para las evaluaciones de desempeño de empleados
 */

import { TipoEvaluacion, EstadoEvaluacion } from '@shared/schema';

/**
 * Entidad de dominio para las evaluaciones de desempeño
 */
export class Evaluacion {
  id?: number;
  empleadoId: number;
  evaluadorId: number;
  titulo: string;
  descripcion?: string;
  tipo: TipoEvaluacion;
  estado: EstadoEvaluacion;
  fechaInicio: Date;
  fechaFinalizacion?: Date;
  calificacion?: number;
  comentarios?: string;
  fortalezas?: string;
  areasAMejorar?: string;
  objetivosSiguientePeriodo?: string;
  criteriosJson?: string;
  createdAt?: Date;
  updatedAt?: Date;

  constructor(props: {
    id?: number;
    empleadoId: number;
    evaluadorId: number;
    titulo: string;
    descripcion?: string;
    tipo: TipoEvaluacion;
    estado?: EstadoEvaluacion;
    fechaInicio: Date;
    fechaFinalizacion?: Date;
    calificacion?: number;
    comentarios?: string;
    fortalezas?: string;
    areasAMejorar?: string;
    objetivosSiguientePeriodo?: string;
    criteriosJson?: string;
    createdAt?: Date;
    updatedAt?: Date;
  }) {
    this.id = props.id;
    this.empleadoId = props.empleadoId;
    this.evaluadorId = props.evaluadorId;
    this.titulo = props.titulo;
    this.descripcion = props.descripcion;
    this.tipo = props.tipo;
    this.estado = props.estado || EstadoEvaluacion.PENDIENTE;
    this.fechaInicio = props.fechaInicio;
    this.fechaFinalizacion = props.fechaFinalizacion;
    this.calificacion = props.calificacion;
    this.comentarios = props.comentarios;
    this.fortalezas = props.fortalezas;
    this.areasAMejorar = props.areasAMejorar;
    this.objetivosSiguientePeriodo = props.objetivosSiguientePeriodo;
    this.criteriosJson = props.criteriosJson;
    this.createdAt = props.createdAt;
    this.updatedAt = props.updatedAt;
  }

  /**
   * Valida si una evaluación está completa para ser finalizada
   */
  estaCompletaParaFinalizar(): boolean {
    return (
      !!this.calificacion &&
      !!this.fechaInicio &&
      !!this.fechaFinalizacion &&
      !!this.comentarios
    );
  }

  /**
   * Finaliza una evaluación si cumple con los requisitos
   */
  finalizar(fechaFinalizacion: Date = new Date()): Evaluacion {
    if (!this.estaCompletaParaFinalizar()) {
      throw new Error('La evaluación no está completa para ser finalizada');
    }

    this.estado = EstadoEvaluacion.COMPLETADA;
    this.fechaFinalizacion = fechaFinalizacion;
    this.updatedAt = new Date();
    return this;
  }

  /**
   * Cambia el estado de una evaluación
   */
  cambiarEstado(nuevoEstado: EstadoEvaluacion): Evaluacion {
    this.estado = nuevoEstado;
    this.updatedAt = new Date();
    return this;
  }

  /**
   * Actualiza la calificación de la evaluación
   */
  actualizarCalificacion(calificacion: number): Evaluacion {
    if (calificacion < 0 || calificacion > 5) {
      throw new Error('La calificación debe estar entre 0 y 5');
    }
    
    this.calificacion = calificacion;
    this.updatedAt = new Date();
    return this;
  }
}

/**
 * DTO para crear una evaluación
 */
export interface CrearEvaluacionDTO {
  empleadoId: number;
  evaluadorId: number;
  titulo: string;
  descripcion?: string;
  tipo: TipoEvaluacion;
  fechaInicio: Date;
  fechaFinalizacion?: Date;
  criteriosJson?: string;
}

/**
 * DTO para actualizar una evaluación
 */
export interface ActualizarEvaluacionDTO {
  id: number;
  titulo?: string;
  descripcion?: string;
  tipo?: TipoEvaluacion;
  estado?: EstadoEvaluacion;
  fechaInicio?: Date;
  fechaFinalizacion?: Date;
  calificacion?: number;
  comentarios?: string;
  fortalezas?: string;
  areasAMejorar?: string;
  objetivosSiguientePeriodo?: string;
  criteriosJson?: string;
}

/**
 * DTO para los filtros de búsqueda de evaluaciones
 */
export interface FiltrosEvaluacion {
  empleadoId?: number;
  evaluadorId?: number;
  tipo?: TipoEvaluacion;
  estado?: EstadoEvaluacion;
  fechaDesde?: Date;
  fechaHasta?: Date;
  calificacionMin?: number;
  calificacionMax?: number;
  busqueda?: string;
}