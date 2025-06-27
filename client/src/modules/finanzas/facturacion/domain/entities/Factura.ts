import { TipoFactura, EstadoFactura } from '@shared/schema';

export interface Factura {
  id: number;
  proyectoId: number;
  numeroFactura: string;
  tipo: TipoFactura;
  cliente: string;
  concepto: string;
  valorSubtotal: number;
  valorTotal: number;
  fechaEmision: string;
  fechaVencimiento: string;
  estado: EstadoFactura;
  medioPago?: string;
  soporteUrl?: string;
  creadoPor: number;
  createdAt: string;
  updatedAt: string;
}

export interface IndicadoresFacturacion {
  totalFacturado: number;
  totalPendiente: number;
  totalPagado: number;
  porcentajePagadas: number;
  diasPromedioPago: number;
  facturasVencidas: number;
  proyeccionIngresos30Dias: number;
  distribucionPorEstado: {
    [key in EstadoFactura]: number;
  };
}

export interface FiltrosFactura {
  estado?: EstadoFactura;
  cliente?: string;
  fechaDesde?: string;
  fechaHasta?: string;
  busqueda?: string;
}

export const ESTADOS_FACTURA_LABELS: Record<EstadoFactura, string> = {
  [EstadoFactura.PENDIENTE]: 'Pendiente',
  [EstadoFactura.PAGADA]: 'Pagada',
  [EstadoFactura.RECHAZADA]: 'Rechazada',
  [EstadoFactura.VENCIDA]: 'Vencida'
};

export const TIPOS_FACTURA_LABELS: Record<TipoFactura, string> = {
  [TipoFactura.INGRESO]: 'Ingreso',
  [TipoFactura.EGRESO]: 'Egreso'
};