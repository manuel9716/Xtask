import { z } from 'zod';

/**
 * Estados posibles de un presupuesto
 * - ACTIVO: Presupuesto con ejecución menor al 80%
 * - ALERTA: Presupuesto con ejecución entre 80% y 95%
 * - COMPLETADO: Presupuesto con ejecución mayor al 95% o marcado como finalizado
 */
export type PresupuestoEstado = 'ACTIVO' | 'ALERTA' | 'COMPLETADO';

/**
 * Entidad de dominio Presupuesto
 */
export interface Presupuesto {
  id: number;
  nombre: string;
  monto: number;
  gastado: number;
  porcentajeEjecucion: number;
  estado: PresupuestoEstado;
  area: string;
  fechaInicio: Date;
  fechaFin: Date;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
  createdBy: number;
}

/**
 * DTO para crear un nuevo presupuesto
 */
export interface CrearPresupuestoDTO {
  nombre: string;
  monto: number;
  fechaInicio: Date;
  fechaFin: Date;
  description?: string;
  area?: string;
  createdBy?: number;
  organizationId?: number;
}

/**
 * DTO para registrar un gasto en un presupuesto
 */
export interface RegistrarGastoDTO {
  monto: number;
  descripcion?: string;
  fecha?: Date;
  usuarioId?: number;
  categoriaId?: number;
}

/**
 * Schema Zod para validar datos de creación de presupuesto
 */
export const crearPresupuestoSchema = z.object({
  nombre: z.string().min(3, 'El nombre debe tener al menos 3 caracteres'),
  monto: z.number().positive('El monto debe ser un número positivo'),
  fechaInicio: z.date(),
  fechaFin: z.date(),
  description: z.string().optional(),
  area: z.string().optional(),
  createdBy: z.number().optional(),
  organizationId: z.number().optional()
}).refine(data => {
  return data.fechaFin > data.fechaInicio;
}, {
  message: 'La fecha de fin debe ser posterior a la fecha de inicio',
  path: ['fechaFin']
});

/**
 * Schema Zod para validar registro de gastos
 */
export const registrarGastoSchema = z.object({
  monto: z.number().positive('El monto debe ser un número positivo'),
  descripcion: z.string().optional(),
  fecha: z.date().default(() => new Date()),
  usuarioId: z.number().optional(),
  categoriaId: z.number().optional()
});

/**
 * Tipo para los datos del formulario de creación de presupuesto
 */
export type CrearPresupuestoFormData = z.infer<typeof crearPresupuestoSchema>;