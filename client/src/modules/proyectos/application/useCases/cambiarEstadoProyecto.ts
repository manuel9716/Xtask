import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { CambiarEstadoProyectoDTO, Proyecto } from '../../domain/entities/Proyecto';
import { proyectosApi } from '../../infrastructure/api/proyectosApi';

/**
 * Hook para gestionar el cambio de estado de un proyecto
 */
export function useCambiarEstadoProyecto(proyectoId: number) {
  const [error, setError] = useState<string | null>(null);
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async (cambioEstado: CambiarEstadoProyectoDTO): Promise<Proyecto> => {
      try {
        return await proyectosApi.cambiarEstadoProyecto(proyectoId, cambioEstado);
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Error al cambiar el estado del proyecto';
        setError(message);
        throw new Error(message);
      }
    },
    onSuccess: () => {
      // Invalidar consultas para refrescar los datos
      queryClient.invalidateQueries({ queryKey: ['/api/proyectos'] });
      queryClient.invalidateQueries({ queryKey: ['/api/proyectos', proyectoId] });
      setError(null);
    },
  });

  return {
    cambiarEstado: mutation.mutate,
    isLoading: mutation.isPending,
    error,
    isSuccess: mutation.isSuccess,
    reset: () => {
      setError(null);
      mutation.reset();
    }
  };
}