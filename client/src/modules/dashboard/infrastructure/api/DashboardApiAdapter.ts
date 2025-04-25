import { DashboardRepository } from '../../domain/repositories/DashboardRepository';
import { 
  DashboardLayout, 
  Widget, 
  CreateDashboardLayoutData, 
  UpdateDashboardLayoutData,
  CreateWidgetData,
  UpdateWidgetData
} from '../../domain/entities/Widget';
import * as dashboardApi from './dashboardApi';

/**
 * Implementación del repositorio de Dashboard utilizando la API
 */
export class DashboardApiAdapter implements DashboardRepository {
  
  async getUserLayouts(): Promise<DashboardLayout[]> {
    return dashboardApi.getUserLayouts();
  }
  
  async getLayoutById(layoutId: string): Promise<DashboardLayout> {
    return dashboardApi.getLayoutById(layoutId);
  }
  
  async getDefaultLayout(): Promise<DashboardLayout> {
    return dashboardApi.getDefaultLayout();
  }
  
  async createLayout(data: CreateDashboardLayoutData): Promise<DashboardLayout> {
    return dashboardApi.createLayout(data);
  }
  
  async updateLayout(layoutId: string, data: UpdateDashboardLayoutData): Promise<DashboardLayout> {
    return dashboardApi.updateLayout(layoutId, data);
  }
  
  async deleteLayout(layoutId: string): Promise<void> {
    return dashboardApi.deleteLayout(layoutId);
  }
  
  async setDefaultLayout(layoutId: string): Promise<DashboardLayout> {
    return dashboardApi.setDefaultLayout(layoutId);
  }
  
  async addWidget(layoutId: string, widgetData: CreateWidgetData): Promise<Widget> {
    return dashboardApi.addWidget(layoutId, widgetData);
  }
  
  async updateWidget(layoutId: string, widgetId: string, data: UpdateWidgetData): Promise<Widget> {
    return dashboardApi.updateWidget(layoutId, widgetId, data);
  }
  
  async removeWidget(layoutId: string, widgetId: string): Promise<void> {
    return dashboardApi.removeWidget(layoutId, widgetId);
  }
  
  async updateWidgetsPositions(
    layoutId: string, 
    positions: Array<{ id: string; position: { x: number; y: number } }>
  ): Promise<Widget[]> {
    return dashboardApi.updateWidgetsPositions(layoutId, positions);
  }
}