import { apiRequest, queryClient } from '@/lib/queryClient';
import { 
  Proyecto, 
  CrearProyectoDTO, 
  ActualizarProyectoDTO, 
  CambiarEstadoProyectoDTO,
  FiltrosProyecto,
  EstadoProyecto
} from '../../domain/entities/Proyecto';
import { ProyectosIndicadores } from '../../domain/repositories/ProyectoRepository';

/**
 * Cliente API para el módulo de proyectos
 * Esta capa se encarga de la comunicación con el servidor
 */
export const proyectosApi = {
  /**
   * Obtiene todos los proyectos con filtros opcionales
   */
  listar: async (filtros?: FiltrosProyecto): Promise<Proyecto[]> => {
    let queryParams = '';
    if (filtros) {
      const params = new URLSearchParams();
      
      if (filtros.busqueda) {
        params.append('busqueda', filtros.busqueda);
      }
      
      if (filtros.estado) {
        params.append('estado', filtros.estado);
      }
      
      if (filtros.fechaInicio) {
        params.append('fechaInicio', filtros.fechaInicio.toISOString());
      }
      
      if (filtros.fechaFin) {
        params.append('fechaFin', filtros.fechaFin.toISOString());
      }
      
      if (filtros.responsableId) {
        params.append('responsableId', filtros.responsableId.toString());
      }
      
      if (filtros.departamentoId) {
        params.append('departamentoId', filtros.departamentoId.toString());
      }
      
      queryParams = `?${params.toString()}`;
    }
    
    const response = await apiRequest('GET', `/api/proyectos${queryParams}`);
    const data = await response.json();
    
    // Convertir fechas en string a objetos Date
    return data.map((proyecto: any) => ({
      ...proyecto,
      fechaInicio: proyecto.fechaInicio ? new Date(proyecto.fechaInicio) : undefined,
      fechaFin: proyecto.fechaFin ? new Date(proyecto.fechaFin) : undefined,
      creadoEn: proyecto.creadoEn ? new Date(proyecto.creadoEn) : undefined,
      actualizadoEn: proyecto.actualizadoEn ? new Date(proyecto.actualizadoEn) : undefined
    }));
  },
  
  /**
   * Obtiene un proyecto por su ID
   */
  obtenerPorId: async (id: number): Promise<Proyecto> => {
    const response = await apiRequest('GET', `/api/proyectos/${id}`);
    const data = await response.json();
    
    return {
      ...data,
      fechaInicio: data.fechaInicio ? new Date(data.fechaInicio) : undefined,
      fechaFin: data.fechaFin ? new Date(data.fechaFin) : undefined,
      creadoEn: data.creadoEn ? new Date(data.creadoEn) : undefined,
      actualizadoEn: data.actualizadoEn ? new Date(data.actualizadoEn) : undefined
    };
  },
  
  /**
   * Crea un nuevo proyecto
   */
  crear: async (proyecto: CrearProyectoDTO): Promise<Proyecto> => {
    const response = await apiRequest('POST', '/api/proyectos', proyecto);
    const data = await response.json();
    
    // Invalidar cache de listado
    queryClient.invalidateQueries({ queryKey: ['/api/proyectos'] });
    
    return {
      ...data,
      fechaInicio: data.fechaInicio ? new Date(data.fechaInicio) : undefined,
      fechaFin: data.fechaFin ? new Date(data.fechaFin) : undefined,
      creadoEn: data.creadoEn ? new Date(data.creadoEn) : undefined,
      actualizadoEn: data.actualizadoEn ? new Date(data.actualizadoEn) : undefined
    };
  },
  
  /**
   * Actualiza un proyecto existente
   */
  actualizar: async (id: number, proyecto: ActualizarProyectoDTO): Promise<Proyecto> => {
    const response = await apiRequest('PATCH', `/api/proyectos/${id}`, proyecto);
    const data = await response.json();
    
    // Invalidar cache de listado y del proyecto específico
    queryClient.invalidateQueries({ queryKey: ['/api/proyectos'] });
    queryClient.invalidateQueries({ queryKey: [`/api/proyectos/${id}`] });
    
    return {
      ...data,
      fechaInicio: data.fechaInicio ? new Date(data.fechaInicio) : undefined,
      fechaFin: data.fechaFin ? new Date(data.fechaFin) : undefined,
      creadoEn: data.creadoEn ? new Date(data.creadoEn) : undefined,
      actualizadoEn: data.actualizadoEn ? new Date(data.actualizadoEn) : undefined
    };
  },
  
  /**
   * Elimina un proyecto
   */
  eliminar: async (id: number): Promise<void> => {
    await apiRequest('DELETE', `/api/proyectos/${id}`);
    
    // Invalidar cache de listado
    queryClient.invalidateQueries({ queryKey: ['/api/proyectos'] });
  },
  
  /**
   * Cambia el estado de un proyecto
   */
  cambiarEstado: async (id: number, cambioEstado: CambiarEstadoProyectoDTO): Promise<Proyecto> => {
    const response = await apiRequest('PATCH', `/api/proyectos/${id}/estado`, cambioEstado);
    const data = await response.json();
    
    // Invalidar cache de listado y del proyecto específico
    queryClient.invalidateQueries({ queryKey: ['/api/proyectos'] });
    queryClient.invalidateQueries({ queryKey: [`/api/proyectos/${id}`] });
    
    return {
      ...data,
      fechaInicio: data.fechaInicio ? new Date(data.fechaInicio) : undefined,
      fechaFin: data.fechaFin ? new Date(data.fechaFin) : undefined,
      creadoEn: data.creadoEn ? new Date(data.creadoEn) : undefined,
      actualizadoEn: data.actualizadoEn ? new Date(data.actualizadoEn) : undefined
    };
  },
  
  /**
   * Obtiene indicadores y KPIs de proyectos
   */
  obtenerIndicadores: async (): Promise<ProyectosIndicadores> => {
    const response = await apiRequest('GET', '/api/proyectos/indicadores');
    return await response.json();
  }
};