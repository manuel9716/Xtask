/**
 * Entidad de dominio que representa una bonificación mensual de un usuario
 */
export enum EstadoBonificacion {
  CALCULADO = "CALCULADO",
  APROBADO = "APROBADO",
  PAGADO = "PAGADO",
  RECHAZADO = "RECHAZADO"
}

export interface Bonificacion {
  id?: number;
  userId: number;
  mes: string; // Formato: "YYYY-MM"
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
 * Calcula el monto de bonificación mensual basado en el salario variable
 * y el porcentaje de cumplimiento global de los KPIs
 * @param salarioVariable Monto del salario variable (bonificable)
 * @param porcentajeCumplimientoGlobal Porcentaje global de cumplimiento de KPIs
 * @returns Monto de bonificación a pagar
 */
export function calcularBonificacion(
  salarioVariable: number, 
  porcentajeCumplimientoGlobal: number
): number {
  // La fórmula básica es: salario_variable * (porcentaje_cumplimiento / 100)
  return salarioVariable * (porcentajeCumplimientoGlobal / 100);
}

/**
 * Calcula el porcentaje global de cumplimiento basado en los KPIs individuales
 * y sus pesos respectivos
 * @param kpisConResultados Array de KPIs con sus resultados y pesos
 * @returns Porcentaje global de cumplimiento
 */
export function calcularPorcentajeCumplimientoGlobal(
  kpisConResultados: { 
    porcentajeCumplimiento: number, 
    porcentajePeso: number 
  }[]
): number {
  // Si no hay KPIs, el cumplimiento es 0
  if (kpisConResultados.length === 0) return 0;
  
  // Validamos que la suma de los porcentajes de peso sea 100%
  const sumaPesos = kpisConResultados.reduce(
    (suma, kpi) => suma + kpi.porcentajePeso, 
    0
  );
  
  // Normalizamos los pesos si la suma no es exactamente 100
  const factor = sumaPesos > 0 ? 100 / sumaPesos : 0;
  
  // Calculamos el promedio ponderado de los porcentajes de cumplimiento
  const cumplimientoGlobal = kpisConResultados.reduce(
    (suma, kpi) => suma + (kpi.porcentajeCumplimiento * (kpi.porcentajePeso * factor / 100)),
    0
  );
  
  return Math.min(Math.max(cumplimientoGlobal, 0), 100);
}