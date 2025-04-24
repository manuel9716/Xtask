import { apiRequest } from '@/lib/queryClient';
import { Employee } from '@shared/schema';
import { ResultadoCalculoNomina } from '../domain/services/CalculoNominaEmpleado';

// Interfaz simplificada para datos de usuario
export interface Usuario {
  id: number;
  username: string;
  email: string;
  fullName?: string; 
}

/**
 * Interfaz para las opciones de paginación
 */
export interface PaginationOptions {
  page?: number;
  pageSize?: number;
}

/**
 * Interfaz para la respuesta paginada de empleados
 */
export interface PaginatedEmployeesResponse {
  empleados: Employee[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

/**
 * Interfaz para la nómina procesada
 */
export interface NominaProcesada {
  id: number;
  empleadoId: number;
  periodo: string;
  fechaGeneracion: string;
  salarioBase: string;
  totalIngresos: string;
  totalDeducciones: string;
  salarioNeto: string;
  estado: 'pendiente' | 'pagada' | 'cancelada';
  fechaPago?: string;
  pdfUrl?: string;
}

/**
 * Obtiene una lista paginada de empleados
 * @param options Opciones de paginación
 * @returns Promesa con la respuesta paginada
 */
export async function obtenerEmpleados(
  options: PaginationOptions = {}
): Promise<PaginatedEmployeesResponse> {
  const { page = 1, pageSize = 10 } = options;
  const queryParams = new URLSearchParams({
    page: page.toString(),
    pageSize: pageSize.toString()
  });
  
  const response = await apiRequest(
    'GET',
    `/api/nomina/empleados/listar?${queryParams.toString()}`
  );
  
  if (!response.ok) {
    throw new Error('Error al obtener la lista de empleados');
  }
  
  return response.json();
}

/**
 * Obtiene los datos de un empleado específico
 * @param id ID del empleado
 * @returns Promesa con los datos del empleado
 */
export async function obtenerEmpleado(id: number): Promise<Employee> {
  const response = await apiRequest(
    'GET',
    `/api/nomina/empleados/${id}`
  );
  
  if (!response.ok) {
    throw new Error(`Error al obtener los datos del empleado ${id}`);
  }
  
  return response.json();
}

/**
 * Crea un nuevo empleado
 * @param empleado Datos del empleado a crear
 * @returns Promesa con el empleado creado
 */
export async function crearEmpleado(empleado: Partial<Employee>): Promise<Employee> {
  const response = await apiRequest(
    'POST',
    '/api/nomina/empleados',
    empleado
  );
  
  if (!response.ok) {
    throw new Error('Error al crear el empleado');
  }
  
  return response.json();
}

/**
 * Actualiza los datos de un empleado
 * @param id ID del empleado
 * @param datos Datos a actualizar
 * @returns Promesa con el empleado actualizado
 */
export async function actualizarEmpleado(id: number, datos: Partial<Employee>): Promise<Employee> {
  const response = await apiRequest(
    'PATCH',
    `/api/nomina/empleados/${id}`,
    datos
  );
  
  if (!response.ok) {
    throw new Error(`Error al actualizar el empleado ${id}`);
  }
  
  return response.json();
}

/**
 * Elimina un empleado
 * @param id ID del empleado
 * @returns Promesa con la respuesta
 */
export async function eliminarEmpleado(id: number): Promise<void> {
  const response = await apiRequest(
    'DELETE',
    `/api/nomina/empleados/${id}`
  );
  
  if (!response.ok) {
    throw new Error(`Error al eliminar el empleado ${id}`);
  }
}

/**
 * Obtener la URL del contrato de un empleado
 * @param id ID del empleado
 * @returns Promesa con la URL del contrato
 */
export async function obtenerUrlContrato(id: number): Promise<{ url: string }> {
  const response = await apiRequest(
    'GET',
    `/api/nomina/empleados/${id}/contrato-url`
  );
  
  if (!response.ok) {
    throw new Error(`Error al obtener la URL del contrato del empleado ${id}`);
  }
  
  return response.json();
}

/**
 * Genera un PDF de desprendible de nómina
 * @param datosNomina Datos de la nómina a generar
 * @returns Promesa con la información del desprendible generado
 */
export async function generarDesprendible(datosNomina: ResultadoCalculoNomina): Promise<{ pdfUrl: string, id: number }> {
  const response = await apiRequest(
    'POST',
    '/api/nomina/desprendible/generar',
    datosNomina
  );
  
  if (!response.ok) {
    throw new Error('Error al generar el desprendible de nómina');
  }
  
  return response.json();
}

/**
 * Obtiene el historial de nóminas de un empleado
 * @param empleadoId ID del empleado
 * @returns Promesa con el listado de nóminas del empleado
 */
export async function obtenerNominasEmpleado(empleadoId: number): Promise<NominaProcesada[]> {
  const response = await apiRequest(
    'GET',
    `/api/nomina/empleado/${empleadoId}`
  );
  
  if (!response.ok) {
    throw new Error(`Error al obtener el historial de nóminas del empleado ${empleadoId}`);
  }
  
  return response.json();
}

/**
 * Marca una nómina como pagada
 * @param nominaId ID de la nómina
 * @returns Promesa con la nómina actualizada
 */
export async function marcarNominaPagada(nominaId: number): Promise<NominaProcesada> {
  const response = await apiRequest(
    'PATCH',
    `/api/nomina/${nominaId}/marcar-pagada`
  );
  
  if (!response.ok) {
    throw new Error(`Error al marcar la nómina ${nominaId} como pagada`);
  }
  
  return response.json();
}

/**
 * Cancela una nómina
 * @param nominaId ID de la nómina
 * @returns Promesa con la nómina actualizada
 */
export async function cancelarNomina(nominaId: number): Promise<NominaProcesada> {
  const response = await apiRequest(
    'PATCH',
    `/api/nomina/${nominaId}/cancelar`
  );
  
  if (!response.ok) {
    throw new Error(`Error al cancelar la nómina ${nominaId}`);
  }
  
  return response.json();
}

/**
 * Obtiene la URL de descarga del desprendible de una nómina
 * @param nominaId ID de la nómina
 * @returns Promesa con la URL del desprendible
 */
export async function obtenerUrlDesprendible(nominaId: number): Promise<{ pdfUrl: string }> {
  const response = await apiRequest(
    'GET',
    `/api/nomina/${nominaId}/desprendible-url`
  );
  
  if (!response.ok) {
    throw new Error(`Error al obtener la URL del desprendible de la nómina ${nominaId}`);
  }
  
  return response.json();
}

/**
 * Obtiene la lista de usuarios para asociar a empleados
 * @returns Promesa con la lista de usuarios
 */
export async function obtenerUsuarios(): Promise<Usuario[]> {
  const response = await apiRequest('GET', '/api/users');
  
  if (!response.ok) {
    throw new Error('Error al obtener la lista de usuarios');
  }
  
  return response.json();
}

/**
 * Descarga el contrato de un empleado
 * @param id ID del empleado
 * @param nombreEmpleado Nombre del empleado (opcional, para personalizar el nombre del archivo)
 */
export async function descargarContratoEmpleado(id: number, nombreEmpleado?: string): Promise<void> {
  try {
    // Configurar nombre del archivo
    const nombreArchivo = nombreEmpleado 
      ? `contrato_${nombreEmpleado.replace(/\s+/g, '_').toLowerCase()}.pdf`
      : `contrato_empleado_${id}.pdf`;
    
    // Crear un elemento <a> temporal
    const link = document.createElement('a');
    link.href = `/api/nomina/empleados/${id}/contrato`;
    link.setAttribute('download', nombreArchivo);
    
    // Anexar a la página, hacer clic y remover
    document.body.appendChild(link);
    link.click();
    
    // Limpiar el DOM
    setTimeout(() => {
      document.body.removeChild(link);
    }, 100);
  } catch (error) {
    console.error('Error al descargar el contrato del empleado:', error);
    throw error;
  }
}

/**
 * Cambia el estado de un empleado (activo/inactivo)
 * @param id ID del empleado
 * @param estado Nuevo estado (true para activo, false para inactivo)
 * @returns Promesa con el empleado actualizado
 */
export async function cambiarEstadoEmpleado(id: number, estado: boolean): Promise<Employee> {
  const response = await apiRequest(
    'PATCH',
    `/api/nomina/empleados/${id}/estado`,
    { activo: estado }
  );
  
  if (!response.ok) {
    throw new Error(`Error al cambiar el estado del empleado ${id}`);
  }
  
  return response.json();
}