import { useMutation } from '@tanstack/react-query';
import { Proyecto, CambiarEstadoProyectoDTO, EstadoProyecto } from '../../domain/entities/Proyecto';
import { queryClient } from '@/lib/queryClient';
import { proyectosApi } from '../../infrastructure/api/proyectosApi';
import { useToast } from '@/hooks/use-toast';

/**
 * Hook para cambiar el estado de un proyecto
 * Implementa el caso de uso "Cambiar Estado de Proyecto"
 */
export function useCambiarEstadoProyecto(id?: number) {
  const { toast } = useToast();
  
  const mutation = useMutation<Proyecto, Error, CambiarEstadoProyectoDTO>({
    mutationFn: async (cambioEstado: CambiarEstadoProyectoDTO) => {
      if (!id) throw new Error('ID de proyecto no especificado');
      return await proyectosApi.cambiarEstadoProyecto(id, cambioEstado);
    },
    onSuccess: (data) => {
      // Invalidar la cache del listado y del detalle
      queryClient.invalidateQueries({ queryKey: ['/api/proyectos'] });
      queryClient.invalidateQueries({ queryKey: ['/api/proyectos', id] });
      
      // Mostrar mensaje según el estado cambiado
      let mensaje = 'El estado del proyecto ha sido actualizado';
      
      switch (data.estado) {
        case EstadoProyecto.ACTIVO:
          mensaje = 'El proyecto ha sido activado';
          break;
        case EstadoProyecto.PAUSADO:
          mensaje = 'El proyecto ha sido pausado';
          break;
        case EstadoProyecto.FINALIZADO:
          mensaje = 'El proyecto ha sido marcado como finalizado';
          break;
        case EstadoProyecto.CANCELADO:
          mensaje = 'El proyecto ha sido cancelado';
          break;
        case EstadoProyecto.ARCHIVADO:
          mensaje = 'El proyecto ha sido archivado';
          break;
      }
      
      toast({
        title: 'Estado actualizado',
        description: mensaje,
      });
    },
    onError: (error) => {
      toast({
        title: 'Error al cambiar estado',
        description: error.message || 'Ha ocurrido un error al cambiar el estado del proyecto',
        variant: 'destructive',
      });
    },
  });
  
  return mutation;
}