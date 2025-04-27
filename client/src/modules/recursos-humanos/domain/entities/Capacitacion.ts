/**
 * Entidad Capacitación
 * Representa un programa de capacitación para empleados
 */

// Estados posibles de una capacitación
export enum EstadoCapacitacion {
  PLANIFICADA = "PLANIFICADA",
  EN_CURSO = "EN_CURSO",
  FINALIZADA = "FINALIZADA",
  CANCELADA = "CANCELADA"
}

// Tipos de capacitación
export enum TipoCapacitacion {
  TECNICA = "TECNICA",
  HABILIDADES_BLANDAS = "HABILIDADES_BLANDAS",
  LIDERAZGO = "LIDERAZGO",
  NORMATIVA = "NORMATIVA",
  SEGURIDAD = "SEGURIDAD",
  OTROS = "OTROS"
}

// Modalidades de capacitación
export enum ModalidadCapacitacion {
  PRESENCIAL = "PRESENCIAL",
  VIRTUAL = "VIRTUAL",
  MIXTA = "MIXTA",
  AUTOESTUDIO = "AUTOESTUDIO"
}

// Registro de asistencia a una capacitación
export interface AsistenciaCapacitacion {
  empleadoId: number;
  fecha: Date;
  asistio: boolean;
  observaciones?: string;
}

// DTO para crear una capacitación
export interface CrearCapacitacionDTO {
  nombre: string;
  descripcion?: string;
  tipo: TipoCapacitacion;
  modalidad: ModalidadCapacitacion;
  responsableId: number;
  fechaInicio: Date;
  fechaFin: Date;
  duracionHoras: number;
  ubicacion?: string;
  enlaceVirtual?: string;
  cupoMaximo?: number;
  requisitos?: string;
  objetivos?: string;
  contenidos?: string;
  costo?: number;
  proveedorExterno?: string;
}

// DTO para actualizar una capacitación
export interface ActualizarCapacitacionDTO extends Partial<CrearCapacitacionDTO> {
  id: number;
  estado?: EstadoCapacitacion;
}

// Clase principal de Capacitación
export class Capacitacion {
  id: number;
  nombre: string;
  descripcion?: string;
  tipo: TipoCapacitacion;
  modalidad: ModalidadCapacitacion;
  responsableId: number;
  fechaInicio: Date;
  fechaFin: Date;
  duracionHoras: number;
  estado: EstadoCapacitacion;
  ubicacion?: string;
  enlaceVirtual?: string;
  cupoMaximo?: number;
  participantes: number[] = []; // Array de IDs de empleados
  asistencias: AsistenciaCapacitacion[] = [];
  requisitos?: string;
  objetivos?: string;
  contenidos?: string;
  costo?: number;
  proveedorExterno?: string;
  createdAt: Date;
  updatedAt?: Date;

  constructor(data: {
    id: number;
    nombre: string;
    descripcion?: string;
    tipo: TipoCapacitacion;
    modalidad: ModalidadCapacitacion;
    responsableId: number;
    fechaInicio: Date;
    fechaFin: Date;
    duracionHoras: number;
    estado: EstadoCapacitacion;
    ubicacion?: string;
    enlaceVirtual?: string;
    cupoMaximo?: number;
    participantes?: number[];
    asistencias?: AsistenciaCapacitacion[];
    requisitos?: string;
    objetivos?: string;
    contenidos?: string;
    costo?: number;
    proveedorExterno?: string;
    createdAt: Date;
    updatedAt?: Date;
  }) {
    this.id = data.id;
    this.nombre = data.nombre;
    this.descripcion = data.descripcion;
    this.tipo = data.tipo;
    this.modalidad = data.modalidad;
    this.responsableId = data.responsableId;
    this.fechaInicio = data.fechaInicio;
    this.fechaFin = data.fechaFin;
    this.duracionHoras = data.duracionHoras;
    this.estado = data.estado;
    this.ubicacion = data.ubicacion;
    this.enlaceVirtual = data.enlaceVirtual;
    this.cupoMaximo = data.cupoMaximo;
    this.participantes = data.participantes || [];
    this.asistencias = data.asistencias || [];
    this.requisitos = data.requisitos;
    this.objetivos = data.objetivos;
    this.contenidos = data.contenidos;
    this.costo = data.costo;
    this.proveedorExterno = data.proveedorExterno;
    this.createdAt = data.createdAt;
    this.updatedAt = data.updatedAt;
  }

