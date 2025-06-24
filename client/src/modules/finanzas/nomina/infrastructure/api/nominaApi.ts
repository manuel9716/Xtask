import { apiRequest } from '@/lib/queryClient';
import { 
  Nomina, 
  NominaConDetalles, 
  CrearNominaDTO, 
  ResumenNominaProyecto,
  FiltrosNomina 
} from '../../domain/entities/Nomina';

/**
 * API para gestión de nómina
 */
export const nominaApi = {
  /**
   * Obtiene los proyectos que tienen recursos asignados
   */
  async obtenerProyectosConRecursos(): Promise<any[]> {
    const response = await apiRequest('GET', '/api/nomina/proyectos');
    return response.json();
  },

  /**
   * Obtiene los recursos de un proyecto específico para nómina
   */
  async obtenerRecursosPorProyecto(proyectoId: number, filtros?: FiltrosNomina): Promise<NominaConDetalles[]> {
    const params = new URLSearchParams();
    if (filtros?.mes) params.append('mes', filtros.mes);
    if (filtros?.estado) params.append('estado', filtros.estado);
    if (filtros?.perfil) params.append('perfil', filtros.perfil);

    const queryString = params.toString();
    const url = `/api/nomina/${proyectoId}${queryString ? `?${queryString}` : ''}`;
    
    const response = await apiRequest('GET', url);
    return response.json();
  },

  /**
   * Obtiene el resumen de nómina por proyecto
   */
  async obtenerResumenProyecto(proyectoId: number, mes?: string): Promise<ResumenNominaProyecto> {
    const params = new URLSearchParams();
    if (mes) params.append('mes', mes);
    
    const queryString = params.toString();
    const url = `/api/nomina/${proyectoId}/resumen${queryString ? `?${queryString}` : ''}`;
    
    const response = await apiRequest('GET', url);
    return response.json();
  },

  /**
   * Registra un pago de nómina
   */
  async registrarPago(proyectoId: number, data: CrearNominaDTO): Promise<Nomina> {
    const response = await apiRequest('POST', `/api/nomina/${proyectoId}/pagar`, data);
    return response.json();
  },

  /**
   * Actualiza el estado de una nómina
   */
  async actualizarEstado(
    nominaId: number, 
    estado: 'pendiente' | 'pagado' | 'aprobado',
    fechaPago?: string,
    bonificacion?: number
  ): Promise<Nomina> {
    const response = await apiRequest('PATCH', `/api/nomina/${nominaId}/estado`, {
      estado,
      fechaPago,
      bonificacion
    });
    return response.json();
  },

  /**
   * Obtiene el historial de nómina de un recurso específico
   */
  async obtenerHistorialRecurso(recursoId: number): Promise<Nomina[]> {
    const response = await apiRequest('GET', `/api/nomina/recurso/${recursoId}/historial`);
    return response.json();
  },

  /**
   * Obtiene las métricas de nómina
   */
  async obtenerMetricas(proyectoId?: number): Promise<{
    totalMensual: number;
    pendientePago: number;
    pagadoMes: number;
    recursosActivos: number;
  }> {
    const params = new URLSearchParams();
    if (proyectoId) params.append('proyectoId', proyectoId.toString());
    
    const queryString = params.toString();
    const url = `/api/nomina/metricas${queryString ? `?${queryString}` : ''}`;
    
    const response = await apiRequest('GET', url);
    return response.json();
  }
};