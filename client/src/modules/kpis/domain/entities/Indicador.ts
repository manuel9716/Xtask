/**
 * Enumeración para los estados de un KPI
 */
export enum EstadoKpi {
  PENDIENTE = "PENDIENTE",       // Cuando se crea y aún no se evalúa
  EN_PROGRESO = "EN_PROGRESO",   // Cuando se está trabajando pero aún no se evalúa
  CUMPLIDO = "CUMPLIDO",         // Meta alcanzada o superada
  INCUMPLIDO = "INCUMPLIDO",     // No se alcanzó la meta
  PARCIAL = "PARCIAL",           // Cumplimiento parcial
  VALIDADO = "VALIDADO",         // Evaluado y validado por supervisor
  COMPLETADO = "COMPLETADO"      // Finalizado y cerrado
}

/**
 * Enumeración para las periodicidades disponibles de un KPI
 */
export enum PeriodicidadKpi {
  DIARIO = "DIARIO",
  SEMANAL = "SEMANAL",
  QUINCENAL = "QUINCENAL",
  MENSUAL = "MENSUAL",
  TRIMESTRAL = "TRIMESTRAL",
  SEMESTRAL = "SEMESTRAL",
  ANUAL = "ANUAL"
}

/**
 * Enumeración para los tipos de KPI
 */
export enum TipoKpi {
  CUANTITATIVO = "CUANTITATIVO", // KPI con valor numérico
  CUALITATIVO = "CUALITATIVO",   // KPI con valor cualitativo o discrecional
  BOOLEANO = "BOOLEANO"          // KPI de tipo si/no
}

/**
 * Entidad Indicador (KPI)
 * Representa un indicador clave de rendimiento de un empleado
 */
export interface Indicador {
  id: number;
  userId: number;
  nombre: string;
  descripcion: string;
  tipo: TipoKpi;
  unidadMedida: string;
  periodicidad: PeriodicidadKpi;
  fechaInicio: Date;
  fechaFin: Date;
  
  // Valores de referencia
  valorBase: number;    // Valor mínimo o punto de partida
  valorMeta: number;    // Valor objetivo a alcanzar
  valorActual?: number; // Valor actual alcanzado (si ya se ha evaluado)
  valorObtenido?: number; // Alias de valorActual para compatibilidad con API
  
  // Cálculo y evaluación
  formula?: string;    // Fórmula para cálculo automático (opcional)
  porcentajePeso: number; // Peso del KPI en el cálculo global (0-100)
  porcentajeCumplimiento?: number; // Porcentaje de cumplimiento calculado

  // Estado y aprobación
  estado: EstadoKpi;
  validadoPor?: number; // ID del usuario supervisor que validó
  fechaValidacion?: Date;
  comentariosValidacion?: string;
  
  // Asignación
  empleadoId?: number;  // ID del empleado al que se asigna el KPI (opcional)
  
  // Período específico (formato YYYY-MM)
  mes?: string;
  
  // Metadatos
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Calcula el porcentaje de cumplimiento para un indicador cuantitativo
 * @param valorActual Valor actual logrado
 * @param valorBase Valor base o mínimo
 * @param valorMeta Valor meta u objetivo
 * @returns Porcentaje de cumplimiento (0-100+)
 */
export function calcularPorcentajeCumplimiento(
  valorActual: number,
  valorBase: number,
  valorMeta: number
): number {
  // Si la meta y la base son iguales, evitamos división por cero
  if (valorMeta === valorBase) {
    return valorActual >= valorMeta ? 100 : 0;
  }
  
  // Calculamos qué porcentaje del camino entre la base y la meta hemos recorrido
  const diferenciaMeta = valorMeta - valorBase;
  const diferenciaActual = valorActual - valorBase;
  let porcentaje = (diferenciaActual / diferenciaMeta) * 100;
  
  // Aseguramos que el porcentaje esté entre 0 y sin límite superior
  // (puede superar el 100% si se supera la meta)
  return Math.max(0, Math.round(porcentaje));
}

/**
 * Determina el estado apropiado de un KPI basado en su cumplimiento
 * @param porcentajeCumplimiento Porcentaje de cumplimiento calculado
 * @returns Estado del KPI según su cumplimiento
 */
export function determinarEstadoKpi(porcentajeCumplimiento: number): string {
  if (porcentajeCumplimiento >= 100) {
    return "CUMPLIDO";
  } else if (porcentajeCumplimiento >= 70) {
    return "PARCIAL";
  } else {
    return "INCUMPLIDO";
  }
}