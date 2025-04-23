import { Invoice } from "@shared/schema";
import { InvoiceService } from "../../../domain/services";

/**
 * Caso de uso para registrar el pago de una factura
 */
export class RecordInvoicePaymentUseCase {
  constructor(private invoiceService: InvoiceService) {}

  /**
   * Ejecuta el caso de uso para registrar el pago de una factura
   * @param id ID de la factura
   * @param paymentData Datos del pago
   * @returns Promise con la factura actualizada o undefined si no existe
   */
  async execute(id: number, paymentData: {
    amount: number;
    date: Date;
    reference?: string;
  }): Promise<Invoice | undefined> {
    return this.invoiceService.recordInvoicePayment(id, paymentData);
  }
}