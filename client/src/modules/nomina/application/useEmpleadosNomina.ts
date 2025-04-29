import { useQuery } from '@tanstack/react-query';
import { Employee } from '@shared/schema';
import { obtenerEmpleados, FiltrosEmpleado } from '../empleados/api/empleadosApi';

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
      // Solo traemos empleados activos para la nómina
      const filtros: FiltrosEmpleado = {
        contractStatus: 'ACTIVO',
        pageSize: 100 // Traer suficientes para mostrar en el selector
      };
      const response = await obtenerEmpleados(filtros);
      return response.empleados;
    }
  });

  // Extraer y normalizar datos
  const empleados: (Employee & { nombre?: string })[] = data || [];
  
  // Obtener empleados transformados para componentes UI
  const empleadosParaSelect = empleados.map(emp => ({
    value: emp.id.toString(),
    label: emp.firstName ? `${emp.firstName} ${emp.lastName || ''}` : `Empleado #${emp.id}`,
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