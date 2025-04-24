/**
 * Definición de entidades y tipos relacionados con la nómina
 */
import { z } from 'zod';

// Estados posibles de una nómina
export enum EstadoNomina {
  PENDIENTE = 'PENDIENTE',
  APROBADO = 'APROBADO',
  PAGADO = 'PAGADO',
  RECHAZADO = 'RECHAZADO',
  CANCELADO = 'CANCELADO'
}

// Métodos de pago soportados
export enum MetodoPago {
  TRANSFERENCIA = 'TRANSFERENCIA',
  CHEQUE = 'CHEQUE',
  EFECTIVO = 'EFECTIVO',
  ELECTRONICO = 'PAGO_ELECTRONICO'
}

// Parámetros para procesar una nómina
export interface ProcesarNominaParams {
  periodoInicio: Date;
  periodoFin: Date;
  empleadoIds?: number[];  // Si no se especifica, se procesan todos
  usuarioId: number;
  descripcion?: string;
}

// Parámetros para marcar una nómina como pagada
export interface MarcarComoPagadaParams {
  nominaId: number;
  fechaPago: Date;
  metodoPago: string;
  referenciaPago?: string;
  comentarios?: string;
  usuarioId: number;
}

// Parámetros para cambiar el estado de una nómina
export interface CambiarEstadoParams {
  nominaId: number;
  nuevoEstado: string;
  motivo?: string;
  usuarioId: number;
}

// Filtros para listar nóminas
export interface FiltrosNomina {
  empleadoId?: number;
  mes?: number;
  anio?: number;
  estado?: string;
  page?: number;
  pageSize?: number;
}

// Resultado paginado de nóminas
export interface ResultadoPaginadoNominas {
  nominas: any[];
  pagination: {
    page: number;
    pageSize: number;
    totalItems: number;
    totalPages: number;
  };
}

// Detalle de una deducción de nómina
export interface DetalleDeduccion {
  concepto: string;
  monto: number;
  porcentaje?: number;
  esObligatoria: boolean;
}

// Detalle de un beneficio de nómina
export interface DetalleBeneficio {
  concepto: string;
  monto: number;
  descripcion?: string;
}

// DTO para validación de procesamiento de nómina
export const ProcesarNominaDTO = z.object({
  periodoInicio: z.coerce.date(),
  periodoFin: z.coerce.date(),
  empleadoIds: z.array(z.number()).optional(),
  usuarioId: z.number(),
  descripcion: z.string().optional()
});

// DTO para validación de marcar nómina como pagada
export const MarcarComoPagadaDTO = z.object({
  nominaId: z.number(),
  fechaPago: z.coerce.date(),
  metodoPago: z.string(),
  referenciaPago: z.string().optional(),
  comentarios: z.string().optional(),
  usuarioId: z.number()
});

// DTO para validación de cambio de estado de nómina
export const CambiarEstadoNominaDTO = z.object({
  nominaId: z.number(),
  nuevoEstado: z.string(),
  motivo: z.string().optional(),
  usuarioId: z.number()
});

// DTO para validación de consulta de nóminas
export const ConsultarNominasDTO = z.object({
  empleadoId: z.number().optional(),
  mes: z.number().min(1).max(12).optional(),
  anio: z.number().min(2000).max(2100).optional(),
  estado: z.string().optional(),
  page: z.number().min(1).default(1),
  pageSize: z.number().min(1).max(100).default(10)
});