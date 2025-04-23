import { Budget } from "@shared/schema";
import { BudgetService } from "../../../domain/services";

/**
 * Caso de uso para obtener todos los presupuestos
 */
export class GetBudgetsUseCase {
  constructor(private budgetService: BudgetService) {}

  /**
   * Ejecuta el caso de uso para obtener todos los presupuestos
   * @param filters Filtros opcionales para la consulta
   * @returns Promise con la lista de presupuestos
   */
  async execute(filters?: Partial<{
    organizationId: number;
    departmentId?: number;
    projectId?: number;
    startDate?: Date;
    endDate?: Date;
    status?: string;
  }>): Promise<Budget[]> {
    return this.budgetService.getAllBudgets(filters);
  }
}