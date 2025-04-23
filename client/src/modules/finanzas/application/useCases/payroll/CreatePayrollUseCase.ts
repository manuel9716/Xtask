import { Payroll, InsertPayroll } from "@shared/schema";
import { PayrollService } from "../../../domain/services";

/**
 * Caso de uso para crear una nueva nómina
 */
export class CreatePayrollUseCase {
  constructor(private payrollService: PayrollService) {}

  /**
   * Ejecuta el caso de uso para crear una nueva nómina
   * @param payrollData Datos de la nómina a crear
   * @returns Promise con la nómina creada
   */
  async execute(payrollData: InsertPayroll): Promise<Payroll> {
    return this.payrollService.createPayroll(payrollData);
  }
}