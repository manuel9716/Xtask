import { Indicador } from "../entities/Indicador";
import { Bonificacion } from "../entities/Bonificacion";

/**
 * Interfaz para repositorio de KPIs
 * Define los métodos necesarios para gestionar KPIs y bonificaciones
 */
export interface KpiRepository {
  /**
   * Obtiene los KPIs del usuario para un mes específico
   */
  getKpisByUserAndMonth(userId: number, mes: string): Promise<Indicador[]>;
  
  /**
   * Obtiene un KPI específico por ID
   */
  getKpiById(id: number): Promise<Indicador | null>;
  
  /**
   * Crea un nuevo KPI
   */
  createKpi(kpi: Omit<Indicador, "id" | "createdAt" | "updatedAt">): Promise<Indicador>;
  
  /**
   * Actualiza un KPI existente
   */
  updateKpi(id: number, kpi: Partial<Indicador>): Promise<Indicador>;
  
  /**
   * Evalúa un KPI registrando el valor obtenido
   */
  evaluarKpi(id: number, valorObtenido: number): Promise<Indicador>;
  
  /**
   * Valida un KPI (acción de supervisor)
   */
  validarKpi(
    id: number, 
    validadorId: number, 
    aprobado: boolean, 
    comentarios?: string
  ): Promise<Indicador>;
  
  /**
   * Elimina un KPI
   */
  deleteKpi(id: number): Promise<boolean>;
  
  /**
   * Obtiene la bonificación del usuario para un mes específico
   */
  getBonificacionByUserAndMonth(userId: number, mes: string): Promise<Bonificacion | null>;
  
  /**
   * Obtiene todas las bonificaciones del usuario
   */
  getBonificacionesByUser(userId: number): Promise<Bonificacion[]>;
  
  /**
   * Alias para el historial de bonificaciones
   */
  getBonificacionesHistory(): Promise<Bonificacion[]>;
  
  /**
   * Calcula la bonificación del usuario para un mes
   */
  calcularBonificacion(
    userId: number, 
    mes: string,
    salarioBase: number,
    salarioVariable: number
  ): Promise<Bonificacion>;
  
  /**
   * Aprueba o rechaza una bonificación (acción de supervisor)
   */
  aprobarBonificacion(
    id: number, 
    aprobadorId: number, 
    aprobada: boolean, 
    comentarios?: string
  ): Promise<Bonificacion>;
}