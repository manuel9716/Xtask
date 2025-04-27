/**
 * Entidad de dominio Evaluacion para el módulo de Recursos Humanos
 * Representa una evaluación de desempeño de un empleado
 */

// Enums para los valores de estado de la evaluación
export enum EstadoEvaluacion {
  PENDIENTE = 'pendiente',
  EN_PROCESO = 'en_proceso',
  COMPLETADA = 'completada',
  REVISADA = 'revisada',
  CANCELADA = 'cancelada'
}

// Enums para los valores de tipo de evaluación
export enum TipoEvaluacion {
  DESEMPENO = 'desempeno',
  OBJETIVOS = 'objetivos',
  COMPETENCIAS = 'competencias',
  PERIODO_PRUEBA = 'periodo_prueba',
  ASCENSO = 'ascenso'
}

// Tipo para definir criterios de evaluación
export type CriterioEvaluacion = {
  nombre: string;
  descripcion: string;
  peso: number; // Porcentaje de 0 a 100
  calificacion?: number; // De 1 a 5 o 0 a 10, dependiendo del sistema
  comentarios?: string;
};

// Interfaz principal de evaluación
export interface Evaluacion {
  id: number;
  empleadoId: number;
  evaluadorId: number; // ID del empleado que realiza la evaluación
  tipo: TipoEvaluacion;
  titulo: string;
  descripcion?: string;
  fechaInicio: Date;
  fechaFin: Date;
  estado: EstadoEvaluacion;
  calificacionGeneral?: number;
  criterios: CriterioEvaluacion[];
  comentarioEmpleado?: string;
  comentarioEvaluador?: string;
  fechaCreacion: Date;
  fechaActualizacion: Date;
}

// DTO para la creación de una evaluación
export type CrearEvaluacion = Omit<Evaluacion, 'id' | 'fechaCreacion' | 'fechaActualizacion'>;

// DTO para la actualización parcial de una evaluación
export type ActualizarEvaluacion = Partial<Omit<Evaluacion, 'id' | 'empleadoId' | 'fechaCreacion' | 'fechaActualizacion'>>;

// DTO para la vista resumida de una evaluación (vista previa/listado)
export type EvaluacionResumen = Pick<Evaluacion, 'id' | 'empleadoId' | 'tipo' | 'titulo' | 'fechaInicio' | 'fechaFin' | 'estado' | 'calificacionGeneral'>;