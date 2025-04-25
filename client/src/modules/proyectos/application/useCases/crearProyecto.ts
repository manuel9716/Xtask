import { useMutation } from '@tanstack/react-query';
import { Proyecto, CrearProyectoDTO } from '../../domain/entities/Proyecto';
import { queryClient } from '@/lib/queryClient';
import { proyectosApi } from '../../infrastructure/api/proyectosApi';
import { useToast } from '@/hooks/use-toast';

/**
 * Hook para crear un nuevo proyecto
 * Implementa el caso de uso "Crear Proyecto"
 */
export function useCrearProyecto() {
  const { toast } = useToast();
  
  const mutation = useMutation<Proyecto, Error, CrearProyectoDTO>({
    mutationFn: async (proyecto: CrearProyectoDTO) => {
      return await proyectosApi.crearProyecto(proyecto);
    },
    onSuccess: () => {
      // Invalidar la cache para que se recarguen los listados
      queryClient.invalidateQueries({ queryKey: ['/api/proyectos'] });
      
      toast({
        title: 'Proyecto creado',
        description: 'El proyecto ha sido creado exitosamente',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error al crear proyecto',
        description: error.message || 'Ha ocurrido un error al crear el proyecto',
        variant: 'destructive',
      });
    },
  });
  
  return mutation;
}