import { BudgetService } from "../../../domain/services";

/**
 * Caso de uso para calcular el porcentaje de ejecución de un presupuesto
 */
export class CalculateBudgetExecutionUseCase {
  constructor(private budgetService: BudgetService) {}

  /**
   * Ejecuta el caso de uso para calcular el porcentaje de ejecución de un presupuesto
   * @param id ID del presupuesto
   * @returns Promise con el porcentaje de ejecución
   */
  async execute(id: number): Promise<number> {
    return this.budgetService.calculateBudgetExecution(id);
  }
}