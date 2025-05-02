import { Indicador } from "../entities/Indicador";
import { Bonificacion } from "../entities/Bonificacion";

/**
 * Interfaz que define las operaciones de repositorio para KPIs y Bonificaciones
 * Este es el puerto en la arquitectura hexagonal que permite conectar 
 * con diferentes implementaciones (adaptadores)
 */
export interface KpiRepository {
  // Operaciones con KPIs
  getUserKpis(userId: number): Promise<Indicador[]>;
  getKpi(id: number): Promise<Indicador | null>;
  createKpi(kpi: Indicador): Promise<Indicador>;
  updateKpi(id: number, kpi: Partial<Indicador>): Promise<Indicador>;
  deleteKpi(id: number): Promise<boolean>;
  
  // Operaciones específicas para KPIs
  evaluarKpi(id: number, valorActual: number): Promise<Indicador>;
  validarKpi(id: number, validadoPor: number, comentarios?: string): Promise<Indicador>;
  
  // Operaciones con Bonificaciones
  getUserBonificaciones(userId: number): Promise<Bonificacion[]>;
  getBonificacion(id: number): Promise<Bonificacion | null>;
  getBonificacionByUserAndMonth(userId: number, mes: string): Promise<Bonificacion | null>;
  getBonificacionesHistory(userId: number, limit?: number): Promise<Bonificacion[]>;
  
  // Operaciones específicas para Bonificaciones
  calcularBonificacion(
    userId: number, 
    mes: string, 
    salarioBase: number, 
    salarioVariable: number
  ): Promise<Bonificacion>;
  aprobarBonificacion(id: number, aprobadoPor: number, comentarios?: string): Promise<Bonificacion>;
  rechazarBonificacion(id: number, rechazadoPor: number, comentarios: string): Promise<Bonificacion>;
  marcarBonificacionPagada(id: number): Promise<Bonificacion>;
}