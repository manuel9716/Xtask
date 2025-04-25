import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { ActualizarProyectoDTO, Proyecto } from '../../domain/entities/Proyecto';
import { proyectosApi } from '../../infrastructure/api/proyectosApi';

/**
 * Hook para gestionar la actualización de un proyecto
 */
export function useActualizarProyecto(proyectoId: number) {
  const [error, setError] = useState<string | null>(null);
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async (proyecto: ActualizarProyectoDTO): Promise<Proyecto> => {
      try {
        return await proyectosApi.actualizarProyecto(proyectoId, proyecto);
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Error al actualizar el proyecto';
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
    actualizarProyecto: mutation.mutate,
    isLoading: mutation.isPending,
    error,
    isSuccess: mutation.isSuccess,
    reset: () => {
      setError(null);
      mutation.reset();
    }
  };
}