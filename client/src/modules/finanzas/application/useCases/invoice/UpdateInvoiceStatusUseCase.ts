import { Invoice } from "@shared/schema";
import { InvoiceService } from "../../../domain/services";

/**
 * Caso de uso para actualizar el estado de una factura
 */
export class UpdateInvoiceStatusUseCase {
  constructor(private invoiceService: InvoiceService) {}

  /**
   * Ejecuta el caso de uso para actualizar el estado de una factura
   * @param id ID de la factura
   * @param status Nuevo estado de la factura
   * @returns Promise con la factura actualizada o undefined si no existe
   */
  async execute(id: number, status: string): Promise<Invoice | undefined> {
    return this.invoiceService.updateInvoiceStatus(id, status);
  }
}