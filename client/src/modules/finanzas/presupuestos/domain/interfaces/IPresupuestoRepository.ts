import { Presupuesto, CrearPresupuestoDTO, RegistrarGastoDTO } from "../entities/Presupuesto";

/**
 * Interfaz para el repositorio de presupuestos (Patrón Repository)
 */
export interface IPresupuestoRepository {
  /**
   * Obtiene una lista de todos los presupuestos
   * @param organizationId ID de la organización (opcional)
   * @returns Lista de presupuestos
   */
  listarPresupuestos(organizationId?: number): Promise<Presupuesto[]>;
  
  /**
   * Obtiene un presupuesto por su ID
   * @param id ID del presupuesto
   * @returns Presupuesto encontrado o undefined
   */
  obtenerPresupuestoPorId(id: number): Promise<Presupuesto | undefined>;
  
  /**
   * Crea un nuevo presupuesto
   * @param presupuesto Datos del presupuesto a crear
   * @returns Presupuesto creado
   */
  crearPresupuesto(presupuesto: CrearPresupuestoDTO): Promise<Presupuesto>;
  
  /**
   * Actualiza un presupuesto existente
   * @param id ID del presupuesto a actualizar
   * @param presupuesto Datos parciales a actualizar
   * @returns Presupuesto actualizado
   */
  actualizarPresupuesto(id: number, presupuesto: Partial<Presupuesto>): Promise<Presupuesto>;
  
  /**
   * Registra un gasto en un presupuesto
   * @param id ID del presupuesto
   * @param gasto Datos del gasto a registrar
   * @returns Presupuesto actualizado con el gasto registrado
   */
  registrarGasto(id: number, gasto: RegistrarGastoDTO): Promise<Presupuesto>;
}