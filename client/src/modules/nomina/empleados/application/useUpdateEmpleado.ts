import { useMutation, useQueryClient } from '@tanstack/react-query';
import { actualizarEmpleado } from '../api/empleadosApi';
import { Employee } from '@shared/schema';

/**
 * Interface para los parámetros necesarios para editar un empleado
 */
export interface EditarEmpleadoParams {
  id: number;
  data: Partial<Employee>;
}

/**
 * Hook para actualizar los datos de un empleado existente
 * @returns Mutation para actualizar un empleado
 */
export const useUpdateEmpleado = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: EditarEmpleadoParams) => 
      actualizarEmpleado(id, data),
    
    onSuccess: (_, variables) => {
      // Invalidar consultas relacionadas
      queryClient.invalidateQueries({ queryKey: ['/api/nomina/empleados'] });
      queryClient.invalidateQueries({ queryKey: ['/api/nomina/empleados', variables.id] });
    }
  });
};