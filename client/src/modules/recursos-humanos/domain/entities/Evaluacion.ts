/**
 * Entidad Evaluación
 * Representa una evaluación de desempeño de un empleado
 */

// Estados posibles de una evaluación
export enum EstadoEvaluacion {
  PENDIENTE = "PENDIENTE",
  EN_PROCESO = "EN_PROCESO",
  COMPLETADA = "COMPLETADA",
  ARCHIVADA = "ARCHIVADA"
}

// Tipos de evaluación
export enum TipoEvaluacion {
  DESEMPENIO = "DESEMPENIO",
  COMPETENCIAS = "COMPETENCIAS",
  OBJETIVOS = "OBJETIVOS",
  INTEGRAL = "INTEGRAL"
}

// DTO para crear una evaluación
export interface CrearEvaluacionDTO {
  empleadoId: number;
  evaluadorId: number;
  tipo: TipoEvaluacion;
  periodo: string;
  fechaInicio: Date;
  fechaFin: Date;
  objetivos?: string;
  comentarios?: string;
}

// DTO para actualizar una evaluación
export interface ActualizarEvaluacionDTO extends Partial<CrearEvaluacionDTO> {
  id: number;
  estado?: EstadoEvaluacion;
  calificacion?: number;
  retroalimentacion?: string;
}

// DTO para los criterios de evaluación
export interface CriterioEvaluacionDTO {
  nombre: string;
  descripcion?: string;
  peso: number;
  calificacion?: number;
  comentario?: string;
}

// Clase principal de Evaluación
export class Evaluacion {
  id: number;
  empleadoId: number;
  evaluadorId: number;
  tipo: TipoEvaluacion;
  periodo: string; // Ejemplo: "2023-Q1", "2023-S1", "2023-ANUAL"
  fechaInicio: Date;
  fechaFin: Date;
  estado: EstadoEvaluacion;
  calificacion?: number; // Valoración de 1 a 5
  objetivos?: string;
  comentarios?: string;
  retroalimentacion?: string;
  criterios: CriterioEvaluacionDTO[];
  createdAt: Date;
  updatedAt?: Date;

  constructor(data: {
    id: number;
    empleadoId: number;
    evaluadorId: number;
    tipo: TipoEvaluacion;
    periodo: string;
    fechaInicio: Date;
    fechaFin: Date;
    estado: EstadoEvaluacion;
    calificacion?: number;
    objetivos?: string;
    comentarios?: string;
    retroalimentacion?: string;
    criterios?: CriterioEvaluacionDTO[];
    createdAt: Date;
    updatedAt?: Date;
  }) {
    this.id = data.id;
    this.empleadoId = data.empleadoId;
    this.evaluadorId = data.evaluadorId;
    this.tipo = data.tipo;
    this.periodo = data.periodo;
    this.fechaInicio = data.fechaInicio;
    this.fechaFin = data.fechaFin;
    this.estado = data.estado;
    this.calificacion = data.calificacion;
    this.objetivos = data.objetivos;
    this.comentarios = data.comentarios;
    this.retroalimentacion = data.retroalimentacion;
    this.criterios = data.criterios || [];
    this.createdAt = data.createdAt;
    this.updatedAt = data.updatedAt;
  }

  // Métodos de dominio

  // Verifica si la evaluación está en progreso
  get estaEnProgreso(): boolean {
    return this.estado === EstadoEvaluacion.EN_PROCESO;
  }

  // Verifica si la evaluación está completada
  get estaCompletada(): boolean {
    return this.estado === EstadoEvaluacion.COMPLETADA;
  }

  // Verifica si la fecha actual está dentro del período de evaluación
  get estaEnPeriodoActivo(): boolean {
    const fechaActual = new Date();
    return fechaActual >= this.fechaInicio && fechaActual <= this.fechaFin;
  }

  // Cambiar estado de la evaluación
  cambiarEstado(nuevoEstado: EstadoEvaluacion): void {
    this.estado = nuevoEstado;
    this.updatedAt = new Date();
  }

  // Asignar calificación a la evaluación
  asignarCalificacion(calificacion: number): void {
    if (calificacion < 1 || calificacion > 5) {
      throw new Error("La calificación debe estar entre 1 y 5");
    }
    this.calificacion = calificacion;
    this.updatedAt = new Date();
  }

  // Añadir retroalimentación a la evaluación
  agregarRetroalimentacion(retroalimentacion: string): void {
    this.retroalimentacion = retroalimentacion;
    this.updatedAt = new Date();
  }

  // Agregar criterio de evaluación
  agregarCriterio(criterio: CriterioEvaluacionDTO): void {
    this.criterios.push(criterio);
    this.updatedAt = new Date();
  }

  // Calcular calificación promedio basada en criterios
  calcularCalificacionPromedio(): number | undefined {
    if (this.criterios.length === 0 || !this.criterios.some(c => c.calificacion !== undefined)) {
      return undefined;
    }

    const criteriosCalificados = this.criterios.filter(c => c.calificacion !== undefined);
    if (criteriosCalificados.length === 0) return undefined;

    const sumaPonderada = criteriosCalificados.reduce((total, criterio) => {
      return total + (criterio.calificacion! * criterio.peso);
    }, 0);

    const sumaPesos = criteriosCalificados.reduce((total, criterio) => total + criterio.peso, 0);
    
    return sumaPonderada / sumaPesos;
  }

  // Completar evaluación
  completarEvaluacion(calificacionFinal?: number): void {
    if (this.estado !== EstadoEvaluacion.EN_PROCESO) {
      throw new Error("Solo se pueden completar evaluaciones en proceso");
    }

    if (calificacionFinal !== undefined) {
      this.asignarCalificacion(calificacionFinal);
    } else {
      const calificacionCalculada = this.calcularCalificacionPromedio();
      if (calificacionCalculada) {
        this.calificacion = calificacionCalculada;
      }
    }

    this.estado = EstadoEvaluacion.COMPLETADA;
    this.updatedAt = new Date();
  }
}