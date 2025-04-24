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
 * Interfaz para los parámetros de creación de un empleado
 */
export interface CrearEmpleadoParams {
  userId: number;
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
}

/**
 * Esquema de validación para la creación de un empleado
 */
export const CrearEmpleadoDTO = z.object({
  userId: z.number({ 
    required_error: "El usuario es requerido",
    invalid_type_error: "El usuario debe ser un número"
  }),
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
  taxRate: z.string().regex(/^\d+(\.\d{1,2})?$/, "La tasa de impuestos debe ser un número válido").optional().default("0")
});

/**
 * Clase que representa un empleado en el dominio
 */
export class Empleado {
  id: number;
  userId: number;
  fullName?: string;
  email?: string;
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

  constructor(data: Employee) {
    this.id = data.id;
    this.userId = data.userId;
    this.fullName = data.fullName;
    this.email = data.email;
    this.position = data.position;
    this.department = data.department;
    this.hireDate = new Date(data.hireDate);
    this.salary = data.salary || '0';
    this.phoneNumber = data.phoneNumber || undefined;
    this.address = data.address || undefined;
    this.emergencyContact = data.emergencyContact || undefined;
    this.contractStatus = data.contractStatus;
    this.contractType = data.contractType;
    this.identification = data.identification;
    this.baseBenefits = data.baseBenefits || '0';
    this.baseDeductions = data.baseDeductions || '0';
    this.taxRate = data.taxRate || '0';
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