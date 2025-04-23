import { useQuery } from '@tanstack/react-query';
import { Employee } from '@shared/schema';

/**
 * Hook para obtener empleados disponibles para nómina
 */
export function useEmpleadosNomina() {
  const {
    data,
    isLoading,
    isError,
    error,
    refetch
  } = useQuery({
    queryKey: ['/api/nomina/empleados/listar'],
    queryFn: async () => {
      const response = await fetch('/api/nomina/empleados/listar');
      if (!response.ok) {
        throw new Error('Error al obtener empleados');
      }
      return await response.json();
    }
  });

  // Extraer y normalizar datos
  const empleados: (Employee & { nombre: string })[] = data || [];
  
  // Obtener empleados transformados para componentes UI
  const empleadosParaSelect = empleados.map(emp => ({
    value: emp.id.toString(),
    label: emp.nombre || `Empleado #${emp.id}`,
    data: emp
  }));

  return {
    empleados,
    empleadosParaSelect,
    isLoading,
    isError,
    error,
    refetch
  };
}