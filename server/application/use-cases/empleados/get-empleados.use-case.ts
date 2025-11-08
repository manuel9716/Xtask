import { EmpleadoRepository, EmpleadoFiltros } from '../../../domain/repositories/empleados.repository';
import { EmpleadoResponseDto } from '../../dto/empleados.dto';

/**
 * Caso de uso: Obtener lista de empleados
 */
export class GetEmpleadosUseCase {
  constructor(
    private readonly empleadoRepository: EmpleadoRepository
  ) {}

  async execute(filtros?: EmpleadoFiltros): Promise<EmpleadoResponseDto[]> {
    const empleados = await this.empleadoRepository.findAll(filtros);
    return EmpleadoResponseDto.fromEntityList(empleados);
  }
}
