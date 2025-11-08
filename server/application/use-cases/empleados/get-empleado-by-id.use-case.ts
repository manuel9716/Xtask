import { EmpleadoRepository } from '../../../domain/repositories/empleados.repository';
import { EmpleadoResponseDto } from '../../dto/empleados.dto';

/**
 * Caso de uso: Obtener empleado por ID
 */
export class GetEmpleadoByIdUseCase {
  constructor(
    private readonly empleadoRepository: EmpleadoRepository
  ) {}

  async execute(id: number): Promise<EmpleadoResponseDto> {
    const empleado = await this.empleadoRepository.findById(id);
    
    if (!empleado) {
      throw new Error(`Empleado con ID ${id} no encontrado`);
    }

    return EmpleadoResponseDto.fromEntity(empleado);
  }
}
