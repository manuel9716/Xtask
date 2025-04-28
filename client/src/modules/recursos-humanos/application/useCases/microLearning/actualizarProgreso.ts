/**
 * @file Caso de uso: Actualizar Progreso de Micro-Learning
 * @description Gestiona la actualización de progreso y valoración de contenido
 */

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";

import { 
  ActualizacionProgresoMicroLearning,
  MicroLearningRecomendacion,
  MicroLearningHistorial
} from "../../../domain/entities/MicroLearning";
import { MicroLearningRepository } from "../../../domain/repositories/MicroLearningRepository";
import * as microLearningApi from "../../../infrastructure/api/microLearningApi";

// Clave para cache de ReactQuery
const MICROLEARNING_QUERY_KEY = "/api/microlearning";

/**
 * Hook personalizado para actualizar el progreso del micro-learning
 */
export function useActualizarProgresoMicroLearning() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Mutation para actualizar progreso (marcar como visto/completado)
  const mutation = useMutation<
    MicroLearningRecomendacion, 
    Error, 
    ActualizacionProgresoMicroLearning
  >({
    mutationFn: async (datos) => {
      try {
        return await microLearningApi.actualizarProgresoContenido(datos);
      } catch (error) {
        console.error("Error al actualizar progreso:", error);
        throw new Error("No se pudo actualizar el progreso del contenido");
      }
    },
    onSuccess: (_, variables) => {
      // Invalidar queries para refrescar los datos
      queryClient.invalidateQueries({ 
        queryKey: [`${MICROLEARNING_QUERY_KEY}/recomendaciones`] 
      });
      queryClient.invalidateQueries({ 
        queryKey: [`${MICROLEARNING_QUERY_KEY}/historial/${variables.empleadoId}`] 
      });
      
      const mensaje = variables.completado 
        ? "Contenido marcado como completado" 
        : "Contenido marcado como visto";
      
      // Mostrar notificación de éxito
      toast({
        title: "Progreso actualizado",
        description: mensaje,
      });
    },
    onError: (error: Error) => {
      // Mostrar notificación de error
      toast({
        title: "Error al actualizar progreso",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  // Mutation para valorar contenido
  const valoracionMutation = useMutation<
    MicroLearningHistorial, 
    Error, 
    { empleadoId: number; contenidoId: number; valoracion: number; comentario?: string }
  >({
    mutationFn: async ({ empleadoId, contenidoId, valoracion, comentario }) => {
      try {
        return await microLearningApi.registrarValoracion(
          empleadoId, 
          contenidoId, 
          valoracion, 
          comentario
        );
      } catch (error) {
        console.error("Error al registrar valoración:", error);
        throw new Error("No se pudo registrar la valoración del contenido");
      }
    },
    onSuccess: (_, variables) => {
      // Invalidar queries para refrescar los datos
      queryClient.invalidateQueries({ 
        queryKey: [`${MICROLEARNING_QUERY_KEY}/historial/${variables.empleadoId}`] 
      });
      
      // Mostrar notificación de éxito
      toast({
        title: "Valoración registrada",
        description: "Tu valoración ha sido registrada correctamente",
      });
    },
    onError: (error: Error) => {
      // Mostrar notificación de error
      toast({
        title: "Error al registrar valoración",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  // Función para marcar como visto
  const marcarComoVisto = (empleadoId: number, contenidoId: number) => {
    mutation.mutate({
      empleadoId,
      contenidoId,
      visto: true
    });
  };

  // Función para marcar como completado
  const marcarComoCompletado = (empleadoId: number, contenidoId: number, tiempoCompletadoMinutos?: number) => {
    mutation.mutate({
      empleadoId,
      contenidoId,
      completado: true,
      tiempoCompletadoMinutos
    });
  };

  // Función para valorar contenido
  const valorarContenido = (empleadoId: number, contenidoId: number, valoracion: number, comentario?: string) => {
    // Validar valoración
    if (valoracion < 1 || valoracion > 5) {
      toast({
        title: "Valoración inválida",
        description: "La valoración debe estar entre 1 y 5",
        variant: "destructive",
      });
      return;
    }
    
    valoracionMutation.mutate({
      empleadoId,
      contenidoId,
      valoracion,
      comentario
    });
  };

  return {
    marcarComoVisto,
    marcarComoCompletado,
    valorarContenido,
    isLoading: mutation.isPending || valoracionMutation.isPending,
    isError: mutation.isError || valoracionMutation.isError,
    error: mutation.error || valoracionMutation.error
  };
}

/**
 * Implementación del caso de uso para actualizar progreso usando el repositorio
 */
export class ActualizarProgresoMicroLearningUseCase {
  constructor(private microLearningRepository: MicroLearningRepository) {}

  async actualizarProgreso(actualizacion: ActualizacionProgresoMicroLearning): Promise<MicroLearningRecomendacion> {
    try {
      return await this.microLearningRepository.actualizarProgresoContenido(actualizacion);
    } catch (error) {
      console.error("Error al actualizar progreso:", error);
      throw new Error("No se pudo actualizar el progreso del contenido");
    }
  }

  async registrarValoracion(
    empleadoId: number,
    contenidoId: number,
    valoracion: number,
    comentario?: string
  ): Promise<MicroLearningHistorial> {
    // Validar valoración
    if (valoracion < 1 || valoracion > 5) {
      throw new Error("La valoración debe estar entre 1 y 5");
    }
    
    try {
      return await this.microLearningRepository.registrarValoracion(
        empleadoId, 
        contenidoId, 
        valoracion, 
        comentario
      );
    } catch (error) {
      console.error("Error al registrar valoración:", error);
      throw new Error("No se pudo registrar la valoración del contenido");
    }
  }
}