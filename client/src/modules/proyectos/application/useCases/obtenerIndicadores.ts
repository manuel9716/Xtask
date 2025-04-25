import { useQuery } from '@tanstack/react-query';
import { ProyectosIndicadores } from '../../domain/repositories/ProyectoRepository';
import { proyectoService } from '../../infrastructure/di/container';

/**
 * Hook para obtener indicadores y métricas de proyectos
 */
export function useIndicadoresProyectos() {
  // Reducimos staleTime para forzar actualización más frecuente
  return useQuery<ProyectosIndicadores, Error>({
    queryKey: ['/api/proyectos/indicadores'],
    queryFn: async () => {
      console.log('Obteniendo indicadores de proyectos...');
      try {
        const response = await fetch('/api/proyectos/indicadores');
        if (!response.ok) {
          throw new Error(`Error API: ${response.status}`);
        }
        const indicadores = await response.json();
        console.log('Indicadores obtenidos directamente:', indicadores);
        return indicadores;
      } catch (error) {
        console.error('Error al obtener indicadores:', error);
        throw error;
      }
    },
    staleTime: 0, // Sin caché para forzar refetch
    refetchOnWindowFocus: true,
    refetchOnMount: true,
    retry: 3
  });
}

/**
 * Use case para obtener indicadores y métricas de proyectos
 */
export async function obtenerIndicadoresProyectos(): Promise<ProyectosIndicadores> {
  return proyectoService.obtenerIndicadores();
}