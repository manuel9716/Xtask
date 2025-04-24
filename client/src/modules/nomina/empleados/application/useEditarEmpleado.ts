import { useMutation, useQueryClient } from '@tanstack/react-query';
import { actualizarEmpleado } from '../api/empleadosApi';
import { useToast } from '@/hooks/use-toast';
import { Employee } from '@shared/schema';

/**
 * Hook para editar un empleado usando React Query
 * @returns Mutación para actualizar empleado con estados y funciones de callback
 */
export const useEditarEmpleado = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<Employee> }) => 
      actualizarEmpleado(id, data),
    onSuccess: (data, variables) => {
      // Invalidar la caché del empleado específico y la lista de empleados
      queryClient.invalidateQueries({ queryKey: ['/api/finanzas/nomina/empleados', variables.id] });
      queryClient.invalidateQueries({ queryKey: ['/api/finanzas/nomina/empleados'] });
      
      toast({
        title: 'Empleado actualizado',
        description: 'Los datos del empleado han sido actualizados exitosamente',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: `Error al actualizar el empleado: ${error.message}`,
        variant: 'destructive',
      });
    },
  });
};