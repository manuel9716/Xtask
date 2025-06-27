import { apiRequest } from '@/lib/queryClient';
import { Factura, IndicadoresFacturacion, FiltrosFactura } from '../domain/entities/Factura';
import { InsertFacturaProyecto } from '@shared/schema';

export class FacturacionApi {
  static async listarFacturasPorProyecto(proyectoId: number, filtros?: FiltrosFactura): Promise<Factura[]> {
    const params = new URLSearchParams();
    if (filtros?.estado) params.append('estado', filtros.estado);
    if (filtros?.cliente) params.append('cliente', filtros.cliente);
    if (filtros?.fechaDesde) params.append('fechaDesde', filtros.fechaDesde);
    if (filtros?.fechaHasta) params.append('fechaHasta', filtros.fechaHasta);
    if (filtros?.busqueda) params.append('busqueda', filtros.busqueda);

    const query = params.toString() ? `?${params.toString()}` : '';
    const response = await apiRequest('GET', `/api/facturacion/${proyectoId}${query}`);
    return response.json();
  }

  static async obtenerIndicadores(proyectoId: number): Promise<IndicadoresFacturacion> {
    const response = await apiRequest('GET', `/api/facturacion/${proyectoId}/indicadores`);
    return response.json();
  }

  static async registrarFactura(factura: InsertFacturaProyecto): Promise<Factura> {
    const response = await apiRequest('POST', '/api/facturacion', factura);
    return response.json();
  }

  static async actualizarEstadoFactura(facturaId: number, estado: string): Promise<Factura> {
    const response = await apiRequest('PATCH', `/api/facturacion/${facturaId}/estado`, { estado });
    return response.json();
  }

  static async obtenerFactura(facturaId: number): Promise<Factura> {
    const response = await apiRequest('GET', `/api/facturacion/detalle/${facturaId}`);
    return response.json();
  }

  static async eliminarFactura(facturaId: number): Promise<void> {
    await apiRequest('DELETE', `/api/facturacion/${facturaId}`);
  }
}