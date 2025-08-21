import { z } from 'zod';
import { Employee } from '@shared/schema';

/**
 * Interfaz para filtros de búsqueda de empleados
 */
export interface FiltrosEmpleado {
  page?: number;
  pageSize?: number;
  search?: string;
  contractStatus?: string;
  department?: string;
  userId?: number;
}

/**
 * Interfaz para paginación de resultados
 */
export interface Paginacion {
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
}

/**
 * Interfaz para resultados paginados de empleados
 */
export interface ResultadoPaginadoEmpleados {
  empleados: Employee[];
  pagination: Paginacion;
}

/**
 * Interfaz para los parámetros de creación de un empleado (nueva versión con tipos de contrato colombianos)
 */
export interface CrearEmpleadoParams {
  // Campos básicos
  user_id?: number;
  nombre: string;
  apellido: string;
  identificacion: string;
  depto: string;
  cargo: string;
  fecha_ingreso: Date;
  estado_contrato: "activo" | "inactivo" | "suspendido";
  telefono?: string;
  direccion?: string;
  contacto_emergencia?: string;
  // Tipo de contrato según la ley colombiana
  tipo_contrato: "indefinido" | "fijo" | "prestacion_servicios" | "por_horas";
  // Campos condicionales según tipo de contrato
  fecha_fin_contrato?: Date;
  clase_riesgo_arl?: "I" | "II" | "III" | "IV" | "V";
  horas_por_semana?: number;
  salario_por_hora?: number;
  honorarios?: number;
  retencion_fuente?: number;
  requiere_seguridad_social?: boolean;
}

/**
 * Interfaz legacy para compatibilidad
 */
export interface CrearEmpleadoLegacyParams {
  userId: number;
  firstName: string;     // Nombre del empleado
  lastName: string;      // Apellido del empleado
  skills?: string;       // Habilidades del empleado
  position: string;
  department: string;
  hireDate: Date;
  salary: string;
  phoneNumber?: string;
  address?: string;
  emergencyContact?: string;
  contractStatus: string;
  contractType: string;
  identification: string;
  baseBenefits?: string;
  baseDeductions?: string;
  taxRate?: string;
  projectIds?: number[]; // IDs de los proyectos asignados
  bankAccount?: string;  // Cuenta bancaria para pagos
  paymentMethod?: string; // Método de pago (transferencia, cheque, etc.)
  healthInsurance?: string; // Seguro de salud
  vacationDays?: number; // Días de vacaciones anuales
  // Campos para el contrato
  contratoUrl?: string; // URL del contrato subido
  contratoFile?: File; // Archivo del contrato (solo frontend)
  tipoPago?: string; // Tipo de pago (mensual, quincenal, etc.)
  fechaInicioNomina?: Date; // Fecha de inicio para cálculos de nómina
}

/**
 * Esquema de validación para la creación de un empleado
 */
