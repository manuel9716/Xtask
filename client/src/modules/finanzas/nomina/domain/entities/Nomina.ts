/**
 * Definición de entidades y tipos relacionados con la nómina
 */

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