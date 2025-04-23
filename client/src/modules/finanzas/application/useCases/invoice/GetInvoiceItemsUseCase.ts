import { InvoiceItem } from "@shared/schema";
import { InvoiceService } from "../../../domain/services";

/**
 * Caso de uso para obtener los ítems de una factura
 */
export class GetInvoiceItemsUseCase {
  constructor(private invoiceService: InvoiceService) {}

  /**
   * Ejecuta el caso de uso para obtener los ítems de una factura
   * @param invoiceId ID de la factura
   * @returns Promise con la lista de ítems de la factura
   */
  async execute(invoiceId: number): Promise<InvoiceItem[]> {
    return this.invoiceService.getInvoiceItems(invoiceId);
  }
}