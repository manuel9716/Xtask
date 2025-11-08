import { useMutation, useQueryClient } from '@tanstack/react-query';
import { empleadosService } from '@/application/services/empleados.service';
import { CreateEmpleadosData } from '@/domain/types/empleados.types';

/**
 * Hook para crear empleados
 */
export function useCreateEmpleados() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateEmpleadosData) => 
      empleadosService.createEmpleados(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['empleados'] });
    },
  });
}
