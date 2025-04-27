/**
 * Caso de uso: Eliminar Empleado
 * Permite eliminar o desactivar un empleado del sistema
 */

import { EstadoEmpleado } from "../../../domain/entities/Empleado";
import { EmpleadoRepository } from "../../../domain/repositories/EmpleadoRepository";

export class EliminarEmpleadoUseCase {
  constructor(private empleadoRepository: EmpleadoRepository) {}

  /**
   * Ejecuta el caso de uso para eliminar o desactivar un empleado
   * @param empleadoId ID del empleado a eliminar
   * @param eliminacionLogica Indica si se debe realizar una eliminación lógica (desactivación) en lugar de física
   * @returns true si la operación fue exitosa, false en caso contrario
   * @throws Error si el empleado no existe
   */
  async execute(empleadoId: number, eliminacionLogica: boolean = true): Promise<boolean> {
    // Verificar que el empleado exista
    const empleadoExistente = await this.empleadoRepository.obtenerEmpleadoPorId(empleadoId);
    if (!empleadoExistente) {
      throw new Error(`No se encontró el empleado con ID: ${empleadoId}`);
    }
    
    // Si es eliminación lógica, solo cambiamos el estado a INACTIVO
    if (eliminacionLogica) {
      await this.empleadoRepository.cambiarEstadoEmpleado(
        empleadoId, 
        EstadoEmpleado.INACTIVO
      );
      return true;
    } else {
      // Eliminación física (solo si está permitido por las políticas de la empresa)
      // Generalmente es preferible la eliminación lógica para mantener historial
      return this.empleadoRepository.eliminarEmpleado(empleadoId);
    }
  }
}