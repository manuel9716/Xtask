import { z } from 'zod';

/**
 * Estados posibles de un presupuesto
 * ACTIVO: < 80% de ejecución
 * ALERTA: Entre 80% y 95% de ejecución
 * COMPLETADO: >= 95% de ejecución
 */
export type PresupuestoEstado = 'ACTIVO' | 'ALERTA' | 'COMPLETADO';

/**
 * Entidad Presupuesto que representa un presupuesto en el sistema
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
  // Campos calculados de metadata
  porcentajeEjecucionMeta?: number;
  montoEjecucion?: number;
  porcentajeGarantia?: number;
  montoGarantia?: number;
  reservas?: number;
}

/**
 * DTO para la creación de un presupuesto
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
  concepto: string;
  fecha: Date;
  registradoPor: number;
}

/**
 * Esquema de validación para la creación de presupuestos
 */
export const crearPresupuestoSchema = z.object({
  nombre: z.string()
    .min(3, "El nombre debe tener al menos 3 caracteres")
    .max(100, "El nombre no puede exceder los 100 caracteres"),
  monto: z.number()
    .positive("El monto debe ser mayor que cero"),
  fechaInicio: z.date()
    .refine(date => date instanceof Date && !isNaN(date.getTime()), 
      { message: "Fecha de inicio inválida" }),
  fechaFin: z.date()
    .refine(date => date instanceof Date && !isNaN(date.getTime()), 
      { message: "Fecha de fin inválida" }),
  description: z.string().optional(),
  area: z.string().optional(),
  createdBy: z.number().optional(),
  organizationId: z.number().optional()
}).refine(
  data => data.fechaFin > data.fechaInicio,
  {
    message: "La fecha de fin debe ser posterior a la fecha de inicio",
    path: ["fechaFin"]
  }
);

/**
 * Esquema de validación para registrar un gasto
 */
export const registrarGastoSchema = z.object({
  monto: z.number()
    .positive("El monto debe ser mayor que cero"),
  concepto: z.string()
    .min(3, "El concepto debe tener al menos 3 caracteres")
    .max(200, "El concepto no puede exceder los 200 caracteres"),
  fecha: z.date()
    .refine(date => date instanceof Date && !isNaN(date.getTime()), 
      { message: "Fecha inválida" }),
  registradoPor: z.number()
});