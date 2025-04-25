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
      console.log('Obteniendo indicadores de proyectos...');
      const indicadores = await proyectoService.obtenerIndicadores();
      console.log('Indicadores obtenidos:', indicadores);
      return indicadores;
    },
    staleTime: 5 * 60 * 1000, // 5 minutos
    refetchOnWindowFocus: true, // Habilitamos para ver actualizaciones
    retry: 3 // Intentar hasta 3 veces
  });
}

/**
 * Use case para obtener indicadores y métricas de proyectos
 */
export async function obtenerIndicadoresProyectos(): Promise<ProyectosIndicadores> {
  return proyectoService.obtenerIndicadores();
}