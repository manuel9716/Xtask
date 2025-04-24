import { useQuery } from '@tanstack/react-query';
import { obtenerEmpleado } from '../api/empleadosApi';
import { Employee } from '@shared/schema';

/**
 * Hook para obtener los detalles de un empleado específico usando React Query
 * @param id ID del empleado a consultar
 * @returns Query con los datos del empleado, estado de carga y error
 */
export const useGetEmpleado = (id: number | undefined) => {
  return useQuery<Employee, Error>({
    queryKey: ['/api/finanzas/nomina/empleados', id],
    queryFn: () => {
      if (!id) {
        throw new Error('ID de empleado no proporcionado');
      }
      return obtenerEmpleado(id);
    },
    enabled: !!id, // Solo ejecutar la consulta si hay un ID válido
  });
};