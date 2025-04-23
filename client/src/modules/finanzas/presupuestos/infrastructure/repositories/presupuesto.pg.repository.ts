import { apiRequest } from '@/lib/queryClient';
import { Presupuesto, CrearPresupuestoDTO, RegistrarGastoDTO } from '../../domain/entities/Presupuesto';
import { IPresupuestoRepository } from '../../domain/interfaces/IPresupuestoRepository';
import { CalculoEjecucion } from '../../domain/services/CalculoEjecucion';

/**
 * Implementación PostgreSQL del repositorio de presupuestos
 * Utiliza la API REST para comunicarse con el backend
 */
export class PresupuestoPgRepository implements IPresupuestoRepository {
  private calculoEjecucion: CalculoEjecucion;

  constructor() {
    this.calculoEjecucion = new CalculoEjecucion();
  }

  /**
   * Obtiene un presupuesto por su ID
   * @param id ID del presupuesto
   * @returns Presupuesto encontrado o undefined si no existe
   */
  async obtenerPresupuesto(id: number): Promise<Presupuesto | undefined> {
    try {
      const response = await apiRequest('GET', `/api/presupuestos/${id}`);
      
      if (!response.ok) {
        if (response.status === 404) {
          return undefined;
        }
        throw new Error(`Error al obtener presupuesto: ${response.statusText}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error al obtener presupuesto:', error);
      throw error;
    }
  }

  /**
   * Lista todos los presupuestos, opcionalmente filtrados por organización
   * @param organizationId ID de la organización (opcional)
   * @returns Array de presupuestos
   */
  async listarPresupuestos(organizationId?: number): Promise<Presupuesto[]> {
    try {
      const url = organizationId 
        ? `/api/presupuestos?organizationId=${organizationId}` 
        : '/api/presupuestos';
      
      const response = await apiRequest('GET', url);
      
      if (!response.ok) {
        throw new Error(`Error al listar presupuestos: ${response.statusText}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error al listar presupuestos:', error);
      return [];
    }
  }

  /**
   * Crea un nuevo presupuesto
   * @param presupuesto Datos para crear el presupuesto
   * @returns Presupuesto creado con su ID
   */
  async crearPresupuesto(presupuestoDTO: CrearPresupuestoDTO): Promise<Presupuesto> {
    try {
      const response = await apiRequest('POST', '/api/presupuestos', presupuestoDTO);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error al crear presupuesto');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error al crear presupuesto:', error);
      throw error;
    }
  }

  /**
   * Actualiza un presupuesto existente
   * @param id ID del presupuesto a actualizar
   * @param presupuesto Datos actualizados
   * @returns Presupuesto actualizado
   */
  async actualizarPresupuesto(id: number, presupuesto: Partial<Presupuesto>): Promise<Presupuesto> {
    try {
      const response = await apiRequest('PATCH', `/api/presupuestos/${id}`, presupuesto);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error al actualizar presupuesto');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error al actualizar presupuesto:', error);
      throw error;
    }
  }

  /**
   * Registra un gasto en un presupuesto
   * @param id ID del presupuesto
   * @param gasto Datos del gasto a registrar
   * @returns Presupuesto actualizado con el gasto incluido
   */
  async registrarGasto(id: number, gasto: RegistrarGastoDTO): Promise<Presupuesto> {
    try {
      const response = await apiRequest('POST', `/api/presupuestos/${id}/gastos`, gasto);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error al registrar gasto');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error al registrar gasto:', error);
      throw error;
    }
  }

  /**
   * Elimina un presupuesto
   * @param id ID del presupuesto a eliminar
   * @returns true si se eliminó correctamente, false si no
   */
  async eliminarPresupuesto(id: number): Promise<boolean> {
    try {
      const response = await apiRequest('DELETE', `/api/presupuestos/${id}`);
      
      if (!response.ok) {
        return false;
      }
      
      return true;
    } catch (error) {
      console.error('Error al eliminar presupuesto:', error);
      return false;
    }
  }
}

// Exportamos una instancia singleton del repositorio
export const presupuestoRepository = new PresupuestoPgRepository();