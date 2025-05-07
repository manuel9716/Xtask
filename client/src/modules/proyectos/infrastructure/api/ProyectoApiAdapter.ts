import { 
  Proyecto, 
  CrearProyectoDTO, 
  ActualizarProyectoDTO, 
  FiltrosProyecto
} from '../../domain/entities/Proyecto';
import { ProyectoRepository, ProyectosIndicadores } from '../../domain/repositories/ProyectoRepository';
import { proyectosApi } from './proyectosApi';

/**
 * Adaptador de la API para implementar el repositorio de proyectos.
 * Esta clase implementa la interfaz ProyectoRepository y
 * se comunica con la API utilizando proyectosApi.
 */
export class ProyectoApiAdapter implements ProyectoRepository {
  /**
   * Obtiene todos los proyectos
   */
  async listar(filtros?: FiltrosProyecto): Promise<Proyecto[]> {
    return proyectosApi.listar(filtros);
  }
  
  /**
   * Obtiene un proyecto por su ID
   */
  async obtenerPorId(id: number): Promise<Proyecto> {
    return proyectosApi.obtenerPorId(id);
  }
  
  /**
   * Crea un nuevo proyecto
   */
  async crear(proyecto: CrearProyectoDTO): Promise<Proyecto> {
    return proyectosApi.crear(proyecto);
  }
  
  /**
   * Actualiza un proyecto existente
   */
  async actualizar(id: number, proyecto: ActualizarProyectoDTO): Promise<Proyecto> {
    return proyectosApi.actualizar(id, proyecto);
  }
  
  /**
   * Elimina un proyecto
   */
  async eliminar(id: number): Promise<void> {
    return proyectosApi.eliminar(id);
  }
  
  /**
   * Cambia el estado de un proyecto
   */
  async cambiarEstado(id: number, estado: string): Promise<Proyecto> {
    return proyectosApi.cambiarEstado(id, estado);
  }
  
  /**
   * Obtiene indicadores y métricas de proyectos
   */
  async obtenerIndicadores(): Promise<ProyectosIndicadores> {
    return proyectosApi.obtenerIndicadores();
  }
}