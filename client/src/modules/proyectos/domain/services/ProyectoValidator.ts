import { z } from 'zod';
import { EstadoProyecto } from '../entities/Proyecto';

/**
 * Validador para proyectos utilizando Zod
 * Centralizamos todas las validaciones para mantener consistencia
 * entre cliente y servidor
 */
export const proyectoSchema = {
  /**
   * Esquema para crear un nuevo proyecto
   */
  crear: z.object({
    nombre: z.string()
      .min(3, 'El nombre debe tener al menos 3 caracteres')
      .max(100, 'El nombre no puede exceder 100 caracteres'),
    descripcion: z.string()
      .min(10, 'La descripción debe tener al menos 10 caracteres')
      .max(2000, 'La descripción no puede exceder 2000 caracteres'),
    fechaInicio: z.date({
      required_error: 'La fecha de inicio es requerida',
      invalid_type_error: 'Formato de fecha inválido'
    }),
    fechaFinPrevista: z.date({
      invalid_type_error: 'Formato de fecha inválido'
    }).optional().nullable(),
    presupuesto: z.number({
      required_error: 'El presupuesto es requerido',
      invalid_type_error: 'El presupuesto debe ser un número'
    }).min(0, 'El presupuesto no puede ser negativo'),
    responsableId: z.number({
      required_error: 'El responsable es requerido',
      invalid_type_error: 'El ID del responsable debe ser un número'
    }).int().positive('ID de responsable inválido'),
    clienteId: z.number({
      invalid_type_error: 'El ID del cliente debe ser un número'
    }).int().positive('ID de cliente inválido').optional(),
    tags: z.array(z.string()).optional(),
  }).refine((data) => {
    // Verificar que fechaFinPrevista sea posterior a fechaInicio si está definida
    if (data.fechaFinPrevista && data.fechaInicio) {
      return data.fechaFinPrevista > data.fechaInicio;
    }
    return true;
  }, {
    message: 'La fecha de fin prevista debe ser posterior a la fecha de inicio',
    path: ['fechaFinPrevista'],
  }),
  
  /**
   * Esquema para actualizar un proyecto existente
   * Todos los campos son opcionales
   */
  actualizar: z.object({
    nombre: z.string()
      .min(3, 'El nombre debe tener al menos 3 caracteres')
      .max(100, 'El nombre no puede exceder 100 caracteres')
      .optional(),
    descripcion: z.string()
      .min(10, 'La descripción debe tener al menos 10 caracteres')
      .max(2000, 'La descripción no puede exceder 2000 caracteres')
      .optional(),
    fechaInicio: z.date({
      invalid_type_error: 'Formato de fecha inválido'
    }).optional(),
    fechaFinPrevista: z.date({
      invalid_type_error: 'Formato de fecha inválido'
    }).optional().nullable(),
    fechaFinReal: z.date({
      invalid_type_error: 'Formato de fecha inválido'
    }).optional().nullable(),
    presupuesto: z.number({
      invalid_type_error: 'El presupuesto debe ser un número'
    }).min(0, 'El presupuesto no puede ser negativo').optional(),
    responsableId: z.number({
      invalid_type_error: 'El ID del responsable debe ser un número'
    }).int().positive('ID de responsable inválido').optional(),
    clienteId: z.number({
      invalid_type_error: 'El ID del cliente debe ser un número'
    }).int().positive('ID de cliente inválido').optional().nullable(),
    tags: z.array(z.string()).optional(),
  }),
  
  /**
   * Esquema para cambiar el estado de un proyecto
   */
  cambiarEstado: z.object({
    estado: z.nativeEnum(EstadoProyecto, {
      errorMap: () => ({ message: 'Estado inválido' }),
    }),
    comentario: z.string().max(500, 'El comentario no puede exceder 500 caracteres').optional(),
  }),
  
  /**
   * Esquema para filtrar proyectos
   */
  filtros: z.object({
    busqueda: z.string().optional(),
    estado: z.union([
      z.nativeEnum(EstadoProyecto),
      z.array(z.nativeEnum(EstadoProyecto))
    ]).optional(),
    responsableId: z.number().int().positive().optional(),
    clienteId: z.number().int().positive().optional(),
    fechaInicioDesde: z.date().optional(),
    fechaInicioHasta: z.date().optional(),
    page: z.number().int().min(1).optional().default(1),
    pageSize: z.number().int().min(1).max(100).optional().default(10),
  }),
};