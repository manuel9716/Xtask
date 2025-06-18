import { pgTable, text, serial, integer, decimal, timestamp, boolean, uniqueIndex, date } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Exportar esquema de microlearning
export * from './schema/microlearning';

// Enums
export enum EstadoProyecto {
  ACTIVO = "ACTIVO",
  PAUSADO = "PAUSADO",
  RETRASADO = "RETRASADO",
  FINALIZADO = "FINALIZADO",
  CANCELADO = "CANCELADO",
  ARCHIVADO = "ARCHIVADO"
}

export enum EstadoNomina {
  PENDIENTE = "PENDIENTE",
  PROCESANDO = "PROCESANDO",
  PAGADO = "PAGADO",
  CANCELADO = "CANCELADO"
}

export enum MetodoPago {
  TRANSFERENCIA = "TRANSFERENCIA",
  CHEQUE = "CHEQUE",
  EFECTIVO = "EFECTIVO",
  OTRO = "OTRO"
}

export enum ModalidadCapacitacion {
  PRESENCIAL = "PRESENCIAL",
  VIRTUAL = "VIRTUAL",
  MIXTA = "MIXTA",
  AUTOESTUDIO = "AUTOESTUDIO"
}

export enum TipoEvaluacion {
  DESEMPEÑO = "DESEMPEÑO",
  PERIODO_PRUEBA = "PERIODO_PRUEBA",
  OBJETIVOS = "OBJETIVOS",
  COMPETENCIAS = "COMPETENCIAS",
  ASCENSO = "ASCENSO"
}

export enum TipoHabilidad {
  HERRAMIENTA = "herramienta",
  HABILIDAD_BLANDA = "habilidad_blanda",
  CONOCIMIENTO = "conocimiento",
  IDIOMA = "idioma"
}

