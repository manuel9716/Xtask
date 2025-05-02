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
 * Entidad Indicador (KPI)
 * Representa un indicador de desempeño personal
 */
export interface Indicador {
  id?: number;
  userId: number;
  descripcion: string;
  formula: string;
  valorEsperado: number;
  valorObtenido?: number;
  porcentajePeso: number;
  porcentajeCumplimiento?: number;
  mes: string; // YYYY-MM
  estado: EstadoKpi;
  validadoPor?: number;
  fechaValidacion?: Date;
  comentariosValidacion?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

/**
 * Calcula el porcentaje de cumplimiento basado en valor obtenido y esperado
 */
export function calcularPorcentajeCumplimiento(
  valorObtenido: number,
  valorEsperado: number
): number {
  if (valorEsperado === 0) return 0;
  return Math.min(Math.round((valorObtenido / valorEsperado) * 100), 200);
}

/**
 * Determina el estado del KPI basándose en su porcentaje de cumplimiento
 */
export function determinarEstadoKpi(porcentajeCumplimiento: number): EstadoKpi {
  if (porcentajeCumplimiento >= 100) {
    return EstadoKpi.CUMPLIDO;
  } else {
    return EstadoKpi.NO_CUMPLIDO;
  }
}