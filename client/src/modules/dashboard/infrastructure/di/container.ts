import { DashboardRepository } from '../../domain/repositories/DashboardRepository';
import { DashboardApiAdapter } from '../api/DashboardApiAdapter';

// Crear una instancia del repositorio utilizando el adaptador de API
export const dashboardRepository: DashboardRepository = new DashboardApiAdapter();