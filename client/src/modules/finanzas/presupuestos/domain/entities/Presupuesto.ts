/**
 * Entidad de dominio que representa un Presupuesto
 */

export enum PeriodoBudget {
  Q1 = 'Q1',
  Q2 = 'Q2',
  Q3 = 'Q3',
  Q4 = 'Q4',
  SEMESTRE1 = 'SEMESTRE1',
  SEMESTRE2 = 'SEMESTRE2',
  ANUAL = 'ANUAL'
}

export enum EstadoPresupuesto {
  ACTIVO = 'ACTIVO',
  EN_RIESGO = 'EN_RIESGO',
  CRITICO = 'CRITICO'
}

export interface Presupuesto {
  id: number;
  nombre: string;
  monto: number;
  gastado: number;
  area?: string;
  periodo: PeriodoBudget;
  fechaInicio: Date;
  fechaFin: Date;
  estado: EstadoPresupuesto;
  porcentajeEjecucion: number;
  organizationId: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreatePresupuestoDto {
  nombre: string;
  monto: number;
  area?: string;
  periodo: PeriodoBudget;
  fechaInicio: Date;
  fechaFin: Date;
  organizationId: number;
}

export interface UpdatePresupuestoDto {
  nombre?: string;
  monto?: number;
  area?: string;
  fechaInicio?: Date;
  fechaFin?: Date;
}