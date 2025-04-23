import { InvoiceService } from "../../../domain/services";

/**
 * Caso de uso para enviar una factura por correo electrónico
 */
export class SendInvoiceByEmailUseCase {
  constructor(private invoiceService: InvoiceService) {}

  /**
   * Ejecuta el caso de uso para enviar una factura por correo electrónico
   * @param id ID de la factura
   * @param emailData Datos del correo electrónico
   * @returns Promise con un booleano que indica si el envío fue exitoso
   */
  async execute(id: number, emailData: {
    recipientEmail: string;
    subject?: string;
    message?: string;
  }): Promise<boolean> {
    return this.invoiceService.sendInvoiceByEmail(id, emailData);
  }
}