/**
 * Estados posibles de un KPI
 */
export enum EstadoKpi {
  PENDIENTE = "PENDIENTE",
  EN_PROGRESO = "EN_PROGRESO",
  CUMPLIDO = "CUMPLIDO",
  NO_CUMPLIDO = "NO_CUMPLIDO",
  VALIDADO = "VALIDADO",
  RECHAZADO = "RECHAZADO"
}

/**
 * Entidad KPI (Indicador)
 * Representa un indicador de desempeño
 */
export interface Indicador {
  id?: number;
  userId: number;
  descripcion: string;
  formula: string;
  valorEsperado: number;
  valorObtenido?: number;
  porcentajeCumplimiento?: number;
  porcentajePeso: number;
  mes: string; // YYYY-MM
  estado: EstadoKpi;
  validadoPor?: number;
  fechaValidacion?: Date;
  comentariosValidacion?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

/**
 * Calcula el porcentaje de cumplimiento de un KPI
 * @param valorEsperado Meta a alcanzar
 * @param valorObtenido Valor real obtenido
 * @returns Porcentaje de cumplimiento (0-100+)
 */
export function calcularPorcentajeCumplimiento(
  valorEsperado: number,
  valorObtenido: number
): number {
  if (valorEsperado === 0) return 0;
  return Math.round((valorObtenido / valorEsperado) * 100);
}

/**
 * Determina el estado de un KPI basado en su porcentaje de cumplimiento
 * @param porcentajeCumplimiento Porcentaje de cumplimiento calculado
 * @returns Estado del KPI (CUMPLIDO o NO_CUMPLIDO)
 */
export function determinarEstadoKpi(porcentajeCumplimiento: number): EstadoKpi {
  return porcentajeCumplimiento >= 100 ? EstadoKpi.CUMPLIDO : EstadoKpi.NO_CUMPLIDO;
}