// Nuevo esquema para empleados con tipos de contrato según la ley colombiana
export const CrearEmpleadoDTO = z.object({
  // Campos básicos
  user_id: z.number().optional(),
  nombre: z.string().min(2, "El nombre debe tener al menos 2 caracteres").max(50),
  apellido: z.string().min(2, "El apellido debe tener al menos 2 caracteres").max(50),
  identificacion: z.string().min(5, "La identificación debe tener al menos 5 caracteres").max(20),
  depto: z.string().min(2, "El departamento es requerido"),
  cargo: z.string().min(2, "El cargo es requerido"),
  fecha_ingreso: z.date(),
  estado_contrato: z.enum(["activo", "inactivo", "suspendido"]).default("activo"),
  telefono: z.string().optional(),
  direccion: z.string().optional(),
  contacto_emergencia: z.string().optional(),
  // Tipo de contrato según la ley colombiana
  tipo_contrato: z.enum(["indefinido", "fijo", "prestacion_servicios", "por_horas"]),
  // Campos condicionales según tipo de contrato
  fecha_fin_contrato: z.date().optional(),
  clase_riesgo_arl: z.enum(["I", "II", "III", "IV", "V"]).optional(),
  horas_por_semana: z.number().min(1).max(48).optional(),
  salario_por_hora: z.number().min(0).optional(),
  honorarios: z.number().min(0).optional(),
  retencion_fuente: z.number().min(0).max(1).optional(),
  requiere_seguridad_social: z.boolean().optional(),
}).refine((data) => {
  // Validaciones específicas por tipo de contrato
  if (data.tipo_contrato === "fijo") {
    return data.fecha_fin_contrato !== undefined && data.clase_riesgo_arl !== undefined;
  }
  if (data.tipo_contrato === "indefinido") {
    return data.clase_riesgo_arl !== undefined;
  }
  if (data.tipo_contrato === "por_horas") {
    return data.horas_por_semana !== undefined && data.salario_por_hora !== undefined;
  }
  if (data.tipo_contrato === "prestacion_servicios") {
    return data.honorarios !== undefined;
  }
  return true;
}, {
  message: "Faltan campos requeridos para el tipo de contrato seleccionado"
});

// Esquema legacy mantenido para compatibilidad
export const CrearEmpleadoLegacyDTO = z.object({
  userId: z.number({ 
    required_error: "El usuario es requerido",
    invalid_type_error: "El usuario debe ser un número"
  }),
  firstName: z.string({ 
    required_error: "El nombre es requerido" 
  }).min(2, "El nombre debe tener al menos 2 caracteres"),
  lastName: z.string({ 
    required_error: "El apellido es requerido" 
  }).min(2, "El apellido debe tener al menos 2 caracteres"),
  skills: z.string().optional(),
  position: z.string({ 
    required_error: "El cargo es requerido" 
  }).min(3, "El cargo debe tener al menos 3 caracteres"),
  department: z.string({ 
    required_error: "El departamento es requerido" 
  }),
  hireDate: z.coerce.date({ 
    required_error: "La fecha de ingreso es requerida",
    invalid_type_error: "Formato de fecha inválido"
  }),
  salary: z.string({ 
    required_error: "El salario es requerido" 
  }).regex(/^\d+(\.\d{1,2})?$/, "El salario debe ser un número válido con hasta 2 decimales"),
  phoneNumber: z.string().optional(),
  address: z.string().optional(),
  emergencyContact: z.string().optional(),
  contractStatus: z.string({ 
    required_error: "El estado del contrato es requerido" 
  }).refine(val => ['active', 'inactive', 'on_leave', 'terminated'].includes(val), {
    message: "Estado de contrato inválido"
  }),
  contractType: z.string({ 
    required_error: "El tipo de contrato es requerido" 
  }).refine(val => ['fulltime', 'parttime', 'contractor', 'temporary', 'internship'].includes(val), {
    message: "Tipo de contrato inválido"
  }),
  identification: z.string({ 
    required_error: "La identificación es requerida" 
  }).min(3, "La identificación debe tener al menos 3 caracteres"),
  baseBenefits: z.string().regex(/^\d+(\.\d{1,2})?$/, "Los beneficios base deben ser un número válido").optional().default("0"),
  baseDeductions: z.string().regex(/^\d+(\.\d{1,2})?$/, "Las deducciones base deben ser un número válido").optional().default("0"),
  taxRate: z.string().regex(/^\d+(\.\d{1,2})?$/, "La tasa de impuestos debe ser un número válido").optional().default("0"),
  // Campos de proyectos y beneficios
  projectIds: z.array(z.number()).optional(),
  bankAccount: z.string().optional(),
  paymentMethod: z.string()
    .refine(val => !val || ['transferencia', 'cheque', 'efectivo', 'otro'].includes(val), {
      message: "Método de pago inválido"
    })
    .optional(),
  healthInsurance: z.string().optional(),
  vacationDays: z.number().int().min(0).max(60).optional(),
  // Campos de contrato y nómina
  contratoUrl: z.string().optional(),
  tipoPago: z.string()
    .refine(val => !val || ['mensual', 'quincenal', 'semanal', 'por_hora'].includes(val), {
      message: "Tipo de pago inválido"
    })
    .optional(),
  fechaInicioNomina: z.coerce.date().optional(),
});

