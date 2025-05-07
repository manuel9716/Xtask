import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Proyecto, CambiarEstadoProyectoDTO } from '../../domain/entities/Proyecto';
import { proyectoService } from '../../infrastructure/di/container';
import * as Schema from '@shared/schema';

const EstadoProyecto = Schema.EstadoProyecto;

/**
 * Hook para cambiar el estado de un proyecto
 */
export function useCambiarEstadoProyecto(id: number) {
  const queryClient = useQueryClient();
  
  return useMutation<Proyecto, Error, { estado: typeof EstadoProyecto[keyof typeof EstadoProyecto], comentario?: string }>({
    mutationFn: async ({ estado }) => {
      try {
        return await proyectoService.cambiarEstadoProyecto(id, estado);
      } catch (error) {
        throw new Error(`Error al cambiar estado del proyecto: ${(error as Error).message}`);
      }
    },
    onSuccess: () => {
      // Invalidar cache del listado y del proyecto específico
      queryClient.invalidateQueries({ queryKey: ['/api/proyectos'] });
      queryClient.invalidateQueries({ queryKey: [`/api/proyectos/${id}`] });
    }
  });
}

/**
 * Use case para cambiar el estado de un proyecto
 */
export async function cambiarEstadoProyecto(id: number, estado: typeof EstadoProyecto[keyof typeof EstadoProyecto]): Promise<Proyecto> {
  return proyectoService.cambiarEstadoProyecto(id, estado);
}

/**
 * Obtiene el siguiente estado de un proyecto en la secuencia típica
 */
export function obtenerSiguienteEstado(estadoActual: typeof EstadoProyecto[keyof typeof EstadoProyecto]): typeof EstadoProyecto[keyof typeof EstadoProyecto] {
  switch (estadoActual) {
    case EstadoProyecto.ACTIVO:
      return EstadoProyecto.PAUSADO;
    case EstadoProyecto.PAUSADO:
      return EstadoProyecto.RETRASADO;
    case EstadoProyecto.RETRASADO:
      return EstadoProyecto.FINALIZADO;
    case EstadoProyecto.FINALIZADO:
      return EstadoProyecto.ACTIVO;
    default:
      return EstadoProyecto.ACTIVO;
  }
}