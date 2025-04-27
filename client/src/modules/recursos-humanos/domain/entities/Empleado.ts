/**
 * Entidad Empleado
 * Representa un empleado en el sistema de Recursos Humanos
 */

// Enumeraciones para valores permitidos
export enum EstadoEmpleado {
  ACTIVO = "ACTIVO",
  INACTIVO = "INACTIVO",
  VACACIONES = "VACACIONES",
  PERMISO = "PERMISO",
  BAJA_MEDICA = "BAJA_MEDICA"
}

// Mapeo de estados para conversión BD/UI
export const mapeoEstadoEmpleado = {
  // De base de datos a UI
  active: EstadoEmpleado.ACTIVO,
  inactive: EstadoEmpleado.INACTIVO,
  on_leave: EstadoEmpleado.VACACIONES,
  permission: EstadoEmpleado.PERMISO,
  medical_leave: EstadoEmpleado.BAJA_MEDICA,
  
  // De UI a base de datos
  [EstadoEmpleado.ACTIVO]: "active",
  [EstadoEmpleado.INACTIVO]: "inactive",
  [EstadoEmpleado.VACACIONES]: "on_leave",
  [EstadoEmpleado.PERMISO]: "permission",
  [EstadoEmpleado.BAJA_MEDICA]: "medical_leave"
};

// Interfaz para los filtros de búsqueda
export interface FiltrosEmpleadoRRHH {
  nombre?: string;
  departamento?: string;
  estado?: EstadoEmpleado;
  fechaContratacionDesde?: Date;
  fechaContratacionHasta?: Date;
}

// Interfaz para la creación de un empleado
export interface CrearEmpleadoDTO {
  nombres: string;
  apellidos: string;
  cargo: string;
  departamento: string;
  fechaContratacion: Date;
  estado: EstadoEmpleado;
  salario: number;
  direccion?: string;
  telefono?: string;
  correo?: string;
  fechaNacimiento?: Date;
  numeroIdentificacion?: string;
  seguridadSocial?: string;
  cuentaBancaria?: string;
  contactoEmergencia?: string;
  telefonoEmergencia?: string;
  notas?: string;
  fotoUrl?: string;
  proyectoPrincipalId?: number;
}

// Interfaz para la actualización de un empleado
export interface ActualizarEmpleadoDTO extends Partial<CrearEmpleadoDTO> {
  id: number;
}

// Clase principal de entidad Empleado
export class Empleado {
  id: number;
  nombres: string;
  apellidos: string;
  cargo: string;
  departamento: string;
  fechaContratacion: Date;
  estado: EstadoEmpleado;
  salario: number;
  direccion?: string;
  telefono?: string;
  correo?: string;
  fechaNacimiento?: Date;
  numeroIdentificacion?: string;
  seguridadSocial?: string;
  cuentaBancaria?: string;
  contactoEmergencia?: string;
  telefonoEmergencia?: string;
  notas?: string;
  fotoUrl?: string;
  proyectoPrincipalId?: number;
  createdAt: Date;
  updatedAt?: Date;

  constructor(data: {
    id: number;
    nombres: string;
    apellidos: string;
    cargo: string;
    departamento: string;
    fechaContratacion: Date;
    estado: EstadoEmpleado;
    salario: number;
    direccion?: string;
    telefono?: string;
    correo?: string;
    fechaNacimiento?: Date;
    numeroIdentificacion?: string;
    seguridadSocial?: string;
    cuentaBancaria?: string;
    contactoEmergencia?: string;
    telefonoEmergencia?: string;
    notas?: string;
    fotoUrl?: string;
    proyectoPrincipalId?: number;
    createdAt: Date;
    updatedAt?: Date;
  }) {
    this.id = data.id;
    this.nombres = data.nombres;
    this.apellidos = data.apellidos;
    this.cargo = data.cargo;
    this.departamento = data.departamento;
    this.fechaContratacion = data.fechaContratacion;
    this.estado = data.estado;
    this.salario = data.salario;
    this.direccion = data.direccion;
    this.telefono = data.telefono;
    this.correo = data.correo;
    this.fechaNacimiento = data.fechaNacimiento;
    this.numeroIdentificacion = data.numeroIdentificacion;
    this.seguridadSocial = data.seguridadSocial;
    this.cuentaBancaria = data.cuentaBancaria;
    this.contactoEmergencia = data.contactoEmergencia;
    this.telefonoEmergencia = data.telefonoEmergencia;
    this.notas = data.notas;
    this.fotoUrl = data.fotoUrl;
    this.proyectoPrincipalId = data.proyectoPrincipalId;
    this.createdAt = data.createdAt;
    this.updatedAt = data.updatedAt;
  }

  // Métodos de dominio

  // Nombre completo del empleado
  get nombreCompleto(): string {
    return `${this.nombres} ${this.apellidos}`;
  }

  // Antigüedad en años
  get antiguedad(): number {
    const fechaActual = new Date();
    const diff = fechaActual.getTime() - this.fechaContratacion.getTime();
    return Math.floor(diff / (1000 * 60 * 60 * 24 * 365.25));
  }

  // Verifica si el empleado está activo
  get estaActivo(): boolean {
    return this.estado === EstadoEmpleado.ACTIVO;
  }

  // Cambiar estado del empleado
  cambiarEstado(nuevoEstado: EstadoEmpleado): void {
    this.estado = nuevoEstado;
    this.updatedAt = new Date();
  }

  // Actualizar salario del empleado
  actualizarSalario(nuevoSalario: number): void {
    if (nuevoSalario <= 0) {
      throw new Error("El salario debe ser mayor que cero");
    }
    this.salario = nuevoSalario;
    this.updatedAt = new Date();
  }

  // Asignar a proyecto principal
  asignarProyectoPrincipal(proyectoId: number): void {
    this.proyectoPrincipalId = proyectoId;
    this.updatedAt = new Date();
  }
}