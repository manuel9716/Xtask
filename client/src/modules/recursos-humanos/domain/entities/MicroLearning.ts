/**
 * @file Entidad de dominio para MicroLearning
 * @description Define las entidades principales del módulo de micro-aprendizaje
 */

import { 
  CategoriaMicroLearning, 
  TipoContenido, 
  NivelDificultad 
} from '@shared/schema/microlearning';

/**
 * Representa un contenido de micro-aprendizaje
 */
export interface MicroLearningContenido {
  id: number;
  titulo: string;
  descripcion?: string;
  categoria: CategoriaMicroLearning;
  tipoContenido: TipoContenido;
  nivel: NivelDificultad;
  duracionMinutos: number;
  url: string;
  imagenUrl?: string;
  tags?: string; // Cadena de etiquetas separadas por comas
  departamentoRelevante?: string;
  cargoRelevante?: string;
  activo: boolean;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Representa una recomendación de micro-aprendizaje para un empleado
 */
export interface MicroLearningRecomendacion {
  id: number;
  empleadoId: number;
  contenidoId: number;
  contenido?: MicroLearningContenido; // Relación cargada desde el backend
  relevancia: number; // 1-100, cuanto más alto, más relevante
  visto: boolean;
  completado: boolean;
  fechaVisto?: Date;
  fechaCompletado?: Date;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Representa el historial de contenido de micro-aprendizaje completado por un empleado
 */
export interface MicroLearningHistorial {
  id: number;
  empleadoId: number;
  contenidoId: number;
  contenido?: MicroLearningContenido; // Relación cargada desde el backend
  valoracion?: number; // 1-5 estrellas
  comentario?: string;
  tiempoCompletadoMinutos?: number;
  fechaCompletado: Date;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Parámetros para filtrar contenido de micro-aprendizaje
 */
export interface FiltrosMicroLearning {
  busqueda?: string;
  categoria?: CategoriaMicroLearning;
  tipoContenido?: TipoContenido;
  nivel?: NivelDificultad;
  duracionMaxima?: number;
  departamento?: string;
  cargo?: string;
  soloActivos?: boolean;
}

/**
 * Contexto para obtener recomendaciones personalizadas
 */
export interface ContextoRecomendacion {
  empleadoId: number;
  departamento?: string;
  cargo?: string;
  habilidades?: string[]; // Lista de habilidades del empleado
  intereses?: string[]; // Intereses declarados por el empleado
  historialCompletado?: number[]; // IDs de contenido ya completado
  paginaActual?: string; // URL o identificador de la página actual
  actividadActual?: string; // Descripción de la actividad que está realizando
}

/**
 * Solicitud para marcar un contenido como visto o completado
 */
export interface ActualizacionProgresoMicroLearning {
  empleadoId: number;
  contenidoId: number;
  visto?: boolean;
  completado?: boolean;
  valoracion?: number;
  comentario?: string;
  tiempoCompletadoMinutos?: number;
}