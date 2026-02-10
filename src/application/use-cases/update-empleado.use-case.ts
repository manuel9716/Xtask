import { EmpleadoRepository } from '../../domain/repositories/empleados.repository';
import { Empleado } from '../../domain/entities/empleados.entity';
import { UpdateEmpleadoDto, EmpleadoResponseDto } from '../dto/empleados.dto';

/**
 * Caso de uso: Actualizar empleado
 */
export class UpdateEmpleadoUseCase {
  constructor(
    private readonly empleadoRepository: EmpleadoRepository
  ) {}

  /**
   * Actualiza las propiedades del empleado con los valores del DTO
   */
  private actualizarPropiedades(empleado: Empleado, dto: UpdateEmpleadoDto): void {
    // Propiedades básicas
    if (dto.nombre) empleado.nombre = dto.nombre;
    if (dto.apellido) empleado.apellido = dto.apellido;
    if (dto.identificacion) empleado.identificacion = dto.identificacion;
    if (dto.depto) empleado.depto = dto.depto;
    if (dto.cargo) empleado.cargo = dto.cargo;
    
    // Propiedades de fecha y estado
    if (dto.fecha_ingreso) empleado.fechaIngreso = new Date(dto.fecha_ingreso);
    if (dto.estado_contrato) empleado.estadoContrato = dto.estado_contrato;
    if (dto.tipo_contrato) empleado.tipoContrato = dto.tipo_contrato;
    
    // Propiedades opcionales (pueden ser null/undefined)
    if (dto.telefono !== undefined) empleado.telefono = dto.telefono;
    if (dto.direccion !== undefined) empleado.direccion = dto.direccion;
    if (dto.contacto_emergencia !== undefined) empleado.contactoEmergencia = dto.contacto_emergencia;
    
    // Propiedades especiales
    if (dto.fecha_fin_contrato !== undefined) {
      empleado.fechaFinContrato = dto.fecha_fin_contrato ? new Date(dto.fecha_fin_contrato) : undefined;
    }
    
    // Propiedades numéricas y booleanas
    this.actualizarPropiedadesNumericas(empleado, dto);
  }

  /**
   * Actualiza propiedades numéricas y booleanas
   */
  private actualizarPropiedadesNumericas(empleado: Empleado, dto: UpdateEmpleadoDto): void {
    if (dto.clase_riesgo_arl !== undefined) empleado.claseRiesgoArl = dto.clase_riesgo_arl;
    if (dto.horas_por_semana !== undefined) empleado.horasPorSemana = dto.horas_por_semana;
    if (dto.salario_por_hora !== undefined) empleado.salarioPorHora = dto.salario_por_hora;
    if (dto.honorarios !== undefined) empleado.honorarios = dto.honorarios;
    if (dto.salario_base !== undefined) empleado.salarioBase = dto.salario_base;
    if (dto.bonificaciones !== undefined) empleado.bonificaciones = dto.bonificaciones;
    if (dto.auxilio_transporte !== undefined) empleado.auxilioTransporte = dto.auxilio_transporte;
    if (dto.requiere_seguridad_social !== undefined) empleado.requiereSeguridadSocial = dto.requiere_seguridad_social;
  }

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
    this.actualizarPropiedades(empleadoExistente, dto);

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
