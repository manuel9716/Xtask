import { useQuery } from '@tanstack/react-query';
import { Employee } from '@shared/schema';
import { apiRequest } from '@/lib/queryClient';

interface EmpleadosResponse {
  data: Employee[];
  total: number;
  currentPage: number;
  totalPages: number;
}

/**
 * Hook para obtener empleados para nómina
 * 
 * Por defecto, trae solo empleados activos
 */
export function useEmpleadosNomina(params = { page: 1, pageSize: 100, contractStatus: 'ACTIVO' }) {
  console.log('Enviando filtros:', params);
  
  const { data, isLoading, error } = useQuery<EmpleadosResponse, Error>({
    queryKey: ['/api/nomina/empleados/listar', params],
    queryFn: async () => {
      // Construir URL con parámetros
      const searchParams = new URLSearchParams();
      
      // Agregar todos los parámetros no vacíos
      for (const [key, value] of Object.entries(params)) {
        if (value !== null && value !== undefined && value !== '') {
          searchParams.append(key, value.toString());
        }
      }
      
      const url = `/api/nomina/empleados/listar?${searchParams.toString()}`;
      const response = await apiRequest('GET', url);
      
      if (!response.ok) {
        const errorMessage = await response.text();
        throw new Error(`Error al obtener empleados: ${errorMessage}`);
      }
      
      return response.json();
    },
  });

  return {
    empleados: data?.data,
    total: data?.total || 0,
    currentPage: data?.currentPage || 1,
    totalPages: data?.totalPages || 1,
    isLoading,
    error,
  };
}