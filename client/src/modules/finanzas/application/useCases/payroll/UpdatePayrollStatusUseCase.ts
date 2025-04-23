import { Payroll } from "@shared/schema";
import { PayrollService } from "../../../domain/services";

/**
 * Caso de uso para actualizar el estado de una nómina
 */
export class UpdatePayrollStatusUseCase {
  constructor(private payrollService: PayrollService) {}

  /**
   * Ejecuta el caso de uso para actualizar el estado de una nómina
   * @param id ID de la nómina
   * @param status Nuevo estado de la nómina
   * @returns Promise con la nómina actualizada o undefined si no existe
   */
  async execute(id: number, status: string): Promise<Payroll | undefined> {
    return this.payrollService.updatePayrollStatus(id, status);
  }
}