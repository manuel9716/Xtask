import { 
  Proyecto, 
  CrearProyectoDTO, 
  ActualizarProyectoDTO, 
  CambiarEstadoProyectoDTO,
  EstadoProyecto,
  FiltrosProyecto,
  ProyectosPaginados
} from '../entities/Proyecto';
import { ProyectoRepository } from '../repositories/ProyectoRepository';

/**
 * Servicio de dominio para la gestión de proyectos
 * Contiene la lógica de negocio relacionada con proyectos
 */
export class ProyectoService {
  constructor(private readonly proyectoRepository: ProyectoRepository) {}

  /**
   * Obtiene un listado paginado de proyectos aplicando filtros opcionales
   */
  async listarProyectos(filtros?: FiltrosProyecto): Promise<ProyectosPaginados> {
    return await this.proyectoRepository.listarProyectos(filtros);
  }

  /**
   * Obtiene un proyecto por su ID
   * @throws Error si el proyecto no existe
   */
  async obtenerProyectoPorId(id: number): Promise<Proyecto> {
    const proyecto = await this.proyectoRepository.obtenerProyectoPorId(id);
    if (!proyecto) {
      throw new Error(`No se encontró el proyecto con ID ${id}`);
    }
    return proyecto;
  }

  /**
   * Crea un nuevo proyecto
   */
  async crearProyecto(proyectoDTO: CrearProyectoDTO): Promise<Proyecto> {
    // Aplicar valores por defecto
    const proyectoCompleto: CrearProyectoDTO = {
      ...proyectoDTO,
      tags: proyectoDTO.tags || []
    };
    
    return await this.proyectoRepository.crearProyecto(proyectoCompleto);
  }

  /**
   * Actualiza un proyecto existente
   * @throws Error si el proyecto no existe
   */
  async actualizarProyecto(id: number, proyectoDTO: ActualizarProyectoDTO): Promise<Proyecto> {
    // Verificar que el proyecto existe
    await this.obtenerProyectoPorId(id);
    
    return await this.proyectoRepository.actualizarProyecto(id, proyectoDTO);
  }

  /**
   * Cambia el estado de un proyecto
   * @throws Error si el proyecto no existe o la transición no está permitida
   */
  async cambiarEstadoProyecto(id: number, cambioEstado: CambiarEstadoProyectoDTO): Promise<Proyecto> {
    // Verificar que el proyecto existe
    const proyecto = await this.obtenerProyectoPorId(id);
    
    // Verificar si la transición está permitida
    if (!this.esTransicionEstadoValida(proyecto.estado, cambioEstado.estado)) {
      throw new Error(`No se puede cambiar el estado de "${proyecto.estado}" a "${cambioEstado.estado}"`);
    }
    
    return await this.proyectoRepository.cambiarEstadoProyecto(id, cambioEstado);
  }

  /**
   * Elimina (o archiva) un proyecto
   * @throws Error si el proyecto no existe
   */
  async eliminarProyecto(id: number): Promise<void> {
    // Verificar que el proyecto existe
    await this.obtenerProyectoPorId(id);
    
    await this.proyectoRepository.eliminarProyecto(id);
  }

  /**
   * Verifica si una transición de estado es válida según reglas de negocio
   * @private
   */
  private esTransicionEstadoValida(estadoActual: EstadoProyecto, nuevoEstado: EstadoProyecto): boolean {
    // Estado actual ARCHIVADO solo puede ir a ACTIVO (recuperar)
    if (estadoActual === EstadoProyecto.ARCHIVADO) {
      return nuevoEstado === EstadoProyecto.ACTIVO;
    }
    
    // Estado actual CANCELADO no puede ir a ningún otro estado (es terminal)
    if (estadoActual === EstadoProyecto.CANCELADO) {
      return false;
    }
    
    // Estado actual FINALIZADO solo puede ir a ARCHIVADO o ACTIVO (reabrir)
    if (estadoActual === EstadoProyecto.FINALIZADO) {
      return nuevoEstado === EstadoProyecto.ARCHIVADO || nuevoEstado === EstadoProyecto.ACTIVO;
    }
    
    // Para ACTIVO y PAUSADO, todas las transiciones están permitidas excepto a sí mismo
    return estadoActual !== nuevoEstado;
  }
}