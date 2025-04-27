/**
 * Entidad de dominio Capacitacion para el módulo de Recursos Humanos
 * Representa una capacitación o entrenamiento para empleados
 */

// Enums para los valores de estado de la capacitación
export enum EstadoCapacitacion {
  PROGRAMADA = 'programada',
  EN_CURSO = 'en_curso',
  COMPLETADA = 'completada',
  CANCELADA = 'cancelada',
  POSPUESTA = 'pospuesta'
}

// Enums para los valores de modalidad de la capacitación
export enum ModalidadCapacitacion {
  PRESENCIAL = 'presencial',
  VIRTUAL = 'virtual',
  HIBRIDA = 'hibrida',
  AUTOAPRENDIZAJE = 'autoaprendizaje'
}

// Tipo para definir los instructores de la capacitación
export type Instructor = {
  id?: number;
  nombre: string;
  apellido: string;
  correo?: string;
  telefono?: string;
  especialidad: string;
  empresa: string;
  esInterno: boolean; // Si es empleado de la empresa o externo
};

// Tipo para definir los materiales de la capacitación
export type MaterialCapacitacion = {
  id?: number;
  titulo: string;
  descripcion?: string;
  url: string;
  tipo: 'documento' | 'video' | 'presentacion' | 'enlace' | 'otro';
};

// Interfaz principal de capacitación
export interface Capacitacion {
  id: number;
  titulo: string;
  descripcion: string;
  modalidad: ModalidadCapacitacion;
  ubicacion?: string; // Lugar físico o plataforma virtual
  fechaInicio: Date;
  fechaFin: Date;
  horaInicio?: string;
  horaFin?: string;
  duracionHoras: number;
  cupoMaximo?: number;
  costo?: number;
  instructores: Instructor[];
  materiales?: MaterialCapacitacion[];
  departamentos?: string[]; // Departamentos a los que está dirigida
  estado: EstadoCapacitacion;
  esObligatoria: boolean;
  certificado: boolean; // Si otorga certificado
  fechaCreacion: Date;
  fechaActualizacion: Date;
}

// Interfaz para la asistencia a capacitación
export interface AsistenciaCapacitacion {
  id: number;
  capacitacionId: number;
  empleadoId: number;
  fechaAsistencia: Date;
  asistio: boolean;
  calificacion?: number; // Calificación obtenida si aplica
  comentarios?: string;
  certificadoEmitido: boolean;
  fechaCreacion: Date;
  fechaActualizacion: Date;
}

// DTO para la creación de una capacitación
export type CrearCapacitacion = Omit<Capacitacion, 'id' | 'fechaCreacion' | 'fechaActualizacion'>;

// DTO para la actualización parcial de una capacitación
export type ActualizarCapacitacion = Partial<Omit<Capacitacion, 'id' | 'fechaCreacion' | 'fechaActualizacion'>>;

// DTO para la creación de una asistencia
export type CrearAsistenciaCapacitacion = Omit<AsistenciaCapacitacion, 'id' | 'fechaCreacion' | 'fechaActualizacion'>;

// DTO para la vista resumida de una capacitación (vista previa/listado)
export type CapacitacionResumen = Pick<Capacitacion, 'id' | 'titulo' | 'modalidad' | 'fechaInicio' | 'fechaFin' | 'estado' | 'esObligatoria'>;