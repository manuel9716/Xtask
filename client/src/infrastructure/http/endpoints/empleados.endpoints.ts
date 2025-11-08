import { apiClient } from '../api-client';
import { Empleados } from '@/domain/models/empleados.model';
import { CreateEmpleadosData, UpdateEmpleadosData } from '@/domain/types/empleados.types';

/**
 * Endpoints para empleados
 */
export const empleadosEndpoints = {
  getAll: () => apiClient.get<Empleados[]>('/api/empleados'),
  getById: (id: number) => apiClient.get<Empleados>(`/api/empleados/${id}`),
  create: (data: CreateEmpleadosData) => 
    apiClient.post<Empleados>('/api/empleados', data),
  update: (id: number, data: UpdateEmpleadosData) => 
    apiClient.put<Empleados>(`/api/empleados/${id}`, data),
  delete: (id: number) => apiClient.delete(`/api/empleados/${id}`),
};
