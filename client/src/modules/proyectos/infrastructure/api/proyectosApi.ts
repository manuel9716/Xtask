import { apiRequest } from '@/lib/queryClient';
import { 
  Proyecto, 
  CrearProyectoDTO, 
  ActualizarProyectoDTO, 
  EstadoProyecto,
  FiltrosProyecto
} from '../../domain/entities/Proyecto';
import { ProyectosIndicadores } from '../../domain/repositories/ProyectoRepository';

/**
 * Cliente de API para el módulo de proyectos
 * Contiene todos los métodos para interactuar con el backend
 */
export const proyectosApi = {
  /**
   * Obtiene todos los proyectos con filtros opcionales
   */
  async listar(filtros?: FiltrosProyecto): Promise<Proyecto[]> {
    const queryParams = new URLSearchParams();
    
    if (filtros) {
      if (filtros.estado) queryParams.append('estado', filtros.estado);
      if (filtros.busqueda) queryParams.append('busqueda', filtros.busqueda);
      if (filtros.departamentoId) queryParams.append('departamentoId', filtros.departamentoId.toString());
      if (filtros.responsableId) queryParams.append('responsableId', filtros.responsableId.toString());
      if (filtros.fechaInicio) queryParams.append('fechaInicio', filtros.fechaInicio.toISOString());
      if (filtros.fechaFin) queryParams.append('fechaFin', filtros.fechaFin.toISOString());
    }
    
    const queryString = queryParams.toString() ? `?${queryParams.toString()}` : '';
    const response = await apiRequest('GET', `/api/proyectos${queryString}`);
    return response.json();
  },
  
  /**
   * Obtiene un proyecto por su ID
   */
  async obtenerPorId(id: number): Promise<Proyecto> {
    const response = await apiRequest('GET', `/api/proyectos/${id}`);
    return response.json();
  },
  
  /**
   * Crea un nuevo proyecto
   */
  async crear(proyecto: CrearProyectoDTO): Promise<Proyecto> {
    const response = await apiRequest('POST', '/api/proyectos', proyecto);
    return response.json();
  },
  
  /**
   * Actualiza un proyecto existente
   */
  async actualizar(id: number, proyecto: ActualizarProyectoDTO): Promise<Proyecto> {
    const response = await apiRequest('PATCH', `/api/proyectos/${id}`, proyecto);
    return response.json();
  },
  
  /**
   * Cambia el estado de un proyecto
   */
  async cambiarEstado(id: number, estado: EstadoProyecto): Promise<Proyecto> {
    const response = await apiRequest('PATCH', `/api/proyectos/${id}/estado`, { estado });
    return response.json();
  },
  
  /**
   * Elimina un proyecto por su ID
   */
  async eliminar(id: number): Promise<void> {
    await apiRequest('DELETE', `/api/proyectos/${id}`);
  },
  
  /**
   * Obtiene indicadores y métricas de proyectos
   */
  async obtenerIndicadores(): Promise<ProyectosIndicadores> {
    const response = await apiRequest('GET', '/api/proyectos/indicadores');
    return response.json();
  }
};