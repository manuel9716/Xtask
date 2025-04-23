import { Payroll, InsertPayroll } from "@shared/schema";

/**
 * Interfaz para el repositorio de nómina siguiendo el patrón de arquitectura hexagonal.
 * Esta interfaz define los métodos que debe implementar cualquier adaptador de infraestructura
 * que quiera proporcionar acceso a los datos de nómina.
 */
export interface PayrollRepository {
  /**
   * Obtiene todos los registros de nómina.
   * @param filters Filtros opcionales para la consulta.
   * @returns Promise con la lista de registros de nómina.
   */
  getAllPayrolls(filters?: Partial<{
    employeeId?: number;
    status?: string;
    periodStart?: Date;
    periodEnd?: Date;
  }>): Promise<Payroll[]>;

  /**
   * Obtiene un registro de nómina por su ID.
   * @param id ID del registro de nómina a obtener.
   * @returns Promise con el registro de nómina o undefined si no existe.
   */
  getPayrollById(id: number): Promise<Payroll | undefined>;

  /**
   * Crea un nuevo registro de nómina.
   * @param payroll Datos del registro de nómina a crear.
   * @returns Promise con el registro de nómina creado.
   */
  createPayroll(payroll: InsertPayroll): Promise<Payroll>;

  /**
   * Actualiza un registro de nómina existente.
   * @param id ID del registro de nómina a actualizar.
   * @param payroll Datos del registro de nómina a actualizar.
   * @returns Promise con el registro de nómina actualizado o undefined si no existe.
   */
  updatePayroll(id: number, payroll: Partial<Payroll>): Promise<Payroll | undefined>;

  /**
   * Actualiza el estado de un registro de nómina.
   * @param id ID del registro de nómina a actualizar.
   * @param status Nuevo estado (pendiente, procesando, pagado, cancelado).
   * @returns Promise con el registro de nómina actualizado o undefined si no existe.
   */
  updatePayrollStatus(id: number, status: string): Promise<Payroll | undefined>;
  
  /**
   * Registra el pago de una nómina.
   * @param id ID del registro de nómina.
   * @param paymentData Datos del pago (fecha, método, referencia).
   * @returns Promise con el registro de nómina actualizado o undefined si no existe.
   */
  recordPayrollPayment(id: number, paymentData: {
    paymentDate: Date;
    paymentMethod: string;
    paymentReference: string;
  }): Promise<Payroll | undefined>;
  
  /**
   * Calcula el salario de un empleado con todas las deducciones, beneficios y retenciones.
   * @param employeeId ID del empleado.
   * @param periodStart Fecha de inicio del período.
   * @param periodEnd Fecha de fin del período.
   * @returns Promise con los detalles del cálculo de nómina.
   */
  calculateEmployeeSalary(employeeId: number, periodStart: Date, periodEnd: Date): Promise<{
    grossSalary: number;
    netSalary: number;
    deductions: number;
    benefits: number;
    taxes: number;
    calculationDetails: any;
  }>;
  
  /**
   * Genera un PDF con el desprendible de pago.
   * @param id ID del registro de nómina.
   * @returns Promise con la URL del archivo PDF generado.
   */
  generatePayslipPDF(id: number): Promise<string>;
}