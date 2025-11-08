import { useQuery } from '@tanstack/react-query';
import { empleadosService } from '@/application/services/empleados.service';

/**
 * Hook para obtener lista de empleados
 */
export function useEmpleadoss() {
  return useQuery({
    queryKey: ['empleados'],
    queryFn: () => empleadosService.getEmpleadoss(),
  });
}
