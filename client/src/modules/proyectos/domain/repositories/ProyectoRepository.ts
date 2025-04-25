import { 
  Proyecto, 
  CrearProyectoDTO, 
  ActualizarProyectoDTO, 
  CambiarEstadoProyectoDTO,
  FiltrosProyecto,
  ProyectosPaginados
} from '../entities/Proyecto';

/**
 * Interfaz que define las operaciones disponibles para el repositorio de proyectos
 * Siguiendo el patrón Repository para abstraer el acceso a datos
 */
export interface ProyectoRepository {
  /**
   * Obtiene un listado paginado de proyectos según los filtros aplicados
   */
  listarProyectos(filtros?: FiltrosProyecto): Promise<ProyectosPaginados>;
  
  /**
   * Obtiene un proyecto por su ID
   */
  obtenerProyectoPorId(id: number): Promise<Proyecto | null>;
  
  /**
   * Crea un nuevo proyecto
   */
  crearProyecto(proyecto: CrearProyectoDTO): Promise<Proyecto>;
  
  /**
   * Actualiza un proyecto existente
   */
  actualizarProyecto(id: number, proyecto: ActualizarProyectoDTO): Promise<Proyecto>;
  
  /**
   * Cambia el estado de un proyecto
   */
  cambiarEstadoProyecto(id: number, cambioEstado: CambiarEstadoProyectoDTO): Promise<Proyecto>;
  
  /**
   * Elimina (o archiva) un proyecto
   */
  eliminarProyecto(id: number): Promise<void>;
}