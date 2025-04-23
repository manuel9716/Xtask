import { Employee } from '@shared/schema';
import { z } from 'zod';

/**
 * Parámetros para la creación de un empleado
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
 * DTO Zod para validar la creación de un empleado
 */
export const CrearEmpleadoDTO = z.object({
  userId: z.number().int().positive(),
  position: z.string().min(1, { message: 'El cargo es obligatorio' }),
  department: z.string().min(1, { message: 'El departamento es obligatorio' }),
  hireDate: z.date(),
  salary: z.string().min(1, { message: 'El salario es obligatorio' }),
  phoneNumber: z.string().optional(),
  address: z.string().optional(),
  emergencyContact: z.string().optional(),
  contractStatus: z.string().default('active'),
  contractType: z.string(),
  identification: z.string().min(1, { message: 'La identificación es obligatoria' }),
  baseBenefits: z.string().optional(),
  baseDeductions: z.string().optional(),
  taxRate: z.string().optional()
});

/**
 * Filtros para la búsqueda de empleados
 */
export interface FiltrosEmpleado {
  page?: number;
  pageSize?: number;
  contractStatus?: string;
  department?: string;
  userId?: number;
  search?: string;
}

/**
 * Resultado paginado de empleados
 */
export interface ResultadoPaginadoEmpleados {
  empleados: Employee[];
  pagination: {
    page: number;
    pageSize: number;
    totalItems: number;
    totalPages: number;
  };
}