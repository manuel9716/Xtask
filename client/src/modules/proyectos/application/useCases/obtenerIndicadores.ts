import { useQuery } from '@tanstack/react-query';
import { proyectosApi } from '../../infrastructure/api/proyectosApi';

/**
 * Interfaz para los indicadores/métricas de proyectos
 */
export interface IndicadoresProyectos {
  totalProyectos: number;
  proyectosActivos: number;
  proyectosPausados: number;
  proyectosFinalizados: number;
  proyectosRetrasados: number;
  presupuestoTotal: number;
  presupuestoActivos: number;
}

/**
 * Hook para obtener indicadores/métricas del dashboard de proyectos
 * Implementa el caso de uso "Obtener Indicadores"
 */
export function useObtenerIndicadores() {
  const {
    data,
    isLoading,
    isError,
    error,
    refetch
  } = useQuery<IndicadoresProyectos, Error>({
    queryKey: ['/api/proyectos/indicadores'],
    queryFn: async () => {
      return await proyectosApi.obtenerIndicadores();
    }
  });
  
  return {
    indicadores: data,
    isLoading,
    isError,
    error,
    refetch
  };
}