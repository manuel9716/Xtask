import { useQuery } from '@tanstack/react-query';
import { FiltrosProyecto, Proyecto } from '../../domain/entities/Proyecto';
import { proyectoService } from '../../infrastructure/di/container';

/**
 * Hook para obtener listado de proyectos con filtros opcionales
 */
export function useProyectos(filtros?: FiltrosProyecto) {
  return useQuery<Proyecto[], Error>({
    queryKey: ['/api/proyectos', filtros],
    queryFn: async () => {
      return proyectoService.listarProyectos(filtros);
    }
  });
}

/**
 * Caso de uso para listar proyectos
 */
export async function listarProyectos(filtros?: FiltrosProyecto): Promise<Proyecto[]> {
  return proyectoService.listarProyectos(filtros);
}