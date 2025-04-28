/**
 * @file Caso de uso: Eliminar Evaluación
 * @description Gestiona la eliminación (archivado) de evaluaciones de desempeño
 */

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";

import { Evaluacion } from "../../../domain/entities/Evaluacion";
import { EvaluacionRepository } from "../../../domain/repositories/EvaluacionRepository";
import * as evaluacionesApi from "../../../infrastructure/api/evaluacionesApi";

// Clave para cache de ReactQuery
const EVALUACIONES_QUERY_KEY = "/api/evaluaciones";

/**
 * Hook personalizado para eliminar evaluaciones
 * @param onSuccess Callback a ejecutar cuando la evaluación se elimina correctamente
 */
export function useEliminarEvaluacion(onSuccess?: () => void) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Mutation para eliminar una evaluación
  const mutation = useMutation({
    mutationFn: async (id: number) => {
      try {
        return await evaluacionesApi.eliminarEvaluacion(id);
      } catch (error) {
        console.error("Error al eliminar evaluación:", error);
        throw new Error("No se pudo eliminar la evaluación");
      }
    },
    onSuccess: (result, id) => {
      if (result.success) {
        // Invalidar queries para refrescar los datos
        queryClient.invalidateQueries({ queryKey: [EVALUACIONES_QUERY_KEY] });
        queryClient.invalidateQueries({ 
          queryKey: [`${EVALUACIONES_QUERY_KEY}/${id}`] 
        });
        
        // Buscar todas las queries que contengan 'empleado' para invalidarlas también
        // ya que no sabemos el ID del empleado en este punto
        const queryCache = queryClient.getQueryCache();
        const empleadoQueries = queryCache.getAll().filter(query => 
          Array.isArray(query.queryKey) && 
          query.queryKey.some(key => 
            typeof key === 'string' && 
            key.includes('/empleado/')
          )
        );
        
        empleadoQueries.forEach(query => {
          queryClient.invalidateQueries({ queryKey: query.queryKey });
        });

        // Mostrar notificación de éxito
        toast({
          title: "Evaluación eliminada",
          description: "La evaluación ha sido archivada correctamente.",
        });

        // Ejecutar callback si existe
        if (onSuccess) {
          onSuccess();
        }
      } else {
        // Mostrar notificación de error
        toast({
          title: "Error al eliminar",
          description: "No se pudo eliminar la evaluación",
          variant: "destructive",
        });
      }
    },
    onError: (error: Error) => {
      // Mostrar notificación de error
      toast({
        title: "Error al eliminar evaluación",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  // Función para eliminar (archivar) evaluación con confirmación
  const eliminarEvaluacion = (id: number, titulo: string) => {
    // Mostrar confirmación antes de eliminar
    if (window.confirm(`¿Está seguro que desea archivar la evaluación "${titulo}"?`)) {
      mutation.mutate(id);
    }
  };

  return {
    eliminarEvaluacion,
    isLoading: mutation.isPending,
    isError: mutation.isError,
    error: mutation.error
  };
}

/**
 * Implementación del caso de uso para eliminar evaluaciones usando el repositorio
 */
export class EliminarEvaluacionUseCase {
  constructor(private evaluacionRepository: EvaluacionRepository) {}

  async ejecutar(id: number): Promise<boolean> {
    // Validar que exista la evaluación
    const evaluacion = await this.evaluacionRepository.obtenerPorId(id);
    
    if (!evaluacion) {
      throw new Error(`No se encontró la evaluación con ID ${id}`);
    }

    try {
      // Realmente llamamos al cambio de estado a ARCHIVADA, no a un borrado físico
      await this.evaluacionRepository.cambiarEstado(id, 'ARCHIVADA' as any);
      return true;
    } catch (error) {
      console.error("Error al eliminar evaluación:", error);
      throw new Error("No se pudo eliminar la evaluación");
    }
  }
}