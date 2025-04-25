import { useQuery } from '@tanstack/react-query';
import { ProyectosIndicadores } from '../../domain/repositories/ProyectoRepository';
import { proyectoService } from '../../infrastructure/di/container';

/**
 * Hook para obtener indicadores y métricas de proyectos
 */
export function useIndicadoresProyectos() {
  return useQuery<ProyectosIndicadores, Error>({
    queryKey: ['/api/proyectos/indicadores'],
    queryFn: async () => {
      return proyectoService.obtenerIndicadores();
    },
    staleTime: 5 * 60 * 1000, // 5 minutos
    refetchOnWindowFocus: false
  });
}

/**
 * Use case para obtener indicadores y métricas de proyectos
 */
export async function obtenerIndicadoresProyectos(): Promise<ProyectosIndicadores> {
  return proyectoService.obtenerIndicadores();
}