/**
 * Interfaz del Repositorio de Nómina
 * Define las operaciones disponibles para gestionar nóminas en el sistema
 */

import { PaginatedResponse, PaginationOptions } from "./EmpleadoRepository";

// Interfaz para registros de nómina
export interface RegistroNomina {
  id: number;
  empleadoId: number;
  periodoInicio: Date;
  periodoFin: Date;
  salarioBase: number;
  salarioBruto: number;
  retencionFiscal: number;
  seguridadSocial: number;
  otrosDescuentos: number;
  salarioNeto: number;
  fechaPago?: Date;
  estado: EstadoNomina;
  metodoPago?: string;
  comentarios?: string;
  creadoPor: number;
  aprobadoPor?: number;
  createdAt: Date;
  updatedAt?: Date;
}

// Estados posibles de un registro de nómina
export enum EstadoNomina {
  PENDIENTE = "PENDIENTE",
  APROBADA = "APROBADA",
  PAGADA = "PAGADA",
  CANCELADA = "CANCELADA"
}

// Interfaz para la creación de un registro de nómina
export interface CrearNominaDTO {
  empleadoId: number;
  periodoInicio: Date;
  periodoFin: Date;
  salarioBase: number;
  salarioBruto: number;
  retencionFiscal: number;
  seguridadSocial: number;
  otrosDescuentos: number;
  salarioNeto: number;
  fechaPago?: Date;
  metodoPago?: string;
  comentarios?: string;
}

// Interfaz para la actualización de un registro de nómina
export interface ActualizarNominaDTO extends Partial<CrearNominaDTO> {
  id: number;
  estado?: EstadoNomina;
  aprobadoPor?: number;
}

// Filtros para búsqueda de nóminas
export interface FiltrosNomina {
  empleadoId?: number;
  estado?: EstadoNomina;
  periodoInicioDesde?: Date;
  periodoInicioHasta?: Date;
  periodoFinDesde?: Date;
  periodoFinHasta?: Date;
  fechaPagoDesde?: Date;
  fechaPagoHasta?: Date;
}

// Definición del repositorio
export interface NominaRepository {
  // Obtener todos los registros de nómina con filtros y paginación
  listarNominas(
    filtros?: FiltrosNomina,
    paginacion?: PaginationOptions
  ): Promise<PaginatedResponse<RegistroNomina>>;
  
  // Obtener un registro de nómina por su ID
  obtenerNominaPorId(id: number): Promise<RegistroNomina | null>;
  
  // Crear un nuevo registro de nómina
  crearNomina(nomina: CrearNominaDTO): Promise<RegistroNomina>;
  
  // Actualizar un registro de nómina existente
  actualizarNomina(nomina: ActualizarNominaDTO): Promise<RegistroNomina>;
  
  // Eliminar un registro de nómina
  eliminarNomina(id: number): Promise<boolean>;
  
  // Cambiar el estado de un registro de nómina
  cambiarEstadoNomina(id: number, estado: EstadoNomina, usuarioId?: number): Promise<RegistroNomina>;
  
  // Marcar un registro de nómina como pagado
  marcarComoPagado(id: number, fechaPago: Date, metodoPago?: string): Promise<RegistroNomina>;
  
  // Obtener nóminas por empleado
  obtenerNominasPorEmpleado(empleadoId: number): Promise<RegistroNomina[]>;
  
  // Obtener estadísticas de nómina
  obtenerEstadisticasNomina(): Promise<{
    totalRegistros: number;
    pendientes: number;
    aprobadas: number;
    pagadas: number;
    montoTotalPagado: number;
    montoPromedioMensual: number;
  }>;
  
  // Generar desprendible de nómina en formato PDF
  generarDesprendibleNomina(nominaId: number): Promise<Buffer>;
}