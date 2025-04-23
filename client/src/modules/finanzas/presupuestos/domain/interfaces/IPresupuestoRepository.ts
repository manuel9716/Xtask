import { Presupuesto, CrearPresupuestoDTO, RegistrarGastoDTO } from '../entities/Presupuesto';

/**
 * Interfaz que define las operaciones del repositorio de presupuestos
 * siguiendo el patrón de arquitectura hexagonal
 */
export interface IPresupuestoRepository {
  /**
   * Obtiene la lista de presupuestos (opcional filtrado por organización)
   * @param organizationId ID de la organización (opcional)
   * @returns Promesa con array de presupuestos
   */
  listarPresupuestos(organizationId?: number): Promise<Presupuesto[]>;

  /**
   * Obtiene un presupuesto por su ID
   * @param id ID del presupuesto
   * @returns Promesa con el presupuesto encontrado o undefined
   */
  obtenerPresupuestoPorId(id: number): Promise<Presupuesto | undefined>;

  /**
   * Crea un nuevo presupuesto
   * @param presupuestoDto Datos del presupuesto a crear
   * @returns Promesa con el presupuesto creado
   */
  crearPresupuesto(presupuestoDto: CrearPresupuestoDTO): Promise<Presupuesto>;

  /**
   * Actualiza un presupuesto existente
   * @param id ID del presupuesto
   * @param presupuestoPartial Datos parciales para actualizar
   * @returns Promesa con el presupuesto actualizado
   */
  actualizarPresupuesto(id: number, presupuestoPartial: Partial<Presupuesto>): Promise<Presupuesto>;

  /**
   * Registra un gasto en un presupuesto
   * @param id ID del presupuesto
   * @param gasto Datos del gasto a registrar
   * @returns Promesa con el presupuesto actualizado
   */
  registrarGasto(id: number, gasto: RegistrarGastoDTO): Promise<Presupuesto>;
}