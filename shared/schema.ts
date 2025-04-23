import { pgTable, text, serial, integer, decimal, timestamp, boolean, uniqueIndex } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

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
  budget: decimal("budget", { precision: 10, scale: 2 }).notNull(),
  remainingBudget: decimal("remaining_budget", { precision: 10, scale: 2 }).notNull(),
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
  position: text("position").notNull(),
  department: text("department").notNull(),
  hireDate: timestamp("hire_date").notNull(),
  salary: decimal("salary", { precision: 10, scale: 2 }),
  phoneNumber: text("phone_number"),
  address: text("address"),
  emergencyContact: text("emergency_contact"),
  contractStatus: text("contract_status").notNull().default("active"), // active, terminated, etc.
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
export const insertSupplierSchema = createInsertSchema(suppliers).omit({ id: true, createdAt: true });
export const insertProductSchema = createInsertSchema(products).omit({ id: true });
export const insertPurchaseOrderSchema = createInsertSchema(purchaseOrders).omit({ id: true, createdAt: true, approvedAt: true, completedAt: true });
export const insertPurchaseOrderItemSchema = createInsertSchema(purchaseOrderItems).omit({ id: true });
export const insertSettingSchema = createInsertSchema(settings).omit({ id: true, updatedAt: true });

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
