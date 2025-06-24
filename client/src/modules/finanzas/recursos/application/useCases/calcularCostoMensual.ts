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

