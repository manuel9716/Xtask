import { 
  BudgetService, 
  PayrollService, 
  InvoiceService 
} from '../domain/services';

import { 
  ApiBudgetRepository,
  ApiPayrollRepository,
  ApiInvoiceRepository
} from '../infrastructure/repositories';

import {
  GetBudgetsUseCase,
  GetBudgetByIdUseCase,
  CreateBudgetUseCase,
  UpdateBudgetUseCase,
  DeleteBudgetUseCase,
  CalculateBudgetExecutionUseCase,
  ValidateBudgetExpenseUseCase,
  GetPayrollsUseCase,
  GetPayrollByIdUseCase,
  CreatePayrollUseCase,
  UpdatePayrollUseCase,
  UpdatePayrollStatusUseCase,
  RecordPayrollPaymentUseCase,
  CalculateEmployeeSalaryUseCase,
  GeneratePayslipPDFUseCase,
  GetInvoicesUseCase,
  GetInvoiceByIdUseCase,
  CreateInvoiceUseCase,
  UpdateInvoiceUseCase,
  UpdateInvoiceStatusUseCase,
  RecordInvoicePaymentUseCase,
  GetInvoiceItemsUseCase,
  GenerateInvoicePDFUseCase,
  SendInvoiceByEmailUseCase,
  GetOverdueInvoicesUseCase
} from '../application/useCases';

// Inicializar repositorios
const budgetRepository = new ApiBudgetRepository();
const payrollRepository = new ApiPayrollRepository();
const invoiceRepository = new ApiInvoiceRepository();

// Inicializar servicios de dominio
const budgetService = new BudgetService(budgetRepository);
const payrollService = new PayrollService(payrollRepository);
const invoiceService = new InvoiceService(invoiceRepository);

// Inicializar casos de uso de presupuestos
const getBudgetsUseCase = new GetBudgetsUseCase(budgetService);
const getBudgetByIdUseCase = new GetBudgetByIdUseCase(budgetService);
const createBudgetUseCase = new CreateBudgetUseCase(budgetService);
const updateBudgetUseCase = new UpdateBudgetUseCase(budgetService);
const deleteBudgetUseCase = new DeleteBudgetUseCase(budgetService);
const calculateBudgetExecutionUseCase = new CalculateBudgetExecutionUseCase(budgetService);
const validateBudgetExpenseUseCase = new ValidateBudgetExpenseUseCase(budgetService);

// Inicializar casos de uso de nóminas
const getPayrollsUseCase = new GetPayrollsUseCase(payrollService);
const getPayrollByIdUseCase = new GetPayrollByIdUseCase(payrollService);
const createPayrollUseCase = new CreatePayrollUseCase(payrollService);
const updatePayrollUseCase = new UpdatePayrollUseCase(payrollService);
const updatePayrollStatusUseCase = new UpdatePayrollStatusUseCase(payrollService);
const recordPayrollPaymentUseCase = new RecordPayrollPaymentUseCase(payrollService);
const calculateEmployeeSalaryUseCase = new CalculateEmployeeSalaryUseCase(payrollService);
const generatePayslipPDFUseCase = new GeneratePayslipPDFUseCase(payrollService);

// Inicializar casos de uso de facturas
const getInvoicesUseCase = new GetInvoicesUseCase(invoiceService);
const getInvoiceByIdUseCase = new GetInvoiceByIdUseCase(invoiceService);
const createInvoiceUseCase = new CreateInvoiceUseCase(invoiceService);
const updateInvoiceUseCase = new UpdateInvoiceUseCase(invoiceService);
const updateInvoiceStatusUseCase = new UpdateInvoiceStatusUseCase(invoiceService);
const recordInvoicePaymentUseCase = new RecordInvoicePaymentUseCase(invoiceService);
const getInvoiceItemsUseCase = new GetInvoiceItemsUseCase(invoiceService);
const generateInvoicePDFUseCase = new GenerateInvoicePDFUseCase(invoiceService);
const sendInvoiceByEmailUseCase = new SendInvoiceByEmailUseCase(invoiceService);
const getOverdueInvoicesUseCase = new GetOverdueInvoicesUseCase(invoiceService);

// Exportar todos los casos de uso para su uso en componentes
export {
  // Casos de uso de presupuestos
  getBudgetsUseCase,
  getBudgetByIdUseCase,
  createBudgetUseCase,
  updateBudgetUseCase,
  deleteBudgetUseCase,
  calculateBudgetExecutionUseCase,
  validateBudgetExpenseUseCase,
  
  // Casos de uso de nóminas
  getPayrollsUseCase,
  getPayrollByIdUseCase,
  createPayrollUseCase,
  updatePayrollUseCase,
  updatePayrollStatusUseCase,
  recordPayrollPaymentUseCase,
  calculateEmployeeSalaryUseCase,
  generatePayslipPDFUseCase,
  
  // Casos de uso de facturas
  getInvoicesUseCase,
  getInvoiceByIdUseCase,
  createInvoiceUseCase,
  updateInvoiceUseCase,
  updateInvoiceStatusUseCase,
  recordInvoicePaymentUseCase,
  getInvoiceItemsUseCase,
  generateInvoicePDFUseCase,
  sendInvoiceByEmailUseCase,
  getOverdueInvoicesUseCase
};