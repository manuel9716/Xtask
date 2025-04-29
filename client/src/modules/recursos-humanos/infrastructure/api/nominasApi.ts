/**
 * API de Nóminas
 * Proporciona métodos para realizar operaciones CRUD relacionadas con nóminas
 */

import { apiRequest } from "@/lib/queryClient";
import { Nomina, NominaInput, NominaFiltros } from "../../domain/entities/Nomina";

export class NominasApi {
  private static BASE_URL = "/api/nomina";

  /**
   * Obtiene una lista paginada de nóminas con filtros opcionales
   */
  static async obtenerNominas(filtros?: NominaFiltros): Promise<{
    nominas: Nomina[];
    total: number;
    pagina: number;
    totalPaginas: number;
  }> {
    // Construir query string con los filtros
    const queryParams = new URLSearchParams();
    
    if (filtros) {
      if (filtros.busqueda) queryParams.append("busqueda", filtros.busqueda);
      if (filtros.empleadoId) queryParams.append("empleadoId", filtros.empleadoId.toString());
      if (filtros.estado) queryParams.append("estado", filtros.estado);
      if (filtros.fechaInicio) queryParams.append("fechaInicio", filtros.fechaInicio.toISOString());
      if (filtros.fechaFin) queryParams.append("fechaFin", filtros.fechaFin.toISOString());
      if (filtros.pagina) queryParams.append("pagina", filtros.pagina.toString());
      if (filtros.porPagina) queryParams.append("porPagina", filtros.porPagina.toString());
      if (filtros.ordenarPor) queryParams.append("ordenarPor", filtros.ordenarPor);
      if (filtros.direccion) queryParams.append("direccion", filtros.direccion);
    }
    
    const queryString = queryParams.toString();
    const url = queryString ? `${this.BASE_URL}?${queryString}` : this.BASE_URL;
    
    const response = await apiRequest("GET", url);
    return await response.json();
  }

  /**
   * Obtiene una nómina específica por su ID
   */
  static async obtenerNominaPorId(id: number): Promise<Nomina> {
    const response = await apiRequest("GET", `${this.BASE_URL}/${id}`);
    return await response.json();
  }

  /**
   * Crea una nueva nómina
   */
  static async crearNomina(nomina: NominaInput): Promise<Nomina> {
    const response = await apiRequest("POST", `${this.BASE_URL}`, nomina);
    return await response.json();
  }

  /**
   * Actualiza una nómina existente
   */
  static async actualizarNomina(id: number, nomina: Partial<NominaInput>): Promise<Nomina> {
    const response = await apiRequest("PATCH", `${this.BASE_URL}/${id}`, nomina);
    return await response.json();
  }

  /**
   * Cambia el estado de una nómina
   */
  static async cambiarEstadoNomina(id: number, estado: string): Promise<Nomina> {
    const response = await apiRequest("POST", `${this.BASE_URL}/cambiar-estado/${id}`, { estado });
    return await response.json();
  }

  /**
   * Marca una nómina como pagada
   */
  static async marcarPagada(id: number, datos: { 
    paymentDate: Date,
    paymentMethod: string,
    paymentReference: string
  }): Promise<Nomina> {
    const response = await apiRequest("POST", `${this.BASE_URL}/marcar-pagado/${id}`, datos);
    return await response.json();
  }

  /**
   * Obtiene el desprendible de nómina en formato PDF
   */
  static async obtenerDesprendible(id: number): Promise<Blob> {
    const response = await apiRequest("GET", `${this.BASE_URL}/${id}/desprendible`);
    return await response.blob();
  }

  /**
   * Procesa la nómina para un periodo específico
   */
  static async procesarNomina(datos: {
    fechaInicio: Date,
    fechaFin: Date,
    empleadoIds?: number[]
  }): Promise<{ procesados: number, errores: any[] }> {
    const response = await apiRequest("POST", `${this.BASE_URL}/procesar`, datos);
    return await response.json();
  }
}