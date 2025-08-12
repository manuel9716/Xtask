import { apiRequest } from "@/lib/queryClient";
import { NewEmpleado } from "../schemas/empleado.schemas";

export class EmpleadosApi {
  static async createEmpleado(data: NewEmpleado) {
    const response = await apiRequest("POST", "/api/empleados-nomina", data);
    return response.json();
  }

  static async uploadContrato(empleadoId: number, file: File) {
    const formData = new FormData();
    formData.append('contrato', file);
    
    const response = await fetch(`/api/empleados-nomina/${empleadoId}/contrato`, {
      method: 'POST',
      body: formData,
    });
    
    if (!response.ok) {
      throw new Error('Error al subir contrato');
    }
    
    return response.json();
  }

  static async getProyectos() {
    const response = await apiRequest("GET", "/api/proyectos");
    const data = await response.json();
    
    // Transformar el formato de la respuesta para que coincida con lo esperado
    if (data.data && Array.isArray(data.data)) {
      return data.data.map((proyecto: any) => ({
        id: proyecto.id,
        nombre: proyecto.nombre || proyecto.name,
      }));
    }
    
    // Si ya es un array directamente
    if (Array.isArray(data)) {
      return data.map((proyecto: any) => ({
        id: proyecto.id,
        nombre: proyecto.nombre || proyecto.name,
      }));
    }
    
    // Valor por defecto si no hay datos válidos
    return [];
  }

  static async getEmpleados(filtros: { proyectoId?: number; q?: string } = {}) {
    const params = new URLSearchParams();
    if (filtros.proyectoId) params.set('proyectoId', filtros.proyectoId.toString());
    if (filtros.q) params.set('q', filtros.q);
    
    const response = await apiRequest("GET", `/api/empleados-nomina?${params}`);
    return response.json();
  }

  static async getEmpleado(id: number) {
    const response = await apiRequest('GET', `/api/empleados/${id}?include=proyectos,nominas`);
    return response.json();
  }

  static async updateEmpleado(id: number, data: any) {
    const response = await apiRequest('PATCH', `/api/empleados/${id}`, data);
    return response.json();
  }

  static async updateEmpleadoProyectos(id: number, proyectosIds: number[]) {
    const response = await apiRequest('PUT', `/api/empleados/${id}/proyectos`, { proyectosIds });
    return response.json();
  }

  static async deleteEmpleado(id: number) {
    const response = await apiRequest('DELETE', `/api/empleados/${id}`);
    return response.json();
  }

  static async getHistorialNomina(empleadoId: number) {
    const response = await apiRequest('GET', `/api/empleados/${empleadoId}/historial-nomina`);
    return response.json();
  }

  static async updateEstadoNomina(empleadoId: number, nominaId: number, estado: string) {
    const response = await apiRequest('PATCH', `/api/empleados/${empleadoId}/historial-nomina/${nominaId}/estado`, {
      estado
    });
    return response.json();
  }
}

// Export default instance
export const empleadosApi = EmpleadosApi;