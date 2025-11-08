import { empleadosEndpoints } from '@/infrastructure/http/endpoints/empleados.endpoints';
import { Empleados } from '@/domain/models/empleados.model';
import { CreateEmpleadosData, UpdateEmpleadosData } from '@/domain/types/empleados.types';

/**
 * Servicio de aplicación para empleados
 */
export class EmpleadosService {
  async getEmpleadoss(): Promise<Empleados[]> {
    const response = await empleadosEndpoints.getAll();
    return response.data;
  }

  async getEmpleadosById(id: number): Promise<Empleados> {
    const response = await empleadosEndpoints.getById(id);
    return response.data;
  }

  async createEmpleados(data: CreateEmpleadosData): Promise<Empleados> {
    const response = await empleadosEndpoints.create(data);
    return response.data;
  }

  async updateEmpleados(id: number, data: UpdateEmpleadosData): Promise<Empleados> {
    const response = await empleadosEndpoints.update(id, data);
    return response.data;
  }

  async deleteEmpleados(id: number): Promise<void> {
    await empleadosEndpoints.delete(id);
  }
}

export const empleadosService = new EmpleadosService();
