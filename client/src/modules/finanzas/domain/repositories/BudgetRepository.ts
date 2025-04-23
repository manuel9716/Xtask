import { Budget, InsertBudget } from "@shared/schema";

/**
 * Interfaz para el repositorio de presupuestos siguiendo el patrón de arquitectura hexagonal.
 * Esta interfaz define los métodos que debe implementar cualquier adaptador de infraestructura
 * que quiera proporcionar acceso a los datos de presupuestos.
 */
export interface BudgetRepository {
  /**
   * Obtiene todos los presupuestos.
   * @param filters Filtros opcionales para la consulta.
   * @returns Promise con la lista de presupuestos.
   */
  getAllBudgets(filters?: Partial<{
    organizationId: number;
    departmentId?: number;
    projectId?: number;
    startDate?: Date;
    endDate?: Date;
    status?: string;
  }>): Promise<Budget[]>;

  /**
   * Obtiene un presupuesto por su ID.
   * @param id ID del presupuesto a obtener.
   * @returns Promise con el presupuesto o undefined si no existe.
   */
  getBudgetById(id: number): Promise<Budget | undefined>;

  /**
   * Crea un nuevo presupuesto.
   * @param budget Datos del presupuesto a crear.
   * @returns Promise con el presupuesto creado.
   */
  createBudget(budget: InsertBudget): Promise<Budget>;

  /**
   * Actualiza un presupuesto existente.
   * @param id ID del presupuesto a actualizar.
   * @param budget Datos del presupuesto a actualizar.
   * @returns Promise con el presupuesto actualizado o undefined si no existe.
   */
  updateBudget(id: number, budget: Partial<Budget>): Promise<Budget | undefined>;

  /**
   * Elimina un presupuesto.
   * @param id ID del presupuesto a eliminar.
   * @returns Promise con un booleano indicando si se eliminó correctamente.
   */
  deleteBudget(id: number): Promise<boolean>;

  /**
   * Calcula el porcentaje de ejecución de un presupuesto.
   * @param id ID del presupuesto.
   * @returns Promise con el porcentaje de ejecución.
   */
  calculateBudgetExecutionPercentage(id: number): Promise<number>;

  /**
   * Verifica si un gasto excede el presupuesto.
   * @param budgetId ID del presupuesto a verificar.
   * @param amount Monto del gasto a validar.
   * @returns Promise con un booleano indicando si excede el presupuesto.
   */
  checkBudgetOverspending(budgetId: number, amount: number): Promise<boolean>;
}