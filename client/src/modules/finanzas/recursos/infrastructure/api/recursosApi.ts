import { apiRequest } from '@/lib/queryClient';
import { Recurso, CrearRecursoDTO, ActualizarRecursoDTO, ResumenCostos } from '../../domain/entities/Recurso';

/**
 * API client para el manejo de recursos financieros
 */
export class RecursosApi {
  /**
   * Obtiene todos los recursos de un presupuesto
   */
  async listarRecursosPorPresupuesto(presupuestoId: number): Promise<Recurso[]> {
    const response = await apiRequest('GET', `/api/finanzas/recursos/${presupuestoId}`);
    return response.json();
  }

  /**
   * Crea un nuevo recurso
   */
  async crearRecurso(data: CrearRecursoDTO): Promise<Recurso> {
    const response = await apiRequest('POST', '/api/finanzas/recursos', data);
    return response.json();
  }

  /**
   * Actualiza un recurso existente
   */
  async actualizarRecurso(id: number, data: ActualizarRecursoDTO): Promise<Recurso> {
    const response = await apiRequest('PATCH', `/api/finanzas/recursos/${id}`, data);
    return response.json();
  }

  /**
   * Elimina un recurso
   */
  async eliminarRecurso(id: number): Promise<void> {
    await apiRequest('DELETE', `/api/finanzas/recursos/${id}`);
  }

  /**
   * Obtiene el resumen de costos de un presupuesto
   */
  async obtenerResumenCostos(presupuestoId: number): Promise<ResumenCostos> {
    const response = await apiRequest('GET', `/api/finanzas/recursos/${presupuestoId}/resumen`);
    return response.json();
  }
}

export const recursosApi = new RecursosApi();