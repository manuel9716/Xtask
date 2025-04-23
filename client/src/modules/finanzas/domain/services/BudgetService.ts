import { Budget, InsertBudget } from "@shared/schema";
import { BudgetRepository } from "../repositories";

/**
 * Servicio de dominio para operaciones con presupuestos.
 * Implementa la lógica de negocio relacionada con presupuestos.
 */
export class BudgetService {
  constructor(private readonly budgetRepository: BudgetRepository) {}

  /**
   * Obtiene todos los presupuestos con filtros opcionales.
   */
  async getAllBudgets(filters?: any): Promise<Budget[]> {
    return this.budgetRepository.getAllBudgets(filters);
  }

  /**
   * Obtiene un presupuesto por su ID.
   */
  async getBudgetById(id: number): Promise<Budget | undefined> {
    return this.budgetRepository.getBudgetById(id);
  }

  /**
   * Crea un nuevo presupuesto.
   */
  async createBudget(budget: InsertBudget): Promise<Budget> {
    // Validar que el monto sea positivo
    if (Number(budget.amount) <= 0) {
      throw new Error('El monto del presupuesto debe ser positivo');
    }

    // Validar que la fecha de fin sea posterior a la fecha de inicio
    if (new Date(budget.endDate) <= new Date(budget.startDate)) {
      throw new Error('La fecha de fin debe ser posterior a la fecha de inicio');
    }

    return this.budgetRepository.createBudget(budget);
  }

  /**
   * Actualiza un presupuesto existente.
   */
  async updateBudget(id: number, budget: Partial<Budget>): Promise<Budget | undefined> {
    // Validar que el presupuesto existe
    const existingBudget = await this.budgetRepository.getBudgetById(id);
    if (!existingBudget) {
      throw new Error(`El presupuesto con ID ${id} no existe`);
    }

    // Validar que el monto sea positivo si se está actualizando
    if (budget.amount !== undefined && Number(budget.amount) <= 0) {
      throw new Error('El monto del presupuesto debe ser positivo');
    }

    // Validar fechas consistentes si se están actualizando
    if (budget.startDate && budget.endDate) {
      if (new Date(budget.endDate) <= new Date(budget.startDate)) {
        throw new Error('La fecha de fin debe ser posterior a la fecha de inicio');
      }
    } else if (budget.startDate && !budget.endDate) {
      if (new Date(budget.startDate) >= new Date(existingBudget.endDate)) {
        throw new Error('La fecha de inicio debe ser anterior a la fecha de fin existente');
      }
    } else if (!budget.startDate && budget.endDate) {
      if (new Date(budget.endDate) <= new Date(existingBudget.startDate)) {
        throw new Error('La fecha de fin debe ser posterior a la fecha de inicio existente');
      }
    }

    return this.budgetRepository.updateBudget(id, budget);
  }

  /**
   * Elimina un presupuesto.
   */
  async deleteBudget(id: number): Promise<boolean> {
    // Validar que el presupuesto existe
    const existingBudget = await this.budgetRepository.getBudgetById(id);
    if (!existingBudget) {
      throw new Error(`El presupuesto con ID ${id} no existe`);
    }

    // Se podría agregar lógica adicional para validar que no hay transacciones asociadas
    
    return this.budgetRepository.deleteBudget(id);
  }

  /**
   * Calcula el porcentaje de ejecución de un presupuesto.
   */
  async calculateBudgetExecutionPercentage(id: number): Promise<number> {
    return this.budgetRepository.calculateBudgetExecutionPercentage(id);
  }

  /**
   * Verifica si un gasto excede el presupuesto, aplicando las reglas de negocio.
   */
  async validateExpense(budgetId: number, amount: number): Promise<{
    valid: boolean;
    message?: string;
    details?: {
      budgetAmount: number;
      currentUsage: number;
      newTotal: number;
      remainingAfter: number;
      percentUsedAfter: number;
    };
  }> {
    // Obtener información del presupuesto
    const budget = await this.budgetRepository.getBudgetById(budgetId);
    if (!budget) {
      throw new Error(`El presupuesto con ID ${budgetId} no existe`);
    }

    // Verificar si excede el presupuesto
    const willExceed = await this.budgetRepository.checkBudgetOverspending(budgetId, amount);
    
    // Obtener el porcentaje de ejecución actual
    const currentPercentage = await this.budgetRepository.calculateBudgetExecutionPercentage(budgetId);
    
    // Calcular el porcentaje que representaría este nuevo gasto
    const currentUsage = (currentPercentage / 100) * Number(budget.amount);
    const newTotal = currentUsage + amount;
    const percentUsedAfter = (newTotal / Number(budget.amount)) * 100;
    const remainingAfter = Number(budget.amount) - newTotal;

    const details = {
      budgetAmount: Number(budget.amount),
      currentUsage,
      newTotal,
      remainingAfter,
      percentUsedAfter
    };

    if (willExceed) {
      return {
        valid: false,
        message: `El gasto de ${amount} excede el presupuesto disponible.`,
        details
      };
    }

    // Alertar si el gasto supera un umbral (p.ej., 80% del presupuesto)
    if (percentUsedAfter > 80 && percentUsedAfter <= 100) {
      return {
        valid: true,
        message: `Advertencia: Este gasto llevará el presupuesto al ${percentUsedAfter.toFixed(2)}% de su utilización.`,
        details
      };
    }

    return {
      valid: true,
      details
    };
  }

  /**
   * Obtiene presupuestos por centro de costo (departamento).
   */
  async getBudgetsByDepartment(departmentId: number): Promise<Budget[]> {
    return this.budgetRepository.getAllBudgets({ departmentId });
  }

  /**
   * Obtiene presupuestos por proyecto.
   */
  async getBudgetsByProject(projectId: number): Promise<Budget[]> {
    return this.budgetRepository.getAllBudgets({ projectId });
  }

  /**
   * Obtiene presupuestos activos en un rango de fechas.
   */
  async getActiveBudgetsInDateRange(startDate: Date, endDate: Date): Promise<Budget[]> {
    return this.budgetRepository.getAllBudgets({
      startDate,
      endDate,
      status: 'active'
    });
  }
}