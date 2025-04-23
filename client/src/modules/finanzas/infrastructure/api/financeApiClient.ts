import { apiRequest } from "@/lib/queryClient";

/**
 * Cliente API para realizar peticiones a los endpoints financieros
 * Centraliza todas las llamadas a la API relacionadas con finanzas
 */
export const financeApiClient = {
  // ======== PRESUPUESTOS ========
  async getBudgets(filters?: any) {
    const queryParams = new URLSearchParams();
    
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined) {
          if (value instanceof Date) {
            queryParams.append(key, value.toISOString());
          } else {
            queryParams.append(key, String(value));
          }
        }
      });
    }
    
    const query = queryParams.toString() ? `?${queryParams.toString()}` : '';
    const response = await apiRequest('GET', `/api/finances/budgets${query}`);
    return response.json();
  },

  async getBudgetById(id: number) {
    const response = await apiRequest('GET', `/api/finances/budgets/${id}`);
    return response.json();
  },

  async createBudget(budgetData: any) {
    const response = await apiRequest('POST', '/api/finances/budgets', budgetData);
    return response.json();
  },

  async updateBudget(id: number, budgetData: any) {
    const response = await apiRequest('PATCH', `/api/finances/budgets/${id}`, budgetData);
    return response.json();
  },

  async deleteBudget(id: number) {
    const response = await apiRequest('DELETE', `/api/finances/budgets/${id}`);
    return response.json();
  },

  async calculateBudgetExecution(id: number) {
    const response = await apiRequest('GET', `/api/finances/budgets/${id}/execution`);
    return response.json();
  },

  async validateBudgetExpense(budgetId: number, amount: number) {
    const response = await apiRequest('POST', `/api/finances/budgets/${budgetId}/validate-expense`, { amount });
    return response.json();
  },

  // ======== NÓMINA ========
  async getPayrolls(filters?: any) {
    const queryParams = new URLSearchParams();
    
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined) {
          if (value instanceof Date) {
            queryParams.append(key, value.toISOString());
          } else {
            queryParams.append(key, String(value));
          }
        }
      });
    }
    
    const query = queryParams.toString() ? `?${queryParams.toString()}` : '';
    const response = await apiRequest('GET', `/api/finances/payrolls${query}`);
    return response.json();
  },

  async getPayrollById(id: number) {
    const response = await apiRequest('GET', `/api/finances/payrolls/${id}`);
    return response.json();
  },

  async createPayroll(payrollData: any) {
    const response = await apiRequest('POST', '/api/finances/payrolls', payrollData);
    return response.json();
  },

  async updatePayroll(id: number, payrollData: any) {
    const response = await apiRequest('PATCH', `/api/finances/payrolls/${id}`, payrollData);
    return response.json();
  },

  async updatePayrollStatus(id: number, status: string) {
    const response = await apiRequest('PATCH', `/api/finances/payrolls/${id}/status`, { status });
    return response.json();
  },

  async recordPayrollPayment(id: number, paymentData: any) {
    const response = await apiRequest('POST', `/api/finances/payrolls/${id}/payment`, paymentData);
    return response.json();
  },

  async calculateEmployeeSalary(employeeId: number, periodStart: Date, periodEnd: Date) {
    const response = await apiRequest('POST', '/api/finances/payrolls/calculate', {
      employeeId,
      periodStart: periodStart.toISOString(),
      periodEnd: periodEnd.toISOString()
    });
    return response.json();
  },

  async generatePayslipPDF(id: number) {
    const response = await apiRequest('GET', `/api/finances/payrolls/${id}/pdf`);
    return response.json();
  },

  async generatePayrollForPeriod(data: { employeeIds: number[], periodStart: Date, periodEnd: Date }) {
    const response = await apiRequest('POST', '/api/finances/payrolls/generate-batch', {
      employeeIds: data.employeeIds,
      periodStart: data.periodStart.toISOString(),
      periodEnd: data.periodEnd.toISOString()
    });
    return response.json();
  },

  // ======== FACTURAS ========
  async getInvoices(filters?: any) {
    const queryParams = new URLSearchParams();
    
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined) {
          if (value instanceof Date) {
            queryParams.append(key, value.toISOString());
          } else {
            queryParams.append(key, String(value));
          }
        }
      });
    }
    
    const query = queryParams.toString() ? `?${queryParams.toString()}` : '';
    const response = await apiRequest('GET', `/api/finances/invoices${query}`);
    return response.json();
  },

  async getInvoiceById(id: number) {
    const response = await apiRequest('GET', `/api/finances/invoices/${id}`);
    return response.json();
  },

  async createInvoice(invoiceData: any) {
    const response = await apiRequest('POST', '/api/finances/invoices', invoiceData);
    return response.json();
  },

  async updateInvoice(id: number, invoiceData: any) {
    const response = await apiRequest('PATCH', `/api/finances/invoices/${id}`, invoiceData);
    return response.json();
  },

  async updateInvoiceStatus(id: number, status: string) {
    const response = await apiRequest('PATCH', `/api/finances/invoices/${id}/status`, { status });
    return response.json();
  },

  async recordInvoicePayment(id: number, paymentData: any) {
    const response = await apiRequest('POST', `/api/finances/invoices/${id}/payment`, paymentData);
    return response.json();
  },

  async getInvoiceItems(invoiceId: number) {
    const response = await apiRequest('GET', `/api/finances/invoices/${invoiceId}/items`);
    return response.json();
  },

  async generateInvoicePDF(id: number) {
    const response = await apiRequest('GET', `/api/finances/invoices/${id}/pdf`);
    return response.json();
  },

  async sendInvoiceByEmail(id: number, emailData: any) {
    const response = await apiRequest('POST', `/api/finances/invoices/${id}/send-email`, emailData);
    return response.json();
  },

  async getOverdueOrSoonDueInvoices(daysThreshold: number = 7) {
    const response = await apiRequest('GET', `/api/finances/invoices/overdue?daysThreshold=${daysThreshold}`);
    return response.json();
  },

  // ======== INFORMES FINANCIEROS ========
  async getFinancialReports(filters?: any) {
    const queryParams = new URLSearchParams();
    
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined) {
          if (value instanceof Date) {
            queryParams.append(key, value.toISOString());
          } else {
            queryParams.append(key, String(value));
          }
        }
      });
    }
    
    const query = queryParams.toString() ? `?${queryParams.toString()}` : '';
    const response = await apiRequest('GET', `/api/finances/reports${query}`);
    return response.json();
  },

  async getFinancialReportById(id: number) {
    const response = await apiRequest('GET', `/api/finances/reports/${id}`);
    return response.json();
  },

  async createFinancialReport(reportData: any) {
    const response = await apiRequest('POST', '/api/finances/reports', reportData);
    return response.json();
  },

  async updateFinancialReport(id: number, reportData: any) {
    const response = await apiRequest('PATCH', `/api/finances/reports/${id}`, reportData);
    return response.json();
  },

  async generateBalanceSheet(parameters: any) {
    const response = await apiRequest('POST', '/api/finances/reports/balance-sheet', parameters);
    return response.json();
  },

  async generateIncomeStatement(parameters: any) {
    const response = await apiRequest('POST', '/api/finances/reports/income-statement', parameters);
    return response.json();
  },

  async generateCashFlowStatement(parameters: any) {
    const response = await apiRequest('POST', '/api/finances/reports/cash-flow', parameters);
    return response.json();
  },

  async generateReportPDF(id: number) {
    const response = await apiRequest('GET', `/api/finances/reports/${id}/pdf`);
    return response.json();
  },

  async exportReportToExcel(id: number) {
    const response = await apiRequest('GET', `/api/finances/reports/${id}/excel`);
    return response.json();
  },

  // ======== AUDITORÍA FINANCIERA ========
  async getAuditRecords(filters?: any) {
    const queryParams = new URLSearchParams();
    
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined) {
          if (value instanceof Date) {
            queryParams.append(key, value.toISOString());
          } else {
            queryParams.append(key, String(value));
          }
        }
      });
    }
    
    const query = queryParams.toString() ? `?${queryParams.toString()}` : '';
    const response = await apiRequest('GET', `/api/finances/audits${query}`);
    return response.json();
  },

  async getAuditRecordById(id: number) {
    const response = await apiRequest('GET', `/api/finances/audits/${id}`);
    return response.json();
  },

  async getEntityChangeHistory(entityType: string, entityId: number) {
    const response = await apiRequest('GET', `/api/finances/audits/history/${entityType}/${entityId}`);
    return response.json();
  },

  async detectIrregularities(parameters: any) {
    const response = await apiRequest('POST', '/api/finances/audits/detect-irregularities', parameters);
    return response.json();
  },

  async verifyTransactionCompliance(transactionId: number) {
    const response = await apiRequest('GET', `/api/finances/audits/verify-compliance/transaction/${transactionId}`);
    return response.json();
  },

  async generateAuditReport(parameters: any) {
    const response = await apiRequest('POST', '/api/finances/audits/report', parameters);
    return response.json();
  }
};