  // Métodos de dominio

  // Verifica si la capacitación está en progreso
  get estaEnCurso(): boolean {
    return this.estado === EstadoCapacitacion.EN_CURSO;
  }

  // Verifica si la capacitación ha finalizado
  get estaFinalizada(): boolean {
    return this.estado === EstadoCapacitacion.FINALIZADA;
  }

  // Número de participantes inscritos
  get numeroParticipantes(): number {
    return this.participantes.length;
  }

  // Verifica si hay cupo disponible
  get tieneCupoDisponible(): boolean {
    return this.cupoMaximo === undefined || this.participantes.length < this.cupoMaximo;
  }

  // Verifica si la fecha actual está dentro del período de capacitación
  get estaActiva(): boolean {
    const fechaActual = new Date();
    return fechaActual >= this.fechaInicio && fechaActual <= this.fechaFin;
  }

  // Cambiar estado de la capacitación
  cambiarEstado(nuevoEstado: EstadoCapacitacion): void {
    this.estado = nuevoEstado;
    this.updatedAt = new Date();
  }

  // Añadir un participante a la capacitación
  agregarParticipante(empleadoId: number): boolean {
    if (this.participantes.includes(empleadoId)) {
      return false; // Ya está inscrito
    }

    if (!this.tieneCupoDisponible) {
      return false; // No hay cupo disponible
    }

    this.participantes.push(empleadoId);
    this.updatedAt = new Date();
    return true;
  }

  // Eliminar un participante de la capacitación
  eliminarParticipante(empleadoId: number): boolean {
    const index = this.participantes.indexOf(empleadoId);
    if (index === -1) {
      return false; // No estaba inscrito
    }

    this.participantes.splice(index, 1);
    this.updatedAt = new Date();
    return true;
  }

  // Registrar asistencia de un participante
  registrarAsistencia(empleadoId: number, fecha: Date, asistio: boolean, observaciones?: string): boolean {
    // Verificar que el empleado esté inscrito
    if (!this.participantes.includes(empleadoId)) {
      return false;
    }

    // Verificar que la fecha esté dentro del período de capacitación
    if (fecha < this.fechaInicio || fecha > this.fechaFin) {
      return false;
    }

    // Buscar si ya existe un registro para ese empleado y fecha
    const indiceExistente = this.asistencias.findIndex(
      a => a.empleadoId === empleadoId && a.fecha.toDateString() === fecha.toDateString()
    );

    if (indiceExistente >= 0) {
      // Actualizar registro existente
      this.asistencias[indiceExistente] = {
        empleadoId,
        fecha,
        asistio,
        observaciones
      };
    } else {
      // Crear nuevo registro
      this.asistencias.push({
        empleadoId,
        fecha,
        asistio,
        observaciones
      });
    }

    this.updatedAt = new Date();
    return true;
  }

  // Obtener porcentaje de asistencia para un empleado
  obtenerPorcentajeAsistencia(empleadoId: number): number | null {
    if (!this.participantes.includes(empleadoId)) {
      return null; // El empleado no está inscrito
    }

    const asistenciasEmpleado = this.asistencias.filter(a => a.empleadoId === empleadoId);
    if (asistenciasEmpleado.length === 0) {
      return 0; // No hay registros de asistencia
    }

    const asistenciasPresentes = asistenciasEmpleado.filter(a => a.asistio).length;
    return (asistenciasPresentes / asistenciasEmpleado.length) * 100;
  }

  // Calcular porcentaje general de asistencia
  calcularPorcentajeGeneralAsistencia(): number {
    if (this.asistencias.length === 0 || this.participantes.length === 0) {
      return 0;
    }

    const asistenciasPresentes = this.asistencias.filter(a => a.asistio).length;
    return (asistenciasPresentes / this.asistencias.length) * 100;
  }
}