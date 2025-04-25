import {
  Proyecto,
  CrearProyectoDTO,
  ActualizarProyectoDTO,
  CambiarEstadoProyectoDTO,
  FiltrosProyecto,
  ProyectosPaginados,
  EstadoProyecto
} from '../../domain/entities/Proyecto';
import { ProyectoRepository } from '../../domain/repositories/ProyectoRepository';
import { proyectosApi } from '../api/proyectosApi';

/**
 * Implementación del repositorio de proyectos que utiliza la API para interactuar con la base de datos
 * Sigue el patrón Adapter para adaptar la API al repositorio definido en el dominio
 */
export class ProyectoDbAdapter implements ProyectoRepository {
  /**
   * Obtiene un listado paginado de proyectos según los filtros aplicados
   */
  async listarProyectos(filtros?: FiltrosProyecto): Promise<ProyectosPaginados> {
    return await proyectosApi.listarProyectos(filtros);
  }
  
  /**
   * Obtiene un proyecto por su ID
   */
  async obtenerProyectoPorId(id: number): Promise<Proyecto | null> {
    try {
      return await proyectosApi.obtenerProyectoPorId(id);
    } catch (error) {
      return null;
    }
  }
  
  /**
   * Crea un nuevo proyecto
   */
  async crearProyecto(proyecto: CrearProyectoDTO): Promise<Proyecto> {
    return await proyectosApi.crearProyecto(proyecto);
  }
  
  /**
   * Actualiza un proyecto existente
   */
  async actualizarProyecto(id: number, proyecto: ActualizarProyectoDTO): Promise<Proyecto> {
    return await proyectosApi.actualizarProyecto(id, proyecto);
  }
  
  /**
   * Cambia el estado de un proyecto
   */
  async cambiarEstadoProyecto(id: number, cambioEstado: CambiarEstadoProyectoDTO): Promise<Proyecto> {
    return await proyectosApi.cambiarEstadoProyecto(id, cambioEstado);
  }
  
  /**
   * Elimina (o archiva) un proyecto
   */
  async eliminarProyecto(id: number): Promise<void> {
    await proyectosApi.eliminarProyecto(id);
  }
}

// Exportar una instancia singleton del repositorio
export const proyectoRepository = new ProyectoDbAdapter();