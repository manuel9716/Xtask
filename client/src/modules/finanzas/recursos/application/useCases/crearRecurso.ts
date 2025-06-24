import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { recursosApi } from '../../infrastructure/api/recursosApi';
import { CrearRecursoDTO, calcularRecurso } from '../../domain/entities/Recurso';

/**
 * Hook para crear un nuevo recurso
 */
export function useCrearRecurso() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (data: CrearRecursoDTO) => {
      // Validar y calcular los valores antes de enviar
      const recursoCompleto = calcularRecurso.completarRecurso(data);
      return recursosApi.crearRecurso(data);
    },
    onSuccess: (recurso) => {
      // Invalidar las queries relacionadas
      queryClient.invalidateQueries({ 
        queryKey: ['recursos', recurso.presupuestoId] 
      });
      queryClient.invalidateQueries({ 
        queryKey: ['recursos-resumen', recurso.presupuestoId] 
      });

      toast({
        title: "Recurso creado",
        description: `Se ha agregado el recurso ${recurso.perfil} exitosamente.`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error al crear recurso",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}