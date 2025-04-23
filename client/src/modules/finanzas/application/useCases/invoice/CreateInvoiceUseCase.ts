import { Invoice, InsertInvoice, InsertInvoiceItem } from "@shared/schema";
import { InvoiceService } from "../../../domain/services";

/**
 * Caso de uso para crear una nueva factura
 */
export class CreateInvoiceUseCase {
  constructor(private invoiceService: InvoiceService) {}

  /**
   * Ejecuta el caso de uso para crear una nueva factura
   * @param invoiceData Datos de la factura a crear
   * @param items Ítems de la factura
   * @returns Promise con la factura creada
   */
  async execute(invoiceData: InsertInvoice, items: InsertInvoiceItem[]): Promise<Invoice> {
    return this.invoiceService.createInvoice(invoiceData, items);
  }
}