import { z } from 'zod';
import { Payroll, Employee } from '@shared/schema';

// Estados posibles de una nómina
export enum EstadoNomina {
  PENDIENTE = 'pending',
  PROCESANDO = 'processing',
  PAGADO = 'paid',
  CANCELADO = 'cancelled'
}

// Tipo que representa una nómina con información del empleado
export type NominaConEmpleado = Payroll & {
  empleado?: Employee;
  nombreEmpleado?: string;
};

// DTO para procesar una nómina (batch de empleados)
export const ProcesarNominaDTO = z.object({
  periodoInicio: z.date({
    required_error: "La fecha de inicio del período es requerida",
  }),
  periodoFin: z.date({
    required_error: "La fecha de fin del período es requerida",
  }),
  empleadoIds: z.array(z.number()).optional(),
  notasAdicionales: z.string().optional(),
  // El usuario procesando la nómina
  usuarioId: z.number(),
});

export type ProcesarNominaParams = z.infer<typeof ProcesarNominaDTO>;

// DTO para registrar un gasto de nómina
export const RegistrarGastoNominaDTO = z.object({
  nominaId: z.number(),
  montoBruto: z.number().positive(),
  montoNeto: z.number().positive(),
  deducciones: z.number().min(0),
  beneficios: z.number().min(0),
  impuestos: z.number().min(0),
  fechaPago: z.date(),
  referenciaPago: z.string().optional(),
  notas: z.string().optional(),
});

export type RegistrarGastoNominaParams = z.infer<typeof RegistrarGastoNominaDTO>;

// DTO para marcar una nómina como pagada
export const MarcarComoPagadaDTO = z.object({
  nominaId: z.number(),
  fechaPago: z.date().optional().default(() => new Date()),
  metodoPago: z.string().optional(),
  referenciaPago: z.string().optional(),
  usuarioId: z.number(),
});

export type MarcarComoPagadaParams = z.infer<typeof MarcarComoPagadaDTO>;

// DTO para cambiar el estado de una nómina
export const CambiarEstadoNominaDTO = z.object({
  nominaId: z.number(),
  nuevoEstado: z.nativeEnum(EstadoNomina),
  usuarioId: z.number(),
  motivo: z.string().optional(),
});

export type CambiarEstadoNominaParams = z.infer<typeof CambiarEstadoNominaDTO>;

// DTO para consultar el historial de nóminas
export const ConsultarNominasDTO = z.object({
  periodoInicio: z.date().optional(),
  periodoFin: z.date().optional(),
  empleadoId: z.number().optional(),
  estado: z.nativeEnum(EstadoNomina).optional(),
  page: z.number().optional().default(1),
  limit: z.number().optional().default(10),
});

export type ConsultarNominasParams = z.infer<typeof ConsultarNominasDTO>;