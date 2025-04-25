import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Proyecto, CrearProyectoDTO } from '../../domain/entities/Proyecto';
import { proyectoService } from '../../infrastructure/di/container';

/**
 * Hook para crear un nuevo proyecto
 */
export function useCrearProyecto() {
  const queryClient = useQueryClient();
  
  return useMutation<Proyecto, Error, CrearProyectoDTO>({
    mutationFn: async (datos) => {
      try {
        return await proyectoService.crearProyecto(datos);
      } catch (error) {
        throw new Error(`Error al crear el proyecto: ${(error as Error).message}`);
      }
    },
    onSuccess: () => {
      // Invalidar cache de proyectos
      queryClient.invalidateQueries({ queryKey: ['/api/proyectos'] });
    }
  });
}

/**
 * Use case para crear un nuevo proyecto
 */
export async function crearProyecto(datos: CrearProyectoDTO): Promise<Proyecto> {
  return proyectoService.crearProyecto(datos);
}