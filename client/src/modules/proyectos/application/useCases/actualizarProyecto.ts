import { useMutation } from '@tanstack/react-query';
import { Proyecto, ActualizarProyectoDTO } from '../../domain/entities/Proyecto';
import { queryClient } from '@/lib/queryClient';
import { proyectosApi } from '../../infrastructure/api/proyectosApi';
import { useToast } from '@/hooks/use-toast';

/**
 * Hook para actualizar un proyecto existente
 * Implementa el caso de uso "Actualizar Proyecto"
 */
export function useActualizarProyecto(id?: number) {
  const { toast } = useToast();
  
  const mutation = useMutation<Proyecto, Error, ActualizarProyectoDTO>({
    mutationFn: async (proyecto: ActualizarProyectoDTO) => {
      if (!id) throw new Error('ID de proyecto no especificado');
      return await proyectosApi.actualizarProyecto(id, proyecto);
    },
    onSuccess: (data) => {
      // Invalidar la cache del listado y del detalle
      queryClient.invalidateQueries({ queryKey: ['/api/proyectos'] });
      queryClient.invalidateQueries({ queryKey: ['/api/proyectos', id] });
      
      toast({
        title: 'Proyecto actualizado',
        description: 'El proyecto ha sido actualizado exitosamente',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error al actualizar proyecto',
        description: error.message || 'Ha ocurrido un error al actualizar el proyecto',
        variant: 'destructive',
      });
    },
  });
  
  return mutation;
}