/**
 * @file Entidad Evaluacion
 * @description Define la estructura de datos de evaluaciones de desempeño
 */

import { EstadoEvaluacion, TipoEvaluacion } from '@shared/schema';

/**
 * Entidad Evaluación de desempeño
 */
export interface Evaluacion {
  id: number;
  titulo: string;
  descripcion?: string;
  empleadoId: number;
  evaluadorId: number;
  fechaInicio: Date;
  fechaFin?: Date;
  tipo: TipoEvaluacion;
  estado: EstadoEvaluacion;
  calificacion?: number;
  criteriosJson?: string;
  comentarios?: string;
  fortalezas?: string;
  areasAMejorar?: string;
  objetivosSiguientePeriodo?: string;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * DTO para crear una Evaluación
 */
export interface CrearEvaluacionDTO {
  titulo: string;
  descripcion?: string;
  empleadoId: number;
  evaluadorId: number;
  fechaInicio: Date;
  fechaFin?: Date;
  tipo: TipoEvaluacion;
  estado?: EstadoEvaluacion;
  criteriosJson?: string;
  comentarios?: string;
  fortalezas?: string;
  areasAMejorar?: string;
  objetivosSiguientePeriodo?: string;
}

/**
 * DTO para actualizar una Evaluación
 */
export interface ActualizarEvaluacionDTO {
  id: number;
  titulo?: string;
  descripcion?: string;
  empleadoId?: number;
  evaluadorId?: number;
  fechaInicio?: Date;
  fechaFin?: Date;
  tipo?: TipoEvaluacion;
  estado?: EstadoEvaluacion;
  calificacion?: number;
  criteriosJson?: string;
  comentarios?: string;
  fortalezas?: string;
  areasAMejorar?: string;
  objetivosSiguientePeriodo?: string;
}

/**
 * DTO para completar una Evaluación
 */
export interface CompletarEvaluacionDTO {
  id: number;
  calificacion: number;
  comentarios?: string;
  fortalezas?: string;
  areasAMejorar?: string;
  objetivosSiguientePeriodo?: string;
}

/**
 * Filtros para listar evaluaciones
 */
export interface FiltrosEvaluacion {
  empleadoId?: number;
  evaluadorId?: number;
  tipo?: TipoEvaluacion;
  estado?: EstadoEvaluacion;
  fechaDesde?: Date;
  fechaHasta?: Date;
  busqueda?: string;
}

/**
 * Criterio de evaluación
 */
export interface CriterioEvaluacion {
  id: string;
  nombre: string;
  descripcion?: string;
  peso: number;
  calificacion?: number;
  comentario?: string;
}

/**
 * Tipo de criterio (para tener un objeto fácil de utilizar)
 */
export const CRITERIOS_EVALUACION = {
  PRODUCTIVIDAD: 'PRODUCTIVIDAD',
  CALIDAD: 'CALIDAD',
  COMUNICACION: 'COMUNICACION',
  TRABAJO_EQUIPO: 'TRABAJO_EQUIPO',
  INICIATIVA: 'INICIATIVA',
  LIDERAZGO: 'LIDERAZGO',
  APRENDIZAJE: 'APRENDIZAJE',
  RESOLUCION_PROBLEMAS: 'RESOLUCION_PROBLEMAS',
  PUNTUALIDAD: 'PUNTUALIDAD',
  CUMPLIMIENTO_OBJETIVOS: 'CUMPLIMIENTO_OBJETIVOS'
} as const;

/**
 * Mapeo de estados de evaluación para mostrar en la interfaz
 */
export const ESTADOS_EVALUACION_LABELS: Record<EstadoEvaluacion, string> = {
  [EstadoEvaluacion.PENDIENTE]: 'Pendiente',
  [EstadoEvaluacion.EN_CURSO]: 'En Curso',
  [EstadoEvaluacion.COMPLETADA]: 'Completada',
  [EstadoEvaluacion.REVISADA]: 'Revisada',
  [EstadoEvaluacion.ARCHIVADA]: 'Archivada',
  [EstadoEvaluacion.CANCELADA]: 'Cancelada'
};

/**
 * Mapeo de tipos de evaluación para mostrar en la interfaz
 */
export const TIPOS_EVALUACION_LABELS: Record<TipoEvaluacion, string> = {
  [TipoEvaluacion.PERIODO]: 'Evaluación de Periodo',
  [TipoEvaluacion.OBJETIVOS]: 'Evaluación por Objetivos',
  [TipoEvaluacion.DESEMPENO]: 'Evaluación de Desempeño',
  [TipoEvaluacion.COMPETENCIAS]: 'Evaluación de Competencias',
  [TipoEvaluacion.PROYECTO]: 'Evaluación de Proyecto',
  [TipoEvaluacion.INICIAL]: 'Evaluación Inicial',
  [TipoEvaluacion.ANUAL]: 'Evaluación Anual'
};