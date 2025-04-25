/**
 * Tipos de widgets disponibles en el dashboard
 */
export enum WidgetType {
  PROJECTS_OVERVIEW = 'PROJECTS_OVERVIEW',
  PROJECTS_STATUS = 'PROJECTS_STATUS',
  TASKS_OVERVIEW = 'TASKS_OVERVIEW',
  RECENT_ACTIVITY = 'RECENT_ACTIVITY',
  BUDGET_SUMMARY = 'BUDGET_SUMMARY',
  TEAM_PERFORMANCE = 'TEAM_PERFORMANCE',
  CALENDAR = 'CALENDAR',
  NOTIFICATIONS = 'NOTIFICATIONS',
  CUSTOM_CHART = 'CUSTOM_CHART',
}

/**
 * Tamaños disponibles para los widgets
 */
export enum WidgetSize {
  SMALL = 'SMALL',   // 1x1
  MEDIUM = 'MEDIUM', // 2x1
  LARGE = 'LARGE',   // 2x2
  EXTRA_LARGE = 'EXTRA_LARGE', // 4x2
}

/**
 * Modelo Widget que representa un componente visual en el dashboard
 */
export interface Widget {
  id: string;
  type: WidgetType;
  title: string;
  size: WidgetSize;
  position: {
    x: number;
    y: number;
  };
  config?: Record<string, any>; // Configuración específica del widget
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Modelo para representar un layout personalizado del dashboard
 */
export interface DashboardLayout {
  id: string;
  userId: number;
  name: string;
  isDefault: boolean;
  widgets: Widget[];
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Datos para crear un nuevo widget
 */
export interface CreateWidgetData {
  type: WidgetType;
  title: string;
  size: WidgetSize;
  position: {
    x: number;
    y: number;
  };
  config?: Record<string, any>;
}

/**
 * Datos para actualizar un widget existente
 */
export interface UpdateWidgetData {
  title?: string;
  size?: WidgetSize;
  position?: {
    x: number;
    y: number;
  };
  config?: Record<string, any>;
}

/**
 * Datos para crear un nuevo layout de dashboard
 */
export interface CreateDashboardLayoutData {
  name: string;
  isDefault?: boolean;
  widgets: CreateWidgetData[];
}

/**
 * Datos para actualizar un layout de dashboard existente
 */
export interface UpdateDashboardLayoutData {
  name?: string;
  isDefault?: boolean;
  widgets?: (CreateWidgetData | Widget)[];
}