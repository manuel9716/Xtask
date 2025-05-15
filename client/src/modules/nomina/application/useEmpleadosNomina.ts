import { useQuery } from '@tanstack/react-query';
import { Employee } from '@shared/schema';

interface BackendEmpleadosResponse {
  empleados: Employee[];
  pagination: {
    page: number;
    pageSize: number;
    totalItems: number;
    totalPages: number;
  };
}

interface EmpleadosResponse {
  data: Employee[];
  total: number;
  currentPage: number;
  totalPages: number;
}

interface EmpleadosParams {
  page?: number;
  pageSize?: number;
  search?: string;
  department?: string;
  contractStatus?: string;
}

interface UseEmpleadosNominaResult {
  data: EmpleadosResponse | undefined;
  empleados: Employee[]; // Para compatibilidad con componentes existentes
  empleadosParaSelect: { label: string; value: string }[]; // Para compatibilidad con componentes existentes
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
}

/**
 * Hook para obtener empleados para nómina
 * 
 * Por defecto, trae solo empleados activos
 */
export function useEmpleadosNomina(params: EmpleadosParams = { page: 1, pageSize: 100, contractStatus: 'active' }): UseEmpleadosNominaResult {
  console.log('Enviando filtros:', params);
  
  const { data, isLoading, isError, error } = useQuery<EmpleadosResponse>({
    queryKey: [
      '/api/nomina/empleados/listar',
      params.page,
      params.pageSize,
      params.search,
      params.department,
      params.contractStatus
    ],
    queryFn: async ({ queryKey }) => {
      const [_, page, pageSize, search, department, contractStatus] = queryKey;
      
      const searchParams = new URLSearchParams();
      if (page) searchParams.append('page', page.toString());
      if (pageSize) searchParams.append('pageSize', pageSize.toString());
      if (search) searchParams.append('search', search.toString());
      if (department) searchParams.append('department', department.toString());
      if (contractStatus) searchParams.append('contractStatus', contractStatus.toString());
      
      const response = await fetch(`/api/nomina/empleados/listar?${searchParams.toString()}`);
      
      if (!response.ok) {
        throw new Error('Error al obtener empleados para nómina');
      }
      
      const data = await response.json();
      console.log('Datos recibidos del backend:', data);
      
      // Si el backend devuelve un array plano, lo convertimos al formato esperado
      if (Array.isArray(data)) {
        console.log('Formato: Array plano');
        return {
          data: data,
          total: data.length,
          currentPage: 1,
          totalPages: 1
        };
      }
      
      // Si el backend devuelve el formato con empleados y pagination
      if (data.empleados && data.pagination) {
        console.log('Formato: { empleados, pagination }');
        return {
          data: data.empleados,
          total: data.pagination.totalItems,
          currentPage: data.pagination.page,
          totalPages: data.pagination.totalPages
        };
      }
      
      // Si ya tiene el formato esperado, lo devolvemos tal cual
      console.log('Formato: asumiendo formato esperado');
      return data;
    }
  });

  // Extraer los empleados para compatibilidad con componentes existentes
  const empleados: Employee[] = data?.data || [];
  
  // Convertir empleados en opciones para componentes de selección
  const empleadosParaSelect = empleados.map(emp => ({
    label: `${emp.firstName} ${emp.lastName}`,
    value: emp.id.toString()
  }));

  return {
    data,
    empleados,
    empleadosParaSelect,
    isLoading,
    isError,
    error
  };
}