import { Payroll, Employee, InsertPayroll } from '@shared/schema';
import { 
  CambiarEstadoNominaParams, 
  MarcarComoPagadaParams, 
  ProcesarNominaParams 
} from '../entities/Nomina';

/**
 * Interfaz para el repositorio de nómina
 * Define las operaciones que puede realizar sobre las nóminas
 */
export interface INominaRepository {
  /**
   * Obtiene todas las nóminas, opcionalmente filtradas por empleado, periodo y estado
   */
  obtenerNominas(
    filtros?: { 
      empleadoId?: number; 
      desde?: Date; 
      hasta?: Date; 
      estado?: string; 
      page?: number; 
      limit?: number; 
    }
  ): Promise<{ nominas: Payroll[]; total: number }>;
  
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
  crearNomina(nomina: InsertPayroll): Promise<Payroll>;
  
  /**
   * Marca una nómina como pagada
   */
  marcarComoPagada(params: MarcarComoPagadaParams): Promise<Payroll>;
  
  /**
   * Cambia el estado de una nómina
   */
  cambiarEstadoNomina(params: CambiarEstadoNominaParams): Promise<Payroll>;
  
  /**
   * Obtiene el historial de nóminas de un empleado
   */
  obtenerHistorialPorEmpleado(
    empleadoId: number, 
    filtros?: { desde?: Date; hasta?: Date; estado?: string }
  ): Promise<Payroll[]>;
  
  /**
   * Registra una actividad de auditoría relacionada con la nómina
   */
  registrarAuditoria(
    entidadId: number, 
    accion: string, 
    datosAnteriores: any, 
    datosNuevos: any, 
    usuarioId: number
  ): Promise<void>;
}