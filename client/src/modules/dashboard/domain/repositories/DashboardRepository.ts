import { 
  DashboardLayout, 
  Widget, 
  CreateDashboardLayoutData, 
  UpdateDashboardLayoutData,
  CreateWidgetData,
  UpdateWidgetData
} from '../entities/Widget';

/**
 * Interfaz del repositorio para operaciones relacionadas con el dashboard
 */
export interface DashboardRepository {
  /**
   * Obtiene todos los layouts de dashboard del usuario
   */
  getUserLayouts(): Promise<DashboardLayout[]>;
  
  /**
   * Obtiene un layout específico por ID
   */
  getLayoutById(layoutId: string): Promise<DashboardLayout>;
  
  /**
   * Obtiene el layout por defecto del usuario
   */
  getDefaultLayout(): Promise<DashboardLayout>;
  
  /**
   * Crea un nuevo layout de dashboard
   */
  createLayout(data: CreateDashboardLayoutData): Promise<DashboardLayout>;
  
  /**
   * Actualiza un layout existente
   */
  updateLayout(layoutId: string, data: UpdateDashboardLayoutData): Promise<DashboardLayout>;
  
  /**
   * Elimina un layout
   */
  deleteLayout(layoutId: string): Promise<void>;
  
  /**
   * Establece un layout como predeterminado
   */
  setDefaultLayout(layoutId: string): Promise<DashboardLayout>;
  
  /**
   * Añade un widget a un layout
   */
  addWidget(layoutId: string, widgetData: CreateWidgetData): Promise<Widget>;
  
  /**
   * Actualiza un widget existente
   */
  updateWidget(layoutId: string, widgetId: string, data: UpdateWidgetData): Promise<Widget>;
  
  /**
   * Elimina un widget de un layout
   */
  removeWidget(layoutId: string, widgetId: string): Promise<void>;
  
  /**
   * Actualiza la posición de múltiples widgets en un solo paso
   */
  updateWidgetsPositions(
    layoutId: string, 
    positions: Array<{ id: string; position: { x: number; y: number } }>
  ): Promise<Widget[]>;
}