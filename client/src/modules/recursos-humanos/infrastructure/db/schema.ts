/**
 * Esquema de base de datos para el módulo de Recursos Humanos
 * Define las tablas, columnas y relaciones utilizando Drizzle ORM
 */

import { pgTable, serial, text, date, decimal, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";

// Esquema para la tabla de empleados
export const empleados = pgTable("employees", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  position: text("position").notNull(),
  department: text("department").notNull(),
  hireDate: date("hire_date").notNull(),
  contractStatus: text("contract_status").notNull(), // active, inactive, etc.
  salary: decimal("salary", { precision: 12, scale: 2 }).notNull(),
  address: text("address"),
  phone: text("phone"),
  email: text("email"),
  birthDate: date("birth_date"),
  identityNumber: text("identity_number"),
  socialSecurityNumber: text("social_security_number"),
  bankAccount: text("bank_account"),
  emergencyContact: text("emergency_contact"),
  emergencyPhone: text("emergency_phone"),
  notes: text("notes"),
  photoUrl: text("photo_url"),
  idEmployedProyects: integer("id_employed_proyects"), // relación 1:1 con proyecto principal
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at")
});

// Referencia a la tabla de usuarios ya existente
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  fullName: text("full_name").notNull(),
  role: text("role").notNull(), // admin, user, etc.
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at")
});

// Esquema para la tabla de evaluaciones
export const evaluaciones = pgTable("evaluations", {
  id: serial("id").primaryKey(),
  empleadoId: integer("employee_id").notNull().references(() => empleados.id),
  evaluadorId: integer("evaluator_id").notNull().references(() => empleados.id),
  tipo: text("type").notNull(), // desempeño, competencias, objetivos, integral
  periodo: text("period").notNull(), // 2023-Q1, 2023-S1, 2023-ANUAL
  fechaInicio: date("start_date").notNull(),
  fechaFin: date("end_date").notNull(),
  estado: text("status").notNull(), // pendiente, en_proceso, completada, archivada
  calificacion: decimal("score", { precision: 3, scale: 1 }), // 1.0-5.0
  objetivos: text("objectives"),
  comentarios: text("comments"),
  retroalimentacion: text("feedback"),
  criteriosJson: text("criteria_json"), // JSON con criterios de evaluación
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at")
});

