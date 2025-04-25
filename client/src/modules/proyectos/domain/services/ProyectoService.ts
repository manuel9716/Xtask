import { 
  Proyecto, 
  EstadoProyecto, 
  CrearProyectoDTO, 
  ActualizarProyectoDTO,
  CambiarEstadoProyectoDTO,
  FiltrosProyecto,
  ProyectoFactory,
  ProyectoMetricas
} from '../entities/Proyecto';
import { ProyectoRepository, ProyectosIndicadores } from '../repositories/ProyectoRepository';

/**
 * Servicio de dominio para la lógica de negocio relacionada con proyectos
 */
export class ProyectoService {
  constructor(private repository: ProyectoRepository) {}

  /**
   * Obtiene todos los proyectos aplicando filtros si se proporcionan
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
   * Crea un nuevo proyecto aplicando validaciones de negocio
   */
  async crearProyecto(datos: CrearProyectoDTO): Promise<Proyecto> {
    // Aplicar reglas de negocio a través del factory
    const proyectoValidado = ProyectoFactory.crear(datos);
    return this.repository.crear(proyectoValidado);
  }

  /**
   * Actualiza un proyecto existente
   */
  async actualizarProyecto(id: number, datos: ActualizarProyectoDTO): Promise<Proyecto> {
    // Validar datos de actualización
    const datosValidados = ProyectoFactory.actualizar(datos);
    return this.repository.actualizar(id, datosValidados);
  }

  /**
   * Elimina un proyecto
   */
  async eliminarProyecto(id: number): Promise<void> {
    return this.repository.eliminar(id);
  }

  /**
   * Cambia el estado de un proyecto
   */
  async cambiarEstadoProyecto(id: number, nuevoEstado: EstadoProyecto): Promise<Proyecto> {
    return this.repository.cambiarEstado(id, { estado: nuevoEstado });
  }

  /**
   * Verifica si un proyecto está retrasado según su fecha de fin
   */
  estaRetrasado(proyecto: Proyecto): boolean {
    return ProyectoMetricas.estaRetrasado(proyecto);
  }

  /**
   * Calcula el progreso de un proyecto basado en fechas
   */
  calcularPorcentajeAvance(proyecto: Proyecto): number {
    return ProyectoMetricas.calcularPorcentajeAvanceTemporal(proyecto);
  }

  /**
   * Calcula el porcentaje de presupuesto utilizado
   */
  calcularPorcentajePresupuesto(proyecto: Proyecto): number {
    return ProyectoMetricas.calcularPorcentajePresupuesto(proyecto);
  }

  /**
   * Obtiene indicadores y KPIs de proyectos
   */
  async obtenerIndicadores(): Promise<ProyectosIndicadores> {
    return this.repository.obtenerIndicadores();
  }

  /**
   * Calcula el presupuesto restante de un proyecto
   */
  calcularPresupuestoRestante(proyecto: Proyecto): number {
    return ProyectoMetricas.calcularPresupuestoRestante(proyecto);
  }
}