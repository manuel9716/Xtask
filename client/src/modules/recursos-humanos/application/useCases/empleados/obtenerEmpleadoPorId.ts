/**
 * Caso de uso: Obtener Empleado Por ID
 * Permite obtener los datos detallados de un empleado específico
 */

import { Empleado } from "../../../domain/entities/Empleado";
import { EmpleadoRepository } from "../../../domain/repositories/EmpleadoRepository";

export class ObtenerEmpleadoPorIdUseCase {
  constructor(private empleadoRepository: EmpleadoRepository) {}

  /**
   * Ejecuta el caso de uso para obtener un empleado por su ID
   * @param empleadoId ID del empleado a obtener
   * @returns Datos del empleado o null si no existe
   * @throws Error si hay algún problema en la obtención
   */
  async execute(empleadoId: number): Promise<Empleado | null> {
    if (!empleadoId || empleadoId <= 0) {
      throw new Error('ID de empleado inválido');
    }
    
    const empleado = await this.empleadoRepository.obtenerEmpleadoPorId(empleadoId);
    
    return empleado;
  }
  
  /**
   * Ejecuta el caso de uso exigiendo que el empleado exista
   * @param empleadoId ID del empleado a obtener
   * @returns Datos del empleado
   * @throws Error si el empleado no existe
   */
  async executeOrFail(empleadoId: number): Promise<Empleado> {
    const empleado = await this.execute(empleadoId);
    
    if (!empleado) {
      throw new Error(`No se encontró el empleado con ID: ${empleadoId}`);
    }
    
    return empleado;
  }
}