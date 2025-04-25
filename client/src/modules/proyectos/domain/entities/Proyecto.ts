/**
 * Enum para representar los estados posibles de un proyecto.
 * Seguimos el patrón de Value Objects para limitar los valores posibles.
 */
export enum EstadoProyecto {
  ACTIVO = 'active',
  PAUSADO = 'paused',
  RETRASADO = 'delayed',
  FINALIZADO = 'done'
}

/**
 * Interfaz que representa la entidad Proyecto en el dominio
 * Esta es independiente de la capa de infraestructura/persistencia
 */
export interface Proyecto {
  id: number;
  nombre: string;
  descripcion?: string;
  estado: EstadoProyecto;
  fechaInicio: Date;
  fechaFin?: Date;
  presupuesto: number;
  costoActual?: number;
  departamentoId?: number;
  responsableId?: number;
  creadoEn: Date;
  actualizadoEn?: Date;
  categoria?: string;
  presupuestoRestante?: number;
}

/**
 * DTO para crear un nuevo proyecto
 */
export interface CrearProyectoDTO {
  nombre: string;
  descripcion?: string;
  estado: EstadoProyecto;
  fechaInicio: Date;
  fechaFin?: Date;
  presupuesto: number;
  departamentoId?: number;
  responsableId?: number;
  categoria?: string;
}

/**
 * DTO para actualizar un proyecto existente
 */
export interface ActualizarProyectoDTO {
  nombre?: string;
  descripcion?: string;
  estado?: EstadoProyecto;
  fechaInicio?: Date;
  fechaFin?: Date;
  presupuesto?: number;
  costoActual?: number;
  departamentoId?: number;
  responsableId?: number;
  categoria?: string;
  presupuestoRestante?: number;
}

/**
 * DTO para cambiar solo el estado de un proyecto
 */
export interface CambiarEstadoProyectoDTO {
  estado: EstadoProyecto;
}

/**
 * DTO para filtrar proyectos
 */
export interface FiltrosProyecto {
  busqueda?: string;
  estado?: EstadoProyecto;
  fechaInicio?: Date;
  fechaFin?: Date;
  responsableId?: number;
  departamentoId?: number;
  categoria?: string;
}

/**
 * Clase para validar la creación de un proyecto y aplicar reglas de negocio
 */
export class ProyectoFactory {
  /**
   * Crea un nuevo proyecto validando las reglas de negocio
   */
  public static crear(datos: CrearProyectoDTO): CrearProyectoDTO {
    if (!datos.nombre || datos.nombre.trim() === '') {
      throw new Error('El nombre del proyecto es obligatorio');
    }

    if (!datos.fechaInicio) {
      throw new Error('La fecha de inicio es obligatoria');
    }

    if (datos.fechaFin && datos.fechaInicio > datos.fechaFin) {
      throw new Error('La fecha de fin no puede ser anterior a la fecha de inicio');
    }

    if (datos.presupuesto <= 0) {
      throw new Error('El presupuesto debe ser mayor que cero');
    }

    return {
      ...datos,
      nombre: datos.nombre.trim(),
      estado: datos.estado || EstadoProyecto.ACTIVO
    };
  }

  /**
   * Valida los datos para actualizar un proyecto
   */
  public static actualizar(datos: ActualizarProyectoDTO): ActualizarProyectoDTO {
    // Validar que al menos se proporciona un campo para actualizar
    if (Object.keys(datos).length === 0) {
      throw new Error('Debe proporcionar al menos un campo para actualizar');
    }

    // Validar nombre si se proporciona
    if (datos.nombre !== undefined && datos.nombre.trim() === '') {
      throw new Error('El nombre del proyecto no puede estar vacío');
    }

    // Validar fechas si se proporcionan ambas
    if (datos.fechaInicio && datos.fechaFin && datos.fechaInicio > datos.fechaFin) {
      throw new Error('La fecha de fin no puede ser anterior a la fecha de inicio');
    }

    // Validar presupuesto si se proporciona
    if (datos.presupuesto !== undefined && datos.presupuesto <= 0) {
      throw new Error('El presupuesto debe ser mayor que cero');
    }

    return datos;
  }
}

/**
 * Funciones para calcular KPIs y métricas relacionadas con proyectos
 */
export class ProyectoMetricas {
  /**
   * Calcula el porcentaje de avance basado en fechas
   */
  public static calcularPorcentajeAvanceTemporal(proyecto: Proyecto): number {
    if (!proyecto.fechaFin) return 0;
    
    const hoy = new Date();
    const inicio = new Date(proyecto.fechaInicio);
    const fin = new Date(proyecto.fechaFin);
    
    // Si la fecha de fin ya pasó
    if (hoy > fin) {
      return proyecto.estado === EstadoProyecto.FINALIZADO ? 100 : 90;
    }
    
    // Si aún no ha comenzado
    if (hoy < inicio) return 0;
    
    // Calcular porcentaje de tiempo transcurrido
    const duracionTotal = fin.getTime() - inicio.getTime();
    const tiempoTranscurrido = hoy.getTime() - inicio.getTime();
    
    return Math.min(Math.round((tiempoTranscurrido / duracionTotal) * 100), 100);
  }

  /**
   * Calcula el porcentaje de presupuesto utilizado
   */
  public static calcularPorcentajePresupuesto(proyecto: Proyecto): number {
    if (!proyecto.costoActual || proyecto.costoActual <= 0) return 0;
    
    return Math.min(Math.round((proyecto.costoActual / proyecto.presupuesto) * 100), 100);
  }

  /**
   * Determina si un proyecto está retrasado
   */
  public static estaRetrasado(proyecto: Proyecto): boolean {
    if (proyecto.estado === EstadoProyecto.FINALIZADO) return false;
    
    if (!proyecto.fechaFin) return false;
    
    const hoy = new Date();
    const fin = new Date(proyecto.fechaFin);
    
    return hoy > fin && proyecto.estado !== EstadoProyecto.FINALIZADO;
  }

  /**
   * Calcula el presupuesto restante
   */
  public static calcularPresupuestoRestante(proyecto: Proyecto): number {
    if (!proyecto.costoActual) return proyecto.presupuesto;
    
    return Math.max(proyecto.presupuesto - proyecto.costoActual, 0);
  }
}

// Exportar todo el módulo
export default {
  EstadoProyecto,
  ProyectoFactory,
  ProyectoMetricas
};