/**
 * @file Caso de uso: Listar Evaluaciones
 * @description Gestiona la obtención y filtrado de evaluaciones de desempeño
 */

import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";

import { Evaluacion, FiltrosEvaluacion, ESTADOS_EVALUACION_LABELS, TIPOS_EVALUACION_LABELS } from "../../../domain/entities/Evaluacion";
import { EvaluacionRepository } from "../../../domain/repositories/EvaluacionRepository";
import * as evaluacionesApi from "../../../infrastructure/api/evaluacionesApi";

// Clave para cache de ReactQuery
const EVALUACIONES_QUERY_KEY = "/api/evaluaciones";

/**
 * Hook personalizado para listar evaluaciones con filtros
 */
export function useListarEvaluaciones() {
  const { toast } = useToast();
  const [filtros, setFiltros] = useState<FiltrosEvaluacion>({});
  const [evaluacionesFiltradas, setEvaluacionesFiltradas] = useState<Evaluacion[]>([]);

  // Consulta para obtener evaluaciones
  const {
    data: evaluaciones = [],
    isLoading,
    isError,
    error,
    refetch
  } = useQuery<Evaluacion[], Error>({
    queryKey: [EVALUACIONES_QUERY_KEY, filtros],
    queryFn: async () => {
      try {
        return await evaluacionesApi.listarEvaluaciones(filtros);
      } catch (error) {
        console.error("Error al cargar evaluaciones:", error);
        throw new Error("No se pudieron cargar las evaluaciones");
      }
    }
  });

  // Configuración del formulario de filtros
  const filtrosForm = useForm<FiltrosEvaluacion>({
    defaultValues: filtros
  });

  // Función para aplicar filtros
  const aplicarFiltros = (nuevosFiltros: FiltrosEvaluacion) => {
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
        title: "Error al cargar evaluaciones",
        description: error.message,
        variant: "destructive",
      });
    }
  }, [isError, error, toast]);

  // Cuando cambian los datos o filtros, actualizar las evaluaciones filtradas
  useEffect(() => {
    if (evaluaciones) {
      // Si no hay filtros, usamos todas las evaluaciones
      if (Object.keys(filtros).length === 0) {
        setEvaluacionesFiltradas(evaluaciones);
        return;
      }

      // Aplicar filtros adicionales en memoria (filtros complejos)
      const filtered = evaluaciones.filter(eval => {
        // Filtrado en cliente si es necesario para búsquedas más complejas
        // que no se puedan manejar fácilmente en el backend
        return true;
      });

      setEvaluacionesFiltradas(filtered);
    }
  }, [evaluaciones, filtros]);

  return {
    evaluaciones: evaluacionesFiltradas,
    isLoading,
    isError,
    error,
    filtros,
    filtrosForm,
    aplicarFiltros,
    limpiarFiltros,
    refrescarDatos,
    ESTADOS_EVALUACION_LABELS,
    TIPOS_EVALUACION_LABELS,
  };
}

/**
 * Implementación de repositorio de evaluaciones usando API
 */
export class EvaluacionRepositoryImpl implements EvaluacionRepository {
  async listar(filtros?: FiltrosEvaluacion): Promise<Evaluacion[]> {
    return evaluacionesApi.listarEvaluaciones(filtros);
  }

  async obtenerPorId(id: number): Promise<Evaluacion | null> {
    return evaluacionesApi.obtenerEvaluacionPorId(id);
  }

  async obtenerPorEmpleadoId(empleadoId: number): Promise<Evaluacion[]> {
    return evaluacionesApi.obtenerEvaluacionesPorEmpleado(empleadoId);
  }

  async crear(evaluacion: any): Promise<Evaluacion> {
    return evaluacionesApi.crearEvaluacion(evaluacion);
  }

  async actualizar(evaluacion: any): Promise<Evaluacion> {
    return evaluacionesApi.actualizarEvaluacion(evaluacion);
  }

  async eliminar(id: number): Promise<boolean> {
    const result = await evaluacionesApi.eliminarEvaluacion(id);
    return result.success;
  }

  async cambiarEstado(id: number, nuevoEstado: any): Promise<Evaluacion> {
    return evaluacionesApi.cambiarEstadoEvaluacion(id, nuevoEstado);
  }

  async obtenerEstadisticasPorDepartamento(): Promise<any> {
    return evaluacionesApi.obtenerEstadisticasPorDepartamento();
  }

  async obtenerEstadisticasPorCargo(): Promise<any> {
    // Implementar cuando la API lo soporte
    throw new Error("Método no implementado");
  }

  async obtenerUltimasEvaluaciones(limite: number): Promise<Evaluacion[]> {
    // Simplemente limitar los resultados de listar
    const evaluaciones = await this.listar();
    return evaluaciones.slice(0, limite);
  }
}