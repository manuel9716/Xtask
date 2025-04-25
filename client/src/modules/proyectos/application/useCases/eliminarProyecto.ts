import { useMutation } from '@tanstack/react-query';
import { queryClient } from '@/lib/queryClient';
import { proyectosApi } from '../../infrastructure/api/proyectosApi';
import { useToast } from '@/hooks/use-toast';

/**
 * Hook para eliminar (archivar) un proyecto
 * Implementa el caso de uso "Eliminar Proyecto"
 */
export function useEliminarProyecto() {
  const { toast } = useToast();
  
  const mutation = useMutation<void, Error, number>({
    mutationFn: async (id: number) => {
      return await proyectosApi.eliminarProyecto(id);
    },
    onSuccess: () => {
      // Invalidar la cache de proyectos para que se actualice el listado
      queryClient.invalidateQueries({ queryKey: ['/api/proyectos'] });
      
      toast({
        title: 'Proyecto eliminado',
        description: 'El proyecto ha sido archivado correctamente',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error al eliminar proyecto',
        description: error.message || 'Ha ocurrido un error al eliminar el proyecto',
        variant: 'destructive',
      });
    },
  });
  
  return mutation;
}