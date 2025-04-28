/**
 * @file Caso de uso: Listar Capacitaciones
 * @description Gestiona la obtención y filtrado de capacitaciones
 */

import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";

import { 
  Capacitacion, 
  FiltrosCapacitacion, 
  ESTADOS_CAPACITACION_LABELS, 
  TIPOS_CAPACITACION_LABELS,
  MODALIDADES_CAPACITACION_LABELS
} from "../../../domain/entities/Capacitacion";
import { CapacitacionRepository } from "../../../domain/repositories/CapacitacionRepository";
import * as capacitacionesApi from "../../../infrastructure/api/capacitacionesApi";

// Clave para cache de ReactQuery
const CAPACITACIONES_QUERY_KEY = "/api/capacitaciones";

/**
 * Hook personalizado para listar capacitaciones con filtros
 */
export function useListarCapacitaciones() {
  const { toast } = useToast();
  const [filtros, setFiltros] = useState<FiltrosCapacitacion>({});
  const [capacitacionesFiltradas, setCapacitacionesFiltradas] = useState<Capacitacion[]>([]);

  // Consulta para obtener capacitaciones
  const {
    data: capacitaciones = [],
    isLoading,
    isError,
    error,
    refetch
  } = useQuery<Capacitacion[], Error>({
    queryKey: [CAPACITACIONES_QUERY_KEY, filtros],
    queryFn: async () => {
      try {
        return await capacitacionesApi.listarCapacitaciones(filtros);
      } catch (error) {
        console.error("Error al cargar capacitaciones:", error);
        throw new Error("No se pudieron cargar las capacitaciones");
      }
    }
  });

  // Configuración del formulario de filtros
  const filtrosForm = useForm<FiltrosCapacitacion>({
    defaultValues: filtros
  });

  // Función para aplicar filtros
  const aplicarFiltros = (nuevosFiltros: FiltrosCapacitacion) => {
    setFiltros(nuevosFiltros);
  };

  // Función para limpiar filtros
  const limpiarFiltros = () => {
    filtrosForm.reset({});
    setFiltros({});
  };

  // Función para refrescar datos
  const refrescarDatos = () => {
    refetch();
  };

  // Mostrar toast en caso de error
  useEffect(() => {
    if (isError && error) {
      toast({
        title: "Error al cargar capacitaciones",
        description: error.message,
        variant: "destructive",
      });
    }
  }, [isError, error, toast]);

  // Cuando cambian los datos o filtros, actualizar las capacitaciones filtradas
  useEffect(() => {
    if (capacitaciones) {
      // Si no hay filtros, usamos todas las capacitaciones
      if (Object.keys(filtros).length === 0) {
        setCapacitacionesFiltradas(capacitaciones);
        return;
      }

      // Aplicar filtros adicionales en memoria (filtros complejos)
      const filtered = capacitaciones.filter(capacitacion => {
        // Filtrado en cliente si es necesario para búsquedas más complejas
        // que no se puedan manejar fácilmente en el backend
        return true;
      });

      setCapacitacionesFiltradas(filtered);
    }
  }, [capacitaciones, filtros]);

  return {
    capacitaciones: capacitacionesFiltradas,
    isLoading,
    isError,
    error,
    filtros,
    filtrosForm,
    aplicarFiltros,
    limpiarFiltros,
    refrescarDatos,
    ESTADOS_CAPACITACION_LABELS,
    TIPOS_CAPACITACION_LABELS,
    MODALIDADES_CAPACITACION_LABELS
  };
}

/**
 * Hook para obtener capacitaciones programadas
 */
export function useCapacitacionesProgramadas() {
  const { toast } = useToast();
  
  const {
    data: capacitaciones = [],
    isLoading,
    isError,
    error,
    refetch
  } = useQuery<Capacitacion[], Error>({
    queryKey: [`${CAPACITACIONES_QUERY_KEY}/estado/programadas`],
    queryFn: async () => {
      try {
        return await capacitacionesApi.obtenerCapacitacionesProgramadas();
      } catch (error) {
        console.error("Error al cargar capacitaciones programadas:", error);
        throw new Error("No se pudieron cargar las capacitaciones programadas");
      }
    }
  });

  // Mostrar toast en caso de error
  useEffect(() => {
    if (isError && error) {
      toast({
        title: "Error al cargar capacitaciones programadas",
        description: error.message,
        variant: "destructive",
      });
    }
  }, [isError, error, toast]);
  
  return {
    capacitaciones,
    isLoading,
    isError,
    error,
    refetch
  };
}

/**
 * Hook para obtener capacitaciones en curso
 */
