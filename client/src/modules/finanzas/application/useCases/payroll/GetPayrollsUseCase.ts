import { Payroll } from "@shared/schema";
import { PayrollService } from "../../../domain/services";

/**
 * Caso de uso para obtener todas las nóminas
 */
export class GetPayrollsUseCase {
  constructor(private payrollService: PayrollService) {}

  /**
   * Ejecuta el caso de uso para obtener todas las nóminas
   * @param filters Filtros opcionales para la consulta
   * @returns Promise con la lista de nóminas
   */
  async execute(filters?: Partial<{
    employeeId?: number;
    status?: string;
    periodStart?: Date;
    periodEnd?: Date;
  }>): Promise<Payroll[]> {
    return this.payrollService.getAllPayrolls(filters);
  }
}