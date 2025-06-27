import { useQuery } from '@tanstack/react-query';
import { FacturacionApi } from '../../infrastructure/api/facturacionApi';
import { Factura, FiltrosFactura } from '../../domain/entities/Factura';

export function useListarFacturasPorProyecto(proyectoId: number, filtros?: FiltrosFactura) {
  return useQuery<Factura[]>({
    queryKey: ['/api/facturacion', proyectoId, filtros],
    queryFn: () => FacturacionApi.listarFacturasPorProyecto(proyectoId, filtros),
    enabled: !!proyectoId
  });
}