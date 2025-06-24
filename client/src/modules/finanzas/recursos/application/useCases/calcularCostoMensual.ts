import { useQuery } from '@tanstack/react-query';
import { recursosApi } from '../../infrastructure/api/recursosApi';
import { Recurso, ResumenCostos } from '../../domain/entities/Recurso';

/**
 * Hook para obtener el resumen de costos de un presupuesto
 */
export function useCalcularCostoMensual(presupuestoId: number) {
  return useQuery({
    queryKey: ['recursos-resumen', presupuestoId],
    queryFn: () => recursosApi.obtenerResumenCostos(presupuestoId),
    enabled: !!presupuestoId,
  });
}

/**
 * Utilidades para cálculos de costos
 */
export const calculadoraCostos = {
  /**
   * Calcula el resumen de costos basado en una lista de recursos
   */
  calcularResumen: (recursos: Recurso[]): ResumenCostos => {
    const totalGeneral = recursos.reduce((sum, recurso) => sum + recurso.totalEstimado, 0);
    
    const totalPorOrigen = recursos.reduce((acc, recurso) => {
      acc[recurso.origen] = (acc[recurso.origen] || 0) + recurso.totalEstimado;
      return acc;
    }, {} as Record<string, number>);

    const totalPorPerfil = recursos.reduce((acc, recurso) => {
      acc[recurso.perfil] = (acc[recurso.perfil] || 0) + recurso.totalEstimado;
      return acc;
    }, {} as Record<string, number>);

    return {
      totalGeneral,
      totalPorOrigen: {
        INTERNO: totalPorOrigen.INTERNO || 0,
        EXTERNO: totalPorOrigen.EXTERNO || 0
      },
      totalPorPerfil: totalPorPerfil as any,
      totalRecursos: recursos.length,
      promedioPorRecurso: recursos.length > 0 ? totalGeneral / recursos.length : 0
    };
  },

  /**
   * Calcula el costo mensual promedio de un recurso
   */
  costoMensual: (recurso: Recurso): number => {
    return recurso.totalEstimado / recurso.meses;
  },

  /**
   * Calcula la eficiencia por hora (costo/hora)
   */
  costoPorHora: (recurso: Recurso): number => {
    return recurso.totalEstimado / recurso.totalHoras;
  }
};