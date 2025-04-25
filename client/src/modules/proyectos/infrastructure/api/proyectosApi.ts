import { apiRequest } from '@/lib/queryClient';
import { 
  ActualizarProyectoDTO, 
  CambiarEstadoProyectoDTO, 
  CrearProyectoDTO,
  EstadoProyecto,
  FiltrosProyecto, 
  Proyecto, 
  ProyectosPaginados 
} from '../../domain/entities/Proyecto';

/**
 * Cliente HTTP para consumir la API REST de proyectos
 * Implementa las operaciones definidas en ProyectoRepository
 */
class ProyectosApi {
  private readonly baseUrl = '/api/proyectos';

  /**
   * Obtiene un listado paginado de proyectos según los filtros aplicados
   */
  async listarProyectos(filtros: FiltrosProyecto = {}): Promise<ProyectosPaginados> {
    // Construir query params a partir de los filtros
    const queryParams = new URLSearchParams();
    
    if (filtros.busqueda) queryParams.append('busqueda', filtros.busqueda);
    
    if (filtros.estado) {
      const estados = Array.isArray(filtros.estado) ? filtros.estado : [filtros.estado];
      estados.forEach(estado => queryParams.append('estado', estado));
    }
    
    if (filtros.responsableId) queryParams.append('responsableId', filtros.responsableId.toString());
    if (filtros.clienteId) queryParams.append('clienteId', filtros.clienteId.toString());
    
    if (filtros.fechaInicioDesde) queryParams.append('fechaInicioDesde', filtros.fechaInicioDesde.toISOString());
    if (filtros.fechaInicioHasta) queryParams.append('fechaInicioHasta', filtros.fechaInicioHasta.toISOString());
    
    if (filtros.page) queryParams.append('page', filtros.page.toString());
    if (filtros.pageSize) queryParams.append('pageSize', filtros.pageSize.toString());
    
    const url = `${this.baseUrl}?${queryParams.toString()}`;
    const response = await apiRequest('GET', url);
    const data = await response.json();
    
    // Transformar fechas de string a Date
    return this.transformarRespuestaPaginada(data);
  }

  /**
   * Obtiene un proyecto por su ID
   */
  async obtenerProyectoPorId(id: number): Promise<Proyecto> {
    const response = await apiRequest('GET', `${this.baseUrl}/${id}`);
    if (!response.ok) {
      throw new Error(`Error al obtener el proyecto #${id}: ${response.statusText}`);
    }
    
    const data = await response.json();
    return this.transformarProyecto(data);
  }

  /**
   * Crea un nuevo proyecto
   */
  async crearProyecto(proyecto: CrearProyectoDTO): Promise<Proyecto> {
    const response = await apiRequest('POST', this.baseUrl, proyecto);
    if (!response.ok) {
      throw new Error(`Error al crear el proyecto: ${response.statusText}`);
    }
    
    const data = await response.json();
    return this.transformarProyecto(data);
  }

  /**
   * Actualiza un proyecto existente
   */
  async actualizarProyecto(id: number, proyecto: ActualizarProyectoDTO): Promise<Proyecto> {
    const response = await apiRequest('PATCH', `${this.baseUrl}/${id}`, proyecto);
    if (!response.ok) {
      throw new Error(`Error al actualizar el proyecto #${id}: ${response.statusText}`);
    }
    
    const data = await response.json();
    return this.transformarProyecto(data);
  }

  /**
   * Cambia el estado de un proyecto
   */
  async cambiarEstadoProyecto(id: number, cambioEstado: CambiarEstadoProyectoDTO): Promise<Proyecto> {
    const response = await apiRequest('PATCH', `${this.baseUrl}/${id}/estado`, cambioEstado);
    if (!response.ok) {
      throw new Error(`Error al cambiar el estado del proyecto #${id}: ${response.statusText}`);
    }
    
    const data = await response.json();
    return this.transformarProyecto(data);
  }

  /**
   * Elimina (o archiva) un proyecto
   */
  async eliminarProyecto(id: number): Promise<void> {
    const response = await apiRequest('DELETE', `${this.baseUrl}/${id}`);
    if (!response.ok) {
      throw new Error(`Error al eliminar el proyecto #${id}: ${response.statusText}`);
    }
  }

  /**
   * Transforma las fechas de string a Date en un proyecto
   */
  private transformarProyecto(proyecto: any): Proyecto {
    return {
      ...proyecto,
      fechaInicio: proyecto.fechaInicio ? new Date(proyecto.fechaInicio) : new Date(),
      fechaFinPrevista: proyecto.fechaFinPrevista ? new Date(proyecto.fechaFinPrevista) : null,
      fechaFinReal: proyecto.fechaFinReal ? new Date(proyecto.fechaFinReal) : null,
      createdAt: proyecto.createdAt ? new Date(proyecto.createdAt) : new Date(),
      updatedAt: proyecto.updatedAt ? new Date(proyecto.updatedAt) : new Date(),
    };
  }

  /**
   * Transforma las fechas en una respuesta paginada
   */
  private transformarRespuestaPaginada(respuesta: any): ProyectosPaginados {
    return {
      ...respuesta,
      data: Array.isArray(respuesta.data) 
        ? respuesta.data.map((proyecto: any) => this.transformarProyecto(proyecto))
        : [],
    };
  }
}

export const proyectosApi = new ProyectosApi();