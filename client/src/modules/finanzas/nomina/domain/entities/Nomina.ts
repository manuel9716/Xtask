import { z } from 'zod';

/**
 * Enumeración de los estados posibles de una nómina
 */
export enum EstadoNomina {
  PENDIENTE = 'pending',
  APROBADO = 'approved',
  PAGADO = 'paid',
  CANCELADO = 'canceled',
  RECHAZADO = 'rejected'
}

/**
 * Enumeración de los métodos de pago
 */
export enum MetodoPago {
  TRANSFERENCIA = 'transfer',
  CHEQUE = 'check',
  EFECTIVO = 'cash',
  ELECTRONICO = 'electronic'
}

/**
 * Parámetros para procesar la nómina
 */
export interface ProcesarNominaParams {
  periodoInicio: Date;
  periodoFin: Date;
  empleadoIds?: number[];
  usuarioId: number;
  descripcion?: string;
}

/**
 * DTO para validar los parámetros de procesado de nómina
 */
export const ProcesarNominaDTO = z.object({
  periodoInicio: z.coerce.date(),
  periodoFin: z.coerce.date(),
  empleadoIds: z.array(z.number()).optional(),
  usuarioId: z.number(),
  descripcion: z.string().optional()
}).refine(
  (data) => data.periodoFin > data.periodoInicio,
  {
    message: "La fecha de fin debe ser posterior a la fecha de inicio",
    path: ["periodoFin"]
  }
);

/**
 * Parámetros para marcar una nómina como pagada
 */
export interface MarcarComoPagadaParams {
  nominaId: number;
  fechaPago: Date;
  metodoPago: string;
  referenciaPago?: string;
  usuarioId: number;
  comentarios?: string;
}

/**
 * DTO para validar los parámetros de marcado como pagada
 */
export const MarcarComoPagadaDTO = z.object({
  nominaId: z.number(),
  fechaPago: z.coerce.date(),
  metodoPago: z.nativeEnum(MetodoPago),
  referenciaPago: z.string().optional(),
  usuarioId: z.number(),
  comentarios: z.string().optional()
});

/**
 * Parámetros para cambiar el estado de una nómina
 */
export interface CambiarEstadoNominaParams {
  nominaId: number;
  nuevoEstado: string;
  motivo?: string;
  usuarioId: number;
}

/**
 * DTO para validar los parámetros de cambio de estado
 */
export const CambiarEstadoNominaDTO = z.object({
  nominaId: z.number(),
  nuevoEstado: z.nativeEnum(EstadoNomina),
  motivo: z.string().optional(),
  usuarioId: z.number()
});

/**
 * DTO para consultar nóminas con filtros
 */
export const ConsultarNominasDTO = z.object({
  empleadoId: z.number().optional(),
  mes: z.number().min(1).max(12).optional(),
  anio: z.number().min(2000).max(2100).optional(),
  estado: z.nativeEnum(EstadoNomina).optional(),
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(100).default(10)
});