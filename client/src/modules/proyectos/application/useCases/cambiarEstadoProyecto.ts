import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Proyecto, EstadoProyecto, CambiarEstadoProyectoDTO } from '../../domain/entities/Proyecto';
import { proyectoService } from '../../infrastructure/di/container';

/**
 * Hook para cambiar el estado de un proyecto
 */
export function useCambiarEstadoProyecto(id: number) {
  const queryClient = useQueryClient();
  
  return useMutation<Proyecto, Error, { estado: EstadoProyecto, comentario?: string }>({
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
export async function cambiarEstadoProyecto(id: number, estado: EstadoProyecto): Promise<Proyecto> {
  return proyectoService.cambiarEstadoProyecto(id, estado);
}

/**
 * Obtiene el siguiente estado de un proyecto en la secuencia típica
 */
export function obtenerSiguienteEstado(estadoActual: EstadoProyecto): EstadoProyecto {
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