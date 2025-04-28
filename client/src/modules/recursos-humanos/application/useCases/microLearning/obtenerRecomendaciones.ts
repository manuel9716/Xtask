/**
 * @file Caso de uso: Obtener Recomendaciones de Micro-Learning
 * @description Gestiona la obtención de recomendaciones personalizadas de contenido
 */

import { useQuery } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { useState, useEffect } from "react";

import { 
  MicroLearningRecomendacion,
  ContextoRecomendacion
} from "../../../domain/entities/MicroLearning";
import { MicroLearningRepository } from "../../../domain/repositories/MicroLearningRepository";
import * as microLearningApi from "../../../infrastructure/api/microLearningApi";

// Clave para cache de ReactQuery
const MICROLEARNING_QUERY_KEY = "/api/microlearning";

/**
 * Hook personalizado para obtener recomendaciones de micro-learning
 */
export function useRecomendacionesMicroLearning(
  empleadoId: number,
  contextoAdicional?: Partial<ContextoRecomendacion>
) {
  const { toast } = useToast();
  const [contexto, setContexto] = useState<ContextoRecomendacion>({
    empleadoId,
    ...contextoAdicional
  });

  // Actualizar contexto cuando cambien las props
  useEffect(() => {
    setContexto(prevContexto => ({
      ...prevContexto,
      empleadoId,
      ...contextoAdicional
    }));
  }, [empleadoId, contextoAdicional]);

  const {
    data: recomendaciones = [],
    isLoading,
    isError,
    error,
    refetch
  } = useQuery<MicroLearningRecomendacion[], Error>({
    queryKey: [`${MICROLEARNING_QUERY_KEY}/recomendaciones`, contexto],
    queryFn: async () => {
      try {
        return await microLearningApi.obtenerRecomendaciones(contexto);
      } catch (error) {
        console.error("Error al cargar recomendaciones:", error);
        throw new Error("No se pudieron cargar las recomendaciones de contenido");
      }
    },
    enabled: !!empleadoId // Solo ejecutar si hay ID de empleado
  });

  // Función para actualizar el contexto actual
  const actualizarContexto = (nuevoContexto: Partial<ContextoRecomendacion>) => {
    setContexto(prevContexto => ({
      ...prevContexto,
      ...nuevoContexto
    }));
  };

  // Mostrar toast en caso de error
  useEffect(() => {
    if (isError && error) {
      toast({
        title: "Error al cargar recomendaciones",
        description: error.message,
        variant: "destructive",
      });
    }
  }, [isError, error, toast]);

  return {
    recomendaciones,
    isLoading,
    isError,
    error,
    refetch,
    actualizarContexto
  };
}

/**
 * Hook personalizado para obtener recomendaciones contextuales basadas en la página actual
 */
export function useRecomendacionesContextuales(
  empleadoId: number, 
  paginaActual?: string,
  actividadActual?: string
) {
  const { toast } = useToast();
  const [contexto, setContexto] = useState({
    pagina: paginaActual,
    actividad: actividadActual
  });

  // Actualizar contexto cuando cambien las props
  useEffect(() => {
    setContexto({
      pagina: paginaActual,
      actividad: actividadActual
    });
  }, [paginaActual, actividadActual]);

  const {
    data: recomendaciones = [],
    isLoading,
    isError,
    error,
    refetch
  } = useQuery<MicroLearningRecomendacion[], Error>({
    queryKey: [`${MICROLEARNING_QUERY_KEY}/recomendaciones/contextuales`, empleadoId, contexto],
    queryFn: async () => {
      try {
        return await microLearningApi.obtenerRecomendacionesContextuales(
          empleadoId, 
          contexto
        );
      } catch (error) {
        console.error("Error al cargar recomendaciones contextuales:", error);
        throw new Error("No se pudieron cargar las recomendaciones de contenido");
      }
    },
    enabled: !!empleadoId && (!!paginaActual || !!actividadActual) // Solo ejecutar si hay ID y algún contexto
  });

  // Mostrar toast en caso de error
  useEffect(() => {
    if (isError && error) {
      toast({
        title: "Error al cargar recomendaciones",
        description: error.message,
        variant: "destructive",
      });
    }
  }, [isError, error, toast]);

  return {
    recomendaciones,
    isLoading,
    isError,
    error,
    refetch
  };
}

/**
 * Implementación del caso de uso para obtener recomendaciones usando el repositorio
 */
export class ObtenerRecomendacionesUseCase {
  constructor(private microLearningRepository: MicroLearningRepository) {}

  async obtenerRecomendaciones(contexto: ContextoRecomendacion): Promise<MicroLearningRecomendacion[]> {
    try {
      return await this.microLearningRepository.obtenerRecomendaciones(contexto);
    } catch (error) {
      console.error("Error al obtener recomendaciones:", error);
      throw new Error("No se pudieron obtener las recomendaciones de contenido");
    }
  }

  // Método para obtener recomendaciones basadas en la página actual
  async obtenerRecomendacionesContextuales(
    empleadoId: number,
    paginaActual?: string,
    actividadActual?: string
  ): Promise<MicroLearningRecomendacion[]> {
    try {
      const contexto: ContextoRecomendacion = {
        empleadoId,
        paginaActual,
        actividadActual
      };
      
      return await this.microLearningRepository.obtenerRecomendaciones(contexto);
    } catch (error) {
      console.error("Error al obtener recomendaciones contextuales:", error);
      throw new Error("No se pudieron obtener las recomendaciones de contenido");
    }
  }
}