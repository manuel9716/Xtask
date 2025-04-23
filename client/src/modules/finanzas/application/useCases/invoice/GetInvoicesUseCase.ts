import { Invoice } from "@shared/schema";
import { InvoiceService } from "../../../domain/services";

/**
 * Caso de uso para obtener todas las facturas
 */
export class GetInvoicesUseCase {
  constructor(private invoiceService: InvoiceService) {}

  /**
   * Ejecuta el caso de uso para obtener todas las facturas
   * @param filters Filtros opcionales para la consulta
   * @returns Promise con la lista de facturas
   */
  async execute(filters?: Partial<{
    clientId?: number;
    status?: string;
    issueDate?: Date;
    dueDate?: Date;
    isOverdue?: boolean;
  }>): Promise<Invoice[]> {
    return this.invoiceService.getAllInvoices(filters);
  }
}