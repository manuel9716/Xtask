import { 
  EmpleadoRRHH, 
  CrearEmpleadoRRHH, 
  ActualizarEmpleadoRRHH, 
  FiltrosEmpleadoRRHH, 
  EmpleadoResumenRRHH 
} from '../entities/Empleado';

/**
 * Repositorio de Empleados - Define las operaciones de persistencia para la entidad Empleado
 * Esta es una interfaz pura del dominio, sin acoplamiento a infraestructura
 */
export interface EmpleadoRepository {
  /**
   * Obtiene todos los empleados aplicando filtros opcionales
   * @param filtros Criterios de filtrado opcionales
   * @param pagina Número de página para paginación
   * @param porPagina Cantidad de elementos por página
   * @returns Lista de empleados que coinciden con los filtros
   */
  listarEmpleados(
    filtros?: FiltrosEmpleadoRRHH, 
    pagina?: number, 
    porPagina?: number
  ): Promise<{
    empleados: EmpleadoResumenRRHH[];
    total: number;
    pagina: number;
    porPagina: number;
    totalPaginas: number;
  }>;

  /**
   * Obtiene un empleado por su identificador
   * @param id Identificador único del empleado
   * @returns Empleado encontrado o undefined si no existe
   */
  obtenerEmpleadoPorId(id: number): Promise<EmpleadoRRHH | undefined>;

  /**
   * Crea un nuevo empleado
   * @param empleado Datos del empleado a crear
   * @returns Empleado creado con su identificador asignado
   */
  crearEmpleado(empleado: CrearEmpleadoRRHH): Promise<EmpleadoRRHH>;

  /**
   * Actualiza los datos de un empleado existente
   * @param id Identificador único del empleado
   * @param empleado Datos parciales a actualizar
   * @returns Empleado actualizado o undefined si no existe
   */
  actualizarEmpleado(id: number, empleado: ActualizarEmpleadoRRHH): Promise<EmpleadoRRHH | undefined>;

  /**
   * Elimina lógicamente un empleado (cambia su estado a INACTIVO)
   * @param id Identificador único del empleado
   * @returns true si se pudo eliminar, false si no existe
   */
  eliminarEmpleado(id: number): Promise<boolean>;

  /**
   * Obtiene una lista de empleados por departamento
   * @param departamento Nombre del departamento
   * @returns Lista de empleados del departamento
   */
  obtenerEmpleadosPorDepartamento(departamento: string): Promise<EmpleadoResumenRRHH[]>;

  /**
   * Obtiene una lista de empleados por supervisor
   * @param supervisorId Identificador del supervisor
   * @returns Lista de empleados a cargo del supervisor
   */
  obtenerEmpleadosPorSupervisor(supervisorId: number): Promise<EmpleadoResumenRRHH[]>;

  /**
   * Busca empleados por habilidades específicas
   * @param habilidades Lista de habilidades a buscar
   * @returns Lista de empleados que tienen las habilidades especificadas
   */
  buscarEmpleadosPorHabilidades(habilidades: string[]): Promise<EmpleadoResumenRRHH[]>;
}