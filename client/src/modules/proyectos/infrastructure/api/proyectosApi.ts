import { 
  Proyecto, 
  CrearProyectoDTO, 
  ActualizarProyectoDTO, 
  CambiarEstadoProyectoDTO,
  FiltrosProyecto,
  ProyectosPaginados
} from '../../domain/entities/Proyecto';
import { apiRequest } from '@/lib/queryClient';

/**
 * Cliente API para interactuar con el backend de proyectos
 * Implementa las operaciones definidas en el repositorio
 */
export const proyectosApi = {
  /**
   * Obtiene un listado paginado de proyectos según los filtros
   */
  async listarProyectos(filtros?: FiltrosProyecto): Promise<ProyectosPaginados> {
    // Construir query params para filtros
    const params = new URLSearchParams();
    if (filtros?.busqueda) params.append('busqueda', filtros.busqueda);
    if (filtros?.estado) {
      if (Array.isArray(filtros.estado)) {
        filtros.estado.forEach(estado => params.append('estado', estado));
      } else {
        params.append('estado', filtros.estado);
      }
    }
    if (filtros?.responsableId) params.append('responsableId', String(filtros.responsableId));
    if (filtros?.clienteId) params.append('clienteId', String(filtros.clienteId));
    if (filtros?.fechaInicioDesde) params.append('fechaInicioDesde', filtros.fechaInicioDesde.toISOString());
    if (filtros?.fechaInicioHasta) params.append('fechaInicioHasta', filtros.fechaInicioHasta.toISOString());
    if (filtros?.page) params.append('page', String(filtros.page));
    if (filtros?.pageSize) params.append('pageSize', String(filtros.pageSize));

    // Hacer la petición GET con los parámetros
    const queryString = params.toString() ? `?${params.toString()}` : '';
    const response = await apiRequest('GET', `/api/proyectos${queryString}`);
    const data = await response.json();
    return data;
  },

  /**
   * Obtiene un proyecto por su ID
   */
  async obtenerProyectoPorId(id: number): Promise<Proyecto> {
    const response = await apiRequest('GET', `/api/proyectos/${id}`);
    if (!response.ok) {
      throw new Error(`Error al obtener proyecto: ${response.statusText}`);
    }
    return await response.json();
  },

  /**
   * Crea un nuevo proyecto
   */
  async crearProyecto(proyecto: CrearProyectoDTO): Promise<Proyecto> {
    const response = await apiRequest('POST', '/api/proyectos', proyecto);
    if (!response.ok) {
      throw new Error(`Error al crear proyecto: ${response.statusText}`);
    }
    return await response.json();
  },

  /**
   * Actualiza un proyecto existente
   */
  async actualizarProyecto(id: number, proyecto: ActualizarProyectoDTO): Promise<Proyecto> {
    const response = await apiRequest('PATCH', `/api/proyectos/${id}`, proyecto);
    if (!response.ok) {
      throw new Error(`Error al actualizar proyecto: ${response.statusText}`);
    }
    return await response.json();
  },

  /**
   * Cambia el estado de un proyecto
   */
  async cambiarEstadoProyecto(id: number, cambioEstado: CambiarEstadoProyectoDTO): Promise<Proyecto> {
    const response = await apiRequest('PATCH', `/api/proyectos/${id}/estado`, cambioEstado);
    if (!response.ok) {
      throw new Error(`Error al cambiar estado: ${response.statusText}`);
    }
    return await response.json();
  },

  /**
   * Elimina (o archiva) un proyecto
   */
  async eliminarProyecto(id: number): Promise<void> {
    const response = await apiRequest('DELETE', `/api/proyectos/${id}`);
    if (!response.ok) {
      throw new Error(`Error al eliminar proyecto: ${response.statusText}`);
    }
  },

  /**
   * Obtiene indicadores/métricas de los proyectos
   */
  async obtenerIndicadores(): Promise<{ 
    totalProyectos: number, 
    proyectosActivos: number, 
    proyectosPausados: number,
    proyectosFinalizados: number,
    proyectosRetrasados: number,
    presupuestoTotal: number,
    presupuestoActivos: number
  }> {
    const response = await apiRequest('GET', '/api/proyectos/indicadores');
    if (!response.ok) {
      throw new Error(`Error al obtener indicadores: ${response.statusText}`);
    }
    return await response.json();
  }
};