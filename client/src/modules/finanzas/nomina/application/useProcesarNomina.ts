import { useMutation, useQueryClient } from '@tanstack/react-query';
import { ProcesarNominaParams } from '../domain/entities/Nomina';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';

/**
 * Hook para procesar nóminas
 */
export function useProcesarNomina() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { mutate, isPending, isError, error, isSuccess, reset } = useMutation({
    mutationFn: async (params: ProcesarNominaParams) => {
      const response = await apiRequest('POST', '/api/nomina/procesar', params);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error al procesar la nómina');
      }
      return response.json();
    },
    onSuccess: (data) => {
      // Mostrar mensaje de éxito
      toast({
        title: 'Nómina procesada',
        description: `Se procesó con éxito la nómina para ${data.nominas.length} empleado(s)`,
        variant: 'default',
      });
      
      // Actualizar caché de nóminas
      queryClient.invalidateQueries({ queryKey: ['/api/nomina'] });
    },
    onError: (error: Error) => {
      // Mostrar mensaje de error
      toast({
        title: 'Error',
        description: error.message || 'Ocurrió un error al procesar la nómina',
        variant: 'destructive',
      });
    },
  });

  return {
    procesarNomina: mutate,
    isPending,
    isError,
    error,
    isSuccess,
    reset
  };
}