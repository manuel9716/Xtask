/**
 * Enumeración de posibles estados de un proyecto
 */
export enum EstadoProyecto {
  ACTIVO = "activo",
  PAUSADO = "pausado",
  FINALIZADO = "finalizado",
  ARCHIVADO = "archivado",
  CANCELADO = "cancelado",
}

/**
 * Interfaz para la entidad Proyecto
 */
export interface Proyecto {
  id: number;
  nombre: string;
  descripcion: string;
  fechaInicio: Date;
  fechaFinPrevista: Date | null;
  fechaFinReal: Date | null;
  estado: EstadoProyecto;
  presupuesto: number;
  responsableId: number;
  clienteId?: number;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Interfaz para crear un nuevo proyecto (DTO de entrada)
 */
export interface CrearProyectoDTO {
  nombre: string;
  descripcion: string;
  fechaInicio: Date;
  fechaFinPrevista?: Date;
  presupuesto: number;
  responsableId: number;
  clienteId?: number;
  tags?: string[];
}

/**
 * Interfaz para actualizar un proyecto (DTO de entrada)
 */
export interface ActualizarProyectoDTO {
  nombre?: string;
  descripcion?: string;
  fechaInicio?: Date;
  fechaFinPrevista?: Date | null;
  fechaFinReal?: Date | null;
  presupuesto?: number;
  responsableId?: number;
  clienteId?: number | null;
  tags?: string[];
}

/**
 * Interfaz para cambiar el estado de un proyecto (DTO de entrada)
 */
export interface CambiarEstadoProyectoDTO {
  estado: EstadoProyecto;
  comentario?: string;
}

/**
 * Interfaz para filtros en la consulta de proyectos
 */
export interface FiltrosProyecto {
  busqueda?: string;
  estado?: EstadoProyecto | EstadoProyecto[];
  responsableId?: number;
  clienteId?: number;
  fechaInicioDesde?: Date;
  fechaInicioHasta?: Date;
  page?: number;
  pageSize?: number;
}

/**
 * Interfaz para la respuesta paginada de proyectos
 */
export interface ProyectosPaginados {
  data: Proyecto[];
  total: number;
  pagina: number;
  totalPaginas: number;
  porPagina: number;
}