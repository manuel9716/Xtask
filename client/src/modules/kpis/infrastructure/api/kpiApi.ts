import { Indicador } from "../../domain/entities/Indicador";
import { Bonificacion } from "../../domain/entities/Bonificacion";
import { apiRequest } from "@/lib/queryClient";

/**
 * Clase que encapsula las llamadas a la API para el módulo de KPIs
 */
export class KpiApi {
  private readonly basePath = "/api/kpis";

  /**
   * Obtiene los KPIs de un usuario para un mes específico
   */
  async getKpisByUserAndMonth(userId: number, mes: string): Promise<Indicador[]> {
    const response = await apiRequest(
      "GET",
      `${this.basePath}/mis-kpis?mes=${mes}`
    );
    return await response.json();
  }

  /**
   * Obtiene un KPI específico por su ID
   */
  async getKpiById(id: number): Promise<Indicador> {
    const response = await apiRequest(
      "GET",
      `${this.basePath}/${id}`
    );
    return await response.json();
  }

  /**
   * Crea un nuevo KPI
   */
  async createKpi(kpi: Omit<Indicador, "id" | "createdAt" | "updatedAt">): Promise<Indicador> {
    const response = await apiRequest(
      "POST",
      this.basePath,
      kpi
    );
    return await response.json();
  }

  /**
   * Actualiza un KPI existente
   */
  async updateKpi(id: number, kpi: Partial<Indicador>): Promise<Indicador> {
    const response = await apiRequest(
      "PATCH",
      `${this.basePath}/${id}`,
      kpi
    );
    return await response.json();
  }

  /**
   * Registra el resultado de un KPI
   */
  async evaluarKpi(id: number, valorObtenido: number): Promise<Indicador> {
    const response = await apiRequest(
      "PATCH",
      `${this.basePath}/${id}/resultado`,
      { valorObtenido }
    );
    return await response.json();
  }

  /**
   * Valida un KPI por parte de un supervisor
   */
  async validarKpi(
    id: number, 
    aprobado: boolean, 
    comentarios?: string
  ): Promise<Indicador> {
    const response = await apiRequest(
      "PATCH",
      `${this.basePath}/${id}/validar`,
      { aprobado, comentarios }
    );
    return await response.json();
  }

  /**
   * Elimina un KPI
   */
  async deleteKpi(id: number): Promise<boolean> {
    const response = await apiRequest(
      "DELETE",
      `${this.basePath}/${id}`
    );
    const result = await response.json();
    return result.success || false;
  }

  /**
   * Obtiene la bonificación de un usuario para un mes específico
   */
  async getBonificacionByUserAndMonth(mes: string): Promise<Bonificacion> {
    const response = await apiRequest(
      "GET",
      `${this.basePath}/bonificacion?mes=${mes}`
    );
    return await response.json();
  }

  /**
   * Obtiene todas las bonificaciones de un usuario
   */
  async getBonificacionesHistory(): Promise<Bonificacion[]> {
    const response = await apiRequest(
      "GET",
      `${this.basePath}/bonificaciones/historial`
    );
    return await response.json();
  }

  /**
   * Calcula la bonificación mensual para un usuario
   */
  async calcularBonificacion(
    mes: string,
    salarioBase: number,
    salarioVariable: number
  ): Promise<Bonificacion> {
    const response = await apiRequest(
      "POST",
      `${this.basePath}/calcular-bonificacion`,
      { mes, salarioBase, salarioVariable }
    );
    return await response.json();
  }

  /**
   * Aprueba una bonificación por parte de un supervisor
   */
  async aprobarBonificacion(
    id: number,
    aprobada: boolean,
    comentarios?: string
  ): Promise<Bonificacion> {
    const response = await apiRequest(
      "PATCH",
      `${this.basePath}/bonificacion/${id}/aprobar`,
      { aprobada, comentarios }
    );
    return await response.json();
  }
}