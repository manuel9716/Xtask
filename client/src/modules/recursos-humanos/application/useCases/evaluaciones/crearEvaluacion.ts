/**
 * @file Caso de uso: Crear Evaluación
 * @description Gestiona la creación de nuevas evaluaciones de desempeño
 */

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";

import { CrearEvaluacionDTO, Evaluacion, EstadoEvaluacion, CRITERIOS_EVALUACION } from "../../../domain/entities/Evaluacion";
import { EvaluacionRepository } from "../../../domain/repositories/EvaluacionRepository";
import * as evaluacionesApi from "../../../infrastructure/api/evaluacionesApi";

// Clave para cache de ReactQuery
const EVALUACIONES_QUERY_KEY = "/api/evaluaciones";

/**
 * Hook personalizado para crear evaluaciones
 * @param onSuccess Callback a ejecutar cuando la evaluación se crea correctamente
 */
export function useCrearEvaluacion(onSuccess?: (evaluacion: Evaluacion) => void) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [errores, setErrores] = useState<Record<string, string>>({});

  // Mutation para crear una evaluación
  const mutation = useMutation({
    mutationFn: async (nuevaEvaluacion: CrearEvaluacionDTO) => {
      try {
        return await evaluacionesApi.crearEvaluacion(nuevaEvaluacion);
      } catch (error) {
        console.error("Error al crear evaluación:", error);
        throw new Error("No se pudo crear la evaluación");
      }
    },
    onSuccess: (evaluacion) => {
      // Limpiar errores
      setErrores({});

      // Invalidar queries para refrescar los datos
      queryClient.invalidateQueries({ queryKey: [EVALUACIONES_QUERY_KEY] });
      queryClient.invalidateQueries({ 
        queryKey: [`${EVALUACIONES_QUERY_KEY}/empleado/${evaluacion.empleadoId}`] 
      });

      // Mostrar notificación de éxito
      toast({
        title: "Evaluación creada",
        description: `La evaluación "${evaluacion.titulo}" ha sido creada correctamente.`,
      });

      // Ejecutar callback si existe
      if (onSuccess) {
        onSuccess(evaluacion);
      }
    },
    onError: (error: Error) => {
      // Mostrar notificación de error
      toast({
        title: "Error al crear evaluación",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  // Función para validar datos
  const validarDatos = (datos: CrearEvaluacionDTO): boolean => {
    const erroresValidacion: Record<string, string> = {};

    // Validar título
    if (!datos.titulo || datos.titulo.trim() === '') {
      erroresValidacion.titulo = "El título es obligatorio";
    } else if (datos.titulo.length < 5) {
      erroresValidacion.titulo = "El título debe tener al menos 5 caracteres";
    }

    // Validar empleadoId
    if (!datos.empleadoId) {
      erroresValidacion.empleadoId = "El empleado es obligatorio";
    }

    // Validar evaluadorId
    if (!datos.evaluadorId) {
      erroresValidacion.evaluadorId = "El evaluador es obligatorio";
    }

    // Validar fechaInicio
    if (!datos.fechaInicio) {
      erroresValidacion.fechaInicio = "La fecha de inicio es obligatoria";
    }

    // Validar tipo
    if (!datos.tipo) {
      erroresValidacion.tipo = "El tipo de evaluación es obligatorio";
    }

    // Si hay errores, guardarlos y retornar false
    if (Object.keys(erroresValidacion).length > 0) {
      setErrores(erroresValidacion);
      return false;
    }

    return true;
  };

  // Función para crear evaluación
  const crearEvaluacion = (datos: CrearEvaluacionDTO) => {
    // Validar datos
    if (!validarDatos(datos)) {
      return;
    }

    // Asegurar que estado sea PENDIENTE si no se proporciona
    const evaluacionConEstado: CrearEvaluacionDTO = {
      ...datos,
      estado: datos.estado || EstadoEvaluacion.PENDIENTE
    };

    // Ejecutar la mutación
    mutation.mutate(evaluacionConEstado);
  };

  return {
    crearEvaluacion,
    isLoading: mutation.isPending,
    isError: mutation.isError,
    error: mutation.error,
    errores,
    setErrores,
    CRITERIOS_EVALUACION
  };
}

/**
 * Implementación del caso de uso para crear evaluaciones usando el repositorio
 */
export class CrearEvaluacionUseCase {
  constructor(private evaluacionRepository: EvaluacionRepository) {}

  async ejecutar(datos: CrearEvaluacionDTO): Promise<Evaluacion> {
    // Validar datos
    if (!datos.titulo || !datos.empleadoId || !datos.evaluadorId || !datos.fechaInicio || !datos.tipo) {
      throw new Error("Faltan datos obligatorios para crear la evaluación");
    }

    // Asegurar que estado sea PENDIENTE si no se proporciona
    const evaluacionConEstado: CrearEvaluacionDTO = {
      ...datos,
      estado: datos.estado || EstadoEvaluacion.PENDIENTE
    };

    // Crear la evaluación usando el repositorio
    try {
      return await this.evaluacionRepository.crear(evaluacionConEstado);
    } catch (error) {
      console.error("Error al crear evaluación:", error);
      throw new Error("No se pudo crear la evaluación en el sistema");
    }
  }
}