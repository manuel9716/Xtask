import { Invoice, InsertInvoice, InvoiceItem, InsertInvoiceItem } from "@shared/schema";

/**
 * Interfaz para el repositorio de facturas siguiendo el patrón de arquitectura hexagonal.
 * Esta interfaz define los métodos que debe implementar cualquier adaptador de infraestructura
 * que quiera proporcionar acceso a los datos de facturas.
 */
export interface InvoiceRepository {
  /**
   * Obtiene todas las facturas.
   * @param filters Filtros opcionales para la consulta.
   * @returns Promise con la lista de facturas.
   */
  getAllInvoices(filters?: Partial<{
    clientId?: number;
    status?: string;
    issueDate?: Date;
    dueDate?: Date;
    isOverdue?: boolean;
  }>): Promise<Invoice[]>;

  /**
   * Obtiene una factura por su ID.
   * @param id ID de la factura a obtener.
   * @returns Promise con la factura o undefined si no existe.
   */
  getInvoiceById(id: number): Promise<Invoice | undefined>;

  /**
   * Crea una nueva factura.
   * @param invoice Datos de la factura a crear.
   * @param items Items de la factura.
   * @returns Promise con la factura creada.
   */
  createInvoice(invoice: InsertInvoice, items: InsertInvoiceItem[]): Promise<Invoice>;

  /**
   * Actualiza una factura existente.
   * @param id ID de la factura a actualizar.
   * @param invoice Datos de la factura a actualizar.
   * @returns Promise con la factura actualizada o undefined si no existe.
   */
  updateInvoice(id: number, invoice: Partial<Invoice>): Promise<Invoice | undefined>;

  /**
   * Actualiza el estado de una factura.
   * @param id ID de la factura a actualizar.
   * @param status Nuevo estado (pendiente, pagada, vencida, cancelada).
   * @returns Promise con la factura actualizada o undefined si no existe.
   */
  updateInvoiceStatus(id: number, status: string): Promise<Invoice | undefined>;
  
  /**
   * Registra un pago parcial o total de una factura.
   * @param id ID de la factura.
   * @param paymentData Datos del pago (monto, fecha).
   * @returns Promise con la factura actualizada o undefined si no existe.
   */
  recordInvoicePayment(id: number, paymentData: {
    amount: number;
    date: Date;
    reference?: string;
  }): Promise<Invoice | undefined>;
  
  /**
   * Obtiene todos los ítems de una factura.
   * @param invoiceId ID de la factura.
   * @returns Promise con la lista de ítems de la factura.
   */
  getInvoiceItems(invoiceId: number): Promise<InvoiceItem[]>;
  
  /**
   * Genera un PDF de la factura.
   * @param id ID de la factura.
   * @returns Promise con la URL del archivo PDF generado.
   */
  generateInvoicePDF(id: number): Promise<string>;
  
  /**
   * Envía la factura por correo electrónico.
   * @param id ID de la factura.
   * @param emailData Datos para el envío del correo.
   * @returns Promise con un booleano indicando si se envió correctamente.
   */
  sendInvoiceByEmail(id: number, emailData: {
    recipientEmail: string;
    subject?: string;
    message?: string;
  }): Promise<boolean>;
  
  /**
   * Obtiene las facturas vencidas o próximas a vencer.
   * @param daysThreshold Número de días para considerar una factura próxima a vencer.
   * @returns Promise con la lista de facturas vencidas o próximas a vencer.
   */
  getOverdueOrSoonDueInvoices(daysThreshold: number): Promise<Invoice[]>;
}