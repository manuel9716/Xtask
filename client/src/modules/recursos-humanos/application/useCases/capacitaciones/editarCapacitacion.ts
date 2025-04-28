/**
 * @file Caso de uso: Editar Capacitación
 * @description Gestiona la edición de capacitaciones existentes
 */

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";

import { 
  ActualizarCapacitacionDTO, 
  Capacitacion,
  ESTADOS_CAPACITACION_LABELS,
  TIPOS_CAPACITACION_LABELS,
  MODALIDADES_CAPACITACION_LABELS
} from "../../../domain/entities/Capacitacion";
import { CapacitacionRepository } from "../../../domain/repositories/CapacitacionRepository";
import * as capacitacionesApi from "../../../infrastructure/api/capacitacionesApi";

// Clave para cache de ReactQuery
const CAPACITACIONES_QUERY_KEY = "/api/capacitaciones";

/**
 * Hook personalizado para editar capacitaciones
 * @param onSuccess Callback a ejecutar cuando la capacitación se actualiza correctamente
 */
export function useEditarCapacitacion(onSuccess?: (capacitacion: Capacitacion) => void) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [errores, setErrores] = useState<Record<string, string>>({});

  // Mutation para actualizar una capacitación
  const mutation = useMutation({
    mutationFn: async (actualizarCapacitacion: ActualizarCapacitacionDTO) => {
      try {
        return await capacitacionesApi.actualizarCapacitacion(actualizarCapacitacion);
      } catch (error) {
        console.error("Error al actualizar capacitación:", error);
        throw new Error("No se pudo actualizar la capacitación");
      }
    },
    onSuccess: (capacitacion) => {
      // Limpiar errores
      setErrores({});

      // Invalidar queries para refrescar los datos
      queryClient.invalidateQueries({ queryKey: [CAPACITACIONES_QUERY_KEY] });
      queryClient.invalidateQueries({ 
        queryKey: [`${CAPACITACIONES_QUERY_KEY}/${capacitacion.id}`] 
      });
      queryClient.invalidateQueries({ 
        queryKey: [`${CAPACITACIONES_QUERY_KEY}/estado/programadas`] 
      });
      queryClient.invalidateQueries({ 
        queryKey: [`${CAPACITACIONES_QUERY_KEY}/estado/en-curso`] 
      });

      // Mostrar notificación de éxito
      toast({
        title: "Capacitación actualizada",
        description: `La capacitación "${capacitacion.titulo}" ha sido actualizada correctamente.`,
      });

      // Ejecutar callback si existe
      if (onSuccess) {
        onSuccess(capacitacion);
      }
    },
    onError: (error: Error) => {
      // Mostrar notificación de error
      toast({
        title: "Error al actualizar capacitación",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  // Mutation para cambiar estado de una capacitación
  const cambiarEstadoMutation = useMutation({
    mutationFn: async ({ id, estado }: { id: number, estado: string }) => {
      try {
        return await capacitacionesApi.cambiarEstadoCapacitacion(id, estado);
      } catch (error) {
        console.error("Error al cambiar estado de capacitación:", error);
        throw new Error("No se pudo cambiar el estado de la capacitación");
      }
    },
    onSuccess: (capacitacion) => {
      // Invalidar queries para refrescar los datos
      queryClient.invalidateQueries({ queryKey: [CAPACITACIONES_QUERY_KEY] });
      queryClient.invalidateQueries({ 
        queryKey: [`${CAPACITACIONES_QUERY_KEY}/${capacitacion.id}`] 
      });
      queryClient.invalidateQueries({ 
        queryKey: [`${CAPACITACIONES_QUERY_KEY}/estado/programadas`] 
      });
      queryClient.invalidateQueries({ 
        queryKey: [`${CAPACITACIONES_QUERY_KEY}/estado/en-curso`] 
      });

      // Mostrar notificación de éxito
      toast({
        title: "Estado actualizado",
        description: `El estado de la capacitación "${capacitacion.titulo}" ha sido actualizado.`,
      });

      // Ejecutar callback si existe
      if (onSuccess) {
        onSuccess(capacitacion);
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

  // Función para validar datos
  const validarDatos = (datos: ActualizarCapacitacionDTO): boolean => {
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

    // Validar duracionHoras si se proporciona
    if (datos.duracionHoras !== undefined && datos.duracionHoras <= 0) {
      erroresValidacion.duracionHoras = "La duración en horas debe ser mayor a 0";
    }

    // Validar costo si se proporciona
    if (datos.costo !== undefined && datos.costo < 0) {
      erroresValidacion.costo = "El costo no puede ser negativo";
    }

    // Validar cupoMaximo si se proporciona
    if (datos.cupoMaximo !== undefined && datos.cupoMaximo <= 0) {
      erroresValidacion.cupoMaximo = "El cupo máximo debe ser mayor a 0";
    }

    // Si hay errores, guardarlos y retornar false
    if (Object.keys(erroresValidacion).length > 0) {
      setErrores(erroresValidacion);
      return false;
    }

    return true;
  };

  // Función para editar capacitación
  const editarCapacitacion = (datos: ActualizarCapacitacionDTO) => {
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

  return {
    editarCapacitacion,
    cambiarEstado,
    isLoading: mutation.isPending || cambiarEstadoMutation.isPending,
    isError: mutation.isError || cambiarEstadoMutation.isError,
    error: mutation.error || cambiarEstadoMutation.error,
    errores,
    setErrores,
    ESTADOS_CAPACITACION_LABELS,
    TIPOS_CAPACITACION_LABELS,
    MODALIDADES_CAPACITACION_LABELS
  };
}

/**
 * Implementación del caso de uso para editar capacitaciones usando el repositorio
 */
export class EditarCapacitacionUseCase {
  constructor(private capacitacionRepository: CapacitacionRepository) {}

  async actualizar(datos: ActualizarCapacitacionDTO): Promise<Capacitacion> {
    // Validar que exista ID
    if (!datos.id) {
      throw new Error("El ID de la capacitación es requerido para actualizarla");
    }

    // Obtener capacitación actual para verificar que existe
    const capacitacionActual = await this.capacitacionRepository.obtenerPorId(datos.id);
    
    if (!capacitacionActual) {
      throw new Error(`No se encontró la capacitación con ID ${datos.id}`);
    }

    // Validar fechas si se proporcionan ambas
    if (datos.fechaInicio && datos.fechaFin && new Date(datos.fechaInicio) > new Date(datos.fechaFin)) {
      throw new Error("La fecha de fin debe ser posterior a la fecha de inicio");
    }
    
    // Actualizar la capacitación
    try {
      return await this.capacitacionRepository.actualizar(datos);
    } catch (error) {
      console.error("Error al actualizar capacitación:", error);
      throw new Error("No se pudo actualizar la capacitación en el sistema");
    }
  }

  async cambiarEstado(id: number, nuevoEstado: string): Promise<Capacitacion> {
    // Validar que exista la capacitación
    const capacitacion = await this.capacitacionRepository.obtenerPorId(id);
    
    if (!capacitacion) {
      throw new Error(`No se encontró la capacitación con ID ${id}`);
    }
    
    // Cambiar estado
    try {
      return await this.capacitacionRepository.cambiarEstado(id, nuevoEstado as any);
    } catch (error) {
      console.error("Error al cambiar estado de capacitación:", error);
      throw new Error("No se pudo cambiar el estado de la capacitación");
    }
  }
}