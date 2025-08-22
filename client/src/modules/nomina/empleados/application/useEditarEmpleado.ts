import { useMutation, useQueryClient } from '@tanstack/react-query';
import { actualizarEmpleado } from '../api/empleadosApi';
import { EmpleadoNuevo } from '@shared/schema';

/**
 * Interface para los parámetros necesarios para editar un empleado
 */
export interface EditarEmpleadoParams {
  id: number;
  data: Partial<EmpleadoNuevo>;
}

/**
 * Hook para actualizar los datos de un empleado existente
 * @returns Mutation para actualizar un empleado
 */
export const useEditarEmpleado = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: EditarEmpleadoParams) => 
      actualizarEmpleado(id, data),
    
    onSuccess: (_, variables) => {
      // Invalidar consultas relacionadas
      queryClient.invalidateQueries({ queryKey: ['/api/empleados-nuevos'] });
      queryClient.invalidateQueries({ queryKey: ['/api/empleados-nuevos', variables.id] });
    }
  });
};