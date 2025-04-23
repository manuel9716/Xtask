import { Budget } from "@shared/schema";
import { BudgetService } from "../../../domain/services";

/**
 * Caso de uso para obtener un presupuesto por su ID
 */
export class GetBudgetByIdUseCase {
  constructor(private budgetService: BudgetService) {}

  /**
   * Ejecuta el caso de uso para obtener un presupuesto por su ID
   * @param id ID del presupuesto a consultar
   * @returns Promise con el presupuesto encontrado o undefined si no existe
   */
  async execute(id: number): Promise<Budget | undefined> {
    return this.budgetService.getBudgetById(id);
  }
}