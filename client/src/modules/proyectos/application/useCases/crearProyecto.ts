import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { CrearProyectoDTO, Proyecto } from '../../domain/entities/Proyecto';
import { proyectosApi } from '../../infrastructure/api/proyectosApi';

/**
 * Hook para gestionar la creación de un nuevo proyecto
 */
export function useCrearProyecto() {
  const [error, setError] = useState<string | null>(null);
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async (proyecto: CrearProyectoDTO): Promise<Proyecto> => {
      try {
        return await proyectosApi.crearProyecto(proyecto);
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Error al crear el proyecto';
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
    crearProyecto: mutation.mutate,
    isLoading: mutation.isPending,
    error,
    isSuccess: mutation.isSuccess,
    reset: () => {
      setError(null);
      mutation.reset();
    }
  };
}