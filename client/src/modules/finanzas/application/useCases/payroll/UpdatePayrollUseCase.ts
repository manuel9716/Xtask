import { Payroll } from "@shared/schema";
import { PayrollService } from "../../../domain/services";

/**
 * Caso de uso para actualizar una nómina existente
 */
export class UpdatePayrollUseCase {
  constructor(private payrollService: PayrollService) {}

  /**
   * Ejecuta el caso de uso para actualizar una nómina
   * @param id ID de la nómina a actualizar
   * @param payrollData Datos actualizados de la nómina
   * @returns Promise con la nómina actualizada o undefined si no existe
   */
  async execute(id: number, payrollData: Partial<Payroll>): Promise<Payroll | undefined> {
    return this.payrollService.updatePayroll(id, payrollData);
  }
}