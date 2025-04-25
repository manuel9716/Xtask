import { useQuery } from '@tanstack/react-query';
import { Proyecto } from '../../domain/entities/Proyecto';
import { proyectoService } from '../../infrastructure/di/container';

/**
 * Hook para obtener un proyecto por su ID
 */
export function useProyecto(id: number) {
  return useQuery<Proyecto, Error>({
    queryKey: [`/api/proyectos/${id}`],
    queryFn: async () => {
      try {
        return await proyectoService.obtenerProyecto(id);
      } catch (error) {
        throw new Error(`Error al obtener el proyecto: ${(error as Error).message}`);
      }
    },
    enabled: !!id
  });
}

/**
 * Caso de uso para obtener un proyecto por su ID
 */
export async function obtenerProyecto(id: number): Promise<Proyecto> {
  return proyectoService.obtenerProyecto(id);
}