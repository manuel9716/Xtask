import { 
  Proyecto, 
  CrearProyectoDTO, 
  ActualizarProyectoDTO, 
  CambiarEstadoProyectoDTO,
  FiltrosProyecto
} from '../entities/Proyecto';

/**
 * Interface para el repositorio de proyectos.
 * Define las operaciones que se pueden realizar con proyectos,
 * independiente de la implementación de persistencia.
 */
export interface ProyectoRepository {
  /**
   * Obtiene todos los proyectos, opcionalmente filtrados
   */
  listar(filtros?: FiltrosProyecto): Promise<Proyecto[]>;
  
  /**
   * Obtiene un proyecto por su ID
   */
  obtenerPorId(id: number): Promise<Proyecto>;
  
  /**
   * Crea un nuevo proyecto
   */
  crear(proyecto: CrearProyectoDTO): Promise<Proyecto>;
  
  /**
   * Actualiza un proyecto existente
   */
  actualizar(id: number, proyecto: ActualizarProyectoDTO): Promise<Proyecto>;
  
  /**
   * Elimina un proyecto
   */
  eliminar(id: number): Promise<void>;
  
  /**
   * Cambia el estado de un proyecto
   */
  cambiarEstado(id: number, cambioEstado: CambiarEstadoProyectoDTO): Promise<Proyecto>;
  
  /**
   * Obtiene indicadores y métricas de proyectos
   */
  obtenerIndicadores(): Promise<ProyectosIndicadores>;
}

/**
 * Interfaz para representar los indicadores/KPIs de proyectos
 */
export interface ProyectosIndicadores {
  totalProyectos: number;
  proyectosActivos: number;
  proyectosRetrasados: number;
  proyectosCompletados: number;
  presupuestoTotal: number;
  costoAcumulado: number;
  proyectosPorDepartamento?: {
    departamentoId: number;
    nombreDepartamento?: string;
    cantidad: number;
  }[];
  proyectosFueraDeTiempo?: number;
}