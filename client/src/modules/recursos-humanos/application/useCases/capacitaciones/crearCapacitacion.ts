/**
 * @file Caso de uso: Crear Capacitación
 * @description Gestiona la creación de nuevas capacitaciones
 */

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";

import { 
  CrearCapacitacionDTO, 
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
 * Hook personalizado para crear capacitaciones
 * @param onSuccess Callback a ejecutar cuando la capacitación se crea correctamente
 */
export function useCrearCapacitacion(onSuccess?: (capacitacion: Capacitacion) => void) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [errores, setErrores] = useState<Record<string, string>>({});

  // Mutation para crear una capacitación
  const mutation = useMutation({
    mutationFn: async (nuevaCapacitacion: CrearCapacitacionDTO) => {
      try {
        return await capacitacionesApi.crearCapacitacion(nuevaCapacitacion);
      } catch (error) {
        console.error("Error al crear capacitación:", error);
        throw new Error("No se pudo crear la capacitación");
      }
    },
    onSuccess: (capacitacion) => {
      // Limpiar errores
      setErrores({});

      // Invalidar queries para refrescar los datos
      queryClient.invalidateQueries({ queryKey: [CAPACITACIONES_QUERY_KEY] });
      queryClient.invalidateQueries({ 
        queryKey: [`${CAPACITACIONES_QUERY_KEY}/estado/programadas`] 
      });
      queryClient.invalidateQueries({ 
        queryKey: [`${CAPACITACIONES_QUERY_KEY}/estado/en-curso`] 
      });

      // Mostrar notificación de éxito
      toast({
        title: "Capacitación creada",
        description: `La capacitación "${capacitacion.titulo}" ha sido creada correctamente.`,
      });

      // Ejecutar callback si existe
      if (onSuccess) {
        onSuccess(capacitacion);
      }
    },
    onError: (error: Error) => {
      // Mostrar notificación de error
      toast({
        title: "Error al crear capacitación",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  // Función para validar datos
  const validarDatos = (datos: CrearCapacitacionDTO): boolean => {
    const erroresValidacion: Record<string, string> = {};

    // Validar título
    if (!datos.titulo || datos.titulo.trim() === '') {
      erroresValidacion.titulo = "El título es obligatorio";
    } else if (datos.titulo.length < 5) {
      erroresValidacion.titulo = "El título debe tener al menos 5 caracteres";
    }

    // Validar responsableId
    if (!datos.responsableId) {
      erroresValidacion.responsableId = "El responsable es obligatorio";
    }

    // Validar fechaInicio
    if (!datos.fechaInicio) {
      erroresValidacion.fechaInicio = "La fecha de inicio es obligatoria";
    }

    // Validar fechaFin
    if (!datos.fechaFin) {
      erroresValidacion.fechaFin = "La fecha de fin es obligatoria";
    } else if (datos.fechaInicio && datos.fechaFin && new Date(datos.fechaInicio) > new Date(datos.fechaFin)) {
      erroresValidacion.fechaFin = "La fecha de fin debe ser posterior a la fecha de inicio";
    }

    // Validar tipo
    if (!datos.tipo) {
      erroresValidacion.tipo = "El tipo de capacitación es obligatorio";
    }

    // Validar modalidad
    if (!datos.modalidad) {
      erroresValidacion.modalidad = "La modalidad es obligatoria";
    }

    // Validar ubicación si es presencial o híbrida
    if ((datos.modalidad === 'PRESENCIAL' || datos.modalidad === 'HIBRIDA') && !datos.ubicacion) {
      erroresValidacion.ubicacion = "La ubicación es obligatoria para capacitaciones presenciales o híbridas";
    }

    // Validar enlaceVirtual si es virtual o híbrida
    if ((datos.modalidad === 'VIRTUAL' || datos.modalidad === 'HIBRIDA') && !datos.enlaceVirtual) {
      erroresValidacion.enlaceVirtual = "El enlace virtual es obligatorio para capacitaciones virtuales o híbridas";
    }

    // Validar duracionHoras
    if (!datos.duracionHoras || datos.duracionHoras <= 0) {
      erroresValidacion.duracionHoras = "La duración en horas debe ser mayor a 0";
    }

    // Validar costo
    if (datos.costo < 0) {
      erroresValidacion.costo = "El costo no puede ser negativo";
    }

    // Validar cupoMaximo
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

  // Función para crear capacitación
  const crearCapacitacion = (datos: CrearCapacitacionDTO) => {
    // Validar datos
    if (!validarDatos(datos)) {
      return;
    }

    // Asegurar que estado sea PROGRAMADA si no se proporciona
    const capacitacionConEstado: CrearCapacitacionDTO = {
      ...datos,
      estado: datos.estado || 'PROGRAMADA'
    };

    // Ejecutar la mutación
    mutation.mutate(capacitacionConEstado);
  };

  return {
    crearCapacitacion,
    isLoading: mutation.isPending,
    isError: mutation.isError,
    error: mutation.error,
    errores,
    setErrores,
    ESTADOS_CAPACITACION_LABELS,
    TIPOS_CAPACITACION_LABELS,
    MODALIDADES_CAPACITACION_LABELS
  };
}

/**
 * Implementación del caso de uso para crear capacitaciones usando el repositorio
 */
export class CrearCapacitacionUseCase {
  constructor(private capacitacionRepository: CapacitacionRepository) {}

  async ejecutar(datos: CrearCapacitacionDTO): Promise<Capacitacion> {
    // Validar datos obligatorios
    if (!datos.titulo || !datos.responsableId || !datos.fechaInicio || !datos.fechaFin || 
        !datos.tipo || !datos.modalidad || !datos.duracionHoras) {
      throw new Error("Faltan datos obligatorios para crear la capacitación");
    }

    // Validar fechas
    if (new Date(datos.fechaInicio) > new Date(datos.fechaFin)) {
      throw new Error("La fecha de fin debe ser posterior a la fecha de inicio");
    }

    // Validar modalidad y campos relacionados
    if ((datos.modalidad === 'PRESENCIAL' || datos.modalidad === 'HIBRIDA') && !datos.ubicacion) {
      throw new Error("La ubicación es obligatoria para capacitaciones presenciales o híbridas");
    }

    if ((datos.modalidad === 'VIRTUAL' || datos.modalidad === 'HIBRIDA') && !datos.enlaceVirtual) {
      throw new Error("El enlace virtual es obligatorio para capacitaciones virtuales o híbridas");
    }

    // Asegurar que estado sea PROGRAMADA si no se proporciona
    const capacitacionConEstado: CrearCapacitacionDTO = {
      ...datos,
      estado: datos.estado || 'PROGRAMADA'
    };

    // Crear la capacitación usando el repositorio
    try {
      return await this.capacitacionRepository.crear(capacitacionConEstado);
    } catch (error) {
      console.error("Error al crear capacitación:", error);
      throw new Error("No se pudo crear la capacitación en el sistema");
    }
  }
}