import { pgTable, serial, text, varchar, integer, timestamp, pgEnum, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";

// Enumeración para categorías de micro-aprendizaje
export const categoriaMicroLearningEnum = pgEnum('categoria_microlearning', [
  'TECNICO',
  'HABILIDADES_BLANDAS',
  'LIDERAZGO',
  'GESTION',
  'TECNOLOGIA',
  'REGULATORIO',
  'SEGURIDAD',
  'BIENESTAR'
]);

// Enumeración para tipos de contenido
export const tipoContenidoEnum = pgEnum('tipo_contenido', [
  'VIDEO',
  'ARTICULO',
  'PODCAST',
  'QUIZ',
  'INFOGRAFIA',
  'CURSO_CORTO'
]);

// Enumeración para niveles de dificultad
export const nivelDificultadEnum = pgEnum('nivel_dificultad', [
  'PRINCIPIANTE',
  'INTERMEDIO',
  'AVANZADO'
]);

// Tabla de contenido de micro-aprendizaje
export const microLearningContenido = pgTable('microlearning_contenido', {
  id: serial('id').primaryKey(),
  titulo: varchar('titulo', { length: 255 }).notNull(),
  descripcion: text('descripcion'),
  categoria: categoriaMicroLearningEnum('categoria').notNull(),
  tipoContenido: tipoContenidoEnum('tipo_contenido').notNull(),
  nivel: nivelDificultadEnum('nivel_dificultad').notNull(),
  duracionMinutos: integer('duracion_minutos').notNull(),
  url: text('url').notNull(),
  imagenUrl: text('imagen_url'),
  tags: text('tags'),
  departamentoRelevante: varchar('departamento_relevante', { length: 100 }),
  cargoRelevante: varchar('cargo_relevante', { length: 100 }),
  activo: boolean('activo').default(true),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow()
});

// Tabla de recomendaciones de micro-aprendizaje para empleados
export const microLearningRecomendaciones = pgTable('microlearning_recomendaciones', {
  id: serial('id').primaryKey(),
  empleadoId: integer('empleado_id').notNull(),
  contenidoId: integer('contenido_id').notNull(),
  relevancia: integer('relevancia').notNull(), // Puntuación de relevancia 1-100
  visto: boolean('visto').default(false),
  completado: boolean('completado').default(false),
  fechaVisto: timestamp('fecha_visto'),
  fechaCompletado: timestamp('fecha_completado'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow()
});

// Tabla de historial de micro-aprendizaje completado por empleados
export const microLearningHistorial = pgTable('microlearning_historial', {
  id: serial('id').primaryKey(),
  empleadoId: integer('empleado_id').notNull(),
  contenidoId: integer('contenido_id').notNull(),
  valoracion: integer('valoracion'), // Valoración del empleado 1-5
  comentario: text('comentario'),
  tiempoCompletadoMinutos: integer('tiempo_completado_minutos'),
  fechaCompletado: timestamp('fecha_completado').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow()
});

// Esquemas de inserción y tipos
export const insertMicroLearningContenidoSchema = createInsertSchema(microLearningContenido);
export const insertMicroLearningRecomendacionSchema = createInsertSchema(microLearningRecomendaciones);
export const insertMicroLearningHistorialSchema = createInsertSchema(microLearningHistorial);

// Tipos
export type MicroLearningContenido = typeof microLearningContenido.$inferSelect;
export type InsertMicroLearningContenido = z.infer<typeof insertMicroLearningContenidoSchema>;

export type MicroLearningRecomendacion = typeof microLearningRecomendaciones.$inferSelect;
export type InsertMicroLearningRecomendacion = z.infer<typeof insertMicroLearningRecomendacionSchema>;

export type MicroLearningHistorial = typeof microLearningHistorial.$inferSelect;
export type InsertMicroLearningHistorial = z.infer<typeof insertMicroLearningHistorialSchema>;

// Enumeraciones en formato TypeScript para el frontend
export enum CategoriaMicroLearning {
  TECNICO = 'TECNICO',
  HABILIDADES_BLANDAS = 'HABILIDADES_BLANDAS',
  LIDERAZGO = 'LIDERAZGO',
  GESTION = 'GESTION',
  TECNOLOGIA = 'TECNOLOGIA',
  REGULATORIO = 'REGULATORIO',
  SEGURIDAD = 'SEGURIDAD',
  BIENESTAR = 'BIENESTAR'
}

export enum TipoContenido {
  VIDEO = 'VIDEO',
  ARTICULO = 'ARTICULO',
  PODCAST = 'PODCAST',
  QUIZ = 'QUIZ',
  INFOGRAFIA = 'INFOGRAFIA',
  CURSO_CORTO = 'CURSO_CORTO'
}

export enum NivelDificultad {
  PRINCIPIANTE = 'PRINCIPIANTE',
  INTERMEDIO = 'INTERMEDIO',
  AVANZADO = 'AVANZADO'
}

// Etiquetas para mostrar en la interfaz
export const CATEGORIA_MICROLEARNING_LABELS: Record<CategoriaMicroLearning, string> = {
  [CategoriaMicroLearning.TECNICO]: 'Técnico',
  [CategoriaMicroLearning.HABILIDADES_BLANDAS]: 'Habilidades Blandas',
  [CategoriaMicroLearning.LIDERAZGO]: 'Liderazgo',
  [CategoriaMicroLearning.GESTION]: 'Gestión',
  [CategoriaMicroLearning.TECNOLOGIA]: 'Tecnología',
  [CategoriaMicroLearning.REGULATORIO]: 'Regulatorio',
  [CategoriaMicroLearning.SEGURIDAD]: 'Seguridad',
  [CategoriaMicroLearning.BIENESTAR]: 'Bienestar'
};

export const TIPO_CONTENIDO_LABELS: Record<TipoContenido, string> = {
  [TipoContenido.VIDEO]: 'Video',
  [TipoContenido.ARTICULO]: 'Artículo',
  [TipoContenido.PODCAST]: 'Podcast',
  [TipoContenido.QUIZ]: 'Quiz',
  [TipoContenido.INFOGRAFIA]: 'Infografía',
  [TipoContenido.CURSO_CORTO]: 'Curso Corto'
};

export const NIVEL_DIFICULTAD_LABELS: Record<NivelDificultad, string> = {
  [NivelDificultad.PRINCIPIANTE]: 'Principiante',
  [NivelDificultad.INTERMEDIO]: 'Intermedio',
  [NivelDificultad.AVANZADO]: 'Avanzado'
};