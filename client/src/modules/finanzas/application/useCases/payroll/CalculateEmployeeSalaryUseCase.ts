import { PayrollService } from "../../../domain/services";

/**
 * Caso de uso para calcular el salario de un empleado con deducciones y beneficios
 */
export class CalculateEmployeeSalaryUseCase {
  constructor(private payrollService: PayrollService) {}

  /**
   * Ejecuta el caso de uso para calcular el salario de un empleado
   * @param employeeId ID del empleado
   * @param periodStart Fecha de inicio del período
   * @param periodEnd Fecha de fin del período
   * @returns Promise con los detalles del cálculo del salario
   */
  async execute(employeeId: number, periodStart: Date, periodEnd: Date): Promise<{
    grossSalary: number;
    netSalary: number;
    deductions: number;
    benefits: number;
    taxes: number;
    calculationDetails: any;
  }> {
    return this.payrollService.calculateEmployeeSalary(employeeId, periodStart, periodEnd);
  }
}