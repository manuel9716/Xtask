import { Presupuesto, CrearPresupuestoDTO, RegistrarGastoDTO } from "../../domain/entities/Presupuesto";
import { IPresupuestoRepository } from "../../domain/interfaces/IPresupuestoRepository";
import { CalculoEjecucion } from "../../domain/services/CalculoEjecucion";
import { apiRequest } from "@/lib/queryClient";

/**
 * Implementación del repositorio de presupuestos que usa PostgreSQL a través de la API
 */
export class PresupuestoPgRepository implements IPresupuestoRepository {
  /**
   * Obtiene la lista de presupuestos desde la API
   */
  async listarPresupuestos(organizationId?: number): Promise<Presupuesto[]> {
    try {
      const url = organizationId 
        ? `/api/presupuestos?organizationId=${organizationId}`
        : '/api/presupuestos';
        
      const response = await apiRequest('GET', url);
      
      if (!response.ok) {
        throw new Error(`Error al obtener presupuestos: ${response.statusText}`);
      }
      
      const presupuestos: Presupuesto[] = await response.json();
      
      // Asegurarse de que las fechas sean objetos Date
      return presupuestos.map(presupuesto => ({
        ...presupuesto,
        fechaInicio: new Date(presupuesto.fechaInicio),
        fechaFin: new Date(presupuesto.fechaFin),
        createdAt: new Date(presupuesto.createdAt),
        updatedAt: new Date(presupuesto.updatedAt)
      }));
    } catch (error) {
      console.error('Error en listarPresupuestos:', error);
      throw error;
    }
  }

  /**
   * Obtiene un presupuesto por su ID
   */
  async obtenerPresupuestoPorId(id: number): Promise<Presupuesto | undefined> {
    try {
      const response = await apiRequest('GET', `/api/presupuestos/${id}`);
      
      if (response.status === 404) {
        return undefined;
      }
      
      if (!response.ok) {
        throw new Error(`Error al obtener presupuesto: ${response.statusText}`);
      }
      
      const presupuesto: Presupuesto = await response.json();
      
      // Asegurarse de que las fechas sean objetos Date
      return {
        ...presupuesto,
        fechaInicio: new Date(presupuesto.fechaInicio),
        fechaFin: new Date(presupuesto.fechaFin),
        createdAt: new Date(presupuesto.createdAt),
        updatedAt: new Date(presupuesto.updatedAt)
      };
    } catch (error) {
      console.error(`Error en obtenerPresupuestoPorId(${id}):`, error);
      throw error;
    }
  }

  /**
   * Crea un nuevo presupuesto
   */
  async crearPresupuesto(presupuestoDto: CrearPresupuestoDTO): Promise<Presupuesto> {
    try {
      // Transformar a formato esperado por la API
      const apiData = {
        name: presupuestoDto.nombre,
        amount: presupuestoDto.monto,
        startDate: presupuestoDto.fechaInicio,
        endDate: presupuestoDto.fechaFin,
        description: presupuestoDto.description || null,
        departmentId: presupuestoDto.area ? parseInt(presupuestoDto.area.replace('Departamento ', '')) : null,
        organizationId: 1, // Valor por defecto si no se proporciona
        createdBy: presupuestoDto.createdBy || 1 // Valor por defecto si no se proporciona
      };
      
      const response = await apiRequest('POST', '/api/presupuestos', apiData);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Error al crear presupuesto: ${errorData.error || response.statusText}`);
      }
      
      const createdData = await response.json();
      
      // Convertir la respuesta al formato de dominio
      const presupuesto: Presupuesto = {
        id: createdData.id,
        nombre: createdData.nombre,
        monto: createdData.monto,
        gastado: createdData.gastado || 0,
        porcentajeEjecucion: createdData.porcentajeEjecucion || 0,
        estado: createdData.estado || 'ACTIVO',
        area: createdData.area,
        fechaInicio: new Date(createdData.fechaInicio),
        fechaFin: new Date(createdData.fechaFin),
        createdAt: new Date(createdData.createdAt),
        updatedAt: new Date(createdData.updatedAt),
        createdBy: createdData.createdBy,
        description: createdData.description
      };
      
      return presupuesto;
    } catch (error) {
      console.error('Error en crearPresupuesto:', error);
      throw error;
    }
  }

  /**
   * Actualiza un presupuesto existente
   */
  async actualizarPresupuesto(id: number, presupuestoPartial: Partial<Presupuesto>): Promise<Presupuesto> {
    try {
      // Obtener presupuesto actual para verificar si está completado
      const presupuestoActual = await this.obtenerPresupuestoPorId(id);
      
      if (!presupuestoActual) {
        throw new Error(`Presupuesto con ID ${id} no encontrado`);
      }
      
      // Verificar si el presupuesto está completado
      if (presupuestoActual.estado === 'COMPLETADO') {
        throw new Error('No se puede modificar un presupuesto que está COMPLETADO');
      }
      
      // Transformar a formato esperado por la API
      const apiData: Record<string, any> = {};
      
      if (presupuestoPartial.nombre) apiData.nombre = presupuestoPartial.nombre;
      if (presupuestoPartial.monto) apiData.monto = presupuestoPartial.monto;
      if (presupuestoPartial.area) apiData.area = presupuestoPartial.area;
      if (presupuestoPartial.fechaInicio) apiData.fechaInicio = presupuestoPartial.fechaInicio;
      if (presupuestoPartial.fechaFin) apiData.fechaFin = presupuestoPartial.fechaFin;
      if (presupuestoPartial.description) apiData.description = presupuestoPartial.description;
      
      const response = await apiRequest('PATCH', `/api/presupuestos/${id}`, apiData);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Error al actualizar presupuesto: ${errorData.error || response.statusText}`);
      }
      
