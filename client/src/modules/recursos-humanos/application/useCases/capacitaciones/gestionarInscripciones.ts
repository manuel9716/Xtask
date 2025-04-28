/**
 * @file Caso de uso: Gestionar Inscripciones a Capacitaciones
 * @description Maneja la inscripción, cancelación y seguimiento de empleados en capacitaciones
 */

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";

import { 
  Capacitacion, 
  EmpleadoCapacitacion, 
  InscribirEmpleadoDTO 
} from "../../../domain/entities/Capacitacion";
import { CapacitacionRepository } from "../../../domain/repositories/CapacitacionRepository";
import * as capacitacionesApi from "../../../infrastructure/api/capacitacionesApi";

// Clave para cache de ReactQuery
const CAPACITACIONES_QUERY_KEY = "/api/capacitaciones";

/**
 * Hook para obtener las inscripciones a una capacitación
 */
export function useInscripcionesCapacitacion(capacitacionId: number) {
  const { toast } = useToast();
  
  const {
    data: inscripciones = [],
    isLoading,
    isError,
    error,
    refetch
  } = useQuery<EmpleadoCapacitacion[], Error>({
    queryKey: [`${CAPACITACIONES_QUERY_KEY}/${capacitacionId}/inscripciones`],
    queryFn: async () => {
      try {
        return await capacitacionesApi.obtenerInscripciones(capacitacionId);
      } catch (error) {
        console.error("Error al cargar inscripciones:", error);
        throw new Error("No se pudieron cargar las inscripciones a la capacitación");
      }
    },
    enabled: !!capacitacionId // Solo ejecutar si hay ID de capacitación
  });

  // Mostrar toast en caso de error
  useState(() => {
    if (isError && error) {
      toast({
        title: "Error al cargar inscripciones",
        description: error.message,
        variant: "destructive",
      });
    }
  });
  
  return {
    inscripciones,
    isLoading,
    isError,
    error,
    refetch
  };
}

/**
 * Hook para gestionar inscripciones a una capacitación
 */