export enum NivelHabilidad {
  BASICO = "básico",
  INTERMEDIO = "intermedio",
  AVANZADO = "avanzado",
  EXPERTO = "experto"
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
  isActive: boolean("is_active").notNull().default(true),
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
  amount: decimal("amount", { precision: 15, scale: 2 }).notNull(),
  spent: decimal("spent", { precision: 15, scale: 2 }).default("0").notNull(),
  startDate: timestamp("start_date").notNull(),
  endDate: timestamp("end_date").notNull(),
  organizationId: integer("organization_id").default(1).notNull(),
  departmentId: integer("department_id"),
  projectId: integer("project_id").references(() => projects.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  createdBy: integer("created_by").references(() => users.id).notNull(),
  status: text("status").notNull().default("ACTIVO"), // ACTIVO, ALERTA, COMPLETADO
  metadata: text("metadata"), // JSON data serialized - almacena porcentajes y reservas
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

// ========== MÓDULO DE NÓMINA ==========

// Tabla de nóminas grupales (cabecera)
export const nominas = pgTable("nominas", {
  id: serial("id").primaryKey(),
  titulo: text("titulo"),
  periodoInicio: timestamp("periodo_inicio").notNull(),
  periodoFin: timestamp("periodo_fin").notNull(),
  fechaPago: timestamp("fecha_pago").notNull(),
  metodoPago: text("metodo_pago").notNull(),
  estado: text("estado").notNull().default(EstadoNomina.PENDIENTE),
  comentarios: text("comentarios"),
  fechaCreacion: timestamp("fecha_creacion").defaultNow().notNull(),
  fechaActualizacion: timestamp("fecha_actualizacion").defaultNow().notNull(),
  creadoPor: integer("creado_por").references(() => users.id).notNull(),
  actualizadoPor: integer("actualizado_por").references(() => users.id),
  montoTotal: decimal("monto_total", { precision: 12, scale: 2 }).notNull(),
});

// Detalle de nómina por empleado
export const nominaDetalles = pgTable("nomina_detalles", {
  id: serial("id").primaryKey(),
  nominaId: integer("nomina_id").references(() => nominas.id).notNull(),
  empleadoId: integer("empleado_id").references(() => employees.id).notNull(),
  salarioBase: decimal("salario_base", { precision: 10, scale: 2 }).notNull(),
  totalIngresos: decimal("total_ingresos", { precision: 10, scale: 2 }).notNull(),
  totalDeducciones: decimal("total_deducciones", { precision: 10, scale: 2 }).notNull(),
  salarioNeto: decimal("salario_neto", { precision: 10, scale: 2 }).notNull(),
  detalleIngresos: text("detalle_ingresos"), // JSON con descripción y montos
  detalleDeducciones: text("detalle_deducciones"), // JSON con descripción y montos
  estado: text("estado").notNull().default(EstadoNomina.PENDIENTE),
  pdfUrl: text("pdf_url"), // URL del desprendible generado
  fechaGeneracion: timestamp("fecha_generacion").defaultNow().notNull(),
});

// Dejamos la tabla original de payrolls por compatibilidad con código existente
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

// Enumeraciones para módulo de Recursos Humanos
export enum EstadoEvaluacion {
  PENDIENTE = "PENDIENTE",
  EN_PROGRESO = "EN_PROGRESO",
  COMPLETADA = "COMPLETADA",
  REVISIÓN = "REVISIÓN",
  ARCHIVADA = "ARCHIVADA"
}

export enum TipoCapacitacion {
  INDUCCION = "INDUCCION",
  TECNICA = "TECNICA",
  HABILIDADES_BLANDAS = "HABILIDADES_BLANDAS",
  LIDERAZGO = "LIDERAZGO",
  NORMATIVA = "NORMATIVA",
  SEGURIDAD = "SEGURIDAD"
}

export enum EstadoCapacitacion {
  PROGRAMADA = "PROGRAMADA",
  EN_CURSO = "EN_CURSO",
  COMPLETADA = "COMPLETADA",
  CANCELADA = "CANCELADA",
  POSPUESTA = "POSPUESTA"
}

// Evaluaciones de Desempeño
export const evaluaciones = pgTable("evaluaciones", {
  id: serial("id").primaryKey(),
  empleadoId: integer("empleado_id").references(() => employees.id).notNull(),
  evaluadorId: integer("evaluador_id").references(() => users.id).notNull(),
  titulo: text("titulo").notNull(),
  descripcion: text("descripcion"),
  tipo: text("tipo").notNull(), // Usar TipoEvaluacion
  estado: text("estado").notNull().default("PENDIENTE"), // Usar EstadoEvaluacion
  fechaInicio: timestamp("fecha_inicio").notNull(),
  fechaFinalizacion: timestamp("fecha_finalizacion"),
  calificacion: decimal("calificacion", { precision: 5, scale: 2 }),
  comentarios: text("comentarios"),
  fortalezas: text("fortalezas"),
  areasAMejorar: text("areas_a_mejorar"),
  objetivosSiguientePeriodo: text("objetivos_siguiente_periodo"),
  criteriosJson: text("criterios_json"), // JSON con criterios específicos de evaluación
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Capacitaciones y Formaciones
export const capacitaciones = pgTable("capacitaciones", {
  id: serial("id").primaryKey(),
  titulo: text("titulo").notNull(),
  descripcion: text("descripcion"),
  tipo: text("tipo").notNull(), // Usar TipoCapacitacion
  estado: text("estado").notNull().default("PROGRAMADA"), // Usar EstadoCapacitacion
  responsableId: integer("responsable_id").references(() => users.id).notNull(),
  // Volvemos a timestamp para mantener compatibilidad
  fechaInicio: timestamp("fecha_inicio").notNull(),
  fechaFin: timestamp("fecha_fin").notNull(),
  duracionHoras: decimal("duracion_horas", { precision: 5, scale: 2 }).notNull(),
  ubicacion: text("ubicacion"),
  modalidad: text("modalidad").notNull(), // presencial, virtual, mixta
  proveedor: text("proveedor"),
  costo: decimal("costo", { precision: 10, scale: 2 }),
  objetivos: text("objetivos"),
  contenido: text("contenido"),
  materialUrl: text("material_url"),
  capacidadMaxima: integer("capacidad_maxima"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Relación Empleados-Capacitaciones (para seguimiento de asistencia)
export const empleadoCapacitaciones = pgTable("empleado_capacitaciones", {
  id: serial("id").primaryKey(),
  empleadoId: integer("empleado_id").references(() => employees.id).notNull(),
  capacitacionId: integer("capacitacion_id").references(() => capacitaciones.id).notNull(),
  asistencia: boolean("asistencia").default(false),
  calificacion: decimal("calificacion", { precision: 5, scale: 2 }),
  completado: boolean("completado").default(false),
  comentarios: text("comentarios"),
  fechaInscripcion: timestamp("fecha_inscripcion").defaultNow().notNull(),
  certificadoUrl: text("certificado_url"),
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

// User Skills
export const userSkills = pgTable("user_skills", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  tipo: text("tipo").notNull(), // herramienta, habilidad_blanda, conocimiento, idioma
  nombre: text("nombre").notNull(),
  nivel: text("nivel").notNull(), // básico, intermedio, avanzado, experto
  observaciones: text("observaciones"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
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

// User Skills validation schema
export const insertUserSkillSchema = createInsertSchema(userSkills).omit({ id: true, createdAt: true, updatedAt: true });
export const updateUserSkillSchema = insertUserSkillSchema.partial();

// Esquemas Zod para el módulo de Nómina
export const insertNominaSchema = createInsertSchema(nominas).omit({ 
  id: true, 
  fechaCreacion: true, 
  fechaActualizacion: true, 
  actualizadoPor: true
}).extend({
  periodoInicio: z.preprocess(
    (arg) => {
      if (typeof arg === 'string' || arg instanceof Date) return new Date(arg as string);
      return undefined;
    },
    z.date({
      required_error: "La fecha de inicio del período es requerida",
      invalid_type_error: "La fecha de inicio debe ser una fecha válida",
    })
  ),
  periodoFin: z.preprocess(
    (arg) => {
      if (typeof arg === 'string' || arg instanceof Date) return new Date(arg as string);
      return undefined;
    },
    z.date({
      required_error: "La fecha de fin del período es requerida",
      invalid_type_error: "La fecha de fin debe ser una fecha válida",
    })
  ),
  fechaPago: z.preprocess(
    (arg) => {
      if (typeof arg === 'string' || arg instanceof Date) return new Date(arg as string);
      return undefined;
    },
    z.date({
      required_error: "La fecha de pago es requerida",
      invalid_type_error: "La fecha de pago debe ser una fecha válida",
    })
  ),
});

export const insertNominaDetalleSchema = createInsertSchema(nominaDetalles).omit({ 
  id: true, 
  fechaGeneracion: true
});

// Esquemas Zod para módulo de Recursos Humanos - Evaluaciones y Capacitaciones
export const insertEvaluacionSchema = createInsertSchema(evaluaciones).omit({ id: true, createdAt: true, updatedAt: true });

// Esquema para capacitaciones con transformación de fechas string a Date
export const insertCapacitacionSchema = createInsertSchema(capacitaciones)
  .omit({ id: true, createdAt: true, updatedAt: true })
  .extend({
    // Para que funcione con los strings ISO que manda el frontend
    fechaInicio: z.preprocess(
      (arg) => {
        if (typeof arg === 'string' || arg instanceof Date) return new Date(arg as string);
        return undefined;
      },
      z.date({
        required_error: "La fecha de inicio es requerida",
        invalid_type_error: "La fecha de inicio debe ser una fecha válida",
      })
    ),
    fechaFin: z.preprocess(
      (arg) => {
        if (typeof arg === 'string' || arg instanceof Date) return new Date(arg as string);
        return undefined;
      },
      z.date({
        required_error: "La fecha de fin es requerida",
        invalid_type_error: "La fecha de fin debe ser una fecha válida",
      })
    )
  });

export const insertEmpleadoCapacitacionSchema = createInsertSchema(empleadoCapacitaciones).omit({ id: true, fechaInscripcion: true });

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

// Tipos para el módulo de Nómina
export type Nomina = typeof nominas.$inferSelect;
export type InsertNomina = z.infer<typeof insertNominaSchema>;

export type NominaDetalle = typeof nominaDetalles.$inferSelect;
export type InsertNominaDetalle = z.infer<typeof insertNominaDetalleSchema>;

// Enumeración para estado de KPIs
export enum EstadoKpi {
  PENDIENTE = "PENDIENTE",
  CUMPLIDO = "CUMPLIDO",
  PARCIAL = "PARCIAL",
  NO_CUMPLIDO = "NO_CUMPLIDO"
}

// Enumeración para estado de bonificaciones
export enum EstadoBonificacion {
  CALCULADO = "CALCULADO",
  APROBADO = "APROBADO",
  PAGADO = "PAGADO",
  RECHAZADO = "RECHAZADO"
}

// Tabla de KPIs de usuario
export const userKpis = pgTable("user_kpis", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  descripcion: text("descripcion").notNull(),
  formula: text("formula").notNull(),
  // Eliminados campos valorEsperado y valorObtenido por simplificación
  porcentajePeso: decimal("porcentaje_peso", { precision: 5, scale: 2 }).notNull(),
  porcentajeCumplimiento: decimal("porcentaje_cumplimiento", { precision: 5, scale: 2 }),
  mes: text("mes").notNull(), // formato: "YYYY-MM"
  estado: text("estado").notNull().default(EstadoKpi.PENDIENTE),
  validadoPor: integer("validado_por").references(() => users.id),
  fechaValidacion: timestamp("fecha_validacion"),
  comentariosValidacion: text("comentarios_validacion"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Tabla de bonificaciones mensuales
export const bonificacionesMensuales = pgTable("bonificaciones_mensuales", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  mes: text("mes").notNull(), // formato: "YYYY-MM"
  salarioBase: decimal("salario_base", { precision: 10, scale: 2 }).notNull(),
  salarioVariable: decimal("salario_variable", { precision: 10, scale: 2 }).notNull(),
  bonificacionTotal: decimal("bonificacion_total", { precision: 10, scale: 2 }).notNull(),
  porcentajeCumplimientoGlobal: decimal("porcentaje_cumplimiento_global", { precision: 5, scale: 2 }).notNull(),
  estado: text("estado").notNull().default(EstadoBonificacion.CALCULADO),
  aprobadoPor: integer("aprobado_por").references(() => users.id),
  fechaAprobacion: timestamp("fecha_aprobacion"),
  comentarios: text("comentarios"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Esquemas de inserción para Zod
export const insertUserKpiSchema = createInsertSchema(userKpis).omit({
  id: true,
  fechaValidacion: true,
  createdAt: true,
  updatedAt: true
});

export const insertBonificacionMensualSchema = createInsertSchema(bonificacionesMensuales).omit({
  id: true,
  fechaAprobacion: true,
  createdAt: true,
  updatedAt: true
});

// Tipos para el módulo de KPIs
export type UserKpi = typeof userKpis.$inferSelect;
export type InsertUserKpi = z.infer<typeof insertUserKpiSchema>;

export type BonificacionMensual = typeof bonificacionesMensuales.$inferSelect;
export type InsertBonificacionMensual = z.infer<typeof insertBonificacionMensualSchema>;

// Tipos para el módulo de Recursos Humanos - Evaluaciones y Capacitaciones
export type Evaluacion = typeof evaluaciones.$inferSelect;
export type InsertEvaluacion = z.infer<typeof insertEvaluacionSchema>;

export type Capacitacion = typeof capacitaciones.$inferSelect;
export type InsertCapacitacion = z.infer<typeof insertCapacitacionSchema>;

export type EmpleadoCapacitacion = typeof empleadoCapacitaciones.$inferSelect;
export type InsertEmpleadoCapacitacion = z.infer<typeof insertEmpleadoCapacitacionSchema>;
