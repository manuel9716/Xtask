import { pgTable, text, serial, integer, decimal, timestamp, boolean, uniqueIndex } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Enums
export enum EstadoProyecto {
  ACTIVO = "ACTIVO",
  PAUSADO = "PAUSADO",
  RETRASADO = "RETRASADO",
  FINALIZADO = "FINALIZADO",
  CANCELADO = "CANCELADO",
  ARCHIVADO = "ARCHIVADO"
}

// Interfaces
export interface FiltrosProyecto {
  busqueda?: string;
  estado?: string;
  fechaInicio?: Date;
  fechaFin?: Date;
  responsableId?: number;
  clienteId?: number;
}

// Users table
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  email: text("email").notNull(),
  fullName: text("full_name").notNull(),
  role: text("role").notNull().default("user"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Projects table
export const projects = pgTable("projects", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  startDate: timestamp("start_date").notNull(),
  endDate: timestamp("end_date"),
  budget: decimal("budget", { precision: 16, scale: 2 }).notNull(),
  remainingBudget: decimal("remaining_budget", { precision: 16, scale: 2 }).notNull(),
  managerId: integer("manager_id").references(() => users.id),
  status: text("status").notNull().default("active"),
  category: text("category"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Financial transactions table
export const transactions = pgTable("transactions", {
  id: serial("id").primaryKey(),
  projectId: integer("project_id").references(() => projects.id),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  type: text("type").notNull(), // income, expense
  category: text("category").notNull(),
  description: text("description"),
  date: timestamp("date").defaultNow().notNull(),
  status: text("status").notNull().default("pending"), // pending, approved, rejected
  requesterId: integer("requester_id").references(() => users.id),
  approverId: integer("approver_id").references(() => users.id),
});

// ========== MÓDULO DE FINANZAS ==========

// Presupuestos empresariales
export const budgets = pgTable("budgets", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  spent: decimal("spent", { precision: 10, scale: 2 }).default("0").notNull(),
  startDate: timestamp("start_date").notNull(),
  endDate: timestamp("end_date").notNull(),
  organizationId: integer("organization_id").default(1).notNull(),
  departmentId: integer("department_id"),
  projectId: integer("project_id").references(() => projects.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  createdBy: integer("created_by").references(() => users.id).notNull(),
  status: text("status").notNull().default("ACTIVO"), // ACTIVO, ALERTA, COMPLETADO
  metadata: text("metadata"), // JSON data serialized
});

// Gastos de presupuestos
export const budgetExpenses = pgTable("budget_expenses", {
  id: serial("id").primaryKey(),
  budgetId: integer("budget_id").references(() => budgets.id).notNull(),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  description: text("description"),
  date: timestamp("date").defaultNow().notNull(),
  createdBy: integer("created_by").references(() => users.id).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  reference: text("reference"), // Referencia opcional, ej. número de factura
  metadata: text("metadata"), // JSON data serialized
});

// Nómina de empleados
export const payrolls = pgTable("payrolls", {
  id: serial("id").primaryKey(),
  employeeId: integer("employee_id").references(() => employees.id).notNull(),
  periodStart: timestamp("period_start").notNull(),
  periodEnd: timestamp("period_end").notNull(),
  grossSalary: decimal("gross_salary", { precision: 10, scale: 2 }).notNull(),
  netSalary: decimal("net_salary", { precision: 10, scale: 2 }).notNull(),
  deductions: decimal("deductions", { precision: 10, scale: 2 }).notNull(),
  benefits: decimal("benefits", { precision: 10, scale: 2 }).notNull(),
  taxes: decimal("taxes", { precision: 10, scale: 2 }).notNull(),
  status: text("status").notNull().default("pending"), // pending, processing, paid, cancelled
  paymentDate: timestamp("payment_date"),
  paymentMethod: text("payment_method"),
  paymentReference: text("payment_reference"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  createdBy: integer("created_by").references(() => users.id).notNull(),
  calculationDetails: text("calculation_details") // JSON data serialized
});

// Informes financieros
export const financialReports = pgTable("financial_reports", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  type: text("type").notNull(), // balance, cash_flow, income_statement
  startDate: timestamp("start_date").notNull(),
  endDate: timestamp("end_date").notNull(),
  organizationId: integer("organization_id").default(1).notNull(),
  departmentId: integer("department_id"),
  projectId: integer("project_id").references(() => projects.id),
  fileUrl: text("file_url"),
  status: text("status").notNull().default("draft"), // draft, published, archived
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  createdBy: integer("created_by").references(() => users.id).notNull(),
  reportData: text("report_data") // JSON data serialized
});

// Facturas
export const invoices = pgTable("invoices", {
  id: serial("id").primaryKey(),
  invoiceNumber: text("invoice_number").notNull().unique(),
  clientId: integer("client_id").notNull(), // Referencia a la tabla de clientes (que se debe crear)
  issueDate: timestamp("issue_date").notNull(),
  dueDate: timestamp("due_date").notNull(),
  subtotal: decimal("subtotal", { precision: 10, scale: 2 }).notNull(),
  taxAmount: decimal("tax_amount", { precision: 10, scale: 2 }).notNull(),
  totalAmount: decimal("total_amount", { precision: 10, scale: 2 }).notNull(),
  status: text("status").notNull().default("pending"), // pending, paid, overdue, cancelled
  notes: text("notes"),
  termsAndConditions: text("terms_and_conditions"),
  paidAmount: decimal("paid_amount", { precision: 10, scale: 2 }).default("0").notNull(),
  paidDate: timestamp("paid_date"),
  fileUrl: text("file_url"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  createdBy: integer("created_by").references(() => users.id).notNull(),
  electronicInvoiceData: text("electronic_invoice_data") // JSON data serialized
});

// Items de facturas
export const invoiceItems = pgTable("invoice_items", {
  id: serial("id").primaryKey(),
  invoiceId: integer("invoice_id").references(() => invoices.id).notNull(),
  description: text("description").notNull(),
  quantity: decimal("quantity", { precision: 10, scale: 2 }).notNull(),
  unitPrice: decimal("unit_price", { precision: 10, scale: 2 }).notNull(),
  subtotal: decimal("subtotal", { precision: 10, scale: 2 }).notNull(),
  taxRate: decimal("tax_rate", { precision: 10, scale: 2 }).notNull(),
  taxAmount: decimal("tax_amount", { precision: 10, scale: 2 }).notNull(),
  totalAmount: decimal("total_amount", { precision: 10, scale: 2 }).notNull(),
  productId: integer("product_id").references(() => products.id),
  createdAt: timestamp("created_at").defaultNow().notNull()
});

// Categorías financieras
export const financialCategories = pgTable("financial_categories", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  type: text("type").notNull(), // income, expense
  parentId: integer("parent_id"),
  organizationId: integer("organization_id").default(1).notNull(),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  createdBy: integer("created_by").references(() => users.id).notNull()
});

// Añadimos la relación de forma segura después de definir la tabla
// Esto solucionará el problema de referencia circular
// financialCategories.id.references(() => financialCategories.id, { foreignKeyName: "financial_categories_parent_id_fkey" });

// Auditoría financiera
export const financialAudits = pgTable("financial_audits", {
  id: serial("id").primaryKey(),
  entityType: text("entity_type").notNull(), // transaction, invoice, payroll, budget
  entityId: integer("entity_id").notNull(),
  action: text("action").notNull(), // create, update, delete, approve, reject
  previousData: text("previous_data"), // JSON data serialized
  newData: text("new_data"), // JSON data serialized
  performedBy: integer("performed_by").references(() => users.id).notNull(),
  performedAt: timestamp("performed_at").defaultNow().notNull(),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  notes: text("notes")
});

// Tasks (Kanban) table
export const tasks = pgTable("tasks", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description"),
  status: text("status").notNull().default("todo"), // todo, in_progress, completed
  priority: text("priority").notNull().default("medium"), // low, medium, high
  dueDate: timestamp("due_date"),
  projectId: integer("project_id").references(() => projects.id),
  assigneeId: integer("assignee_id").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Tabla de relación entre empleados y proyectos
export const employeeProjects = pgTable("employee_projects", {
  id: serial("id").primaryKey(),
  employeeId: integer("employee_id").references(() => employees.id).notNull(),
  projectId: integer("project_id").references(() => projects.id).notNull(),
  role: text("role").default("member"), // member, lead, manager
  assignedAt: timestamp("assigned_at").defaultNow().notNull(),
  assignedBy: integer("assigned_by").references(() => users.id).notNull(),
  isActive: boolean("is_active").default(true).notNull(),
});

// Task comments
export const taskComments = pgTable("task_comments", {
  id: serial("id").primaryKey(),
  taskId: integer("task_id").references(() => tasks.id).notNull(),
  userId: integer("user_id").references(() => users.id).notNull(),
  content: text("content").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Employees (HR)
export const employees = pgTable("employees", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  firstName: text("first_name"), // Nombre del empleado
  lastName: text("last_name"), // Apellido del empleado
  skills: text("skills"), // Habilidades del empleado (texto separado por comas o JSON)
  position: text("position").notNull(),
  department: text("department").notNull(),
  hireDate: timestamp("hire_date").notNull(),
  salary: decimal("salary", { precision: 10, scale: 2 }),
  phoneNumber: text("phone_number"),
  address: text("address"),
  emergencyContact: text("emergency_contact"),
  contractStatus: text("contract_status").notNull().default("active"), // active, terminated, etc.
  contractType: text("contract_type").default("fulltime"), // fulltime, parttime, contractor
  identification: text("identification"), // Número de identificación nacional/fiscal
  baseBenefits: decimal("base_benefits", { precision: 10, scale: 2 }).default("0"), // Beneficios predefinidos
  baseDeductions: decimal("base_deductions", { precision: 10, scale: 2 }).default("0"), // Deducciones predefinidas
  taxRate: decimal("tax_rate", { precision: 5, scale: 2 }).default("0"), // Tasa de impuestos aplicable al empleado
  bankAccount: text("bank_account"), // Cuenta bancaria para pagos
  paymentMethod: text("payment_method"), // Método de pago (transferencia, cheque, etc.)
  healthInsurance: text("health_insurance"), // Seguro de salud
  vacationDays: integer("vacation_days"), // Días de vacaciones anuales
  contratoUrl: text("contrato_url"), // URL del contrato subido
  tipoPago: text("tipo_pago"), // Tipo de pago (mensual, quincenal, etc.)
  fechaInicioNomina: timestamp("fecha_inicio_nomina"), // Fecha de inicio para cálculos de nómina
  id_employed_proyects: integer("id_employed_proyects").references(() => projects.id), // ID del proyecto asignado al empleado
});

// Suppliers
export const suppliers = pgTable("suppliers", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  contactPerson: text("contact_person"),
  email: text("email"),
  phone: text("phone"),
  address: text("address"),
  category: text("category").notNull(),
  status: text("status").notNull().default("active"), // active, inactive
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Products/Services offered by suppliers
export const products = pgTable("products", {
  id: serial("id").primaryKey(),
  supplierId: integer("supplier_id").references(() => suppliers.id).notNull(),
  name: text("name").notNull(),
  description: text("description"),
  price: decimal("price", { precision: 10, scale: 2 }),
  category: text("category"),
  status: text("status").notNull().default("available"), // available, discontinued, etc.
});

// Purchase orders
export const purchaseOrders = pgTable("purchase_orders", {
  id: serial("id").primaryKey(),
  supplierId: integer("supplier_id").references(() => suppliers.id).notNull(),
  projectId: integer("project_id").references(() => projects.id),
  status: text("status").notNull().default("pending"), // pending, approved, rejected, completed
  totalAmount: decimal("total_amount", { precision: 10, scale: 2 }).notNull(),
  requesterId: integer("requester_id").references(() => users.id).notNull(),
  approverId: integer("approver_id").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  approvedAt: timestamp("approved_at"),
  completedAt: timestamp("completed_at"),
});

// Purchase order items
export const purchaseOrderItems = pgTable("purchase_order_items", {
  id: serial("id").primaryKey(),
  purchaseOrderId: integer("purchase_order_id").references(() => purchaseOrders.id).notNull(),
  productId: integer("product_id").references(() => products.id).notNull(),
  quantity: integer("quantity").notNull(),
  unitPrice: decimal("unit_price", { precision: 10, scale: 2 }).notNull(),
  totalPrice: decimal("total_price", { precision: 10, scale: 2 }).notNull(),
});

// Settings and configuration
export const settings = pgTable("settings", {
  id: serial("id").primaryKey(),
  key: text("key").notNull().unique(),
  value: text("value").notNull(),
  description: text("description"),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Zod schemas for validation
export const insertUserSchema = createInsertSchema(users).omit({ id: true, createdAt: true });
export const insertProjectSchema = createInsertSchema(projects).omit({ id: true, createdAt: true });
export const insertTransactionSchema = createInsertSchema(transactions).omit({ id: true });
export const insertTaskSchema = createInsertSchema(tasks).omit({ id: true, createdAt: true });
export const insertTaskCommentSchema = createInsertSchema(taskComments).omit({ id: true, createdAt: true });
export const insertEmployeeSchema = createInsertSchema(employees).omit({ id: true });
export const insertEmployeeProjectSchema = createInsertSchema(employeeProjects).omit({ id: true, assignedAt: true });
export const insertSupplierSchema = createInsertSchema(suppliers).omit({ id: true, createdAt: true });
export const insertProductSchema = createInsertSchema(products).omit({ id: true });
export const insertPurchaseOrderSchema = createInsertSchema(purchaseOrders).omit({ id: true, createdAt: true, approvedAt: true, completedAt: true });
export const insertPurchaseOrderItemSchema = createInsertSchema(purchaseOrderItems).omit({ id: true });
export const insertSettingSchema = createInsertSchema(settings).omit({ id: true, updatedAt: true });

// Esquemas Zod para el módulo de finanzas
export const insertBudgetSchema = createInsertSchema(budgets).omit({ id: true, createdAt: true, updatedAt: true });
export const insertBudgetExpenseSchema = createInsertSchema(budgetExpenses).omit({ id: true, createdAt: true });
export const insertPayrollSchema = createInsertSchema(payrolls).omit({ id: true, createdAt: true, updatedAt: true });
export const insertFinancialReportSchema = createInsertSchema(financialReports).omit({ id: true, createdAt: true, updatedAt: true });
export const insertInvoiceSchema = createInsertSchema(invoices).omit({ id: true, createdAt: true, updatedAt: true });
export const insertInvoiceItemSchema = createInsertSchema(invoiceItems).omit({ id: true, createdAt: true });
export const insertFinancialCategorySchema = createInsertSchema(financialCategories).omit({ id: true, createdAt: true });
export const insertFinancialAuditSchema = createInsertSchema(financialAudits).omit({ id: true, performedAt: true });

// Types for usage in application
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Project = typeof projects.$inferSelect;
export type InsertProject = z.infer<typeof insertProjectSchema>;

export type Transaction = typeof transactions.$inferSelect;
export type InsertTransaction = z.infer<typeof insertTransactionSchema>;

export type Task = typeof tasks.$inferSelect;
export type InsertTask = z.infer<typeof insertTaskSchema>;

export type TaskComment = typeof taskComments.$inferSelect;
export type InsertTaskComment = z.infer<typeof insertTaskCommentSchema>;

export type Employee = typeof employees.$inferSelect;
export type InsertEmployee = z.infer<typeof insertEmployeeSchema>;

export type EmployeeProject = typeof employeeProjects.$inferSelect;
export type InsertEmployeeProject = z.infer<typeof insertEmployeeProjectSchema>;

export type Supplier = typeof suppliers.$inferSelect;
export type InsertSupplier = z.infer<typeof insertSupplierSchema>;

export type Product = typeof products.$inferSelect;
export type InsertProduct = z.infer<typeof insertProductSchema>;

export type PurchaseOrder = typeof purchaseOrders.$inferSelect;
export type InsertPurchaseOrder = z.infer<typeof insertPurchaseOrderSchema>;

export type PurchaseOrderItem = typeof purchaseOrderItems.$inferSelect;
export type InsertPurchaseOrderItem = z.infer<typeof insertPurchaseOrderItemSchema>;

export type Setting = typeof settings.$inferSelect;
export type InsertSetting = z.infer<typeof insertSettingSchema>;

// Tipos para el módulo de finanzas
// Extendemos el tipo Budget para incluir el campo virtual gastado
export type Budget = typeof budgets.$inferSelect & { gastado?: number };
export type InsertBudget = z.infer<typeof insertBudgetSchema>;

export type BudgetExpense = typeof budgetExpenses.$inferSelect;
export type InsertBudgetExpense = z.infer<typeof insertBudgetExpenseSchema>;

export type Payroll = typeof payrolls.$inferSelect;
export type InsertPayroll = z.infer<typeof insertPayrollSchema>;

export type FinancialReport = typeof financialReports.$inferSelect;
export type InsertFinancialReport = z.infer<typeof insertFinancialReportSchema>;

export type Invoice = typeof invoices.$inferSelect;
export type InsertInvoice = z.infer<typeof insertInvoiceSchema>;

export type InvoiceItem = typeof invoiceItems.$inferSelect;
export type InsertInvoiceItem = z.infer<typeof insertInvoiceItemSchema>;

export type FinancialCategory = typeof financialCategories.$inferSelect;
export type InsertFinancialCategory = z.infer<typeof insertFinancialCategorySchema>;

export type FinancialAudit = typeof financialAudits.$inferSelect;
export type InsertFinancialAudit = z.infer<typeof insertFinancialAuditSchema>;
