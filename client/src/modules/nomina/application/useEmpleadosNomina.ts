import { useQuery } from '@tanstack/react-query';
import { Employee } from '@shared/schema';

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

/**
 * Hook para obtener empleados para nómina
 * 
 * Por defecto, trae solo empleados activos
 */
export function useEmpleadosNomina(params: EmpleadosParams = { page: 1, pageSize: 100, contractStatus: 'ACTIVO' }) {
  console.log('Enviando filtros:', params);
  
  return useQuery<EmpleadosResponse>({
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
      
      return await response.json();
    }
  });
}