export function useGestionarInscripciones(capacitacionId: number) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [errores, setErrores] = useState<Record<string, string>>({});

  // Mutation para inscribir un empleado
  const inscribirMutation = useMutation({
    mutationFn: async (datos: InscribirEmpleadoDTO) => {
      try {
        return await capacitacionesApi.inscribirEmpleado(datos);
      } catch (error) {
        console.error("Error al inscribir empleado:", error);
        throw new Error("No se pudo inscribir al empleado en la capacitación");
      }
    },
    onSuccess: () => {
      // Limpiar errores
      setErrores({});

      // Invalidar queries para refrescar los datos
      queryClient.invalidateQueries({ 
        queryKey: [`${CAPACITACIONES_QUERY_KEY}/${capacitacionId}/inscripciones`] 
      });
      queryClient.invalidateQueries({ 
        queryKey: [`${CAPACITACIONES_QUERY_KEY}/${capacitacionId}`] 
      });

      // Mostrar notificación de éxito
      toast({
        title: "Empleado inscrito",
        description: "El empleado ha sido inscrito correctamente en la capacitación.",
      });
    },
    onError: (error: Error) => {
      // Mostrar notificación de error
      toast({
        title: "Error al inscribir empleado",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  // Mutation para cancelar inscripción
  const cancelarInscripcionMutation = useMutation({
    mutationFn: async ({ empleadoId }: { empleadoId: number }) => {
      try {
        return await capacitacionesApi.cancelarInscripcion(capacitacionId, empleadoId);
      } catch (error) {
        console.error("Error al cancelar inscripción:", error);
        throw new Error("No se pudo cancelar la inscripción del empleado");
      }
    },
    onSuccess: () => {
      // Invalidar queries para refrescar los datos
      queryClient.invalidateQueries({ 
        queryKey: [`${CAPACITACIONES_QUERY_KEY}/${capacitacionId}/inscripciones`] 
      });
      queryClient.invalidateQueries({ 
        queryKey: [`${CAPACITACIONES_QUERY_KEY}/${capacitacionId}`] 
      });

      // Mostrar notificación de éxito
      toast({
        title: "Inscripción cancelada",
        description: "La inscripción del empleado ha sido cancelada correctamente.",
      });
    },
    onError: (error: Error) => {
      // Mostrar notificación de error
      toast({
        title: "Error al cancelar inscripción",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  // Mutation para registrar asistencia
  const registrarAsistenciaMutation = useMutation({
    mutationFn: async ({ empleadoId, asistio }: { empleadoId: number, asistio: boolean }) => {
      try {
        return await capacitacionesApi.registrarAsistencia(capacitacionId, empleadoId, asistio);
      } catch (error) {
        console.error("Error al registrar asistencia:", error);
        throw new Error("No se pudo registrar la asistencia del empleado");
      }
    },
    onSuccess: () => {
      // Invalidar queries para refrescar los datos
      queryClient.invalidateQueries({ 
        queryKey: [`${CAPACITACIONES_QUERY_KEY}/${capacitacionId}/inscripciones`] 
      });

      // Mostrar notificación de éxito
      toast({
        title: "Asistencia registrada",
        description: "La asistencia del empleado ha sido registrada correctamente.",
      });
    },
    onError: (error: Error) => {
      // Mostrar notificación de error
      toast({
        title: "Error al registrar asistencia",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  // Mutation para marcar completada
  const marcarCompletadaMutation = useMutation({
    mutationFn: async ({ empleadoId, calificacion }: { empleadoId: number, calificacion?: number }) => {
      try {
        return await capacitacionesApi.marcarCompletada(capacitacionId, empleadoId, calificacion);
      } catch (error) {
        console.error("Error al marcar como completada:", error);
        throw new Error("No se pudo marcar como completada la capacitación para el empleado");
      }
    },
    onSuccess: () => {
      // Invalidar queries para refrescar los datos
      queryClient.invalidateQueries({ 
        queryKey: [`${CAPACITACIONES_QUERY_KEY}/${capacitacionId}/inscripciones`] 
      });

      // Mostrar notificación de éxito
      toast({
        title: "Capacitación completada",
        description: "La capacitación ha sido marcada como completada para el empleado.",
      });
    },
    onError: (error: Error) => {
      // Mostrar notificación de error
      toast({
        title: "Error al completar capacitación",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  // Función para inscribir un empleado
  const inscribirEmpleado = (empleadoId: number, comentarios?: string) => {
    // Validar que se haya seleccionado un empleado
    if (!empleadoId) {
      setErrores({
        empleadoId: "Debe seleccionar un empleado para inscribir"
      });
      return;
    }

    // Ejecutar mutation
    inscribirMutation.mutate({
      capacitacionId,
      empleadoId,
      comentarios
    });
  };

  // Función para cancelar inscripción con confirmación
  const cancelarInscripcion = (empleadoId: number, nombreEmpleado: string) => {
    // Mostrar confirmación
    if (window.confirm(`¿Está seguro que desea cancelar la inscripción de ${nombreEmpleado}?`)) {
      cancelarInscripcionMutation.mutate({ empleadoId });
    }
  };

  // Función para registrar asistencia
  const registrarAsistencia = (empleadoId: number, asistio: boolean) => {
    registrarAsistenciaMutation.mutate({ empleadoId, asistio });
  };

  // Función para marcar como completada
  const marcarCompletada = (empleadoId: number, calificacion?: number) => {
    // Validar calificación si se proporciona
    if (calificacion !== undefined && (calificacion < 0 || calificacion > 10)) {
      setErrores({
        calificacion: "La calificación debe estar entre 0 y 10"
      });
      return;
    }

    // Ejecutar mutation
    marcarCompletadaMutation.mutate({ empleadoId, calificacion });
  };

  return {
    inscribirEmpleado,
    cancelarInscripcion,
    registrarAsistencia,
    marcarCompletada,
    isLoading: 
      inscribirMutation.isPending || 
      cancelarInscripcionMutation.isPending || 
      registrarAsistenciaMutation.isPending || 
      marcarCompletadaMutation.isPending,
    errores,
    setErrores
  };
}

/**
 * Implementación del caso de uso para gestionar inscripciones usando el repositorio
 */
export class GestionarInscripcionesUseCase {
  constructor(private capacitacionRepository: CapacitacionRepository) {}

  async obtenerInscripciones(capacitacionId: number): Promise<EmpleadoCapacitacion[]> {
    // Validar que exista la capacitación
    const capacitacion = await this.capacitacionRepository.obtenerPorId(capacitacionId);
    
    if (!capacitacion) {
      throw new Error(`No se encontró la capacitación con ID ${capacitacionId}`);
    }
    
    try {
      return await this.capacitacionRepository.obtenerInscripciones(capacitacionId);
    } catch (error) {
      console.error("Error al obtener inscripciones:", error);
      throw new Error("No se pudieron obtener las inscripciones a la capacitación");
    }
  }

  async inscribirEmpleado(datos: InscribirEmpleadoDTO): Promise<EmpleadoCapacitacion> {
    // Validar que exista la capacitación
    const capacitacion = await this.capacitacionRepository.obtenerPorId(datos.capacitacionId);
    
    if (!capacitacion) {
      throw new Error(`No se encontró la capacitación con ID ${datos.capacitacionId}`);
    }
    
    // Verificar si la capacitación tiene cupo máximo
    if (capacitacion.cupoMaximo) {
      // Obtener inscripciones actuales
      const inscripciones = await this.capacitacionRepository.obtenerInscripciones(datos.capacitacionId);
      
      // Verificar si hay cupo disponible
      if (inscripciones.length >= capacitacion.cupoMaximo) {
        throw new Error("No hay cupo disponible para esta capacitación");
      }
    }
    
    try {
      return await this.capacitacionRepository.inscribirEmpleado(datos);
    } catch (error) {
      console.error("Error al inscribir empleado:", error);
      throw new Error("No se pudo inscribir al empleado en la capacitación");
    }
  }

  async cancelarInscripcion(capacitacionId: number, empleadoId: number): Promise<boolean> {
    // Validar que exista la capacitación
    const capacitacion = await this.capacitacionRepository.obtenerPorId(capacitacionId);
    
    if (!capacitacion) {
      throw new Error(`No se encontró la capacitación con ID ${capacitacionId}`);
    }
    
    try {
      return await this.capacitacionRepository.cancelarInscripcion(empleadoId, capacitacionId);
    } catch (error) {
      console.error("Error al cancelar inscripción:", error);
      throw new Error("No se pudo cancelar la inscripción del empleado");
    }
  }

  async registrarAsistencia(capacitacionId: number, empleadoId: number, asistio: boolean): Promise<EmpleadoCapacitacion> {
    // Validar que exista la capacitación
    const capacitacion = await this.capacitacionRepository.obtenerPorId(capacitacionId);
    
    if (!capacitacion) {
      throw new Error(`No se encontró la capacitación con ID ${capacitacionId}`);
    }
    
    try {
      return await this.capacitacionRepository.registrarAsistencia(empleadoId, capacitacionId, asistio);
    } catch (error) {
      console.error("Error al registrar asistencia:", error);
      throw new Error("No se pudo registrar la asistencia del empleado");
    }
  }

  async marcarCompletada(capacitacionId: number, empleadoId: number, calificacion?: number): Promise<EmpleadoCapacitacion> {
    // Validar que exista la capacitación
    const capacitacion = await this.capacitacionRepository.obtenerPorId(capacitacionId);
    
    if (!capacitacion) {
      throw new Error(`No se encontró la capacitación con ID ${capacitacionId}`);
    }
    
    // Validar calificación si se proporciona
    if (calificacion !== undefined && (calificacion < 0 || calificacion > 10)) {
      throw new Error("La calificación debe estar entre 0 y 10");
    }
    
    try {
      return await this.capacitacionRepository.marcarCompletada(empleadoId, capacitacionId, calificacion);
    } catch (error) {
      console.error("Error al marcar como completada:", error);
      throw new Error("No se pudo marcar como completada la capacitación para el empleado");
    }
  }
}