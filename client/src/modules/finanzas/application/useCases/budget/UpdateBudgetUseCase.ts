import { Budget } from "@shared/schema";
import { BudgetService } from "../../../domain/services";

/**
 * Caso de uso para actualizar un presupuesto existente
 */
export class UpdateBudgetUseCase {
  constructor(private budgetService: BudgetService) {}

  /**
   * Ejecuta el caso de uso para actualizar un presupuesto
   * @param id ID del presupuesto a actualizar
   * @param budgetData Datos actualizados del presupuesto
   * @returns Promise con el presupuesto actualizado o undefined si no existe
   */
  async execute(id: number, budgetData: Partial<Budget>): Promise<Budget | undefined> {
    return this.budgetService.updateBudget(id, budgetData);
  }
}