export function useCapacitacionesEnCurso() {
  const { toast } = useToast();
  
  const {
    data: capacitaciones = [],
    isLoading,
    isError,
    error,
    refetch
  } = useQuery<Capacitacion[], Error>({
    queryKey: [`${CAPACITACIONES_QUERY_KEY}/estado/en-curso`],
    queryFn: async () => {
      try {
        return await capacitacionesApi.obtenerCapacitacionesEnCurso();
      } catch (error) {
        console.error("Error al cargar capacitaciones en curso:", error);
        throw new Error("No se pudieron cargar las capacitaciones en curso");
      }
    }
  });

  // Mostrar toast en caso de error
  useEffect(() => {
    if (isError && error) {
      toast({
        title: "Error al cargar capacitaciones en curso",
        description: error.message,
        variant: "destructive",
      });
    }
  }, [isError, error, toast]);
  
  return {
    capacitaciones,
    isLoading,
    isError,
    error,
    refetch
  };
}

/**
 * Hook para obtener capacitaciones de un empleado
 */
export function useCapacitacionesEmpleado(empleadoId: number) {
  const { toast } = useToast();
  
  const {
    data: capacitaciones = [],
    isLoading,
    isError,
    error,
    refetch
  } = useQuery<Capacitacion[], Error>({
    queryKey: [`${CAPACITACIONES_QUERY_KEY}/empleado/${empleadoId}`],
    queryFn: async () => {
      try {
        return await capacitacionesApi.obtenerCapacitacionesPorEmpleado(empleadoId);
      } catch (error) {
        console.error("Error al cargar capacitaciones del empleado:", error);
        throw new Error("No se pudieron cargar las capacitaciones del empleado");
      }
    },
    enabled: !!empleadoId // Solo ejecutar si hay ID de empleado
  });

  // Mostrar toast en caso de error
  useEffect(() => {
    if (isError && error) {
      toast({
        title: "Error al cargar capacitaciones del empleado",
        description: error.message,
        variant: "destructive",
      });
    }
  }, [isError, error, toast]);
  
  return {
    capacitaciones,
    isLoading,
    isError,
    error,
    refetch
  };
}

/**
 * Implementación de repositorio de capacitaciones usando API
 */
export class CapacitacionRepositoryImpl implements CapacitacionRepository {
  async listar(filtros?: FiltrosCapacitacion): Promise<Capacitacion[]> {
    return capacitacionesApi.listarCapacitaciones(filtros);
  }

  async obtenerPorId(id: number): Promise<Capacitacion | null> {
    return capacitacionesApi.obtenerCapacitacionPorId(id);
  }

  async obtenerCapacitacionesProgramadas(): Promise<Capacitacion[]> {
    return capacitacionesApi.obtenerCapacitacionesProgramadas();
  }

  async obtenerCapacitacionesEnCurso(): Promise<Capacitacion[]> {
    return capacitacionesApi.obtenerCapacitacionesEnCurso();
  }

  async obtenerCapacitacionesFinalizadas(): Promise<Capacitacion[]> {
    // Implementar cuando haya endpoint específico. Por ahora, filtrar con todos.
    const todas = await this.listar();
    return todas.filter(c => c.estado === 'COMPLETADA');
  }

  async crear(capacitacion: any): Promise<Capacitacion> {
    return capacitacionesApi.crearCapacitacion(capacitacion);
  }

  async actualizar(capacitacion: any): Promise<Capacitacion> {
    return capacitacionesApi.actualizarCapacitacion(capacitacion);
  }

  async eliminar(id: number): Promise<boolean> {
    const result = await capacitacionesApi.eliminarCapacitacion(id);
    return result.success;
  }

  async cambiarEstado(id: number, nuevoEstado: any): Promise<Capacitacion> {
    return capacitacionesApi.cambiarEstadoCapacitacion(id, nuevoEstado);
  }

  async inscribirEmpleado(datos: any): Promise<any> {
    return capacitacionesApi.inscribirEmpleado(datos);
  }

  async cancelarInscripcion(empleadoId: number, capacitacionId: number): Promise<boolean> {
    return capacitacionesApi.cancelarInscripcion(capacitacionId, empleadoId);
  }

  async obtenerInscripciones(capacitacionId: number): Promise<any[]> {
    return capacitacionesApi.obtenerInscripciones(capacitacionId);
  }

  async registrarAsistencia(empleadoId: number, capacitacionId: number, asistio: boolean): Promise<any> {
    return capacitacionesApi.registrarAsistencia(capacitacionId, empleadoId, asistio);
  }

  async marcarCompletada(empleadoId: number, capacitacionId: number, calificacion?: number): Promise<any> {
    return capacitacionesApi.marcarCompletada(capacitacionId, empleadoId, calificacion);
  }

  async obtenerCapacitacionesPorEmpleado(empleadoId: number): Promise<Capacitacion[]> {
    return capacitacionesApi.obtenerCapacitacionesPorEmpleado(empleadoId);
  }

  async obtenerEstadisticasCapacitaciones(): Promise<any> {
    return capacitacionesApi.obtenerEstadisticasCapacitaciones();
  }
}