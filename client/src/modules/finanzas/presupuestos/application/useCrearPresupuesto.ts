import { useMutation } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { CrearPresupuestoDTO, crearPresupuestoSchema } from '../domain/entities/Presupuesto';
import { apiRequest, queryClient } from '@/lib/queryClient';

/**
 * Hook de aplicación para crear presupuestos
 */
export function useCrearPresupuesto() {
  const { toast } = useToast();

  const {
    mutateAsync: crearPresupuesto,
    isPending,
    isSuccess,
    isError,
    error
  } = useMutation({
    mutationFn: async (data: CrearPresupuestoDTO) => {
      try {
        const response = await apiRequest('POST', '/api/presupuestos', data);
        
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Error al crear el presupuesto');
        }
        
        return await response.json();
      } catch (error) {
        console.error('Error al crear presupuesto:', error);
        throw error;
      }
    },
    onSuccess: () => {
      // Invalidar la caché para que se actualice la lista de presupuestos
      queryClient.invalidateQueries({ queryKey: ['/api/presupuestos'] });
      
      toast({
        title: 'Presupuesto creado',
        description: 'El presupuesto ha sido creado exitosamente',
        variant: 'default'
      });
      
      return true;
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message || 'No se pudo crear el presupuesto',
        variant: 'destructive'
      });
      
      return false;
    }
  });

  return {
    crearPresupuesto,
    isPending,
    isSubmitting: isPending
  };
}