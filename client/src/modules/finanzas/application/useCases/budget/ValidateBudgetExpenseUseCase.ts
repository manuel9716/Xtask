import { BudgetService } from "../../../domain/services";

/**
 * Caso de uso para validar si un gasto excede un presupuesto
 */
export class ValidateBudgetExpenseUseCase {
  constructor(private budgetService: BudgetService) {}

  /**
   * Ejecuta el caso de uso para validar si un gasto excede un presupuesto
   * @param budgetId ID del presupuesto
   * @param amount Monto del gasto a validar
   * @returns Promise con un booleano que indica si el gasto excede el presupuesto
   */
  async execute(budgetId: number, amount: number): Promise<boolean> {
    return this.budgetService.checkBudgetOverspending(budgetId, amount);
  }
}