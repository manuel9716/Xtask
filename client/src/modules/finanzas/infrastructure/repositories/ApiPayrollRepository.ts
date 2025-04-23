import { Payroll, InsertPayroll } from "@shared/schema";
import { PayrollRepository } from "../../domain/repositories";
import { financeApiClient } from "../api/financeApiClient";

/**
 * Implementación del repositorio de nómina que utiliza la API REST
 * para acceder a los datos de nómina.
 */
export class ApiPayrollRepository implements PayrollRepository {
  /**
   * Obtiene todos los registros de nómina.
   */
  async getAllPayrolls(filters?: Partial<{
    employeeId?: number;
    status?: string;
    periodStart?: Date;
    periodEnd?: Date;
  }>): Promise<Payroll[]> {
    return financeApiClient.getPayrolls(filters);
  }

  /**
   * Obtiene un registro de nómina por su ID.
   */
  async getPayrollById(id: number): Promise<Payroll | undefined> {
    try {
      return await financeApiClient.getPayrollById(id);
    } catch (error) {
      if ((error as any).status === 404) {
        return undefined;
      }
      throw error;
    }
  }

  /**
   * Crea un nuevo registro de nómina.
   */
  async createPayroll(payroll: InsertPayroll): Promise<Payroll> {
    return financeApiClient.createPayroll(payroll);
  }

  /**
   * Actualiza un registro de nómina existente.
   */
  async updatePayroll(id: number, payroll: Partial<Payroll>): Promise<Payroll | undefined> {
    try {
      return await financeApiClient.updatePayroll(id, payroll);
    } catch (error) {
      if ((error as any).status === 404) {
        return undefined;
      }
      throw error;
    }
  }

  /**
   * Actualiza el estado de un registro de nómina.
   */
  async updatePayrollStatus(id: number, status: string): Promise<Payroll | undefined> {
    try {
      return await financeApiClient.updatePayrollStatus(id, status);
    } catch (error) {
      if ((error as any).status === 404) {
        return undefined;
      }
      throw error;
    }
  }

  /**
   * Registra el pago de una nómina.
   */
  async recordPayrollPayment(id: number, paymentData: {
    paymentDate: Date;
    paymentMethod: string;
    paymentReference: string;
  }): Promise<Payroll | undefined> {
    try {
      // Convertir fecha a formato ISO para enviarla a la API
      const paymentDataForApi = {
        ...paymentData,
        paymentDate: paymentData.paymentDate.toISOString()
      };

      return await financeApiClient.recordPayrollPayment(id, paymentDataForApi);
    } catch (error) {
      if ((error as any).status === 404) {
        return undefined;
      }
      throw error;
    }
  }

  /**
   * Calcula el salario de un empleado con todas las deducciones, beneficios y retenciones.
   */
  async calculateEmployeeSalary(employeeId: number, periodStart: Date, periodEnd: Date): Promise<{
    grossSalary: number;
    netSalary: number;
    deductions: number;
    benefits: number;
    taxes: number;
    calculationDetails: any;
  }> {
    return financeApiClient.calculateEmployeeSalary(employeeId, periodStart, periodEnd);
  }

  /**
   * Genera un PDF con el desprendible de pago.
   */
  async generatePayslipPDF(id: number): Promise<string> {
    const result = await financeApiClient.generatePayslipPDF(id);
    return result.fileUrl;
  }
}