import { Invoice } from "@shared/schema";
import { InvoiceService } from "../../../domain/services";

/**
 * Caso de uso para actualizar una factura existente
 */
export class UpdateInvoiceUseCase {
  constructor(private invoiceService: InvoiceService) {}

  /**
   * Ejecuta el caso de uso para actualizar una factura
   * @param id ID de la factura a actualizar
   * @param invoiceData Datos actualizados de la factura
   * @returns Promise con la factura actualizada o undefined si no existe
   */
  async execute(id: number, invoiceData: Partial<Invoice>): Promise<Invoice | undefined> {
    return this.invoiceService.updateInvoice(id, invoiceData);
  }
}