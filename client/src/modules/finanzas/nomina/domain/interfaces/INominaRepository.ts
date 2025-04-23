import { Payroll, Employee } from "@shared/schema";
import { 
  ProcesarNominaParams, 
  MarcarComoPagadaParams, 
  CambiarEstadoParams 
} from "../entities/Nomina";

/**
 * Interfaz para el Repositorio de Nómina - sigue el patrón Repository
 * Define las operaciones disponibles para acceder y manipular datos de nómina
 */
export interface INominaRepository {
  /**
   * Obtiene todas las nóminas, con posibles filtros
   */
  obtenerNominas(filtros?: {
    empleadoId?: number;
    desde?: Date;
    hasta?: Date;
    estado?: string;
    page?: number;
    limit?: number;
  }): Promise<{ nominas: Payroll[]; total: number }>;

  /**
   * Obtiene una nómina específica por su ID
   */
  obtenerNominaPorId(id: number): Promise<Payroll | undefined>;

  /**
   * Obtiene todos los empleados activos
   */
  obtenerEmpleados(): Promise<Employee[]>;

  /**
   * Obtiene un empleado específico por su ID
   */
  obtenerEmpleadoPorId(id: number): Promise<Employee | undefined>;

  /**
   * Procesa la nómina para un grupo de empleados y un periodo específico
   */
  procesarNomina(params: ProcesarNominaParams): Promise<Payroll[]>;

  /**
   * Crea un registro de nómina individual
   */
  crearNomina(nomina: any): Promise<Payroll>;

  /**
   * Marca una nómina como pagada
   */
  marcarComoPagada(params: MarcarComoPagadaParams): Promise<Payroll>;

  /**
   * Cambia el estado de una nómina
   */
  cambiarEstadoNomina(params: CambiarEstadoParams): Promise<Payroll>;

  /**
   * Obtiene el historial de nóminas de un empleado
   */
  obtenerHistorialPorEmpleado(
    empleadoId: number,
    filtros?: { desde?: Date; hasta?: Date; estado?: string }
  ): Promise<Payroll[]>;
}