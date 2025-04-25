import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { FiltrosProyecto, ProyectosPaginados } from '../../domain/entities/Proyecto';
import { proyectosApi } from '../../infrastructure/api/proyectosApi';

/**
 * Hook para listar proyectos con filtros y paginación
 */
export function useListarProyectos(filtros: FiltrosProyecto = {}) {
  const [error, setError] = useState<string | null>(null);
  
  // Construir la key de consulta incluyendo los filtros
  const queryKey = ['/api/proyectos', filtros];
  
  const query = useQuery<ProyectosPaginados>({
    queryKey,
    queryFn: async () => {
      try {
        return await proyectosApi.listarProyectos(filtros);
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Error al listar proyectos';
        setError(message);
        throw new Error(message);
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutos
  });

  return {
    proyectos: query.data?.data || [],
    total: query.data?.total || 0,
    pagina: query.data?.pagina || 1,
    totalPaginas: query.data?.totalPaginas || 1,
    porPagina: query.data?.porPagina || 10,
    isLoading: query.isLoading,
    isError: query.isError,
    error,
    refetch: query.refetch,
  };
}