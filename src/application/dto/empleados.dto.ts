import { Empleado } from '../../domain/entities/empleados.entity';

/**
 * DTO para crear empleado
 */
export class CreateEmpleadoDto {
  nombre!: string;
  apellido!: string;
  identificacion!: string;
  depto!: string;
  cargo!: string;
  fecha_ingreso!: string;
  estado_contrato!: 'activo' | 'inactivo' | 'suspendido';
  tipo_contrato!: 'indefinido' | 'fijo' | 'obra_labor' | 'prestacion_servicios' | 'por_horas';
  telefono?: string;
  direccion?: string;
  contacto_emergencia?: string;
  fecha_fin_contrato?: string;
  clase_riesgo_arl?: string;
  horas_por_semana?: number;
  salario_por_hora?: number;
  honorarios?: number;
  salario_base?: number;
  bonificaciones?: number;
  auxilio_transporte?: boolean;
  requiere_seguridad_social?: boolean;
}

/**
 * DTO para actualizar empleado
 */
export class UpdateEmpleadoDto {
  nombre?: string;
  apellido?: string;
  identificacion?: string;
  depto?: string;
  cargo?: string;
  fecha_ingreso?: string;
  estado_contrato?: 'activo' | 'inactivo' | 'suspendido';
  tipo_contrato?: 'indefinido' | 'fijo' | 'obra_labor' | 'prestacion_servicios' | 'por_horas';
  telefono?: string;
  direccion?: string;
  contacto_emergencia?: string;
  fecha_fin_contrato?: string;
  clase_riesgo_arl?: string;
  horas_por_semana?: number;
  salario_por_hora?: number;
  honorarios?: number;
  salario_base?: number;
  bonificaciones?: number;
  auxilio_transporte?: boolean;
  requiere_seguridad_social?: boolean;
}

/**
 * DTO de respuesta para empleado
 */
export class EmpleadoResponseDto {
  id!: number;
  nombre!: string;
  apellido!: string;
  nombreCompleto!: string;
  identificacion!: string;
  depto!: string;
  cargo!: string;
  fechaIngreso!: string;
  estadoContrato!: string;
  tipoContrato!: string;
  telefono?: string;
  direccion?: string;
  contactoEmergencia?: string;
  fechaFinContrato?: string;
  claseRiesgoArl?: string;
  horasPorSemana?: number;
  salarioPorHora?: number;
  honorarios?: number;
  salarioBase?: number;
  bonificaciones?: number;
  auxilioTransporte?: boolean;
  requiereSeguridadSocial?: boolean;
  salarioMensual?: number;
  activo!: boolean;
  createdAt?: string;

  static fromEntity(empleado: Empleado): EmpleadoResponseDto {
    const dto = new EmpleadoResponseDto();
    dto.id = empleado.id;
    dto.nombre = empleado.nombre;
    dto.apellido = empleado.apellido;
    dto.nombreCompleto = empleado.nombreCompleto;
    dto.identificacion = empleado.identificacion;
    dto.depto = empleado.depto;
    dto.cargo = empleado.cargo;
    dto.fechaIngreso = empleado.fechaIngreso.toISOString();
    dto.estadoContrato = empleado.estadoContrato;
    dto.tipoContrato = empleado.tipoContrato;
    dto.telefono = empleado.telefono;
    dto.direccion = empleado.direccion;
    dto.contactoEmergencia = empleado.contactoEmergencia;
    dto.fechaFinContrato = empleado.fechaFinContrato?.toISOString();
    dto.claseRiesgoArl = empleado.claseRiesgoArl;
    dto.horasPorSemana = empleado.horasPorSemana;
    dto.salarioPorHora = empleado.salarioPorHora;
    dto.honorarios = empleado.honorarios;
    dto.salarioBase = empleado.salarioBase;
    dto.bonificaciones = empleado.bonificaciones;
    dto.auxilioTransporte = empleado.auxilioTransporte;
    dto.requiereSeguridadSocial = empleado.requiereSeguridadSocial;
    dto.salarioMensual = empleado.calcularSalarioMensual();
    dto.activo = empleado.activo;
    dto.createdAt = empleado.createdAt?.toISOString();
    return dto;
  }

  static fromEntityList(empleados: Empleado[]): EmpleadoResponseDto[] {
    return empleados.map(emp => EmpleadoResponseDto.fromEntity(emp));
  }
}

/**
 * DTO para crear empleado completo (con nómina y proyecto)
 */
export class CreateEmpleadoCompletoDto {
  empleado!: CreateEmpleadoDto;
  nomina?: {
    sueldo_base: number;
    bonificacion: number;
    tasa_impuestos: number;
    base_deduccion: number;
    beneficios_base: number;
    metodo_pago: 'transferencia' | 'efectivo' | 'cheque';
    cuenta_bancaria?: string;
    seguro_salud?: string;
    dias_vacaciones: number;
    frecuencia_pago: 'quincenal' | 'mensual';
    fecha_inicio_nomina: string;
  };
  proyecto?: {
    proyecto_id: number;
  };
}
