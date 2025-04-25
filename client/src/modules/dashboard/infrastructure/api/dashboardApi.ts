import { apiRequest } from '@/lib/queryClient';
import { 
  DashboardLayout, 
  Widget, 
  CreateDashboardLayoutData, 
  UpdateDashboardLayoutData,
  CreateWidgetData,
  UpdateWidgetData
} from '../../domain/entities/Widget';

const API_URL = '/api/dashboard';

/**
 * API client para operaciones relacionadas con el dashboard
 */

// Obtener todos los layouts del usuario
export async function getUserLayouts(): Promise<DashboardLayout[]> {
  const response = await apiRequest('GET', `${API_URL}/layouts`);
  return response.json();
}

// Obtener un layout específico por ID
export async function getLayoutById(layoutId: string): Promise<DashboardLayout> {
  const response = await apiRequest('GET', `${API_URL}/layouts/${layoutId}`);
  return response.json();
}

// Obtener el layout por defecto del usuario
export async function getDefaultLayout(): Promise<DashboardLayout> {
  const response = await apiRequest('GET', `${API_URL}/layouts/default`);
  return response.json();
}

// Crear un nuevo layout de dashboard
export async function createLayout(data: CreateDashboardLayoutData): Promise<DashboardLayout> {
  const response = await apiRequest('POST', `${API_URL}/layouts`, data);
  return response.json();
}

// Actualizar un layout existente
export async function updateLayout(layoutId: string, data: UpdateDashboardLayoutData): Promise<DashboardLayout> {
  const response = await apiRequest('PATCH', `${API_URL}/layouts/${layoutId}`, data);
  return response.json();
}

// Eliminar un layout
export async function deleteLayout(layoutId: string): Promise<void> {
  await apiRequest('DELETE', `${API_URL}/layouts/${layoutId}`);
}

// Establecer un layout como predeterminado
export async function setDefaultLayout(layoutId: string): Promise<DashboardLayout> {
  const response = await apiRequest('POST', `${API_URL}/layouts/${layoutId}/default`);
  return response.json();
}

// Añadir un widget a un layout
export async function addWidget(layoutId: string, widgetData: CreateWidgetData): Promise<Widget> {
  const response = await apiRequest('POST', `${API_URL}/layouts/${layoutId}/widgets`, widgetData);
  return response.json();
}

// Actualizar un widget existente
export async function updateWidget(layoutId: string, widgetId: string, data: UpdateWidgetData): Promise<Widget> {
  const response = await apiRequest('PATCH', `${API_URL}/layouts/${layoutId}/widgets/${widgetId}`, data);
  return response.json();
}

// Eliminar un widget de un layout
export async function removeWidget(layoutId: string, widgetId: string): Promise<void> {
  await apiRequest('DELETE', `${API_URL}/layouts/${layoutId}/widgets/${widgetId}`);
}

// Actualizar la posición de múltiples widgets en un solo paso
export async function updateWidgetsPositions(
  layoutId: string, 
  positions: Array<{ id: string; position: { x: number; y: number } }>
): Promise<Widget[]> {
  const response = await apiRequest('PATCH', `${API_URL}/layouts/${layoutId}/positions`, { positions });
  return response.json();
}