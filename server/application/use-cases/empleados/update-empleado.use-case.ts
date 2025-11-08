import { EmpleadoRepository } from '../../../domain/repositories/empleados.repository';
import { UpdateEmpleadoDto, EmpleadoResponseDto } from '../../dto/empleados.dto';

/**
 * Caso de uso: Actualizar empleado
 */
export class UpdateEmpleadoUseCase {
  constructor(
    private readonly empleadoRepository: EmpleadoRepository
  ) {}

  async execute(id: number, dto: UpdateEmpleadoDto): Promise<EmpleadoResponseDto> {
    // Verificar que el empleado existe
    const empleadoExistente = await this.empleadoRepository.findById(id);
    if (!empleadoExistente) {
      throw new Error(`Empleado con ID ${id} no encontrado`);
    }

    // Si se está actualizando la identificación, verificar que no exista otra con el mismo valor
    if (dto.identificacion && dto.identificacion !== empleadoExistente.identificacion) {
      const existe = await this.empleadoRepository.existeIdentificacion(dto.identificacion, id);
      if (existe) {
        throw new Error(`Ya existe otro empleado con la identificación ${dto.identificacion}`);
      }
    }

    // Actualizar propiedades
    if (dto.nombre) empleadoExistente.nombre = dto.nombre;
    if (dto.apellido) empleadoExistente.apellido = dto.apellido;
    if (dto.identificacion) empleadoExistente.identificacion = dto.identificacion;
    if (dto.depto) empleadoExistente.depto = dto.depto;
    if (dto.cargo) empleadoExistente.cargo = dto.cargo;
    if (dto.fecha_ingreso) empleadoExistente.fechaIngreso = new Date(dto.fecha_ingreso);
    if (dto.estado_contrato) empleadoExistente.estadoContrato = dto.estado_contrato;
    if (dto.tipo_contrato) empleadoExistente.tipoContrato = dto.tipo_contrato;
    if (dto.telefono !== undefined) empleadoExistente.telefono = dto.telefono;
    if (dto.direccion !== undefined) empleadoExistente.direccion = dto.direccion;
    if (dto.contacto_emergencia !== undefined) empleadoExistente.contactoEmergencia = dto.contacto_emergencia;
    if (dto.fecha_fin_contrato !== undefined) {
      empleadoExistente.fechaFinContrato = dto.fecha_fin_contrato ? new Date(dto.fecha_fin_contrato) : undefined;
    }
    if (dto.clase_riesgo_arl !== undefined) empleadoExistente.claseRiesgoArl = dto.clase_riesgo_arl;
    if (dto.horas_por_semana !== undefined) empleadoExistente.horasPorSemana = dto.horas_por_semana;
    if (dto.salario_por_hora !== undefined) empleadoExistente.salarioPorHora = dto.salario_por_hora;
    if (dto.honorarios !== undefined) empleadoExistente.honorarios = dto.honorarios;
    if (dto.salario_base !== undefined) empleadoExistente.salarioBase = dto.salario_base;
    if (dto.bonificaciones !== undefined) empleadoExistente.bonificaciones = dto.bonificaciones;
    if (dto.auxilio_transporte !== undefined) empleadoExistente.auxilioTransporte = dto.auxilio_transporte;
    if (dto.requiere_seguridad_social !== undefined) empleadoExistente.requiereSeguridadSocial = dto.requiere_seguridad_social;

    // Validar la entidad actualizada
    const validacion = empleadoExistente.validar();
    if (!validacion.valido) {
      throw new Error(`Errores de validación: ${validacion.errores.join(', ')}`);
    }

    // Guardar cambios
    const empleadoActualizado = await this.empleadoRepository.update(id, empleadoExistente);
    
    return EmpleadoResponseDto.fromEntity(empleadoActualizado);
  }
}
