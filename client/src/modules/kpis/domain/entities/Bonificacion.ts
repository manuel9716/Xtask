/**
 * Enumeración para los estados de una bonificación mensual
 */
export enum EstadoBonificacion {
  CALCULADA = "CALCULADA",   // Recién calculada y pendiente de revisión
  APROBADA = "APROBADA",     // Aprobada por supervisor, pendiente de pago
  RECHAZADA = "RECHAZADA",   // Rechazada por supervisor, requiere revisión
  PAGADA = "PAGADA"          // Bonificación ya pagada
}

/**
 * Entidad Bonificacion
 * Representa el cálculo de bonificación mensual basado en KPIs
 */
export interface Bonificacion {
  id: number;
  userId: number;
  mes: string; // Formato YYYY-MM
  
  // Datos económicos
  salarioBase: number;
  salarioVariable: number;
  porcentajeCumplimientoGlobal: number; // Porcentaje global de cumplimiento de KPIs
  bonificacionTotal: number; // Monto calculado a pagar
  
  // Estado y aprobación
  estado: EstadoBonificacion | string;
  aprobadoPor?: number; // ID del supervisor que aprobó
  fechaAprobacion?: Date;
  comentarios?: string; // Comentarios de la aprobación/rechazo
  
  // Información de pago
  fechaPago?: Date;
  referenciaPago?: string;
  
  // Metadatos
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Calcula el porcentaje de cumplimiento global basado en KPIs
 * @param kpis Array de KPIs evaluados
 * @returns Porcentaje de cumplimiento global (0-100)
 */
export function calcularPorcentajeCumplimientoGlobal(
  kpis: Array<{
    porcentajePeso: number;
    porcentajeCumplimiento?: number;
  }>
): number {
  // Si no hay KPIs, devolver 0
  if (!kpis.length) return 0;
  
  // Filtrar KPIs que tengan un cumplimiento calculado
  const kpisEvaluados = kpis.filter(kpi => 
    kpi.porcentajeCumplimiento !== undefined && 
    kpi.porcentajeCumplimiento !== null
  );
  
  // Si no hay KPIs evaluados, devolver 0
  if (!kpisEvaluados.length) return 0;
  
  // Calcular suma ponderada
  let sumaPonderada = 0;
  let sumaPesos = 0;
  
  for (const kpi of kpisEvaluados) {
    sumaPonderada += (kpi.porcentajeCumplimiento || 0) * kpi.porcentajePeso;
    sumaPesos += kpi.porcentajePeso;
  }
  
  // Si la suma de pesos es 0, devolver 0 para evitar división por cero
  if (sumaPesos === 0) return 0;
  
  // Calcular porcentaje global y redondear
  return Math.round(sumaPonderada / sumaPesos);
}

/**
 * Calcula el monto de bonificación basado en el salario variable y el porcentaje de cumplimiento
 * @param salarioVariable Monto máximo de bonificación posible
 * @param porcentajeCumplimiento Porcentaje de cumplimiento (0-100+)
 * @returns Monto de bonificación a pagar
 */
export function calcularMontoBonificacion(
  salarioVariable: number,
  porcentajeCumplimiento: number
): number {
  // Si el porcentaje de cumplimiento es mayor a 100%, pagar el 100% del variable
  if (porcentajeCumplimiento >= 100) {
    return salarioVariable;
  }
  
  // Calcular monto proporcional al cumplimiento
  return Math.round(salarioVariable * (porcentajeCumplimiento / 100));
}