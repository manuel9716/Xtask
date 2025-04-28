/**
 * @file Caso de uso: Editar Evaluación
 * @description Gestiona la edición de evaluaciones de desempeño existentes
 */

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";

import { 
  ActualizarEvaluacionDTO, 
  Evaluacion, 
  CompletarEvaluacionDTO,
  CRITERIOS_EVALUACION 
} from "../../../domain/entities/Evaluacion";
import { EvaluacionRepository } from "../../../domain/repositories/EvaluacionRepository";
import * as evaluacionesApi from "../../../infrastructure/api/evaluacionesApi";

// Clave para cache de ReactQuery
const EVALUACIONES_QUERY_KEY = "/api/evaluaciones";

/**
 * Hook personalizado para editar evaluaciones
 * @param onSuccess Callback a ejecutar cuando la evaluación se actualiza correctamente
 */
export function useEditarEvaluacion(onSuccess?: (evaluacion: Evaluacion) => void) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [errores, setErrores] = useState<Record<string, string>>({});

  // Mutation para actualizar una evaluación
  const mutation = useMutation({
    mutationFn: async (actualizarEvaluacion: ActualizarEvaluacionDTO) => {
      try {
        return await evaluacionesApi.actualizarEvaluacion(actualizarEvaluacion);
      } catch (error) {
        console.error("Error al actualizar evaluación:", error);
        throw new Error("No se pudo actualizar la evaluación");
      }
    },
    onSuccess: (evaluacion) => {
      // Limpiar errores
      setErrores({});

      // Invalidar queries para refrescar los datos
      queryClient.invalidateQueries({ queryKey: [EVALUACIONES_QUERY_KEY] });
      queryClient.invalidateQueries({ 
        queryKey: [`${EVALUACIONES_QUERY_KEY}/${evaluacion.id}`] 
      });
      queryClient.invalidateQueries({ 
        queryKey: [`${EVALUACIONES_QUERY_KEY}/empleado/${evaluacion.empleadoId}`] 
      });

      // Mostrar notificación de éxito
      toast({
        title: "Evaluación actualizada",
        description: `La evaluación "${evaluacion.titulo}" ha sido actualizada correctamente.`,
      });

      // Ejecutar callback si existe
      if (onSuccess) {
        onSuccess(evaluacion);
      }
    },
    onError: (error: Error) => {
      // Mostrar notificación de error
      toast({
        title: "Error al actualizar evaluación",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  // Mutation para cambiar estado de una evaluación
  const cambiarEstadoMutation = useMutation({
    mutationFn: async ({ id, estado }: { id: number, estado: string }) => {
      try {
        return await evaluacionesApi.cambiarEstadoEvaluacion(id, estado);
      } catch (error) {
        console.error("Error al cambiar estado de evaluación:", error);
        throw new Error("No se pudo cambiar el estado de la evaluación");
      }
    },
    onSuccess: (evaluacion) => {
      // Invalidar queries para refrescar los datos
      queryClient.invalidateQueries({ queryKey: [EVALUACIONES_QUERY_KEY] });
      queryClient.invalidateQueries({ 
        queryKey: [`${EVALUACIONES_QUERY_KEY}/${evaluacion.id}`] 
      });
      queryClient.invalidateQueries({ 
        queryKey: [`${EVALUACIONES_QUERY_KEY}/empleado/${evaluacion.empleadoId}`] 
      });

      // Mostrar notificación de éxito
      toast({
        title: "Estado actualizado",
        description: `El estado de la evaluación "${evaluacion.titulo}" ha sido actualizado.`,
      });

      // Ejecutar callback si existe
      if (onSuccess) {
        onSuccess(evaluacion);
      }
    },
    onError: (error: Error) => {
      // Mostrar notificación de error
      toast({
        title: "Error al cambiar estado",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  // Mutation para completar una evaluación
  const completarEvaluacionMutation = useMutation({
    mutationFn: async (datos: CompletarEvaluacionDTO) => {
      try {
        return await evaluacionesApi.completarEvaluacion(datos);
      } catch (error) {
        console.error("Error al completar evaluación:", error);
        throw new Error("No se pudo completar la evaluación");
      }
    },
    onSuccess: (evaluacion) => {
      // Invalidar queries para refrescar los datos
      queryClient.invalidateQueries({ queryKey: [EVALUACIONES_QUERY_KEY] });
      queryClient.invalidateQueries({ 
        queryKey: [`${EVALUACIONES_QUERY_KEY}/${evaluacion.id}`] 
      });
      queryClient.invalidateQueries({ 
        queryKey: [`${EVALUACIONES_QUERY_KEY}/empleado/${evaluacion.empleadoId}`] 
      });

      // Mostrar notificación de éxito
      toast({
        title: "Evaluación completada",
        description: `La evaluación "${evaluacion.titulo}" ha sido completada correctamente.`,
      });

      // Ejecutar callback si existe
      if (onSuccess) {
        onSuccess(evaluacion);
      }
    },
    onError: (error: Error) => {
      // Mostrar notificación de error
      toast({
        title: "Error al completar evaluación",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  // Función para validar datos
  const validarDatos = (datos: ActualizarEvaluacionDTO): boolean => {
    const erroresValidacion: Record<string, string> = {};

    // Validar título si se proporciona
    if (datos.titulo !== undefined) {
      if (datos.titulo.trim() === '') {
        erroresValidacion.titulo = "El título es obligatorio";
      } else if (datos.titulo.length < 5) {
        erroresValidacion.titulo = "El título debe tener al menos 5 caracteres";
      }
    }

    // Validar fechas si se proporcionan
    if (datos.fechaInicio && datos.fechaFin && new Date(datos.fechaInicio) > new Date(datos.fechaFin)) {
      erroresValidacion.fechaFin = "La fecha de fin debe ser posterior a la fecha de inicio";
    }

    // Si hay errores, guardarlos y retornar false
    if (Object.keys(erroresValidacion).length > 0) {
      setErrores(erroresValidacion);
      return false;
    }

    return true;
  };

  // Función para editar evaluación
  const editarEvaluacion = (datos: ActualizarEvaluacionDTO) => {
    // Validar datos
    if (!validarDatos(datos)) {
      return;
    }

    // Ejecutar la mutación
    mutation.mutate(datos);
  };

  // Función para cambiar estado
  const cambiarEstado = (id: number, estado: string) => {
    cambiarEstadoMutation.mutate({ id, estado });
  };

  // Función para completar evaluación
  const completarEvaluacion = (datos: CompletarEvaluacionDTO) => {
    // Validar calificación
    if (datos.calificacion < 0 || datos.calificacion > 10) {
      setErrores({
        calificacion: "La calificación debe estar entre 0 y 10"
      });
      return;
    }

    // Ejecutar mutación
    completarEvaluacionMutation.mutate(datos);
  };

  return {
    editarEvaluacion,
    cambiarEstado,
    completarEvaluacion,
    isLoading: mutation.isPending || cambiarEstadoMutation.isPending || completarEvaluacionMutation.isPending,
    isError: mutation.isError || cambiarEstadoMutation.isError || completarEvaluacionMutation.isError,
    error: mutation.error || cambiarEstadoMutation.error || completarEvaluacionMutation.error,
    errores,
    setErrores,
    CRITERIOS_EVALUACION
  };
}

/**
 * Implementación del caso de uso para editar evaluaciones usando el repositorio
 */
export class EditarEvaluacionUseCase {
  constructor(private evaluacionRepository: EvaluacionRepository) {}

  async actualizar(datos: ActualizarEvaluacionDTO): Promise<Evaluacion> {
    // Validar que exista ID
    if (!datos.id) {
      throw new Error("El ID de la evaluación es requerido para actualizarla");
    }

    // Obtener evaluación actual para verificar que existe
    const evaluacionActual = await this.evaluacionRepository.obtenerPorId(datos.id);
    
    if (!evaluacionActual) {
      throw new Error(`No se encontró la evaluación con ID ${datos.id}`);
    }
    
    // Actualizar la evaluación
    try {
      return await this.evaluacionRepository.actualizar(datos);
    } catch (error) {
      console.error("Error al actualizar evaluación:", error);
      throw new Error("No se pudo actualizar la evaluación en el sistema");
    }
  }

  async cambiarEstado(id: number, nuevoEstado: string): Promise<Evaluacion> {
    // Validar que exista la evaluación
    const evaluacion = await this.evaluacionRepository.obtenerPorId(id);
    
    if (!evaluacion) {
      throw new Error(`No se encontró la evaluación con ID ${id}`);
    }
    
    // Cambiar estado
    try {
      return await this.evaluacionRepository.cambiarEstado(id, nuevoEstado as any);
    } catch (error) {
      console.error("Error al cambiar estado de evaluación:", error);
      throw new Error("No se pudo cambiar el estado de la evaluación");
    }
  }

  async completar(datos: CompletarEvaluacionDTO): Promise<Evaluacion> {
    // Validar que exista la evaluación
    const evaluacion = await this.evaluacionRepository.obtenerPorId(datos.id);
    
    if (!evaluacion) {
      throw new Error(`No se encontró la evaluación con ID ${datos.id}`);
    }
    
    // Validar calificación
    if (datos.calificacion < 0 || datos.calificacion > 10) {
      throw new Error("La calificación debe estar entre 0 y 10");
    }
    
    // Actualizar la evaluación para completarla
    try {
      return await this.evaluacionRepository.actualizar({
        id: datos.id,
        calificacion: datos.calificacion,
        comentarios: datos.comentarios,
        fortalezas: datos.fortalezas,
        areasAMejorar: datos.areasAMejorar,
        objetivosSiguientePeriodo: datos.objetivosSiguientePeriodo,
        estado: 'COMPLETADA'
      });
    } catch (error) {
      console.error("Error al completar evaluación:", error);
      throw new Error("No se pudo completar la evaluación");
    }
  }
}