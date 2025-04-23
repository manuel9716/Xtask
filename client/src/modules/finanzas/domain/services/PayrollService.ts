import { Payroll, InsertPayroll, Employee } from "@shared/schema";
import { PayrollRepository } from "../repositories";

/**
 * Servicio de dominio para operaciones con nómina.
 * Implementa la lógica de negocio relacionada con nómina.
 */
export class PayrollService {
  constructor(private readonly payrollRepository: PayrollRepository) {}

  /**
   * Obtiene todos los registros de nómina con filtros opcionales.
   */
  async getAllPayrolls(filters?: any): Promise<Payroll[]> {
    return this.payrollRepository.getAllPayrolls(filters);
  }

  /**
   * Obtiene un registro de nómina por su ID.
   */
  async getPayrollById(id: number): Promise<Payroll | undefined> {
    return this.payrollRepository.getPayrollById(id);
  }

  /**
   * Crea un nuevo registro de nómina.
   */
  async createPayroll(payroll: InsertPayroll): Promise<Payroll> {
    // Validar que los montos sean coherentes
    if (Number(payroll.grossSalary) <= 0) {
      throw new Error('El salario bruto debe ser positivo');
    }
    
    if (Number(payroll.netSalary) <= 0) {
      throw new Error('El salario neto debe ser positivo');
    }
    
    if (Number(payroll.netSalary) >= Number(payroll.grossSalary)) {
      throw new Error('El salario neto debe ser menor que el salario bruto');
    }
    
    // Validar que la suma de deducciones, beneficios y taxes sea coherente
    const totalDeductions = 
      Number(payroll.deductions) + 
      Number(payroll.taxes) - 
      Number(payroll.benefits);
      
    const calculatedNetSalary = Number(payroll.grossSalary) - totalDeductions;
    
    // Permitimos una pequeña diferencia por redondeo (0.01)
    if (Math.abs(calculatedNetSalary - Number(payroll.netSalary)) > 0.01) {
      throw new Error('El salario neto no coincide con el salario bruto menos las deducciones');
    }

    // Validar que el período sea coherente
    if (new Date(payroll.periodEnd) <= new Date(payroll.periodStart)) {
      throw new Error('La fecha de fin debe ser posterior a la fecha de inicio');
    }

    return this.payrollRepository.createPayroll(payroll);
  }

  /**
   * Actualiza un registro de nómina existente.
   */
  async updatePayroll(id: number, payroll: Partial<Payroll>): Promise<Payroll | undefined> {
    // Validar que el registro de nómina existe
    const existingPayroll = await this.payrollRepository.getPayrollById(id);
    if (!existingPayroll) {
      throw new Error(`El registro de nómina con ID ${id} no existe`);
    }

    // No permitir cambios si el estado es "paid" o "cancelled"
    if (existingPayroll.status === 'paid' || existingPayroll.status === 'cancelled') {
      throw new Error(`No se puede modificar una nómina con estado ${existingPayroll.status}`);
    }

    return this.payrollRepository.updatePayroll(id, payroll);
  }

  /**
   * Actualiza el estado de un registro de nómina.
   */
  async updatePayrollStatus(id: number, status: string): Promise<Payroll | undefined> {
    // Validar estados válidos
    const validStatuses = ['pending', 'processing', 'paid', 'cancelled'];
    if (!validStatuses.includes(status)) {
      throw new Error(`Estado inválido: ${status}. Los estados válidos son: ${validStatuses.join(', ')}`);
    }

    // Validar que el registro de nómina existe
    const existingPayroll = await this.payrollRepository.getPayrollById(id);
    if (!existingPayroll) {
      throw new Error(`El registro de nómina con ID ${id} no existe`);
    }

    // Validar transiciones de estado válidas
    const validTransitions: Record<string, string[]> = {
      'pending': ['processing', 'cancelled'],
      'processing': ['paid', 'cancelled'],
      'paid': [],
      'cancelled': []
    };

    if (!validTransitions[existingPayroll.status].includes(status)) {
      throw new Error(`Transición de estado inválida: de ${existingPayroll.status} a ${status}`);
    }

    return this.payrollRepository.updatePayrollStatus(id, status);
  }

