import { Budget, InsertBudget } from "@shared/schema";
import { BudgetService } from "../../../domain/services";

/**
 * Caso de uso para crear un nuevo presupuesto
 */
export class CreateBudgetUseCase {
  constructor(private budgetService: BudgetService) {}

  /**
   * Ejecuta el caso de uso para crear un nuevo presupuesto
   * @param budgetData Datos del presupuesto a crear
   * @returns Promise con el presupuesto creado
   */
  async execute(budgetData: InsertBudget): Promise<Budget> {
    return this.budgetService.createBudget(budgetData);
  }
}