import { 
  Proyecto, 
  CrearProyectoDTO, 
  ActualizarProyectoDTO, 
  EstadoProyecto,
  FiltrosProyecto 
} from '../entities/Proyecto';

/**
 * Interfaz que define los indicadores (KPIs) para proyectos
 */
export interface ProyectosIndicadores {
  // Contadores
  totalProyectos: number;
  proyectosActivos: number;
  proyectosRetrasados: number;
  proyectosFinalizados: number;
  proyectosPausados: number;
  
  // Financieros
  presupuestoTotal: number;
  costoActualTotal: number;
  desviacionPresupuesto: number;
  
  // Departamentos
  proyectosPorDepartamento: { departamento: string; count: number }[];
  
  // Tiempo
  proyectosRetrasadosPorcentaje: number;
  tiempoPromedioFinalizacion: number;
  proyectosFinalizadosAtiempo: number;
}

/**
 * Interfaz que define las operaciones disponibles para proyectos
 */
export interface ProyectoRepository {
  /**
   * Obtiene todos los proyectos con filtros opcionales
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
  cambiarEstado(id: number, cambioEstado: EstadoProyecto): Promise<Proyecto>;
  
  /**
   * Obtiene indicadores y métricas de proyectos
   */
  obtenerIndicadores(): Promise<ProyectosIndicadores>;
}