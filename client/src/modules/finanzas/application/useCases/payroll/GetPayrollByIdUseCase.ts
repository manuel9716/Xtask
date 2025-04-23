import { Payroll } from "@shared/schema";
import { PayrollService } from "../../../domain/services";

/**
 * Caso de uso para obtener una nómina por su ID
 */
export class GetPayrollByIdUseCase {
  constructor(private payrollService: PayrollService) {}

  /**
   * Ejecuta el caso de uso para obtener una nómina por su ID
   * @param id ID de la nómina a consultar
   * @returns Promise con la nómina encontrada o undefined si no existe
   */
  async execute(id: number): Promise<Payroll | undefined> {
    return this.payrollService.getPayrollById(id);
  }
}