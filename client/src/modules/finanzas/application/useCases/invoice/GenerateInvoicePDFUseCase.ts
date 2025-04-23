import { InvoiceService } from "../../../domain/services";

/**
 * Caso de uso para generar un PDF de una factura
 */
export class GenerateInvoicePDFUseCase {
  constructor(private invoiceService: InvoiceService) {}

  /**
   * Ejecuta el caso de uso para generar un PDF de una factura
   * @param id ID de la factura
   * @returns Promise con la URL del PDF generado
   */
  async execute(id: number): Promise<string> {
    return this.invoiceService.generateInvoicePDF(id);
  }
}