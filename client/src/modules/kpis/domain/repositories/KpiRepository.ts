import { Indicador } from "../entities/Indicador";
import { Bonificacion } from "../entities/Bonificacion";

/**
 * Interfaz repositorio de KPIs
 * Define las operaciones disponibles para gestionar Indicadores y Bonificaciones
 */
export interface KpiRepository {
  // Operaciones con KPIs
  getKpisByUserAndMonth(userId: number, mes: string): Promise<Indicador[]>;
  getKpiById(id: number): Promise<Indicador | null>;
  createKpi(kpi: Omit<Indicador, "id" | "createdAt" | "updatedAt">): Promise<Indicador>;
  evaluarKpi(id: number, valorObtenido: number): Promise<Indicador>;
  
  // Operaciones con bonificaciones
  getBonificacionByUserAndMonth(userId: number, mes: string): Promise<Bonificacion | null>;
  calcularBonificacion(userId: number, mes: string, salarioBase: number, salarioVariable: number): Promise<Bonificacion>;
  getBonificacionesHistory(): Promise<Bonificacion[]>;
}