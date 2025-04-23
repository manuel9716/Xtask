import { Budget, InsertBudget } from "@shared/schema";
import { BudgetRepository } from "../../domain/repositories";
import { financeApiClient } from "../api/financeApiClient";

/**
 * Implementación del repositorio de presupuestos que utiliza la API REST
 * para acceder a los datos de presupuestos.
 */
export class ApiBudgetRepository implements BudgetRepository {
  /**
   * Obtiene todos los presupuestos.
   */
  async getAllBudgets(filters?: Partial<{
    organizationId: number;
    departmentId?: number;
    projectId?: number;
    startDate?: Date;
    endDate?: Date;
    status?: string;
  }>): Promise<Budget[]> {
    return financeApiClient.getBudgets(filters);
  }

  /**
   * Obtiene un presupuesto por su ID.
   */
  async getBudgetById(id: number): Promise<Budget | undefined> {
    try {
      return await financeApiClient.getBudgetById(id);
    } catch (error) {
      if ((error as any).status === 404) {
        return undefined;
      }
      throw error;
    }
  }

  /**
   * Crea un nuevo presupuesto.
   */
  async createBudget(budget: InsertBudget): Promise<Budget> {
    return financeApiClient.createBudget(budget);
  }

  /**
   * Actualiza un presupuesto existente.
   */
  async updateBudget(id: number, budget: Partial<Budget>): Promise<Budget | undefined> {
    try {
      return await financeApiClient.updateBudget(id, budget);
    } catch (error) {
      if ((error as any).status === 404) {
        return undefined;
      }
      throw error;
    }
  }

  /**
   * Elimina un presupuesto.
   */
  async deleteBudget(id: number): Promise<boolean> {
    try {
      const result = await financeApiClient.deleteBudget(id);
      return result.success === true;
    } catch (error) {
      if ((error as any).status === 404) {
        return false;
      }
      throw error;
    }
  }

  /**
   * Calcula el porcentaje de ejecución de un presupuesto.
   */
  async calculateBudgetExecutionPercentage(id: number): Promise<number> {
    const result = await financeApiClient.calculateBudgetExecution(id);
    return result.percentage;
  }

  /**
   * Verifica si un gasto excede el presupuesto.
   */
  async checkBudgetOverspending(budgetId: number, amount: number): Promise<boolean> {
    const result = await financeApiClient.validateBudgetExpense(budgetId, amount);
    return !result.valid; // Si no es válido, es porque excede el presupuesto
  }
}