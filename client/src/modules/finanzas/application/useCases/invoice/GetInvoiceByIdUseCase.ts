import { Invoice } from "@shared/schema";
import { InvoiceService } from "../../../domain/services";

/**
 * Caso de uso para obtener una factura por su ID
 */
export class GetInvoiceByIdUseCase {
  constructor(private invoiceService: InvoiceService) {}

  /**
   * Ejecuta el caso de uso para obtener una factura por su ID
   * @param id ID de la factura a consultar
   * @returns Promise con la factura encontrada o undefined si no existe
   */
  async execute(id: number): Promise<Invoice | undefined> {
    return this.invoiceService.getInvoiceById(id);
  }
}