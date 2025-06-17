import { Habilidad, CreateHabilidadRequest, UpdateHabilidadRequest, HabilidadesPorTipo } from "../entities/Habilidad";

export interface HabilidadRepository {
  /**
   * Obtiene todas las habilidades de un usuario específico agrupadas por tipo
   */
  getHabilidadesByUserId(userId: number): Promise<HabilidadesPorTipo>;

  /**
   * Obtiene las habilidades del usuario actual
   */
  getMisHabilidades(): Promise<HabilidadesPorTipo>;

  /**
   * Crea una nueva habilidad
   */
  createHabilidad(habilidad: CreateHabilidadRequest): Promise<Habilidad>;

  /**
   * Actualiza una habilidad existente
   */
  updateHabilidad(id: number, habilidad: UpdateHabilidadRequest): Promise<Habilidad>;

  /**
   * Elimina una habilidad
   */
  deleteHabilidad(id: number): Promise<void>;
}