// Esquema para la tabla de capacitaciones
export const capacitaciones = pgTable("trainings", {
  id: serial("id").primaryKey(),
  nombre: text("name").notNull(),
  descripcion: text("description"),
  tipo: text("type").notNull(), // técnica, habilidades blandas, liderazgo, normativa, seguridad, otros
  modalidad: text("modality").notNull(), // presencial, virtual, mixta, autoestudio
  responsableId: integer("responsible_id").notNull().references(() => empleados.id),
  fechaInicio: date("start_date").notNull(),
  fechaFin: date("end_date").notNull(),
  duracionHoras: decimal("duration_hours", { precision: 5, scale: 1 }).notNull(),
  estado: text("status").notNull(), // planificada, en_curso, finalizada, cancelada
  ubicacion: text("location"),
  enlaceVirtual: text("virtual_link"),
  cupoMaximo: integer("max_capacity"),
  requisitos: text("requirements"),
  objetivos: text("objectives"),
  contenidos: text("contents"),
  costo: decimal("cost", { precision: 10, scale: 2 }),
  proveedorExterno: text("external_provider"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at")
});

// Esquema para la tabla de relación empleados-capacitaciones
export const empleadosCapacitaciones = pgTable("employee_trainings", {
  empleadoId: integer("employee_id").notNull().references(() => empleados.id),
  capacitacionId: integer("training_id").notNull().references(() => capacitaciones.id),
  fechaInscripcion: date("enrollment_date").notNull(),
  completada: boolean("completed").default(false),
  calificacion: decimal("score", { precision: 3, scale: 1 }),
  comentarios: text("comments"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at")
});

// Esquema para la tabla de asistencias a capacitaciones
export const asistenciasCapacitaciones = pgTable("training_attendances", {
  id: serial("id").primaryKey(),
  empleadoId: integer("employee_id").notNull().references(() => empleados.id),
  capacitacionId: integer("training_id").notNull().references(() => capacitaciones.id),
  fecha: date("date").notNull(),
  asistio: boolean("attended").notNull(),
  observaciones: text("observations"),
  registradoPor: integer("registered_by").references(() => users.id),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at")
});

// Esquema para la tabla de nóminas
export const nominas = pgTable("payrolls", {
  id: serial("id").primaryKey(),
  empleadoId: integer("employee_id").notNull().references(() => empleados.id),
  periodoInicio: date("period_start").notNull(),
  periodoFin: date("period_end").notNull(),
  salarioBase: decimal("base_salary", { precision: 12, scale: 2 }).notNull(),
  salarioBruto: decimal("gross_salary", { precision: 12, scale: 2 }).notNull(),
  retencionFiscal: decimal("tax_withholding", { precision: 12, scale: 2 }).notNull(),
  seguridadSocial: decimal("social_security", { precision: 12, scale: 2 }).notNull(),
  otrosDescuentos: decimal("additional_deductions", { precision: 12, scale: 2 }).notNull(),
  salarioNeto: decimal("net_salary", { precision: 12, scale: 2 }).notNull(),
  fechaPago: date("payment_date"),
  estado: text("status").notNull(), // pendiente, aprobada, pagada, cancelada
  metodoPago: text("payment_method"),
  comentarios: text("comments"),
  creadoPor: integer("created_by").notNull().references(() => users.id),
  aprobadoPor: integer("approved_by").references(() => users.id),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at")
});

// Creación de esquemas Zod para validación y tipado

// Empleados
export const insertEmpleadoSchema = createInsertSchema(empleados, {
  salary: (schema) => schema.salary.positive(),
  email: (schema) => schema.email.email().optional(),
  hireDate: (schema) => schema.hireDate.refine(date => date <= new Date(), {
    message: "La fecha de contratación no puede ser en el futuro"
  })
});
export type InsertEmpleado = z.infer<typeof insertEmpleadoSchema>;
export type SelectEmpleado = z.infer<typeof createSelectSchema(empleados)>;

// Evaluaciones
export const insertEvaluacionSchema = createInsertSchema(evaluaciones, {
  calificacion: (schema) => schema.calificacion.gte(1).lte(5).optional(),
  criteriosJson: (schema) => schema.criteriosJson.optional()
});
export type InsertEvaluacion = z.infer<typeof insertEvaluacionSchema>;
export type SelectEvaluacion = z.infer<typeof createSelectSchema(evaluaciones)>;

// Capacitaciones
export const insertCapacitacionSchema = createInsertSchema(capacitaciones, {
  duracionHoras: (schema) => schema.duracionHoras.positive(),
  costo: (schema) => schema.costo.gte(0).optional()
});
export type InsertCapacitacion = z.infer<typeof insertCapacitacionSchema>;
export type SelectCapacitacion = z.infer<typeof createSelectSchema(capacitaciones)>;

// Nóminas
export const insertNominaSchema = createInsertSchema(nominas, {
  salarioBase: (schema) => schema.salarioBase.positive(),
  salarioBruto: (schema) => schema.salarioBruto.positive(),
  retencionFiscal: (schema) => schema.retencionFiscal.gte(0),
  seguridadSocial: (schema) => schema.seguridadSocial.gte(0),
  otrosDescuentos: (schema) => schema.otrosDescuentos.gte(0),
  salarioNeto: (schema) => schema.salarioNeto.positive()
});
export type InsertNomina = z.infer<typeof insertNominaSchema>;
export type SelectNomina = z.infer<typeof createSelectSchema(nominas)>;