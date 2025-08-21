import { z } from "zod";

export const empleadoSchema = z.object({
  nombre: z.string().min(2, "El nombre debe tener al menos 2 caracteres"),
  apellido: z.string().min(2, "El apellido debe tener al menos 2 caracteres"),
  identificacion: z.string().min(5, "La identificación es obligatoria"),
  depto: z.string().min(1, "El departamento es obligatorio"),
  cargo: z.string().min(1, "El cargo es obligatorio"),
  fecha_ingreso: z.string().min(1, "La fecha de ingreso es obligatoria"),
  estado_contrato: z.enum(["activo", "inactivo", "suspendido"]),
  tipo_contrato: z.enum(["indefinido", "fijo", "prestacion_servicios", "por_horas"]),
  telefono: z.string().optional(),
  email: z.string().email("Formato de email inválido").optional().or(z.literal("")),
  direccion: z.string().optional(),
  contacto_emergencia: z.string().optional(),
  // Campos específicos por tipo de contrato
  fecha_fin_contrato: z.string().optional(),
  clase_riesgo_arl: z.enum(["I", "II", "III", "IV", "V"]).optional(),
  horas_por_semana: z.number().min(1).max(48).optional(),
  salario_por_hora: z.number().min(0).optional(),
  honorarios: z.number().min(0).optional(),
  retencion_fuente: z.number().min(0).max(1).optional(),
  requiere_seguridad_social: z.boolean().optional(),
});

export const empleadoNominaSchema = z.object({
  sueldo_base: z.number().min(0, "El sueldo base debe ser mayor a 0"),
  bonificacion: z.number().min(0).default(0),
  tasa_impuestos: z.number().min(0).max(1).default(0.19),
  base_deduccion: z.number().min(0).default(0),
  beneficios_base: z.number().min(0).default(0),
  metodo_pago: z.enum(["transferencia", "efectivo", "cheque"]),
  cuenta_bancaria: z.string().optional(),
  seguro_salud: z.string().optional(),
  dias_vacaciones: z.number().min(0).default(15),
  frecuencia_pago: z.enum(["quincenal", "mensual"]),
  fecha_inicio_nomina: z.string().min(1, "La fecha de inicio es obligatoria"),
});

export const empleadoProyectoSchema = z.object({
  proyecto_id: z.number().min(1, "Debe seleccionar un proyecto"),
});

export const newEmpleadoSchema = z.object({
  empleado: empleadoSchema,
  nomina: empleadoNominaSchema,
  proyecto: empleadoProyectoSchema,
});

export type Empleado = z.infer<typeof empleadoSchema>;
export type EmpleadoNomina = z.infer<typeof empleadoNominaSchema>;
export type EmpleadoProyecto = z.infer<typeof empleadoProyectoSchema>;
export type NewEmpleado = z.infer<typeof newEmpleadoSchema>;