import { 
  ActualizarProyectoDTO, 
  CambiarEstadoProyectoDTO, 
  CrearProyectoDTO, 
  EstadoProyecto, 
  FiltrosProyecto, 
  Proyecto, 
  ProyectosPaginados 
} from '../../domain/entities/Proyecto';
import { ProyectoRepository } from '../../domain/repositories/ProyectoRepository';

/**
 * Implementación del repositorio para persistencia de proyectos en base de datos
 * Este adaptador se utilizaría del lado del servidor para acceder a la BD
 */
export class ProyectoDbAdapter implements ProyectoRepository {
  /**
   * Obtiene un listado paginado de proyectos según los filtros aplicados
   */
  async listarProyectos(filtros: FiltrosProyecto = {}): Promise<ProyectosPaginados> {
    // Aquí iría la implementación real con acceso a la base de datos
    // Utilizando drizzle-orm para PostgreSQL, por ejemplo

    // Este código sería parte del backend y se incluye como referencia
    // de cómo se implementaría la interfaz del repositorio
    throw new Error('Este adaptador debe usarse en el backend');
  }

  /**
   * Obtiene un proyecto por su ID
   */
  async obtenerProyectoPorId(id: number): Promise<Proyecto | null> {
    // Aquí iría la implementación real con acceso a la base de datos
    throw new Error('Este adaptador debe usarse en el backend');
  }

  /**
   * Crea un nuevo proyecto
   */
  async crearProyecto(proyecto: CrearProyectoDTO): Promise<Proyecto> {
    // Aquí iría la implementación real con acceso a la base de datos
    throw new Error('Este adaptador debe usarse en el backend');
  }

  /**
   * Actualiza un proyecto existente
   */
  async actualizarProyecto(id: number, proyecto: ActualizarProyectoDTO): Promise<Proyecto> {
    // Aquí iría la implementación real con acceso a la base de datos
    throw new Error('Este adaptador debe usarse en el backend');
  }

  /**
   * Cambia el estado de un proyecto
   */
  async cambiarEstadoProyecto(id: number, cambioEstado: CambiarEstadoProyectoDTO): Promise<Proyecto> {
    // Aquí iría la implementación real con acceso a la base de datos
    throw new Error('Este adaptador debe usarse en el backend');
  }

  /**
   * Elimina (o archiva) un proyecto
   */
  async eliminarProyecto(id: number): Promise<void> {
    // Aquí iría la implementación real con acceso a la base de datos
    throw new Error('Este adaptador debe usarse en el backend');
  }
}