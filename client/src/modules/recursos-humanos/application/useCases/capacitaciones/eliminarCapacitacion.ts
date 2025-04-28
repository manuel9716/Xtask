/**
 * @file Caso de uso: Eliminar Capacitación
 * @description Gestiona la cancelación/eliminación de capacitaciones
 */

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";

import { Capacitacion } from "../../../domain/entities/Capacitacion";
import { CapacitacionRepository } from "../../../domain/repositories/CapacitacionRepository";
import * as capacitacionesApi from "../../../infrastructure/api/capacitacionesApi";

// Clave para cache de ReactQuery
const CAPACITACIONES_QUERY_KEY = "/api/capacitaciones";

/**
 * Hook personalizado para eliminar capacitaciones
 * @param onSuccess Callback a ejecutar cuando la capacitación se elimina correctamente
 */
export function useEliminarCapacitacion(onSuccess?: () => void) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Mutation para eliminar una capacitación (cancelar)
  const mutation = useMutation({
    mutationFn: async (id: number) => {
      try {
        return await capacitacionesApi.eliminarCapacitacion(id);
      } catch (error) {
        console.error("Error al eliminar capacitación:", error);
        throw new Error("No se pudo eliminar la capacitación");
      }
    },
    onSuccess: (result, id) => {
      if (result.success) {
        // Invalidar queries para refrescar los datos
        queryClient.invalidateQueries({ queryKey: [CAPACITACIONES_QUERY_KEY] });
        queryClient.invalidateQueries({ 
          queryKey: [`${CAPACITACIONES_QUERY_KEY}/${id}`] 
        });
        queryClient.invalidateQueries({ 
          queryKey: [`${CAPACITACIONES_QUERY_KEY}/estado/programadas`] 
        });
        queryClient.invalidateQueries({ 
          queryKey: [`${CAPACITACIONES_QUERY_KEY}/estado/en-curso`] 
        });
        
        // Buscar queries que puedan estar afectadas
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
          title: "Capacitación cancelada",
          description: "La capacitación ha sido cancelada correctamente.",
        });

        // Ejecutar callback si existe
        if (onSuccess) {
          onSuccess();
        }
      } else {
        // Mostrar notificación de error
        toast({
          title: "Error al cancelar",
          description: "No se pudo cancelar la capacitación",
          variant: "destructive",
        });
      }
    },
    onError: (error: Error) => {
      // Mostrar notificación de error
      toast({
        title: "Error al cancelar capacitación",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  // Función para eliminar (cancelar) capacitación con confirmación
  const eliminarCapacitacion = (id: number, titulo: string) => {
    // Mostrar confirmación antes de eliminar
    if (window.confirm(`¿Está seguro que desea cancelar la capacitación "${titulo}"?`)) {
      mutation.mutate(id);
    }
  };

  return {
    eliminarCapacitacion,
    isLoading: mutation.isPending,
    isError: mutation.isError,
    error: mutation.error
  };
}

/**
 * Implementación del caso de uso para eliminar capacitaciones usando el repositorio
 */
export class EliminarCapacitacionUseCase {
  constructor(private capacitacionRepository: CapacitacionRepository) {}

  async ejecutar(id: number): Promise<boolean> {
    // Validar que exista la capacitación
    const capacitacion = await this.capacitacionRepository.obtenerPorId(id);
    
    if (!capacitacion) {
      throw new Error(`No se encontró la capacitación con ID ${id}`);
    }

    try {
      // Realmente llamamos al cambio de estado a CANCELADA, no a un borrado físico
      await this.capacitacionRepository.cambiarEstado(id, 'CANCELADA' as any);
      return true;
    } catch (error) {
      console.error("Error al eliminar capacitación:", error);
      throw new Error("No se pudo eliminar la capacitación");
    }
  }
}