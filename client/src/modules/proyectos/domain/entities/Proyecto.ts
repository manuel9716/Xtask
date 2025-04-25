/**
 * Enum que define los posibles estados de un proyecto
 */
export enum EstadoProyecto {
  ACTIVO = 'ACTIVO',
  PAUSADO = 'PAUSADO',
  RETRASADO = 'RETRASADO',
  FINALIZADO = 'FINALIZADO'
}

/**
 * Interfaz que define la estructura de un proyecto en el sistema
 */
export interface Proyecto {
  id: number;
  nombre: string;
  descripcion: string;
  estado: EstadoProyecto;
  presupuesto: number;
  costoActual: number;
  fechaInicio: Date | string;
  fechaFin: Date | string | null;
  departamentoId: number | null;
  responsableId: number | null;
  createdAt: Date | string;
  updatedAt: Date | string;
}

/**
 * DTO para crear un nuevo proyecto
 */
export interface CrearProyectoDTO {
  nombre: string;
  descripcion: string;
  presupuesto: number;
  fechaInicio: Date | string;
  fechaFin?: Date | string | null;
  departamentoId?: number | null;
  responsableId?: number | null;
}

/**
 * DTO para actualizar un proyecto existente
 */
export interface ActualizarProyectoDTO {
  nombre?: string;
  descripcion?: string;
  presupuesto?: number;
  costoActual?: number;
  fechaInicio?: Date | string;
  fechaFin?: Date | string | null;
  departamentoId?: number | null;
  responsableId?: number | null;
}

/**
 * DTO para cambiar el estado de un proyecto
 */
export interface CambiarEstadoProyectoDTO {
  estado: EstadoProyecto;
}

/**
 * Filtros para buscar proyectos
 */
export interface FiltrosProyecto {
  estado?: EstadoProyecto;
  busqueda?: string;
  departamentoId?: number;
  responsableId?: number;
  fechaInicio?: Date;
  fechaFin?: Date;
}

/**
 * Métricas de un proyecto
 */
export interface ProyectoMetricas {
  porcentajeAvance: number;
  porcentajePresupuesto: number;
  diasRestantes: number;
  diasTranscurridos: number;
  duracionTotal: number;
  estaRetrasado: boolean;
}

/**
 * Función para calcular las métricas de un proyecto
 */
export function calcularMetricasProyecto(proyecto: Proyecto): ProyectoMetricas {
  const fechaInicio = new Date(proyecto.fechaInicio);
  const fechaFin = proyecto.fechaFin ? new Date(proyecto.fechaFin) : null;
  const hoy = new Date();
  
  // Calcular días transcurridos
  const diasTranscurridos = Math.floor((hoy.getTime() - fechaInicio.getTime()) / (1000 * 60 * 60 * 24));
  
  // Calcular días restantes y duración total
  let diasRestantes = 0;
  let duracionTotal = 0;
  
  if (fechaFin) {
    diasRestantes = Math.max(0, Math.floor((fechaFin.getTime() - hoy.getTime()) / (1000 * 60 * 60 * 24)));
    duracionTotal = Math.floor((fechaFin.getTime() - fechaInicio.getTime()) / (1000 * 60 * 60 * 24));
  }
  
  // Calcular porcentaje de avance (basado en tiempo)
  let porcentajeAvance = 0;
  if (duracionTotal > 0) {
    porcentajeAvance = Math.min(100, Math.round((diasTranscurridos / duracionTotal) * 100));
  }
  
  // Calcular porcentaje de presupuesto utilizado
  const porcentajePresupuesto = proyecto.presupuesto > 0 
    ? Math.round((proyecto.costoActual / proyecto.presupuesto) * 100) 
    : 0;
  
  // Determinar si el proyecto está retrasado
  const estaRetrasado = 
    (fechaFin && hoy > fechaFin && proyecto.estado !== EstadoProyecto.FINALIZADO) || 
    (porcentajePresupuesto > 100) || 
    proyecto.estado === EstadoProyecto.RETRASADO;
  
  return {
    porcentajeAvance,
    porcentajePresupuesto,
    diasRestantes,
    diasTranscurridos,
    duracionTotal,
    estaRetrasado
  };
}