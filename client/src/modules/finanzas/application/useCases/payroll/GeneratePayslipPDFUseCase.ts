import { PayrollService } from "../../../domain/services";

/**
 * Caso de uso para generar un PDF con el desprendible de pago
 */
export class GeneratePayslipPDFUseCase {
  constructor(private payrollService: PayrollService) {}

  /**
   * Ejecuta el caso de uso para generar un PDF con el desprendible de pago
   * @param id ID de la nómina
   * @returns Promise con la URL del PDF generado
   */
  async execute(id: number): Promise<string> {
    return this.payrollService.generatePayslipPDF(id);
  }
}