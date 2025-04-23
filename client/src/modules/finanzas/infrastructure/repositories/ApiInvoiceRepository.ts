import { Invoice, InsertInvoice, InvoiceItem, InsertInvoiceItem } from "@shared/schema";
import { InvoiceRepository } from "../../domain/repositories";
import { financeApiClient } from "../api/financeApiClient";

/**
 * Implementación del repositorio de facturas que utiliza la API REST
 * para acceder a los datos de facturas.
 */
export class ApiInvoiceRepository implements InvoiceRepository {
  /**
   * Obtiene todas las facturas.
   */
  async getAllInvoices(filters?: Partial<{
    clientId?: number;
    status?: string;
    issueDate?: Date;
    dueDate?: Date;
    isOverdue?: boolean;
  }>): Promise<Invoice[]> {
    return financeApiClient.getInvoices(filters);
  }

  /**
   * Obtiene una factura por su ID.
   */
  async getInvoiceById(id: number): Promise<Invoice | undefined> {
    try {
      return await financeApiClient.getInvoiceById(id);
    } catch (error) {
      if ((error as any).status === 404) {
        return undefined;
      }
      throw error;
    }
  }

  /**
   * Crea una nueva factura.
   */
  async createInvoice(invoice: InsertInvoice, items: InsertInvoiceItem[]): Promise<Invoice> {
    // Enviar factura con items en un solo objeto para la API
    return financeApiClient.createInvoice({
      invoice,
      items
    });
  }

  /**
   * Actualiza una factura existente.
   */
  async updateInvoice(id: number, invoice: Partial<Invoice>): Promise<Invoice | undefined> {
    try {
      return await financeApiClient.updateInvoice(id, invoice);
    } catch (error) {
      if ((error as any).status === 404) {
        return undefined;
      }
      throw error;
    }
  }

  /**
   * Actualiza el estado de una factura.
   */
  async updateInvoiceStatus(id: number, status: string): Promise<Invoice | undefined> {
    try {
      return await financeApiClient.updateInvoiceStatus(id, status);
    } catch (error) {
      if ((error as any).status === 404) {
        return undefined;
      }
      throw error;
    }
  }

  /**
   * Registra un pago parcial o total de una factura.
   */
  async recordInvoicePayment(id: number, paymentData: {
    amount: number;
    date: Date;
    reference?: string;
  }): Promise<Invoice | undefined> {
    try {
      // Convertir fecha a formato ISO para enviarla a la API
      const paymentDataForApi = {
        ...paymentData,
        date: paymentData.date.toISOString()
      };

      return await financeApiClient.recordInvoicePayment(id, paymentDataForApi);
    } catch (error) {
      if ((error as any).status === 404) {
        return undefined;
      }
      throw error;
    }
  }

  /**
   * Obtiene todos los ítems de una factura.
   */
  async getInvoiceItems(invoiceId: number): Promise<InvoiceItem[]> {
    return financeApiClient.getInvoiceItems(invoiceId);
  }

  /**
   * Genera un PDF de la factura.
   */
  async generateInvoicePDF(id: number): Promise<string> {
    const result = await financeApiClient.generateInvoicePDF(id);
    return result.fileUrl;
  }

  /**
   * Envía la factura por correo electrónico.
   */
  async sendInvoiceByEmail(id: number, emailData: {
    recipientEmail: string;
    subject?: string;
    message?: string;
  }): Promise<boolean> {
    const result = await financeApiClient.sendInvoiceByEmail(id, emailData);
    return result.success === true;
  }

  /**
   * Obtiene las facturas vencidas o próximas a vencer.
   */
  async getOverdueOrSoonDueInvoices(daysThreshold: number): Promise<Invoice[]> {
    return financeApiClient.getOverdueOrSoonDueInvoices(daysThreshold);
  }
}