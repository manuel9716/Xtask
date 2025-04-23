import { Invoice } from "@shared/schema";
import { InvoiceService } from "../../../domain/services";

/**
 * Caso de uso para obtener las facturas vencidas o próximas a vencer
 */
export class GetOverdueInvoicesUseCase {
  constructor(private invoiceService: InvoiceService) {}

  /**
   * Ejecuta el caso de uso para obtener las facturas vencidas o próximas a vencer
   * @param daysThreshold Número de días para considerar una factura próxima a vencer
   * @returns Promise con la lista de facturas vencidas o próximas a vencer
   */
  async execute(daysThreshold: number = 7): Promise<Invoice[]> {
    return this.invoiceService.getOverdueOrSoonDueInvoices(daysThreshold);
  }
}