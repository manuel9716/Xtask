import { apiRequest } from "@/lib/queryClient";
import { 
  Presupuesto, 
  CrearPresupuestoDTO, 
  RegistrarGastoDTO, 
  PresupuestoEstado 
} from "../../domain/entities/Presupuesto";
import { IPresupuestoRepository } from "../../domain/interfaces/IPresupuestoRepository";
import { CalculoEjecucion } from "../../domain/services/CalculoEjecucion";

/**
 * Implementación del repositorio de presupuestos que usa PostgreSQL a través de la API
 */
export class PresupuestoPgRepository implements IPresupuestoRepository {
  private calculoEjecucion: CalculoEjecucion;

  constructor() {
    this.calculoEjecucion = new CalculoEjecucion();
  }

  /**
   * Obtiene la lista de presupuestos desde la API
   */
  async listarPresupuestos(organizationId?: number): Promise<Presupuesto[]> {
    const endpoint = organizationId 
      ? `/api/presupuestos?organizationId=${organizationId}`
      : '/api/presupuestos';
    
    const response = await apiRequest('GET', endpoint);
    
    if (!response.ok) {
      throw new Error(`Error al listar presupuestos: ${response.statusText}`);
    }
    
    const presupuestos: Presupuesto[] = await response.json();
    return presupuestos;
  }

  /**
   * Obtiene un presupuesto por su ID
   */
  async obtenerPresupuestoPorId(id: number): Promise<Presupuesto | undefined> {
    try {
      const response = await apiRequest('GET', `/api/presupuestos/${id}`);
      
      if (!response.ok) {
        if (response.status === 404) {
          return undefined;
        }
        throw new Error(`Error al obtener presupuesto: ${response.statusText}`);
      }
      
      const presupuesto: Presupuesto = await response.json();
      return presupuesto;
    } catch (error) {
      console.error('Error al obtener presupuesto por ID:', error);
      return undefined;
    }
  }

  /**
   * Crea un nuevo presupuesto
   */
  async crearPresupuesto(presupuestoDto: CrearPresupuestoDTO): Promise<Presupuesto> {
    // Transformar el DTO al formato esperado por la API
    const payload = {
      name: presupuestoDto.nombre,
      amount: presupuestoDto.monto,
      startDate: presupuestoDto.fechaInicio,
      endDate: presupuestoDto.fechaFin,
      description: presupuestoDto.description,
      departmentId: presupuestoDto.area ? 
        // Si el área comienza con "Departamento ", extraer el número
        parseInt(presupuestoDto.area.replace('Departamento ', '')) : null,
      createdBy: presupuestoDto.createdBy || 1, // Usuario por defecto
      organizationId: presupuestoDto.organizationId || 1 // Organización por defecto
    };
    
    const response = await apiRequest('POST', '/api/presupuestos', payload);
    
    if (!response.ok) {
      throw new Error(`Error al crear presupuesto: ${response.statusText}`);
    }
    
    const presupuesto: Presupuesto = {
      id: 0,
      nombre: presupuestoDto.nombre,
      monto: presupuestoDto.monto,
      gastado: 0,
      porcentajeEjecucion: 0,
      estado: 'ACTIVO',
      area: presupuestoDto.area || 'General',
      fechaInicio: presupuestoDto.fechaInicio,
      fechaFin: presupuestoDto.fechaFin,
      description: presupuestoDto.description,
      createdAt: new Date(),
      updatedAt: new Date(),
      createdBy: presupuestoDto.createdBy || 1
    };
    
    // Reemplazar con los datos reales de la respuesta
    const respuestaApi = await response.json();
    Object.assign(presupuesto, respuestaApi);
    
    return presupuesto;
  }

  /**
   * Actualiza un presupuesto existente
   */
  async actualizarPresupuesto(id: number, presupuestoPartial: Partial<Presupuesto>): Promise<Presupuesto> {
    // Transformar el objeto parcial al formato esperado por la API
    const payload: Record<string, any> = {};
    
    if (presupuestoPartial.nombre) payload.nombre = presupuestoPartial.nombre;
    if (presupuestoPartial.monto) payload.monto = presupuestoPartial.monto;
    if (presupuestoPartial.area) payload.area = presupuestoPartial.area;
    if (presupuestoPartial.fechaInicio) payload.fechaInicio = presupuestoPartial.fechaInicio;
    if (presupuestoPartial.fechaFin) payload.fechaFin = presupuestoPartial.fechaFin;
    if (presupuestoPartial.description) payload.description = presupuestoPartial.description;
    
    const response = await apiRequest('PATCH', `/api/presupuestos/${id}`, payload);
    
    if (!response.ok) {
      throw new Error(`Error al actualizar presupuesto: ${response.statusText}`);
    }
    
    const presupuesto: Presupuesto = await response.json();
    return presupuesto;
  }

  /**
   * Registra un gasto en un presupuesto
   */
  async registrarGasto(id: number, gasto: RegistrarGastoDTO): Promise<Presupuesto> {
    const response = await apiRequest('POST', `/api/presupuestos/${id}/gastos`, gasto);
    
    if (!response.ok) {
      throw new Error(`Error al registrar gasto: ${response.statusText}`);
    }
    
    const presupuesto: Presupuesto = await response.json();
    return presupuesto;
  }
}

export const presupuestoRepository = new PresupuestoPgRepository();