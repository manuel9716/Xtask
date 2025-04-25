import { 
  Proyecto, 
  CrearProyectoDTO, 
  ActualizarProyectoDTO, 
  EstadoProyecto,
  FiltrosProyecto,
  ProyectoMetricas,
  calcularMetricasProyecto
} from '../entities/Proyecto';
import { ProyectoRepository, ProyectosIndicadores } from '../repositories/ProyectoRepository';

/**
 * Servicio de dominio para proyectos
 * Implementa la lógica de negocio para el módulo de proyectos
 */
export class ProyectoService {
  constructor(private readonly repository: ProyectoRepository) {}
  
  /**
   * Lista proyectos con filtros opcionales
   */
  async listarProyectos(filtros?: FiltrosProyecto): Promise<Proyecto[]> {
    return this.repository.listar(filtros);
  }
  
  /**
   * Obtiene un proyecto por su ID
   */
  async obtenerProyecto(id: number): Promise<Proyecto> {
    return this.repository.obtenerPorId(id);
  }
  
  /**
   * Crea un nuevo proyecto
   */
  async crearProyecto(proyecto: CrearProyectoDTO): Promise<Proyecto> {
    // Validaciones y reglas de negocio
    if (!proyecto.nombre || proyecto.nombre.trim() === '') {
      throw new Error('El nombre del proyecto es obligatorio');
    }
    
    if (proyecto.presupuesto < 0) {
      throw new Error('El presupuesto no puede ser negativo');
    }
    
    // Valores predeterminados
    const proyectoCompleto: CrearProyectoDTO = {
      ...proyecto,
      descripcion: proyecto.descripcion || '',
      fechaInicio: proyecto.fechaInicio || new Date(),
      presupuesto: proyecto.presupuesto || 0
    };
    
    return this.repository.crear(proyectoCompleto);
  }
  
  /**
   * Actualiza un proyecto existente
   */
  async actualizarProyecto(id: number, datos: ActualizarProyectoDTO): Promise<Proyecto> {
    // Validaciones y reglas de negocio
    if (datos.presupuesto !== undefined && datos.presupuesto < 0) {
      throw new Error('El presupuesto no puede ser negativo');
    }
    
    if (datos.costoActual !== undefined && datos.costoActual < 0) {
      throw new Error('El costo actual no puede ser negativo');
    }
    
    // Verificar existencia
    const proyectoExistente = await this.repository.obtenerPorId(id);
    if (!proyectoExistente) {
      throw new Error(`No se encontró el proyecto con ID: ${id}`);
    }
    
    return this.repository.actualizar(id, datos);
  }
  
  /**
   * Cambia el estado de un proyecto
   */
  async cambiarEstadoProyecto(id: number, estado: EstadoProyecto): Promise<Proyecto> {
    // Verificar existencia
    const proyectoExistente = await this.repository.obtenerPorId(id);
    if (!proyectoExistente) {
      throw new Error(`No se encontró el proyecto con ID: ${id}`);
    }
    
    // Validar transiciones de estado válidas
    if (proyectoExistente.estado === EstadoProyecto.FINALIZADO && 
        estado !== EstadoProyecto.ACTIVO) {
      throw new Error('Un proyecto finalizado solo puede volver a estado activo');
    }
    
    return this.repository.cambiarEstado(id, estado);
  }
  
  /**
   * Elimina un proyecto
   */
  async eliminarProyecto(id: number): Promise<void> {
    // Verificar existencia
    const proyectoExistente = await this.repository.obtenerPorId(id);
    if (!proyectoExistente) {
      throw new Error(`No se encontró el proyecto con ID: ${id}`);
    }
    
    // Solo se pueden eliminar proyectos que no estén finalizados
    if (proyectoExistente.estado === EstadoProyecto.FINALIZADO) {
      throw new Error('No se pueden eliminar proyectos finalizados');
    }
    
    return this.repository.eliminar(id);
  }
  
  /**
   * Obtiene indicadores y métricas de proyectos
   */
  async obtenerIndicadores(): Promise<ProyectosIndicadores> {
    return this.repository.obtenerIndicadores();
  }
  
  /**
   * Calcula el porcentaje de avance de un proyecto basado en tiempo
   */
  calcularPorcentajeAvance(proyecto: Proyecto): number {
    const metricas = calcularMetricasProyecto(proyecto);
    return metricas.porcentajeAvance;
  }
  
  /**
   * Determina si un proyecto está retrasado
   */
  estaRetrasado(proyecto: Proyecto): boolean {
    const metricas = calcularMetricasProyecto(proyecto);
    return metricas.estaRetrasado;
  }
  
  /**
   * Calcula métricas completas de un proyecto
   */
  calcularMetricas(proyecto: Proyecto): ProyectoMetricas {
    return calcularMetricasProyecto(proyecto);
  }
}