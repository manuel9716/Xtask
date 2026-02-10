import { EmpleadoRepository } from '../../domain/repositories/empleados.repository';

/**
 * Caso de uso: Eliminar empleado (soft delete)
 */
export class DeleteEmpleadoUseCase {
  constructor(
    private readonly empleadoRepository: EmpleadoRepository
  ) {}

  async execute(id: number): Promise<void> {
    // Verificar que el empleado existe
    const empleado = await this.empleadoRepository.findById(id);
    if (!empleado) {
      throw new Error(`Empleado con ID ${id} no encontrado`);
    }

    // Realizar soft delete
    await this.empleadoRepository.softDelete(id);
  }
}
