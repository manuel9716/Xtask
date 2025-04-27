/**
 * Entidad de dominio Empleado para el módulo de Recursos Humanos
 * Representa a un empleado dentro del contexto de RRHH
 */

// Enums para los valores de estado del empleado
export enum EstadoEmpleado {
  ACTIVO = 'activo',
  INACTIVO = 'inactivo',
  VACACIONES = 'vacaciones',
  PERMISO = 'permiso',
  BAJA_MEDICA = 'baja_medica'
}

// Tipo para definir las habilidades (skills) de un empleado
export type Habilidad = {
  nombre: string;
  nivel: 'básico' | 'intermedio' | 'avanzado' | 'experto';
  certificado?: boolean;
};

// Tipo para definir la experiencia laboral previa
export type ExperienciaLaboral = {
  empresa: string;
  cargo: string;
  fechaInicio: Date;
  fechaFin?: Date;
  descripcion: string;
};

// Tipo para definir contactos de emergencia
export type ContactoEmergencia = {
  nombre: string;
  relacion: string;
  telefono: string;
  esContactoPrincipal: boolean;
};

// Interfaz para los filtros en la búsqueda de empleados
export interface FiltrosEmpleadoRRHH {
  nombre?: string;
  departamento?: string;
  estado?: EstadoEmpleado;
  posicion?: string;
  habilidades?: string[];
  fechaContratacionDesde?: Date;
  fechaContratacionHasta?: Date;
}

// Interfaz principal del empleado
export interface EmpleadoRRHH {
  id: number;
  userId?: number;
  nombre: string;
  apellido: string;
  fechaNacimiento?: Date;
  genero?: string;
  correo: string;
  telefono?: string;
  direccion?: string;
  departamento: string;
  posicion: string;
  fechaContratacion: Date;
  salario: number;
  estado: EstadoEmpleado;
  supervisor?: number; // ID del empleado supervisor
  habilidades?: Habilidad[];
  experienciaLaboral?: ExperienciaLaboral[];
  contactosEmergencia?: ContactoEmergencia[];
  fotoPerfil?: string;
  nivelEducativo?: string;
  institucionEducativa?: string;
  especialidad?: string;
  fechaCreacion: Date;
  fechaActualizacion: Date;
}

// Omitir los campos generados automáticamente para la creación
export type CrearEmpleadoRRHH = Omit<EmpleadoRRHH, 'id' | 'fechaCreacion' | 'fechaActualizacion'>;

// Dto para actualización parcial del empleado
export type ActualizarEmpleadoRRHH = Partial<Omit<EmpleadoRRHH, 'id' | 'fechaCreacion' | 'fechaActualizacion'>>;

// Dto para los datos resumidos de un empleado (vista previa/listado)
export type EmpleadoResumenRRHH = Pick<EmpleadoRRHH, 'id' | 'nombre' | 'apellido' | 'posicion' | 'departamento' | 'estado' | 'fotoPerfil'>;