      const updatedData = await response.json();
      
      // Convertir la respuesta al formato de dominio
      const presupuesto: Presupuesto = {
        id: updatedData.id,
        nombre: updatedData.nombre,
        monto: updatedData.monto,
        gastado: updatedData.gastado || 0,
        porcentajeEjecucion: updatedData.porcentajeEjecucion || 0,
        estado: updatedData.estado || 'ACTIVO',
        area: updatedData.area,
        fechaInicio: new Date(updatedData.fechaInicio),
        fechaFin: new Date(updatedData.fechaFin),
        createdAt: new Date(updatedData.createdAt),
        updatedAt: new Date(updatedData.updatedAt),
        createdBy: updatedData.createdBy,
        description: updatedData.description
      };
      
      return presupuesto;
    } catch (error) {
      console.error(`Error en actualizarPresupuesto(${id}):`, error);
      throw error;
    }
  }

  /**
   * Registra un gasto en un presupuesto
   */
  async registrarGasto(id: number, gasto: RegistrarGastoDTO): Promise<Presupuesto> {
    try {
      // Obtener presupuesto actual para verificaciones
      const presupuestoActual = await this.obtenerPresupuestoPorId(id);
      
      if (!presupuestoActual) {
        throw new Error(`Presupuesto con ID ${id} no encontrado`);
      }
      
      // Verificar si el presupuesto está completado
      if (presupuestoActual.estado === 'COMPLETADO') {
        throw new Error('No se puede registrar gastos en un presupuesto que está COMPLETADO');
      }
      
      // Verificar que el gasto no exceda el monto disponible
      const montoDisponible = presupuestoActual.monto - presupuestoActual.gastado;
      if (gasto.monto > montoDisponible) {
        throw new Error(`El gasto excede el monto disponible (${montoDisponible})`);
      }
      
      const apiData = {
        monto: gasto.monto,
        descripcion: gasto.descripcion || 'Gasto registrado'
      };
      
      const response = await apiRequest('POST', `/api/presupuestos/${id}/gastos`, apiData);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Error al registrar gasto: ${errorData.error || response.statusText}`);
      }
      
      const updatedData = await response.json();
      
      // Convertir la respuesta al formato de dominio
      const presupuesto: Presupuesto = {
        id: updatedData.id,
        nombre: updatedData.nombre,
        monto: updatedData.monto,
        gastado: updatedData.gastado,
        porcentajeEjecucion: updatedData.porcentajeEjecucion,
        estado: updatedData.estado,
        area: updatedData.area,
        fechaInicio: new Date(updatedData.fechaInicio),
        fechaFin: new Date(updatedData.fechaFin),
        createdAt: new Date(updatedData.createdAt),
        updatedAt: new Date(updatedData.updatedAt),
        createdBy: updatedData.createdBy,
        description: updatedData.description
      };
      
      return presupuesto;
    } catch (error) {
      console.error(`Error en registrarGasto(${id}):`, error);
      throw error;
    }
  }
}

// Exportamos una instancia única del repositorio (Patrón Singleton)
export const presupuestoRepository = new PresupuestoPgRepository();