/**
 * @file Caso de uso: Estadísticas de Capacitaciones
 * @description Gestiona la obtención de estadísticas e informes para análisis de capacitaciones
 */

import { useQuery } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { useState, useEffect } from "react";

import { CapacitacionRepository } from "../../../domain/repositories/CapacitacionRepository";
import * as capacitacionesApi from "../../../infrastructure/api/capacitacionesApi";

// Clave para cache de ReactQuery
const CAPACITACIONES_QUERY_KEY = "/api/capacitaciones";
const ESTADISTICAS_QUERY_KEY = `${CAPACITACIONES_QUERY_KEY}/estadisticas/resumen`;

// Interfaces para estadísticas
interface EstadisticasCapacitaciones {
  porEstado: { estado: string; total: number }[];
  porTipo: { tipo: string; total: number }[];
  asistencia: {
    porcentajeAsistencia: number;
    totalInscripciones: number;
    totalAsistencias: number;
  };
  completadas: { totalCompletadas: number };
  programadas: { totalProgramadas: number };
  enCurso: { totalEnCurso: number };
  proximasCapacitaciones: any[];
}

/**
 * Hook personalizado para obtener estadísticas de capacitaciones
 */
export function useEstadisticasCapacitaciones() {
  const { toast } = useToast();
  
  const {
    data: estadisticas,
    isLoading,
    isError,
    error,
    refetch
  } = useQuery<EstadisticasCapacitaciones, Error>({
    queryKey: [ESTADISTICAS_QUERY_KEY],
    queryFn: async () => {
      try {
        return await capacitacionesApi.obtenerEstadisticasCapacitaciones();
      } catch (error) {
        console.error("Error al cargar estadísticas de capacitaciones:", error);
        throw new Error("No se pudieron cargar las estadísticas de capacitaciones");
      }
    }
  });

  // Estadísticas procesadas para gráficos
  const [datosGraficos, setDatosGraficos] = useState<{
    porEstado: { name: string; value: number }[];
    porTipo: { name: string; value: number }[];
    asistencia: { name: string; value: number }[];
    tendencia: { fecha: string; programadas: number; enCurso: number; completadas: number }[];
  }>({
    porEstado: [],
    porTipo: [],
    asistencia: [],
    tendencia: []
  });

  // Indicadores (KPIs)
  const [indicadores, setIndicadores] = useState<{
    totalCapacitaciones: number;
    porcentajeAsistencia: number;
    capacitacionesProgramadas: number;
    capacitacionesEnCurso: number;
    capacitacionesCompletadas: number;
  }>({
    totalCapacitaciones: 0,
    porcentajeAsistencia: 0,
    capacitacionesProgramadas: 0,
    capacitacionesEnCurso: 0,
    capacitacionesCompletadas: 0
  });

  // Procesar estadísticas para gráficos cuando cambian los datos
  useEffect(() => {
    if (estadisticas) {
      // Datos para gráfico de estado
      const porEstado = estadisticas.porEstado.map(item => ({
        name: item.estado,
        value: item.total
      }));

      // Datos para gráfico de tipo
      const porTipo = estadisticas.porTipo.map(item => ({
        name: item.tipo,
        value: item.total
      }));

      // Datos para gráfico de asistencia
      const asistencia = [
        { name: 'Asistencias', value: estadisticas.asistencia.totalAsistencias },
        { name: 'Ausencias', value: estadisticas.asistencia.totalInscripciones - estadisticas.asistencia.totalAsistencias }
      ];

      // Ejemplo de datos para tendencia (esto podría venir de la API en una implementación completa)
      // En una implementación real, obtendríamos datos de tendencia por mes/semana
      const tendencia = [
        { fecha: 'Ene', programadas: 5, enCurso: 3, completadas: 2 },
        { fecha: 'Feb', programadas: 7, enCurso: 4, completadas: 3 },
        { fecha: 'Mar', programadas: 10, enCurso: 6, completadas: 4 },
        { fecha: 'Abr', programadas: 12, enCurso: 5, completadas: 7 }
      ];

      // Actualizar estado de datos para gráficos
      setDatosGraficos({
        porEstado,
        porTipo,
        asistencia,
        tendencia
      });

      // Calcular indicadores
      const totalCapacitaciones = 
        (estadisticas.programadas?.totalProgramadas || 0) + 
        (estadisticas.enCurso?.totalEnCurso || 0) + 
        (estadisticas.completadas?.totalCompletadas || 0);

      setIndicadores({
        totalCapacitaciones,
        porcentajeAsistencia: estadisticas.asistencia.porcentajeAsistencia,
        capacitacionesProgramadas: estadisticas.programadas?.totalProgramadas || 0,
        capacitacionesEnCurso: estadisticas.enCurso?.totalEnCurso || 0,
        capacitacionesCompletadas: estadisticas.completadas?.totalCompletadas || 0
      });
    }
  }, [estadisticas]);

  // Mostrar toast en caso de error
  useEffect(() => {
    if (isError && error) {
      toast({
        title: "Error al cargar estadísticas",
        description: error.message,
        variant: "destructive",
      });
    }
  }, [isError, error, toast]);

  return {
    estadisticas,
    datosGraficos,
    indicadores,
    proximasCapacitaciones: estadisticas?.proximasCapacitaciones || [],
    isLoading,
    isError,
    error,
    refetch
  };
}

/**
 * Implementación del caso de uso para obtener estadísticas usando el repositorio
 */
export class EstadisticasCapacitacionesUseCase {
  constructor(private capacitacionRepository: CapacitacionRepository) {}

  async obtenerEstadisticas(): Promise<any> {
    try {
      return await this.capacitacionRepository.obtenerEstadisticasCapacitaciones();
    } catch (error) {
      console.error("Error al obtener estadísticas de capacitaciones:", error);
      throw new Error("No se pudieron obtener las estadísticas de capacitaciones");
    }
  }

  // Método adicional para obtener tendencias por período (implementación futura)
  async obtenerTendencias(periodoInicio: Date, periodoFin: Date): Promise<any> {
    // Esta función podría implementarse en el futuro para obtener datos de tendencia
    // por ahora retornamos un error indicando que no está implementada
    throw new Error("Método no implementado");
  }
}