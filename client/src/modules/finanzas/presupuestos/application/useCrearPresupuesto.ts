import { useMutation } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { apiRequest, queryClient } from '@/lib/queryClient';

// Este tipo define los datos esperados por el formulario y que enviaremos a la API
export type CrearPresupuestoDTO = {
  name: string;
  amount: number;
  startDate: Date;
  endDate: Date;
  area?: string;
  description?: string;
  createdBy?: number;
  status?: string;
  organizationId?: number;
  departmentId?: number | null;
  projectId?: number | null;
  porcentajeEjecucion?: number;
  porcentajeGarantia?: number;
  reservasFinancieras?: number;
};

/**
 * Hook de aplicación para crear presupuestos
 * Se adapta a la API existente en el servidor (/api/presupuestos)
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
        // Preparar datos para la API existente
        const requestData = {
          name: data.name,
          amount: data.amount,
          startDate: data.startDate,
          endDate: data.endDate,
          description: data.description || '',
          createdBy: data.createdBy || 1, // Usuario por defecto
          organizationId: data.organizationId || 1,
          departmentId: data.departmentId || null,
          projectId: data.projectId || null
        };
        
        const response = await apiRequest('POST', '/api/presupuestos', requestData);
        
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Error al crear el presupuesto');
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