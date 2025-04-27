/**
 * Caso de uso: Asignar Empleados a Capacitación
 * Permite inscribir empleados en un programa de capacitación
 */

import { CapacitacionRepository } from "../../../domain/repositories/CapacitacionRepository";
import { EmpleadoRepository } from "../../../domain/repositories/EmpleadoRepository";

export class AsignarEmpleadosCapacitacionUseCase {
  constructor(
    private capacitacionRepository: CapacitacionRepository,
    private empleadoRepository: EmpleadoRepository
  ) {}

  /**
   * Ejecuta el caso de uso para asignar un empleado a una capacitación
   * @param capacitacionId ID de la capacitación
   * @param empleadoId ID del empleado a asignar
   * @returns true si la asignación fue exitosa, false en caso contrario
   * @throws Error si la capacitación o el empleado no existen
   */
  async execute(capacitacionId: number, empleadoId: number): Promise<boolean> {
    // Validar que la capacitación exista
    const capacitacion = await this.capacitacionRepository.obtenerCapacitacionPorId(capacitacionId);
    if (!capacitacion) {
      throw new Error(`No se encontró la capacitación con ID: ${capacitacionId}`);
    }
    
    // Validar que el empleado exista
    const empleado = await this.empleadoRepository.obtenerEmpleadoPorId(empleadoId);
    if (!empleado) {
      throw new Error(`No se encontró el empleado con ID: ${empleadoId}`);
    }
    
    // Lógica de aplicación: asignar empleado a la capacitación
    return this.capacitacionRepository.agregarParticipante(capacitacionId, empleadoId);
  }

  /**
   * Ejecuta el caso de uso para asignar múltiples empleados a una capacitación
   * @param capacitacionId ID de la capacitación
   * @param empleadoIds Lista de IDs de empleados a asignar
   * @returns Objeto con resultado de asignaciones (éxito, error, lista de éxito, lista de error)
   * @throws Error si la capacitación no existe
   */
  async executeBatch(
    capacitacionId: number, 
    empleadoIds: number[]
  ): Promise<{
    exito: boolean;
    mensaje: string;
    exitosos: number[];
    fallidos: {id: number; razon: string}[];
  }> {
    if (!empleadoIds || empleadoIds.length === 0) {
      return {
        exito: false,
        mensaje: 'No se proporcionaron empleados para asignar',
        exitosos: [],
        fallidos: []
      };
    }
    
    // Validar que la capacitación exista
    const capacitacion = await this.capacitacionRepository.obtenerCapacitacionPorId(capacitacionId);
    if (!capacitacion) {
      throw new Error(`No se encontró la capacitación con ID: ${capacitacionId}`);
    }
    
    // Preparar resultados
    const resultados = {
      exito: false,
      mensaje: '',
      exitosos: [] as number[],
      fallidos: [] as {id: number; razon: string}[]
    };
    
    // Procesar cada empleado
    for (const empleadoId of empleadoIds) {
      try {
        // Validar que el empleado exista
        const empleado = await this.empleadoRepository.obtenerEmpleadoPorId(empleadoId);
        if (!empleado) {
          resultados.fallidos.push({
            id: empleadoId, 
            razon: `No se encontró el empleado con ID: ${empleadoId}`
          });
          continue;
        }
        
        // Intentar asignar el empleado
        const asignado = await this.capacitacionRepository.agregarParticipante(capacitacionId, empleadoId);
        
        if (asignado) {
          resultados.exitosos.push(empleadoId);
        } else {
          resultados.fallidos.push({
            id: empleadoId, 
            razon: 'No se pudo asignar el empleado a la capacitación (cupo lleno o ya inscrito)'
          });
        }
      } catch (error) {
        resultados.fallidos.push({
          id: empleadoId, 
          razon: error instanceof Error ? error.message : 'Error desconocido'
        });
      }
    }
    
    // Determinar resultado global
    if (resultados.exitosos.length > 0) {
      if (resultados.fallidos.length === 0) {
        resultados.exito = true;
        resultados.mensaje = 'Todos los empleados fueron asignados correctamente';
      } else {
        resultados.exito = true;
        resultados.mensaje = `${resultados.exitosos.length} empleados asignados correctamente, ${resultados.fallidos.length} fallaron`;
      }
    } else {
      resultados.exito = false;
      resultados.mensaje = 'No se pudo asignar ningún empleado a la capacitación';
    }
    
    return resultados;
  }

  /**
   * Ejecuta el caso de uso para desasignar un empleado de una capacitación
   * @param capacitacionId ID de la capacitación
   * @param empleadoId ID del empleado a desasignar
   * @returns true si la desasignación fue exitosa, false en caso contrario
   */
  async executeRemove(capacitacionId: number, empleadoId: number): Promise<boolean> {
    // Validar que la capacitación exista
    const capacitacion = await this.capacitacionRepository.obtenerCapacitacionPorId(capacitacionId);
    if (!capacitacion) {
      throw new Error(`No se encontró la capacitación con ID: ${capacitacionId}`);
    }
    
    // Lógica de aplicación: desasignar empleado de la capacitación
    return this.capacitacionRepository.eliminarParticipante(capacitacionId, empleadoId);
  }
}