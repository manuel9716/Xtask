import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Proyecto } from '../../domain/entities/Proyecto';
import { proyectosApi } from '../../infrastructure/api/proyectosApi';

/**
 * Hook para obtener un proyecto por su ID
 */
export function useObtenerProyecto(proyectoId?: number) {
  const [error, setError] = useState<string | null>(null);
  
  const query = useQuery<Proyecto>({
    queryKey: ['/api/proyectos', proyectoId],
    queryFn: async () => {
      if (!proyectoId) {
        throw new Error('ID de proyecto requerido');
      }
      
      try {
        return await proyectosApi.obtenerProyectoPorId(proyectoId);
      } catch (err) {
        const message = err instanceof Error ? err.message : `Error al obtener el proyecto #${proyectoId}`;
        setError(message);
        throw new Error(message);
      }
    },
    enabled: !!proyectoId,
  });

  return {
    proyecto: query.data,
    isLoading: query.isLoading,
    isError: query.isError,
    error,
    refetch: query.refetch,
  };
}