/**
 * Interfaz del Repositorio de Empleados
 * Define las operaciones disponibles para gestionar empleados en el sistema
 */

import { Empleado, CrearEmpleadoDTO, ActualizarEmpleadoDTO, FiltrosEmpleadoRRHH } from "../entities/Empleado";

// Estructura básica para respuestas paginadas
export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

// Opciones de paginación
export interface PaginationOptions {
  page: number;
  pageSize: number;
}

// Definición del repositorio
export interface EmpleadoRepository {
  // Obtener todos los empleados con filtros y paginación opcional
  listarEmpleados(
    filtros?: FiltrosEmpleadoRRHH,
    paginacion?: PaginationOptions
  ): Promise<PaginatedResponse<Empleado>>;
  
  // Obtener un empleado por su ID
  obtenerEmpleadoPorId(id: number): Promise<Empleado | null>;
  
  // Crear un nuevo empleado
  crearEmpleado(empleado: CrearEmpleadoDTO): Promise<Empleado>;
  
  // Actualizar un empleado existente
  actualizarEmpleado(empleado: ActualizarEmpleadoDTO): Promise<Empleado>;
  
  // Eliminar o desactivar un empleado
  eliminarEmpleado(id: number): Promise<boolean>;
  
  // Cambiar el estado de un empleado
  cambiarEstadoEmpleado(id: number, estado: string): Promise<Empleado>;
  
  // Obtener estadísticas básicas de empleados
  obtenerEstadisticasEmpleados(): Promise<{
    total: number;
    activos: number;
    inactivos: number;
    nuevosMes: number;
  }>;
  
  // Obtener todos los empleados sin paginación (para reportes, métricas, etc.)
  obtenerTodosEmpleados(): Promise<Empleado[]>;
  
  // Buscar empleados por nombre o identificador
  buscarEmpleados(termino: string): Promise<Empleado[]>;
}