/**
 * Caso de uso: Cambiar Estado de Nómina
 * Permite modificar el estado de una nómina (pendiente, en proceso, pagada, cancelada)
 */

import { Nomina, EstadoNomina } from "../../../domain/entities/Nomina";
import { NominasApi } from "../../../infrastructure/api/nominasApi";

export class CambiarEstadoNominaUseCase {
  /**
   * Ejecuta el caso de uso para cambiar el estado de una nómina
   * @param nominaId ID de la nómina a modificar
   * @param nuevoEstado Nuevo estado a asignar
   * @returns La nómina actualizada
   */
  async execute(nominaId: number, nuevoEstado: EstadoNomina): Promise<Nomina> {
    try {
      // Validar que el estado sea válido
      if (!Object.values(EstadoNomina).includes(nuevoEstado)) {
        throw new Error(`Estado de nómina inválido: ${nuevoEstado}`);
      }
      
      // Llamar a la API para actualizar el estado
      const nominaActualizada = await NominasApi.cambiarEstadoNomina(nominaId, nuevoEstado);
      
      return nominaActualizada;
    } catch (error) {
      console.error(`Error al cambiar estado de nómina ${nominaId} a ${nuevoEstado}:`, error);
      throw error;
    }
  }
}