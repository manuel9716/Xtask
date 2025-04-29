/**
 * Entidad de dominio Nomina
 * Representa una nómina o período de pago para un empleado
 */

// Enumeración de posibles estados de una nómina
export enum EstadoNomina {
  PENDIENTE = "PENDIENTE",
  EN_PROCESO = "EN_PROCESO",
  PAGADA = "PAGADA",
  CANCELADA = "CANCELADA"
}

// Interfaz principal de la entidad Nomina
export interface Nomina {
  id: number;
  empleadoId: number;
  periodStart: Date;
  periodEnd: Date;
  grossSalary: number;
  netSalary: number;
  deductions: number;
  benefits: number;
  taxes: number;
  status: EstadoNomina;
  paymentDate?: Date;
  paymentMethod?: string;
  paymentReference?: string;
  createdAt: Date;
  updatedAt: Date;
  createdBy: number;
  calculationDetails?: string; // JSON serializado con detalles del cálculo
  
  // Propiedades calculadas o de relación (opcional)
  empleadoNombre?: string;
  dias?: number;
  horas?: number;
}

// Interfaz para crear o actualizar nóminas
export interface NominaInput {
  empleadoId: number;
  periodStart: Date;
  periodEnd: Date;
  grossSalary: number;
  netSalary: number;
  deductions: number;
  benefits: number;
  taxes: number;
  status?: EstadoNomina;
  paymentDate?: Date;
  paymentMethod?: string;
  paymentReference?: string;
  calculationDetails?: string;
}

// Interfaz para filtros de nómina
export interface NominaFiltros {
  busqueda?: string;
  empleadoId?: number;
  estado?: EstadoNomina;
  fechaInicio?: Date;
  fechaFin?: Date;
  pagina?: number;
  porPagina?: number;
  ordenarPor?: string;
  direccion?: 'ASC' | 'DESC';
}