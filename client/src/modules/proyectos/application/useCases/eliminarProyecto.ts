import { useMutation, useQueryClient } from '@tanstack/react-query';
import { proyectoService } from '../../infrastructure/di/container';

/**
 * Hook para eliminar un proyecto
 */
export function useEliminarProyecto() {
  const queryClient = useQueryClient();
  
  return useMutation<void, Error, number>({
    mutationFn: async (id) => {
      try {
        return await proyectoService.eliminarProyecto(id);
      } catch (error) {
        throw new Error(`Error al eliminar el proyecto: ${(error as Error).message}`);
      }
    },
    onSuccess: () => {
      // Invalidar cache del listado de proyectos
      queryClient.invalidateQueries({ queryKey: ['/api/proyectos'] });
    }
  });
}

/**
 * Use case para eliminar un proyecto
 */
export async function eliminarProyecto(id: number): Promise<void> {
  return proyectoService.eliminarProyecto(id);
}