import { Invoice, InsertInvoice, InvoiceItem, InsertInvoiceItem } from "@shared/schema";
import { InvoiceRepository } from "../repositories";

/**
 * Servicio de dominio para operaciones con facturas.
 * Implementa la lógica de negocio relacionada con facturas.
 */
export class InvoiceService {
  constructor(private readonly invoiceRepository: InvoiceRepository) {}

  /**
   * Obtiene todas las facturas con filtros opcionales.
   */
  async getAllInvoices(filters?: any): Promise<Invoice[]> {
    return this.invoiceRepository.getAllInvoices(filters);
  }

  /**
   * Obtiene una factura por su ID.
   */
  async getInvoiceById(id: number): Promise<Invoice | undefined> {
    return this.invoiceRepository.getInvoiceById(id);
  }

  /**
   * Crea una nueva factura.
   */
  async createInvoice(invoice: InsertInvoice, items: InsertInvoiceItem[]): Promise<Invoice> {
    // Validar que haya al menos un ítem
    if (!items.length) {
      throw new Error('La factura debe tener al menos un ítem');
    }

    // Validar que los montos sean coherentes
    let calculatedSubtotal = 0;
    let calculatedTaxAmount = 0;
    
    for (const item of items) {
      if (Number(item.quantity) <= 0) {
        throw new Error('La cantidad de cada ítem debe ser positiva');
      }
      
      if (Number(item.unitPrice) <= 0) {
        throw new Error('El precio unitario de cada ítem debe ser positivo');
      }
      
      // Validar cálculos de cada item
      const itemSubtotal = Number(item.quantity) * Number(item.unitPrice);
      if (Math.abs(itemSubtotal - Number(item.subtotal)) > 0.01) {
        throw new Error('El subtotal del ítem no coincide con la cantidad por el precio unitario');
      }
      
      const itemTaxAmount = Number(item.subtotal) * (Number(item.taxRate) / 100);
      if (Math.abs(itemTaxAmount - Number(item.taxAmount)) > 0.01) {
        throw new Error('El monto de impuestos del ítem no coincide con el subtotal por la tasa de impuestos');
      }
      
      const itemTotal = Number(item.subtotal) + Number(item.taxAmount);
      if (Math.abs(itemTotal - Number(item.totalAmount)) > 0.01) {
        throw new Error('El monto total del ítem no coincide con el subtotal más los impuestos');
      }
      
      calculatedSubtotal += Number(item.subtotal);
      calculatedTaxAmount += Number(item.taxAmount);
    }
    
    // Validar que los totales de la factura coincidan con los totales calculados
    if (Math.abs(calculatedSubtotal - Number(invoice.subtotal)) > 0.01) {
      throw new Error('El subtotal de la factura no coincide con la suma de los subtotales de los ítems');
    }
    
    if (Math.abs(calculatedTaxAmount - Number(invoice.taxAmount)) > 0.01) {
      throw new Error('El monto de impuestos de la factura no coincide con la suma de los impuestos de los ítems');
    }
    
    const calculatedTotal = calculatedSubtotal + calculatedTaxAmount;
    if (Math.abs(calculatedTotal - Number(invoice.totalAmount)) > 0.01) {
      throw new Error('El monto total de la factura no coincide con el subtotal más los impuestos');
    }

    // Validar que la fecha de vencimiento sea posterior a la fecha de emisión
    if (new Date(invoice.dueDate) <= new Date(invoice.issueDate)) {
      throw new Error('La fecha de vencimiento debe ser posterior a la fecha de emisión');
    }

    return this.invoiceRepository.createInvoice(invoice, items);
  }

  /**
   * Actualiza una factura existente.
   */
  async updateInvoice(id: number, invoice: Partial<Invoice>): Promise<Invoice | undefined> {
    // Validar que la factura existe
    const existingInvoice = await this.invoiceRepository.getInvoiceById(id);
    if (!existingInvoice) {
      throw new Error(`La factura con ID ${id} no existe`);
    }

    // No permitir cambios si el estado es "paid" o "cancelled"
    if (existingInvoice.status === 'paid' || existingInvoice.status === 'cancelled') {
      throw new Error(`No se puede modificar una factura con estado ${existingInvoice.status}`);
    }

    // Validar fechas consistentes si se están actualizando
    if (invoice.issueDate && invoice.dueDate) {
      if (new Date(invoice.dueDate) <= new Date(invoice.issueDate)) {
        throw new Error('La fecha de vencimiento debe ser posterior a la fecha de emisión');
      }
    } else if (invoice.issueDate && !invoice.dueDate) {
      if (new Date(invoice.issueDate) >= new Date(existingInvoice.dueDate)) {
        throw new Error('La fecha de emisión debe ser anterior a la fecha de vencimiento existente');
      }
    } else if (!invoice.issueDate && invoice.dueDate) {
      if (new Date(invoice.dueDate) <= new Date(existingInvoice.issueDate)) {
        throw new Error('La fecha de vencimiento debe ser posterior a la fecha de emisión existente');
      }
    }

    return this.invoiceRepository.updateInvoice(id, invoice);
  }

  /**
   * Actualiza el estado de una factura.
   */
  async updateInvoiceStatus(id: number, status: string): Promise<Invoice | undefined> {
    // Validar estados válidos
    const validStatuses = ['pending', 'paid', 'overdue', 'cancelled'];
    if (!validStatuses.includes(status)) {
      throw new Error(`Estado inválido: ${status}. Los estados válidos son: ${validStatuses.join(', ')}`);
    }

    // Validar que la factura existe
    const existingInvoice = await this.invoiceRepository.getInvoiceById(id);
    if (!existingInvoice) {
      throw new Error(`La factura con ID ${id} no existe`);
    }

    // Validar transiciones de estado válidas
    const validTransitions: Record<string, string[]> = {
      'pending': ['paid', 'overdue', 'cancelled'],
      'overdue': ['paid', 'cancelled'],
      'paid': ['cancelled'], // En algunos casos se podría permitir anular un pago
      'cancelled': []
    };

    if (!validTransitions[existingInvoice.status].includes(status)) {
      throw new Error(`Transición de estado inválida: de ${existingInvoice.status} a ${status}`);
    }

    return this.invoiceRepository.updateInvoiceStatus(id, status);
  }

