import { KpiRepository, Empleado, CreateKpiDTO } from "../../domain/repositories/KpiRepository";
import { Indicador } from "../../domain/entities/Indicador";
import { Bonificacion } from "../../domain/entities/Bonificacion";
import { apiRequest } from "@/lib/queryClient";

/**
 * Interfaz para la información del empleado con salario
 */
export interface EmpleadoInfo {
  id: number;
  userId: number;
  firstName: string;
  lastName: string;
  position: string;
  department: string;
  salary: number;
  nombreCompleto: string;
}

/**
 * Implementación de KpiRepository utilizando la API REST del backend
 * Esta clase actúa como un adaptador para la API de KPIs
 */
export class KpiApi implements KpiRepository {
  
  async getUserKpis(userId: number, mes?: string): Promise<Indicador[]> {
    // Si no se proporciona mes, usamos el mes actual
    const mesAFiltrar = mes || new Date().toISOString().substring(0, 7);
    const response = await apiRequest("GET", `/api/kpis/mis-kpis?mes=${mesAFiltrar}`);
    return await response.json();
  }
  
  async getKpi(id: number): Promise<Indicador | null> {
    try {
      const response = await apiRequest("GET", `/api/kpis/${id}`);
      return await response.json();
    } catch (error) {
      return null;
    }
  }
  
  async createKpi(kpi: CreateKpiDTO): Promise<Indicador> {
    console.log("Datos enviados a createKpi:", kpi);
    const response = await apiRequest("POST", "/api/kpis", kpi);
    return await response.json();
  }
  
  async updateKpi(id: number, kpi: Partial<Indicador>): Promise<Indicador> {
    const response = await apiRequest("PATCH", `/api/kpis/${id}`, kpi);
    return await response.json();
  }
  
  async deleteKpi(id: number): Promise<boolean> {
    try {
      await apiRequest("DELETE", `/api/kpis/${id}`);
      return true;
    } catch (error) {
      return false;
    }
  }
  
  async evaluarKpi(id: number, valorActual: number): Promise<Indicador> {
    // Ahora valorActual representa directamente el porcentaje de cumplimiento
    const response = await apiRequest("PATCH", `/api/kpis/${id}/resultado`, { 
      porcentajeCumplimiento: valorActual 
    });
    return await response.json();
  }
  
  async validarKpi(id: number, validadoPor: number, comentarios?: string): Promise<Indicador> {
    const response = await apiRequest("PATCH", `/api/kpis/${id}/validar`, { 
      aprobado: true, 
      comentarios 
    });
    return await response.json();
  }

  async getEmpleados(): Promise<Empleado[]> {
    try {
      const response = await apiRequest("GET", "/api/kpis/empleados");
      return await response.json();
    } catch (error) {
      console.error("Error al obtener empleados:", error);
      return [];
    }
  }
  
  async getEmpleadoByUserId(userId: number): Promise<EmpleadoInfo | null> {
    try {
      const response = await apiRequest("GET", `/api/kpis/empleado-por-userid/${userId}`);
      return await response.json();
    } catch (error) {
      console.error("Error al obtener información del empleado:", error);
      return null;
    }
  }
  
  async getUserBonificaciones(userId: number): Promise<Bonificacion[]> {
    // No hay endpoint específico para todas las bonificaciones de un usuario,
    // así que usamos el historial sin límite
    return this.getBonificacionesHistory(userId);
  }
  
  async getBonificacion(id: number): Promise<Bonificacion | null> {
    try {
      // Accedemos directamente a la bonificación por ID
      const response = await apiRequest("GET", `/api/kpis/bonificacion/${id}`);
      return await response.json();
    } catch (error) {
      return null;
    }
  }
  
  async getBonificacionByUserAndMonth(userId: number, mes: string): Promise<Bonificacion | null> {
    try {
      // Usamos el endpoint de bonificación con query params
      const response = await apiRequest("GET", `/api/kpis/bonificacion?mes=${mes}`);
      return await response.json();
    } catch (error) {
      return null;
    }
  }
  
  async getBonificacionesHistory(userId: number, limit?: number): Promise<Bonificacion[]> {
    // Usamos el endpoint de historial de bonificaciones
    const queryParams = limit ? `?limit=${limit}` : '';
    const response = await apiRequest("GET", `/api/kpis/bonificaciones/historial${queryParams}`);
    return await response.json();
  }
  
  async calcularBonificacion(userId: number, mes: string, salarioBase: number, salarioVariable: number): Promise<Bonificacion> {
    const response = await apiRequest("POST", "/api/kpis/calcular-bonificacion", {
      userId,
      mes,
      salarioBase,
      salarioVariable
    });
    return await response.json();
  }
  
  async aprobarBonificacion(id: number, aprobadoPor: number, comentarios?: string): Promise<Bonificacion> {
    const response = await apiRequest("PATCH", `/api/kpis/bonificacion/${id}/aprobar`, {
      aprobada: true,
      comentarios
    });
    return await response.json();
  }
  
  async rechazarBonificacion(id: number, aprobadoPor: number, comentarios: string): Promise<Bonificacion> {
    const response = await apiRequest("PATCH", `/api/kpis/bonificacion/${id}/aprobar`, {
      aprobada: false,
      comentarios
    });
    return await response.json();
  }
  
  async marcarBonificacionPagada(id: number): Promise<Bonificacion> {
    const response = await apiRequest("PATCH", `/api/kpis/bonificacion/${id}/marcar-pagada`);
    return await response.json();
  }
}