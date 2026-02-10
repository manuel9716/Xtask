import { EmpleadoRepository } from '../../domain/repositories/empleados.repository';
import { Empleado } from '../../domain/entities/empleados.entity';
import { CreateEmpleadoDto, EmpleadoResponseDto } from '../dto/empleados.dto';

/**
 * Caso de uso: Crear empleado
 */
export class CreateEmpleadoUseCase {
  constructor(
    private readonly empleadoRepository: EmpleadoRepository
  ) {}

  async execute(dto: CreateEmpleadoDto, userId?: number): Promise<EmpleadoResponseDto> {
    // Verificar si ya existe un empleado con la misma identificación
    const existe = await this.empleadoRepository.existeIdentificacion(dto.identificacion);
    if (existe) {
      throw new Error(`Ya existe un empleado con la identificación ${dto.identificacion}`);
    }

    // Crear la entidad de dominio
    const empleado = new Empleado(
      0, // El ID se asignará en la base de datos
      dto.nombre,
      dto.apellido,
      dto.identificacion,
      dto.depto,
      dto.cargo,
      new Date(dto.fecha_ingreso),
      dto.estado_contrato || 'activo',
      dto.tipo_contrato,
      dto.telefono,
      dto.direccion,
      dto.contacto_emergencia,
      dto.fecha_fin_contrato ? new Date(dto.fecha_fin_contrato) : undefined,
      dto.clase_riesgo_arl,
      dto.horas_por_semana,
      dto.salario_por_hora,
      dto.honorarios,
      dto.salario_base,
      dto.bonificaciones || 0,
      dto.auxilio_transporte ?? true,
      dto.requiere_seguridad_social ?? true,
      true, // activo por defecto
      userId
    );

    // Validar la entidad
    const validacion = empleado.validar();
    if (!validacion.valido) {
      throw new Error(`Errores de validación: ${validacion.errores.join(', ')}`);
    }

    // Guardar en el repositorio
    const savedEmpleado = await this.empleadoRepository.save(empleado);
    
    return EmpleadoResponseDto.fromEntity(savedEmpleado);
  }
}
