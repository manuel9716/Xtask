import { apiRequest } from "@/lib/queryClient";
import { NominaPreview, NominaCreate, NominaProcess, NominaItem } from "../schemas/nomina.schemas";

export interface NominaPreviewResponse {
  items: NominaItem[];
  totales: {
    total_sueldos: number;
    total_bonos: number;
    total_deducciones: number;
    total_neto: number;
  };
}

export class NominaApi {
  static async previewNomina(data: NominaPreview) {
    const response = await apiRequest("POST", "/api/nominas-preview/preview", data);
    return response.json();
  }

  static async createNomina(data: NominaCreate) {
    const response = await apiRequest("POST", "/api/nominas", data);
    return response.json();
  }

  static async processNomina(nominaId: number, data: Omit<NominaProcess, 'nomina_id'>) {
    const response = await apiRequest("POST", `/api/nominas/${nominaId}/procesar`, data);
    return response.json();
  }

  static async getNominaDetail(nominaId: number) {
    const response = await apiRequest("GET", `/api/nominas/${nominaId}`);
    return response.json();
  }

  static async getEmpleadosForNomina(filtros: { proyectoId?: number; q?: string } = {}) {
    const params = new URLSearchParams();
    if (filtros.proyectoId) params.set('proyectoId', filtros.proyectoId.toString());
    if (filtros.q) params.set('q', filtros.q);
    
    const response = await apiRequest("GET", `/api/empleados-nomina?${params}`);
    return response.json();
  }

  static async getNomina(id: number) {
    const response = await apiRequest('GET', `/api/nominas/${id}`);
    return response.json();
  }

  static async setNominaEstado(id: number, estado: string) {
    const response = await apiRequest('PATCH', `/api/nominas/${id}/estado`, { estado });
    return response.json();
  }

  static async exportNomina(id: number, format: 'pdf' | 'xlsx' = 'pdf') {
    // Usar ruta temporal sin autenticación para development
    const response = await fetch(`/api/nominas-preview/${id}/export?format=${format}`, {
      method: 'GET'
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Error al exportar nómina: ${errorText}`);
    }
    
    return response.blob();
  }

  static async eliminarNomina(id: number) {
    try {
      const response = await apiRequest('DELETE', `/api/nominas/${id}`);
      if (response.ok) {
        return await response.json();
      } else {
        const errorText = await response.text();
        throw new Error(`Error ${response.status}: ${errorText}`);
      }
    } catch (error) {
      console.error('Error en eliminarNomina:', error);
      throw error;
    }
  }
}

// Export default instance
export const nominaApi = NominaApi;