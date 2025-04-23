import { Presupuesto, CrearPresupuestoDTO, RegistrarGastoDTO } from '../entities/Presupuesto';

/**
 * Interfaz del repositorio de presupuestos
 * Define las operaciones que debe implementar cualquier repositorio de presupuestos
 */
export interface IPresupuestoRepository {
  /**
   * Obtiene un presupuesto por su ID
   * @param id ID del presupuesto
   * @returns Presupuesto encontrado o undefined si no existe
   */
  obtenerPresupuesto(id: number): Promise<Presupuesto | undefined>;
  
  /**
   * Lista todos los presupuestos, opcionalmente filtrados por organización
   * @param organizationId ID de la organización (opcional)
   * @returns Array de presupuestos
   */
  listarPresupuestos(organizationId?: number): Promise<Presupuesto[]>;
  
  /**
   * Crea un nuevo presupuesto
   * @param presupuesto Datos para crear el presupuesto
   * @returns Presupuesto creado con su ID
   */
  crearPresupuesto(presupuesto: CrearPresupuestoDTO): Promise<Presupuesto>;
  
  /**
   * Actualiza un presupuesto existente
   * @param id ID del presupuesto a actualizar
   * @param presupuesto Datos actualizados
   * @returns Presupuesto actualizado
   */
  actualizarPresupuesto(id: number, presupuesto: Partial<Presupuesto>): Promise<Presupuesto>;
  
  /**
   * Registra un gasto en un presupuesto
   * @param id ID del presupuesto
   * @param gasto Datos del gasto a registrar
   * @returns Presupuesto actualizado con el gasto incluido
   */
  registrarGasto(id: number, gasto: RegistrarGastoDTO): Promise<Presupuesto>;
  
  /**
   * Elimina un presupuesto
   * @param id ID del presupuesto a eliminar
   * @returns true si se eliminó correctamente, false si no
   */
  eliminarPresupuesto(id: number): Promise<boolean>;
}