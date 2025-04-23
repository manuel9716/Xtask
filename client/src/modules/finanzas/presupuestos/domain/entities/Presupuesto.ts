/**
 * Modelo de dominio del presupuesto
 */

export type PresupuestoEstado = 'ACTIVO' | 'ALERTA' | 'COMPLETADO';

export interface Presupuesto {
  id: number;
  nombre: string;
  monto: number;
  gastado: number;
  porcentajeEjecucion: number;
  estado: PresupuestoEstado;
  area?: string;
  fechaInicio: Date;
  fechaFin: Date;
  createdAt: Date;
  updatedAt: Date;
  createdBy: number;
  description?: string;
}

export interface CrearPresupuestoDTO {
  nombre: string;
  monto: number;
  area?: string;
  fechaInicio: Date;
  fechaFin: Date;
  description?: string;
  createdBy?: number;
}

export interface RegistrarGastoDTO {
  presupuestoId: number;
  monto: number;
  descripcion?: string;
}