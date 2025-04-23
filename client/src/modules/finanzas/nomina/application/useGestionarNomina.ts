import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { MarcarComoPagadaParams, CambiarEstadoNominaParams } from '../domain/entities/Nomina';

/**
 * Hook para gestionar operaciones de nómina como marcar pagada o cambiar estado
 */
export function useGestionarNomina() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Mutación para marcar como pagada
  const marcarComoPagada = useMutation({
    mutationFn: async (params: MarcarComoPagadaParams) => {
      const response = await apiRequest('POST', `/api/nomina/marcar-pagado/${params.nominaId}`, params);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error al marcar la nómina como pagada');
      }
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: 'Nómina pagada',
        description: 'La nómina ha sido marcada como pagada exitosamente',
        variant: 'default',
      });
      
      // Actualizar caché
      queryClient.invalidateQueries({ queryKey: ['/api/nomina'] });
      queryClient.invalidateQueries({ queryKey: [`/api/nomina/${data.nomina.id}`] });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message || 'Ocurrió un error al marcar la nómina como pagada',
        variant: 'destructive',
      });
    },
  });

  // Mutación para cambiar estado
  const cambiarEstado = useMutation({
    mutationFn: async (params: CambiarEstadoNominaParams) => {
      const response = await apiRequest('POST', `/api/nomina/cambiar-estado/${params.nominaId}`, params);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error al cambiar el estado de la nómina');
      }
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: 'Estado cambiado',
        description: `La nómina ha cambiado a estado: ${data.nomina.status}`,
        variant: 'default',
      });
      
      // Actualizar caché
      queryClient.invalidateQueries({ queryKey: ['/api/nomina'] });
      queryClient.invalidateQueries({ queryKey: [`/api/nomina/${data.nomina.id}`] });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message || 'Ocurrió un error al cambiar el estado de la nómina',
        variant: 'destructive',
      });
    },
  });

  return {
    marcarComoPagada,
    cambiarEstado
  };
}