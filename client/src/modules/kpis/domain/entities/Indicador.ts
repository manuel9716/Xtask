/**
 * Entidad de dominio que representa un Indicador Clave de Desempeño (KPI) de un usuario
 */
export enum EstadoKpi {
  PENDIENTE = "PENDIENTE",
  CUMPLIDO = "CUMPLIDO",
  PARCIAL = "PARCIAL",
  NO_CUMPLIDO = "NO_CUMPLIDO"
}

export interface Indicador {
  id?: number;
  userId: number;
  descripcion: string;
  formula: string;
  valorEsperado: number;
  valorObtenido?: number;
  porcentajePeso: number;
  porcentajeCumplimiento?: number;
  mes: string; // Formato: "YYYY-MM"
  estado: EstadoKpi;
  validadoPor?: number;
  fechaValidacion?: Date;
  comentariosValidacion?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

/**
 * Calcula el porcentaje de cumplimiento de un indicador basado en el valor obtenido
 * y el valor esperado
 * @param valorObtenido Valor obtenido en el KPI
 * @param valorEsperado Valor esperado o meta del KPI
 * @returns Porcentaje de cumplimiento (de 0 a 100)
 */
export function calcularPorcentajeCumplimiento(
  valorObtenido: number, 
  valorEsperado: number
): number {
  // Si el valor esperado es 0, evitamos división por cero
  if (valorEsperado === 0) return 0;
  
  const porcentaje = (valorObtenido / valorEsperado) * 100;
  
  // Limitamos el porcentaje a un máximo de 100%
  return Math.min(Math.max(porcentaje, 0), 100);
}

/**
 * Determina el estado de un KPI basado en su porcentaje de cumplimiento
 * @param porcentajeCumplimiento Porcentaje de cumplimiento del KPI
 * @returns Estado del KPI
 */
export function determinarEstadoKpi(porcentajeCumplimiento: number): EstadoKpi {
  if (porcentajeCumplimiento >= 100) {
    return EstadoKpi.CUMPLIDO;
  } else if (porcentajeCumplimiento >= 70) {
    return EstadoKpi.PARCIAL;
  } else {
    return EstadoKpi.NO_CUMPLIDO;
  }
}