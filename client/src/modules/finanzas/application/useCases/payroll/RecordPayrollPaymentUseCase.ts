import { Payroll } from "@shared/schema";
import { PayrollService } from "../../../domain/services";

/**
 * Caso de uso para registrar el pago de una nómina
 */
export class RecordPayrollPaymentUseCase {
  constructor(private payrollService: PayrollService) {}

  /**
   * Ejecuta el caso de uso para registrar el pago de una nómina
   * @param id ID de la nómina
   * @param paymentData Datos del pago
   * @returns Promise con la nómina actualizada o undefined si no existe
   */
  async execute(id: number, paymentData: {
    paymentDate: Date;
    paymentMethod: string;
    paymentReference: string;
  }): Promise<Payroll | undefined> {
    return this.payrollService.recordPayrollPayment(id, paymentData);
  }
}