/**
 * Clase que representa un empleado en el dominio
 */
export class Empleado {
  id: number;
  userId: number;
  firstName?: string;
  lastName?: string;
  fullName?: string;
  email?: string;
  skills?: string;
  position: string;
  department: string;
  hireDate: Date;
  salary: string;
  phoneNumber?: string;
  address?: string;
  emergencyContact?: string;
  contractStatus: string;
  contractType: string;
  identification: string;
  baseBenefits: string;
  baseDeductions: string;
  taxRate: string;
  // Nuevos campos
  bankAccount?: string;
  paymentMethod?: string;
  healthInsurance?: string;
  vacationDays?: number;
  projectIds?: number[];

  constructor(data: Employee & { fullName?: string, email?: string }) {
    this.id = data.id;
    this.userId = data.userId;
    this.firstName = data.firstName;
    this.lastName = data.lastName;
    this.fullName = data.fullName || `${data.firstName || ''} ${data.lastName || ''}`.trim() || undefined;
    this.email = data.email;
    this.skills = data.skills;
    this.position = data.position;
    this.department = data.department;
    this.hireDate = new Date(data.hireDate);
    this.salary = data.salary || '0';
    this.phoneNumber = data.phoneNumber || undefined;
    this.address = data.address || undefined;
    this.emergencyContact = data.emergencyContact || undefined;
    this.contractStatus = data.contractStatus || 'active';
    this.contractType = data.contractType || 'fulltime';
    this.identification = data.identification || '';
    this.baseBenefits = data.baseBenefits || '0';
    this.baseDeductions = data.baseDeductions || '0';
    this.taxRate = data.taxRate || '0';
    // Inicializar los nuevos campos
    this.bankAccount = data.bankAccount || undefined;
    this.paymentMethod = data.paymentMethod || undefined;
    this.healthInsurance = data.healthInsurance || undefined;
    this.vacationDays = data.vacationDays || undefined;
    // Los projectIds no están en el modelo de base de datos, por lo que tendríamos que obtenerlos a través de otra consulta
    this.projectIds = [];
  }

  /**
   * Calcula el salario neto del empleado
   * @returns El salario neto después de deducciones e impuestos
   */
  calcularSalarioNeto(): number {
    const salarioBase = parseFloat(this.salary || '0');
    const deducciones = parseFloat(this.baseDeductions || '0');
    const impuestos = salarioBase * (parseFloat(this.taxRate || '0') / 100);
    
    return salarioBase - deducciones - impuestos;
  }

  /**
   * Calcula el salario bruto del empleado incluyendo beneficios
   * @returns El salario bruto total
   */
  calcularSalarioBruto(): number {
    const salarioBase = parseFloat(this.salary || '0');
    const beneficios = parseFloat(this.baseBenefits || '0');
    
    return salarioBase + beneficios;
  }

  /**
   * Verifica si el empleado está activo
   * @returns true si el empleado está activo
   */
  estaActivo(): boolean {
    return this.contractStatus === 'active';
  }

  /**
   * Calcula los años de servicio del empleado
   * @returns Años de servicio del empleado
   */
  calcularAnosServicio(): number {
    const hoy = new Date();
    const fechaIngreso = new Date(this.hireDate);
    const diferenciaMilisegundos = hoy.getTime() - fechaIngreso.getTime();
    const milisegundosPorAno = 1000 * 60 * 60 * 24 * 365.25;
    
    return Math.floor(diferenciaMilisegundos / milisegundosPorAno);
  }
}