  /**
   * Registra un pago de factura.
   */
  async recordInvoicePayment(id: number, paymentData: {
    amount: number;
    date: Date;
    reference?: string;
  }): Promise<Invoice | undefined> {
    // Validar que la factura existe
    const existingInvoice = await this.invoiceRepository.getInvoiceById(id);
    if (!existingInvoice) {
      throw new Error(`La factura con ID ${id} no existe`);
    }

    // Validar que la factura no esté cancelada
    if (existingInvoice.status === 'cancelled') {
      throw new Error('No se puede registrar un pago en una factura cancelada');
    }

    // Validar que el monto del pago sea positivo
    if (paymentData.amount <= 0) {
      throw new Error('El monto del pago debe ser positivo');
    }

    // Validar que el monto no exceda el saldo pendiente
    const pendingAmount = Number(existingInvoice.totalAmount) - Number(existingInvoice.paidAmount);
    if (paymentData.amount > pendingAmount) {
      throw new Error(`El monto del pago (${paymentData.amount}) excede el saldo pendiente (${pendingAmount})`);
    }

    const invoice = await this.invoiceRepository.recordInvoicePayment(id, paymentData);
    
    // Si el pago cubre el total, actualizar el estado a "paid"
    if (invoice && Number(invoice.paidAmount) >= Number(invoice.totalAmount)) {
      await this.invoiceRepository.updateInvoiceStatus(id, 'paid');
    }
    
    return invoice;
  }

  /**
   * Obtiene los ítems de una factura.
   */
  async getInvoiceItems(invoiceId: number): Promise<InvoiceItem[]> {
    return this.invoiceRepository.getInvoiceItems(invoiceId);
  }

  /**
   * Genera un PDF de la factura.
   */
  async generateInvoicePDF(id: number): Promise<string> {
    // Validar que la factura existe
    const existingInvoice = await this.invoiceRepository.getInvoiceById(id);
    if (!existingInvoice) {
      throw new Error(`La factura con ID ${id} no existe`);
    }

    return this.invoiceRepository.generateInvoicePDF(id);
  }

  /**
   * Envía la factura por correo electrónico.
   */
  async sendInvoiceByEmail(id: number, emailData: {
    recipientEmail: string;
    subject?: string;
    message?: string;
  }): Promise<boolean> {
    // Validar que la factura existe
    const existingInvoice = await this.invoiceRepository.getInvoiceById(id);
    if (!existingInvoice) {
      throw new Error(`La factura con ID ${id} no existe`);
    }

    // Validar formato de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(emailData.recipientEmail)) {
      throw new Error('El formato del email del destinatario no es válido');
    }

    return this.invoiceRepository.sendInvoiceByEmail(id, emailData);
  }

  /**
   * Obtiene las facturas vencidas o próximas a vencer.
   */
  async getOverdueOrSoonDueInvoices(daysThreshold: number = 7): Promise<Invoice[]> {
    return this.invoiceRepository.getOverdueOrSoonDueInvoices(daysThreshold);
  }

  /**
   * Actualiza automáticamente las facturas vencidas.
   */
  async updateOverdueInvoices(): Promise<number> {
    // Obtener todas las facturas pendientes
    const pendingInvoices = await this.invoiceRepository.getAllInvoices({ status: 'pending' });
    
    let updatedCount = 0;
    const today = new Date();
    
    for (const invoice of pendingInvoices) {
      const dueDate = new Date(invoice.dueDate);
      
      // Si la fecha de vencimiento es anterior a hoy, marcar como vencida
      if (dueDate < today) {
        await this.invoiceRepository.updateInvoiceStatus(invoice.id, 'overdue');
        updatedCount++;
      }
    }
    
    return updatedCount;
  }

  /**
   * Calcula las estadísticas de facturación.
   */
  async getInvoiceStatistics(startDate: Date, endDate: Date): Promise<{
    totalInvoiced: number;
    totalPaid: number;
    totalPending: number;
    totalOverdue: number;
    invoiceCount: number;
    averageInvoiceAmount: number;
  }> {
    const invoices = await this.invoiceRepository.getAllInvoices({
      issueDate: startDate,
      // No pasamos endDate como filtro para poder filtrar después, ya que el repositorio
      // podría interpretar los dos como una intersección (startDate AND endDate)
    });
    
    // Filtrar por fecha de fin
    const filteredInvoices = invoices.filter(
      invoice => new Date(invoice.issueDate) <= endDate
    );
    
    let totalInvoiced = 0;
    let totalPaid = 0;
    let totalPending = 0;
    let totalOverdue = 0;
    
    for (const invoice of filteredInvoices) {
      const amount = Number(invoice.totalAmount);
      totalInvoiced += amount;
      
      if (invoice.status === 'paid') {
        totalPaid += amount;
      } else if (invoice.status === 'pending') {
        totalPending += amount;
      } else if (invoice.status === 'overdue') {
        totalOverdue += amount;
      }
    }
    
    return {
      totalInvoiced,
      totalPaid,
      totalPending,
      totalOverdue,
      invoiceCount: filteredInvoices.length,
      averageInvoiceAmount: filteredInvoices.length 
        ? totalInvoiced / filteredInvoices.length 
        : 0
    };
  }
}