  /**
   * Registra el pago de una nómina.
   */
  async recordPayrollPayment(id: number, paymentData: {
    paymentDate: Date;
    paymentMethod: string;
    paymentReference: string;
  }): Promise<Payroll | undefined> {
    // Validar que el registro de nómina existe
    const existingPayroll = await this.payrollRepository.getPayrollById(id);
    if (!existingPayroll) {
      throw new Error(`El registro de nómina con ID ${id} no existe`);
    }

    // Validar que la nómina está en estado "processing"
    if (existingPayroll.status !== 'processing') {
      throw new Error(`La nómina debe estar en estado "processing" para registrar un pago, estado actual: ${existingPayroll.status}`);
    }

    // Validar que el método de pago sea válido
    const validPaymentMethods = ['transfer', 'check', 'cash', 'stripe'];
    if (!validPaymentMethods.includes(paymentData.paymentMethod)) {
      throw new Error(`Método de pago inválido: ${paymentData.paymentMethod}. Los métodos válidos son: ${validPaymentMethods.join(', ')}`);
    }

    // Registrar el pago y cambiar el estado a "paid"
    const result = await this.payrollRepository.recordPayrollPayment(id, paymentData);
    
    // Si se registró correctamente, cambiar el estado a "paid"
    if (result) {
      await this.payrollRepository.updatePayrollStatus(id, 'paid');
    }
    
    return result;
  }

  /**
   * Calcula el salario de un empleado.
   */
  async calculateEmployeeSalary(employeeId: number, periodStart: Date, periodEnd: Date): Promise<{
    grossSalary: number;
    netSalary: number;
    deductions: number;
    benefits: number;
    taxes: number;
    calculationDetails: any;
  }> {
    return this.payrollRepository.calculateEmployeeSalary(employeeId, periodStart, periodEnd);
  }

  /**
   * Genera un PDF con el desprendible de pago.
   */
  async generatePayslipPDF(id: number): Promise<string> {
    // Validar que el registro de nómina existe
    const existingPayroll = await this.payrollRepository.getPayrollById(id);
    if (!existingPayroll) {
      throw new Error(`El registro de nómina con ID ${id} no existe`);
    }

    return this.payrollRepository.generatePayslipPDF(id);
  }

  /**
   * Genera nómina para todos los empleados en un período.
   */
  async generatePayrollForPeriod(employees: Employee[], periodStart: Date, periodEnd: Date, userId: number): Promise<Payroll[]> {
    const results: Payroll[] = [];

    for (const employee of employees) {
      // Calcular salario para el empleado
      const salaryCalc = await this.payrollRepository.calculateEmployeeSalary(
        employee.id, 
        periodStart, 
        periodEnd
      );
      
      // Crear registro de nómina
      const payroll: InsertPayroll = {
        employeeId: employee.id,
        periodStart,
        periodEnd,
        grossSalary: salaryCalc.grossSalary,
        netSalary: salaryCalc.netSalary,
        deductions: salaryCalc.deductions,
        benefits: salaryCalc.benefits,
        taxes: salaryCalc.taxes,
        status: 'pending',
        createdBy: userId,
        calculationDetails: JSON.stringify(salaryCalc.calculationDetails)
      };
      
      const result = await this.payrollRepository.createPayroll(payroll);
      results.push(result);
    }
    
    return results;
  }

  /**
   * Procesa el pago masivo de nómina.
   */
  async processPayrollBatch(payrollIds: number[], paymentMethod: string): Promise<{
    success: number;
    failed: number;
    errors: Array<{ id: number; error: string }>;
  }> {
    const results = {
      success: 0,
      failed: 0,
      errors: [] as Array<{ id: number; error: string }>
    };

    for (const id of payrollIds) {
      try {
        // Actualizar estado a processing
        await this.payrollRepository.updatePayrollStatus(id, 'processing');
        
        // Registrar pago
        const paymentData = {
          paymentDate: new Date(),
          paymentMethod,
          paymentReference: `BATCH-${Date.now()}-${id}`
        };
        
        await this.recordPayrollPayment(id, paymentData);
        
        results.success++;
      } catch (error: any) {
        results.failed++;
        results.errors.push({ id, error: error.message });
      }
    }
    
    return results;
  }
}