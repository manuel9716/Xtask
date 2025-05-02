import { Indicador } from "../entities/Indicador";
import { Bonificacion } from "../entities/Bonificacion";

/**
 * Interfaz del repositorio para operaciones relacionadas con los KPIs
 * Sigue el patrón Repository para abstraer la capa de persistencia
 */
export interface KpiRepository {
  // Operaciones para Indicadores (KPIs)
  
  /**
   * Obtiene todos los KPIs de un usuario para un mes específico
   */
  getKpisByUserAndMonth(userId: number, mes: string): Promise<Indicador[]>;
  
  /**
   * Obtiene un KPI específico por su ID
   */
  getKpiById(id: number): Promise<Indicador | null>;
  
  /**
   * Crea un nuevo KPI
   */
  createKpi(kpi: Omit<Indicador, 'id' | 'createdAt' | 'updatedAt'>): Promise<Indicador>;
  
  /**
   * Actualiza un KPI existente
   */
  updateKpi(id: number, kpi: Partial<Indicador>): Promise<Indicador>;
  
  /**
   * Actualiza el resultado de un KPI y recalcula su cumplimiento
   */
  evaluarKpi(id: number, valorObtenido: number): Promise<Indicador>;
  
  /**
   * Valida/aprueba el resultado de un KPI por parte de un supervisor
   */
  validarKpi(id: number, validadorId: number, aprobado: boolean, comentarios?: string): Promise<Indicador>;
  
  /**
   * Elimina un KPI
   */
  deleteKpi(id: number): Promise<boolean>;
  
  // Operaciones para Bonificaciones
  
  /**
   * Obtiene la bonificación de un usuario para un mes específico
   */
  getBonificacionByUserAndMonth(userId: number, mes: string): Promise<Bonificacion | null>;
  
  /**
   * Obtiene todas las bonificaciones de un usuario
   */
  getBonificacionesByUser(userId: number): Promise<Bonificacion[]>;
  
  /**
   * Calcula y guarda la bonificación mensual para un usuario
   * basada en sus KPIs y datos salariales
   */
  calcularBonificacion(
    userId: number, 
    mes: string,
    salarioBase: number,
    salarioVariable: number
  ): Promise<Bonificacion>;
  
  /**
   * Aprueba o rechaza una bonificación por parte de un supervisor
   */
  aprobarBonificacion(
    id: number, 
    aprobadorId: number, 
    aprobada: boolean, 
    comentarios?: string
  ): Promise<Bonificacion>;
}