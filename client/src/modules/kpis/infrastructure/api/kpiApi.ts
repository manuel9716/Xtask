import { apiRequest } from "@/lib/queryClient";
import { Indicador } from "../../domain/entities/Indicador";
import { Bonificacion } from "../../domain/entities/Bonificacion";
import { KpiRepository } from "../../domain/repositories/KpiRepository";

/**
 * Implementación de KpiRepository para comunicarse con la API
 */
export class KpiApi implements KpiRepository {
  /**
   * Obtiene los KPIs de un usuario para un mes específico
   */
  async getKpisByUserAndMonth(userId: number, mes: string): Promise<Indicador[]> {
    const res = await apiRequest("GET", `/api/kpis/user/${userId}/mes/${mes}`);
    return await res.json();
  }

  /**
   * Obtiene un KPI por su ID
   */
  async getKpiById(id: number): Promise<Indicador | null> {
    const res = await apiRequest("GET", `/api/kpis/${id}`);
    return await res.json();
  }

  /**
   * Crea un nuevo KPI
   */
  async createKpi(kpi: Omit<Indicador, "id" | "createdAt" | "updatedAt">): Promise<Indicador> {
    const res = await apiRequest("POST", "/api/kpis", kpi);
    return await res.json();
  }

  /**
   * Registra el resultado de un KPI y lo evalúa
   */
  async evaluarKpi(id: number, valorObtenido: number): Promise<Indicador> {
    const res = await apiRequest("POST", `/api/kpis/${id}/evaluar`, { valorObtenido });
    return await res.json();
  }

  /**
   * Obtiene la bonificación de un usuario para un mes específico
   */
  async getBonificacionByUserAndMonth(userId: number, mes: string): Promise<Bonificacion | null> {
    const res = await apiRequest("GET", `/api/kpis/bonificaciones/user/${userId}/mes/${mes}`);
    return await res.json();
  }

  /**
   * Calcula la bonificación para un usuario en un mes específico
   */
  async calcularBonificacion(
    userId: number, 
    mes: string, 
    salarioBase: number, 
    salarioVariable: number
  ): Promise<Bonificacion> {
    const res = await apiRequest("POST", "/api/kpis/bonificaciones/calcular", {
      userId,
      mes,
      salarioBase,
      salarioVariable
    });
    return await res.json();
  }

  /**
   * Obtiene el historial de bonificaciones
   */
  async getBonificacionesHistory(): Promise<Bonificacion[]> {
    const res = await apiRequest("GET", "/api/kpis/bonificaciones/historial");
    return await res.json();
  }
}

// Instancia única para usar en la aplicación
export const kpiApi = new KpiApi();