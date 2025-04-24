import { apiRequest } from '@/lib/queryClient';
import { Employee } from '@shared/schema';
import { ResultadoPaginadoEmpleados, FiltrosEmpleado, CrearEmpleadoParams } from '../empleados/domain/entities/Empleado';

const BASE_URL = '/api/finanzas/nomina/empleados';

/**
 * Obtiene la lista de empleados con filtros opcionales
 */
export async function obtenerEmpleados(filtros?: FiltrosEmpleado): Promise<ResultadoPaginadoEmpleados> {
  const queryParams = new URLSearchParams();
  
  if (filtros?.page) {
    queryParams.append('page', filtros.page.toString());
  }
  
  if (filtros?.pageSize) {
    queryParams.append('pageSize', filtros.pageSize.toString());
  }
  
  if (filtros?.contractStatus) {
    queryParams.append('contractStatus', filtros.contractStatus);
  }
  
  if (filtros?.department) {
    queryParams.append('department', filtros.department);
  }
  
  if (filtros?.search) {
    queryParams.append('search', filtros.search);
  }
  
  const url = `${BASE_URL}?${queryParams.toString()}`;
  const res = await apiRequest('GET', url);
  
  if (!res.ok) {
    throw new Error('Error al obtener la lista de empleados');
  }
  
  return res.json();
}

/**
 * Obtiene un empleado por su ID
 */
export async function obtenerEmpleadoPorId(id: number): Promise<Employee> {
  const res = await apiRequest('GET', `${BASE_URL}/${id}`);
  
  if (!res.ok) {
    throw new Error(`Error al obtener el empleado con ID ${id}`);
  }
  
  return res.json();
}

/**
 * Crea un nuevo empleado
 */
export async function crearEmpleado(datos: CrearEmpleadoParams): Promise<Employee> {
  const res = await apiRequest('POST', BASE_URL, datos);
  
  if (!res.ok) {
    const errorData = await res.json();
    throw new Error(errorData.error || 'Error al crear el empleado');
  }
  
  return res.json();
}

/**
 * Actualiza un empleado existente
 */
export async function actualizarEmpleado(id: number, datos: Partial<CrearEmpleadoParams>): Promise<Employee> {
  const res = await apiRequest('PATCH', `${BASE_URL}/${id}`, datos);
  
  if (!res.ok) {
    const errorData = await res.json();
    throw new Error(errorData.error || `Error al actualizar el empleado con ID ${id}`);
  }
  
  return res.json();
}

/**
 * Cambia el estado del contrato de un empleado
 */
export async function cambiarEstadoEmpleado(id: number, nuevoEstado: string): Promise<Employee> {
  const res = await apiRequest('PATCH', `${BASE_URL}/${id}/estado`, { estado: nuevoEstado });
  
  if (!res.ok) {
    const errorData = await res.json();
    throw new Error(errorData.error || `Error al cambiar el estado del empleado con ID ${id}`);
  }
  
  return res.json();
}

/**
 * Elimina un empleado (lo marca como terminado)
 */
export async function eliminarEmpleado(id: number): Promise<{ message: string; empleado: Employee }> {
  const res = await apiRequest('DELETE', `${BASE_URL}/${id}`);
  
  if (!res.ok) {
    const errorData = await res.json();
    throw new Error(errorData.error || `Error al eliminar el empleado con ID ${id}`);
  }
  
  return res.json();
}