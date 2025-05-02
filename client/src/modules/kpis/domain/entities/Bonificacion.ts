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
 * Representa el detalle de bonificación para un KPI específico
 */
export interface DetalleKpiBonificacion {
  id: number;
  descripcion: string;
  porcentajePeso: number;
  porcentajeCumplimiento: number;
  montoBonificacion: number;
  completado: boolean; // Indica si el KPI está completado (cumplimiento >= 100%)
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
  
  // Detalle de los KPIs que componen la bonificación
  detalleKpis?: DetalleKpiBonificacion[];
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
 * Calcula el monto de bonificación basado en el salario base y el porcentaje del KPI
 * @param salarioBase Salario base del empleado
 * @param porcentajeCumplimiento Porcentaje de cumplimiento de los KPIs (0-100+)
 * @returns Monto de bonificación a pagar
 */
export function calcularMontoBonificacion(
  salarioBase: number,
  porcentajeCumplimiento: number
): number {
  // Calcular bonificación como un porcentaje directo del salario base
  // Dividimos entre 100 para convertir el porcentaje en decimal
  return Math.round(salarioBase * (porcentajeCumplimiento / 100));
}