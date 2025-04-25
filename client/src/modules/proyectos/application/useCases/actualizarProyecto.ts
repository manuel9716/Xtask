import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Proyecto, ActualizarProyectoDTO } from '../../domain/entities/Proyecto';
import { proyectoService } from '../../infrastructure/di/container';

/**
 * Hook para actualizar un proyecto existente
 */
export function useActualizarProyecto(id: number) {
  const queryClient = useQueryClient();
  
  return useMutation<Proyecto, Error, ActualizarProyectoDTO>({
    mutationFn: async (datosActualizados) => {
      try {
        return await proyectoService.actualizarProyecto(id, datosActualizados);
      } catch (error) {
        throw new Error(`Error al actualizar el proyecto: ${(error as Error).message}`);
      }
    },
    onSuccess: () => {
      // Invalidar cache del listado y del proyecto específico
      queryClient.invalidateQueries({ queryKey: ['/api/proyectos'] });
      queryClient.invalidateQueries({ queryKey: [`/api/proyectos/${id}`] });
    }
  });
}

/**
 * Use case para actualizar un proyecto existente
 */
export async function actualizarProyecto(id: number, datos: ActualizarProyectoDTO): Promise<Proyecto> {
  return proyectoService.actualizarProyecto(id, datos);
}