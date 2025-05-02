import { apiRequest } from "@/lib/queryClient";
import { Indicador } from "../../domain/entities/Indicador";
import { Bonificacion } from "../../domain/entities/Bonificacion";
import { KpiRepository } from "../../domain/repositories/KpiRepository";

/**
 * Adaptador API para comunicarse con el servidor
 * e implementar el repositorio de KPIs
 */
export class KpiApi implements KpiRepository {
  /**
   * Obtiene los KPIs del usuario para un mes específico
   */
  async getKpisByUserAndMonth(userId: number, mes: string): Promise<Indicador[]> {
    const response = await apiRequest("GET", `/api/kpis/mis-kpis?mes=${mes}`);
    const data = await response.json();
    return data;
  }

  /**
   * Obtiene un KPI específico por ID
   */
  async getKpiById(id: number): Promise<Indicador | null> {
    try {
      const response = await apiRequest("GET", `/api/kpis/${id}`);
      const data = await response.json();
      return data;
    } catch (error) {
      if ((error as Response).status === 404) {
        return null;
      }
      throw error;
    }
  }

  /**
   * Crea un nuevo KPI
   */
  async createKpi(kpi: Omit<Indicador, "id" | "createdAt" | "updatedAt">): Promise<Indicador> {
    const response = await apiRequest("POST", "/api/kpis", kpi);
    const data = await response.json();
    return data;
  }

  /**
   * Actualiza un KPI existente
   */
  async updateKpi(id: number, kpi: Partial<Indicador>): Promise<Indicador> {
    const response = await apiRequest("PATCH", `/api/kpis/${id}`, kpi);
    const data = await response.json();
    return data;
  }

  /**
   * Evalúa un KPI registrando el valor obtenido
   */
  async evaluarKpi(id: number, valorObtenido: number): Promise<Indicador> {
    const response = await apiRequest("PATCH", `/api/kpis/${id}/resultado`, { valorObtenido });
    const data = await response.json();
    return data;
  }

  /**
   * Valida un KPI (acción de supervisor)
   */
  async validarKpi(
    id: number, 
    validadorId: number, 
    aprobado: boolean, 
    comentarios?: string
  ): Promise<Indicador> {
    const response = await apiRequest("PATCH", `/api/kpis/${id}/validar`, {
      aprobado,
      comentarios
    });
    const data = await response.json();
    return data;
  }

  /**
   * Elimina un KPI
   */
  async deleteKpi(id: number): Promise<boolean> {
    await apiRequest("DELETE", `/api/kpis/${id}`);
    return true;
  }

  /**
   * Obtiene la bonificación del usuario para un mes específico
   * En la API, el userId se ignora porque se toma del usuario autenticado
   */
  async getBonificacionByUserAndMonth(userId: number, mes: string): Promise<Bonificacion | null> {
    try {
      const response = await apiRequest("GET", `/api/kpis/bonificacion?mes=${mes}`);
      const data = await response.json();
      return data;
    } catch (error) {
      if ((error as Response).status === 404) {
        return null;
      }
      throw error;
    }
  }

  /**
   * Obtiene todas las bonificaciones del usuario
   * En la API, el userId se ignora porque se toma del usuario autenticado
   */
  async getBonificacionesByUser(userId: number): Promise<Bonificacion[]> {
    const response = await apiRequest("GET", "/api/kpis/bonificaciones/historial");
    const data = await response.json();
    return data;
  }

  /**
   * Alias para el historial de bonificaciones
   */
  async getBonificacionesHistory(): Promise<Bonificacion[]> {
    return this.getBonificacionesByUser(0); // El ID se ignora en la API
  }

  /**
   * Calcula la bonificación del usuario para un mes
   * En la API, el userId se ignora porque se toma del usuario autenticado
   */
  async calcularBonificacion(
    userId: number,
    mes: string,
    salarioBase: number,
    salarioVariable: number
  ): Promise<Bonificacion> {
    const response = await apiRequest("POST", "/api/kpis/calcular-bonificacion", {
      mes,
      salarioBase,
      salarioVariable
    });
    const data = await response.json();
    return data;
  }

  /**
   * Aprueba o rechaza una bonificación (acción de supervisor)
   */
  async aprobarBonificacion(
    id: number, 
    aprobadorId: number, 
    aprobada: boolean, 
    comentarios?: string
  ): Promise<Bonificacion> {
    const response = await apiRequest("PATCH", `/api/kpis/bonificacion/${id}/aprobar`, {
      aprobada,
      comentarios
    });
    const data = await response.json();
    return data;
  }
}