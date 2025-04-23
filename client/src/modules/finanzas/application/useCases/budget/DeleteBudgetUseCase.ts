import { BudgetService } from "../../../domain/services";

/**
 * Caso de uso para eliminar un presupuesto
 */
export class DeleteBudgetUseCase {
  constructor(private budgetService: BudgetService) {}

  /**
   * Ejecuta el caso de uso para eliminar un presupuesto
   * @param id ID del presupuesto a eliminar
   * @returns Promise con un booleano que indica si la eliminación fue exitosa
   */
  async execute(id: number): Promise<boolean> {
    return this.budgetService.deleteBudget(id);
  }
}