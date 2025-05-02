/**
 * Estados posibles de una bonificación
 */
export enum EstadoBonificacion {
  CALCULADO = "CALCULADO",
  APROBADO = "APROBADO",
  RECHAZADO = "RECHAZADO",
  PAGADO = "PAGADO"
}

/**
 * Entidad Bonificación
 * Representa una bonificación por cumplimiento de KPIs
 */
export interface Bonificacion {
  id?: number;
  userId: number;
  mes: string; // YYYY-MM
  salarioBase: number;
  salarioVariable: number;
  bonificacionTotal: number;
  porcentajeCumplimientoGlobal: number;
  estado: EstadoBonificacion;
  aprobadoPor?: number;
  fechaAprobacion?: Date;
  comentarios?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

/**
 * Tipo auxiliar para el cálculo de bonificación
 */
export interface KpiResultado {
  porcentajeCumplimiento: number;
  porcentajePeso: number;
}

/**
 * Calcula el porcentaje de cumplimiento global de un conjunto de KPIs
 */
export function calcularPorcentajeCumplimientoGlobal(
  kpisResultados: KpiResultado[]
): number {
  if (kpisResultados.length === 0) return 0;

  let sumaPonderada = 0;
  let sumaPesos = 0;

  kpisResultados.forEach(kpi => {
    sumaPonderada += kpi.porcentajeCumplimiento * kpi.porcentajePeso;
    sumaPesos += kpi.porcentajePeso;
  });

  if (sumaPesos === 0) return 0;
  
  return Math.round(sumaPonderada / sumaPesos);
}

/**
 * Calcula la bonificación basada en el salario variable y el % de cumplimiento
 */
export function calcularBonificacion(
  salarioVariable: number,
  porcentajeCumplimiento: number
): number {
  // El cálculo básico es proporcional al porcentaje de cumplimiento
  // Con un tope en 100% (no se paga extra por sobrecumplimiento)
  const porcentajeAplicable = Math.min(porcentajeCumplimiento, 100) / 100;
  return Math.round(salarioVariable * porcentajeAplicable);
}