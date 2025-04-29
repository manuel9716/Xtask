/**
 * API de Nóminas
 * Implementación del cliente HTTP para el módulo de nóminas
 */

import { apiRequest, queryClient } from "@/lib/queryClient";
import { 
  Nomina, 
  EstadoNomina, 
  FiltrosNomina, 
  ResultadoPaginadoNominas 
} from "../../domain/entities/Nomina";
import { INominaRepository } from "../../domain/interfaces/INominaRepository";

export class NominasApi implements INominaRepository {
  private apiUrl = "/api/finanzas/nomina";
  
  /**
   * Obtiene una lista paginada de nóminas
   */
  async listar(
    filtros?: FiltrosNomina,
    paginacion?: { page: number; pageSize: number }
  ): Promise<ResultadoPaginadoNominas> {
    // Construir parámetros de consulta
    const params = new URLSearchParams();
    
    if (filtros) {
      if (filtros.empleadoId) {
        params.append('empleadoId', filtros.empleadoId.toString());
      }
      
      if (filtros.empleadoNombre) {
        params.append('empleadoNombre', filtros.empleadoNombre);
      }
      
      if (filtros.mes) {
        params.append('mes', filtros.mes.toString());
      }
      
      if (filtros.anio) {
        params.append('anio', filtros.anio.toString());
      }
      
      if (filtros.estado) {
        params.append('estado', filtros.estado);
      }
      
      if (filtros.periodo) {
        params.append('periodo', filtros.periodo);
      }
    }
    
    // Añadir parámetros de paginación
    if (paginacion) {
      params.append('page', paginacion.page.toString());
      params.append('pageSize', paginacion.pageSize.toString());
    }
    
    // Construir URL
    const url = `${this.apiUrl}?${params.toString()}`;
    
    try {
      // Realizar petición
      const response = await apiRequest('GET', url);
      const data = await response.json();
      
      return {
        data: data.nominas || [],
        page: data.pagination.page,
        pageSize: data.pagination.pageSize,
        total: data.pagination.totalItems,
        totalPages: data.pagination.totalPages
      };
    } catch (error) {
      console.error("Error al obtener nóminas:", error);
      return {
        data: [],
        page: paginacion?.page || 1,
        pageSize: paginacion?.pageSize || 10,
        total: 0,
        totalPages: 0
      };
    }
  }
  
  /**
   * Obtiene una nómina por su ID
   */
  async obtenerPorId(id: number): Promise<Nomina | null> {
    try {
      const response = await apiRequest('GET', `${this.apiUrl}/${id}`);
      return await response.json();
    } catch (error) {
      console.error("Error al obtener nómina por ID:", error);
      return null;
    }
  }
  
  /**
   * Cambia el estado de una nómina
   */
  async cambiarEstado(id: number, estado: EstadoNomina): Promise<boolean> {
    try {
      await apiRequest('POST', `${this.apiUrl}/cambiar-estado/${id}`, { estado });
      
      // Invalidar caché de consultas relacionadas
      queryClient.invalidateQueries({ queryKey: [this.apiUrl] });
      queryClient.invalidateQueries({ queryKey: [`${this.apiUrl}/${id}`] });
      
      return true;
    } catch (error) {
      console.error("Error al cambiar estado de nómina:", error);
      return false;
    }
  }
  
  /**
   * Marca una nómina como pagada
   */
  async marcarPagada(id: number): Promise<boolean> {
    try {
      await apiRequest('POST', `${this.apiUrl}/marcar-pagado/${id}`);
      
      // Invalidar caché de consultas relacionadas
      queryClient.invalidateQueries({ queryKey: [this.apiUrl] });
      queryClient.invalidateQueries({ queryKey: [`${this.apiUrl}/${id}`] });
      
      return true;
    } catch (error) {
      console.error("Error al marcar nómina como pagada:", error);
      return false;
    }
  }
  
  /**
   * Genera un PDF de la nómina
   */
  async generarPDF(id: number): Promise<Blob | null> {
    try {
      const response = await apiRequest('GET', `${this.apiUrl}/${id}/desprendible`);
      return await response.blob();
    } catch (error) {
      console.error("Error al generar PDF de nómina:", error);
      return null;
    }
  }
  
  /**
   * Envía la nómina por correo electrónico
   */
  async enviarPorEmail(id: number, email?: string): Promise<boolean> {
    try {
      await apiRequest('POST', `${this.apiUrl}/${id}/enviar-email`, email ? { email } : undefined);
      return true;
    } catch (error) {
      console.error("Error al enviar nómina por email:", error);
      return false;
    }
  }
}