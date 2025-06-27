import { useQuery } from '@tanstack/react-query';
import { FacturacionApi } from '../../infrastructure/api/facturacionApi';
import { IndicadoresFacturacion } from '../../domain/entities/Factura';

export function useCalcularIndicadoresFacturacion(proyectoId: number) {
  return useQuery<IndicadoresFacturacion>({
    queryKey: ['/api/facturacion', proyectoId, 'indicadores'],
    queryFn: () => FacturacionApi.obtenerIndicadores(proyectoId),
    enabled: !!proyectoId
  });
}