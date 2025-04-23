import { apiRequest } from '@/lib/queryClient';
import { 
  Presupuesto, 
  CreatePresupuestoDto, 
  UpdatePresupuestoDto, 
  EstadoPresupuesto 
} from '../../domain/entities/Presupuesto';
import { IPresupuestoRepository } from '../../domain/interfaces/IPresupuestoRepository';
import { CalculoEjecucionService } from '../../domain/services/CalculoEjecucion';

/**
 * Implementación del repositorio de presupuestos que utiliza la API para persistir los datos
 * Esta es una implementación concreta del puerto definido en el dominio
 */
export class PresupuestoRepository implements IPresupuestoRepository {
  private calculoService: CalculoEjecucionService;

  constructor() {
    this.calculoService = new CalculoEjecucionService();
  }

  async getAll(organizationId: number): Promise<Presupuesto[]> {
    const response = await apiRequest('GET', `/api/presupuestos?organizationId=${organizationId}`);
    const data = await response.json();
    return data.map(this.mapApiResponseToPresupuesto);
  }

  async getById(id: number): Promise<Presupuesto | null> {
    const response = await apiRequest('GET', `/api/presupuestos/${id}`);
    if (response.status === 404) return null;
    const data = await response.json();
    return this.mapApiResponseToPresupuesto(data);
  }

  async create(data: CreatePresupuestoDto): Promise<Presupuesto> {
    const response = await apiRequest('POST', '/api/presupuestos', data);
    const result = await response.json();
    return this.mapApiResponseToPresupuesto(result);
  }

  async update(id: number, data: UpdatePresupuestoDto): Promise<Presupuesto> {
    const response = await apiRequest('PATCH', `/api/presupuestos/${id}`, data);
    const result = await response.json();
    return this.mapApiResponseToPresupuesto(result);
  }

  async registrarGasto(id: number, monto: number): Promise<Presupuesto> {
    const response = await apiRequest('POST', `/api/presupuestos/${id}/gastos`, { monto });
    const result = await response.json();
    return this.mapApiResponseToPresupuesto(result);
  }

  async importarDesdeCSV(csvData: string, organizationId: number): Promise<Presupuesto[]> {
    const response = await apiRequest('POST', '/api/presupuestos/importar', { 
      csvData, 
      organizationId 
    });
    const result = await response.json();
    return result.map(this.mapApiResponseToPresupuesto);
  }

  /**
   * Mapea la respuesta de la API al modelo de dominio
   */
  private mapApiResponseToPresupuesto(data: any): Presupuesto {
    const calculoService = new CalculoEjecucionService();
    const porcentajeEjecucion = calculoService.calcularPorcentajeEjecucion(data.gastado, data.monto);
    const estado = calculoService.determinarEstado(porcentajeEjecucion);

    return {
      id: data.id,
      nombre: data.nombre,
      monto: data.monto,
      gastado: data.gastado,
      area: data.area,
      periodo: data.periodo,
      fechaInicio: new Date(data.fechaInicio),
      fechaFin: new Date(data.fechaFin),
      estado: estado,
      porcentajeEjecucion: porcentajeEjecucion,
      organizationId: data.organizationId,
      createdAt: new Date(data.createdAt),
      updatedAt: new Date(data.updatedAt)
    };
  }
}