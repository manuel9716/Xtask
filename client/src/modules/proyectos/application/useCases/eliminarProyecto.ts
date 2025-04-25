import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { proyectosApi } from '../../infrastructure/api/proyectosApi';

/**
 * Hook para gestionar la eliminación de un proyecto
 */
export function useEliminarProyecto() {
  const [error, setError] = useState<string | null>(null);
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async (id: number): Promise<void> => {
      try {
        return await proyectosApi.eliminarProyecto(id);
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Error al eliminar el proyecto';
        setError(message);
        throw new Error(message);
      }
    },
    onSuccess: () => {
      // Invalidar consultas para refrescar los datos
      queryClient.invalidateQueries({ queryKey: ['/api/proyectos'] });
      setError(null);
    },
  });

  return {
    eliminarProyecto: mutation.mutate,
    isLoading: mutation.isPending,
    error,
    isSuccess: mutation.isSuccess,
    reset: () => {
      setError(null);
      mutation.reset();
    }
  };
}