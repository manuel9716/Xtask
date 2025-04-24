import { apiRequest } from '@/lib/queryClient';
import { FiltrosEmpleado, ResultadoPaginadoEmpleados, CrearEmpleadoParams } from '../domain/entities/Empleado';
import { Employee, User } from '@shared/schema';

const BASE_URL = '/api/finanzas/nomina/empleados';

/**
 * Obtiene la lista de empleados con filtros opcionales
 * @param filtros Filtros de búsqueda
 * @returns Lista paginada de empleados
 */
export const obtenerEmpleados = async (filtros: FiltrosEmpleado = {}): Promise<ResultadoPaginadoEmpleados> => {
  // Construir query string para los filtros
  const params = new URLSearchParams();
  
  if (filtros.page) params.append('page', filtros.page.toString());
  if (filtros.pageSize) params.append('pageSize', filtros.pageSize.toString());
  if (filtros.search) params.append('search', filtros.search);
  if (filtros.contractStatus) params.append('contractStatus', filtros.contractStatus);
  if (filtros.department) params.append('department', filtros.department);
  
  const queryString = params.toString();
  const url = queryString ? `${BASE_URL}?${queryString}` : BASE_URL;
  
  const response = await apiRequest('GET', url);
  
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Error al obtener empleados');
  }
  
  return response.json();
};

/**
 * Obtiene un empleado por su ID
 * @param id ID del empleado
 * @returns Detalles del empleado
 */
export const obtenerEmpleadoPorId = async (id: number): Promise<Employee> => {
  const response = await apiRequest('GET', `${BASE_URL}/${id}`);
  
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Error al obtener el empleado');
  }
  
  return response.json();
};

/**
 * Crea un nuevo empleado
 * @param empleado Datos del empleado a crear
 * @returns Empleado creado
 */
export const crearEmpleado = async (empleado: CrearEmpleadoParams): Promise<Employee> => {
  // Preparamos los datos, excluyendo el archivo de contrato que se sube por separado
  const { contratoFile, ...datosEmpleado } = empleado;
  
  const response = await apiRequest('POST', BASE_URL, datosEmpleado);
  
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Error al crear el empleado');
  }
  
  return response.json();
};

/**
 * Actualiza un empleado existente
 * @param id ID del empleado a actualizar
 * @param empleado Datos a actualizar
 * @returns Empleado actualizado
 */
export const actualizarEmpleado = async (id: number, empleado: any): Promise<Employee> => {
  const response = await apiRequest('PATCH', `${BASE_URL}/${id}`, empleado);
  
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Error al actualizar el empleado');
  }
  
  return response.json();
};

/**
 * Cambia el estado de un empleado
 * @param id ID del empleado a actualizar
 * @param nuevoEstado Nuevo estado del empleado
 * @returns Resultado de la operación
 */
export const cambiarEstadoEmpleado = async (id: number, nuevoEstado: string): Promise<any> => {
  const response = await apiRequest('PATCH', `${BASE_URL}/${id}/estado`, { estado: nuevoEstado });
  
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Error al cambiar el estado del empleado');
  }
  
  return response.json();
};

/**
 * Elimina (marca como terminado) un empleado
 * @param id ID del empleado a eliminar
 * @returns Resultado de la operación
 */
export const eliminarEmpleado = async (id: number): Promise<any> => {
  const response = await apiRequest('DELETE', `${BASE_URL}/${id}`);
  
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Error al eliminar el empleado');
  }
  
  return response.json();
};

/**
 * Obtiene todos los usuarios del sistema para seleccionar en el formulario de empleado
 * @returns Lista de usuarios
 */
export const obtenerUsuarios = async (): Promise<User[]> => {
  const response = await apiRequest('GET', '/api/users');
  
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Error al obtener usuarios');
  }
  
  return await response.json();
};

/**
 * Sube un archivo de contrato para un empleado
 * @param file Archivo a subir
 * @param empleadoId ID del empleado (opcional, para actualizar un contrato existente)
 * @returns URL del archivo subido
 */
export const subirContratoEmpleado = async (file: File, empleadoId?: number): Promise<string> => {
  const formData = new FormData();
  formData.append('contrato', file);
  
  if (empleadoId) {
    formData.append('empleadoId', empleadoId.toString());
  }
  
  const url = `${BASE_URL}/contrato`;
  
  // No podemos usar apiRequest directamente porque necesitamos enviar un FormData
  const response = await fetch(url, {
    method: 'POST',
    body: formData,
    // No establecemos Content-Type porque fetch lo hace automáticamente con boundary para FormData
  });
  
  if (!response.ok) {
    let errorMsg = 'Error al subir el contrato';
    try {
      const errorData = await response.json();
      errorMsg = errorData.error || errorMsg;
    } catch (e) {
      // Si no podemos parsear el error como JSON, usamos el mensaje genérico
    }
    throw new Error(errorMsg);
  }
  
  const data = await response.json();
  return data.url;
};