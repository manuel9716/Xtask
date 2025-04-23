import { z } from 'zod';
import { Employee, InsertEmployee } from '@shared/schema';

// DTO para validar los datos de creación de un empleado
export const CrearEmpleadoDTO = z.object({
  userId: z.number().int().positive({ message: 'Se debe seleccionar un usuario válido' }),
  position: z.string().min(1, { message: 'El cargo es obligatorio' }),
  department: z.string().min(1, { message: 'El departamento es obligatorio' }),
  hireDate: z.date({ message: 'La fecha de contratación es obligatoria' }),
  salary: z.string().min(1, { message: 'El salario es obligatorio' }),
  phoneNumber: z.string().optional(),
  address: z.string().optional(),
  emergencyContact: z.string().optional(),
  contractStatus: z.string().default('active'),
  contractType: z.enum(['fulltime', 'parttime', 'contractor'], { 
    errorMap: () => ({ message: 'Tipo de contrato no válido' }) 
  }),
  identification: z.string().min(1, { message: 'La identificación es obligatoria' }),
  baseBenefits: z.string().optional(),
  baseDeductions: z.string().optional(),
  taxRate: z.string().optional()
});

// Tipo para los datos de creación de un empleado
export type CrearEmpleadoParams = z.infer<typeof CrearEmpleadoDTO>;

// Tipo para realizar búsquedas de empleados
export interface FiltrosEmpleado {
  contractStatus?: string;
  department?: string;
  userId?: number;
  page?: number;
  pageSize?: number;
}

// Resultado paginado de empleados
export interface ResultadoPaginadoEmpleados {
  empleados: Employee[];
  pagination: {
    page: number;
    pageSize: number;
    totalItems: number;
    totalPages: number;
  };
}