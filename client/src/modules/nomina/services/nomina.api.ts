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
    const response = await apiRequest("POST", "/api/nominas/preview", data);
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

  static async exportNomina(nominaId: number, format: 'pdf' | 'xlsx') {
    const response = await fetch(`/api/nominas/${nominaId}/export?format=${format}`, {
      method: 'GET',
    });
    
    if (!response.ok) {
      throw new Error('Error al exportar nómina');
    }
    
    return response.blob();
  }

  static async getEmpleadosForNomina(filtros: { proyectoId?: number; q?: string } = {}) {
    const params = new URLSearchParams();
    if (filtros.proyectoId) params.set('proyectoId', filtros.proyectoId.toString());
    if (filtros.q) params.set('q', filtros.q);
    
    const response = await apiRequest("GET", `/api/empleados-nomina?${params}`);
    return response.json();
  }
}