import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { recursosApi } from '../../infrastructure/api/recursosApi';
import { ActualizarRecursoDTO } from '../../domain/entities/Recurso';

/**
 * Hook para listar recursos de un presupuesto
 */
export function useListarRecursosPorPresupuesto(presupuestoId: number) {
  return useQuery({
    queryKey: ['recursos', presupuestoId],
    queryFn: () => recursosApi.listarRecursosPorPresupuesto(presupuestoId),
    enabled: !!presupuestoId,
  });
}

/**
 * Hook para actualizar un recurso
 */
export function useActualizarRecurso() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: ActualizarRecursoDTO }) => {
      return recursosApi.actualizarRecurso(id, data);
    },
    onSuccess: (recurso) => {
      queryClient.invalidateQueries({ 
        queryKey: ['recursos', recurso.presupuestoId] 
      });
      queryClient.invalidateQueries({ 
        queryKey: ['recursos-resumen', recurso.presupuestoId] 
      });

      toast({
        title: "Recurso actualizado",
        description: `Se ha actualizado el recurso ${recurso.perfil} exitosamente.`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error al actualizar recurso",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}

/**
 * Hook para eliminar un recurso
 */
export function useEliminarRecurso() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({ id, presupuestoId }: { id: number; presupuestoId: number }) => {
      return recursosApi.eliminarRecurso(id);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ 
        queryKey: ['recursos', variables.presupuestoId] 
      });
      queryClient.invalidateQueries({ 
        queryKey: ['recursos-resumen', variables.presupuestoId] 
      });

      toast({
        title: "Recurso eliminado",
        description: "El recurso ha sido eliminado exitosamente.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error al eliminar recurso",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}