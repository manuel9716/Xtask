import React, { useState, useCallback } from 'react';
import { DashboardLayout, Widget as WidgetModel, WidgetType, WidgetSize } from '../../domain/entities/Widget';
import { Responsive, WidthProvider } from 'react-grid-layout';
import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';
import { Button } from '@/components/ui/button';
import { Plus, Save, LayoutDashboard } from 'lucide-react';
import { Widget } from './Widget';
import { WidgetContent } from './widget-content';
import { AddWidgetDialog } from './AddWidgetDialog';
import { LayoutsSelector } from './LayoutsSelector';
import { useDashboard } from '../../application/useCases/useDashboard';

const ResponsiveGridLayout = WidthProvider(Responsive);

interface DashboardGridProps {
  className?: string;
}

/**
 * Componente principal del dashboard con grid de widgets responsive
 */
export function DashboardGrid({ className = '' }: DashboardGridProps) {
  const {
    layouts,
    currentLayout,
    isLoadingLayouts,
    isLoadingCurrentLayout,
    setCurrentLayout,
    createLayout,
    updateLayout,
    deleteLayout,
    setDefaultLayout,
    addWidget,
    updateWidget,
    removeWidget,
    updatePositions,
    isUpdatingPositions,
  } = useDashboard();

  // Estado para modo de edición
  const [isEditing, setIsEditing] = useState(false);
  
  // Estado para diálogo de añadir widget
  const [isAddWidgetOpen, setIsAddWidgetOpen] = useState(false);
  
  // Convertir widgets a formato para react-grid-layout
  const getLayoutItems = useCallback(() => {
    if (!currentLayout?.widgets?.length) return [];
    
    return currentLayout.widgets.map(widget => ({
      i: widget.id,
      x: widget.position.x,
      y: widget.position.y,
      w: getWidgetWidth(widget.size),
      h: getWidgetHeight(widget.size),
      widget
    }));
  }, [currentLayout]);
  
  // Obtener ancho basado en WidgetSize
  const getWidgetWidth = (size: WidgetSize) => {
    switch (size) {
      case WidgetSize.SMALL:
        return 1;
      case WidgetSize.MEDIUM:
      case WidgetSize.LARGE:
        return 2;
      case WidgetSize.EXTRA_LARGE:
        return 4;
      default:
        return 1;
    }
  };
  
  // Obtener alto basado en WidgetSize
  const getWidgetHeight = (size: WidgetSize) => {
    switch (size) {
      case WidgetSize.SMALL:
      case WidgetSize.MEDIUM:
        return 1;
      case WidgetSize.LARGE:
      case WidgetSize.EXTRA_LARGE:
        return 2;
      default:
        return 1;
    }
  };
  
  // Manejar cambios en el layout (drag & drop)
  const handleLayoutChange = (layout: any[]) => {
    if (!isEditing || !currentLayout || isUpdatingPositions) return;
    
    // Convertir a formato de posiciones para API
    const positions = layout.map(item => ({
      id: item.i,
      position: { x: item.x, y: item.y }
    }));
    
    // Actualizar posiciones en el servidor
    updatePositions({
      layoutId: currentLayout.id,
      positions
    });
  };
  
  // Manejar cambio de tamaño de un widget
  const handleWidgetResize = (widgetId: string, newSize: WidgetSize) => {
    if (!currentLayout) return;
    
    const widget = currentLayout.widgets.find(w => w.id === widgetId);
    if (!widget) return;
    
    updateWidget({
      layoutId: currentLayout.id,
      widgetId,
      data: { size: newSize }
    });
  };
  
  // Manejar eliminación de un widget
  const handleWidgetRemove = (widgetId: string) => {
    if (!currentLayout) return;
    
    removeWidget({
      layoutId: currentLayout.id,
      widgetId
    });
  };
  
  // Manejar añadir nuevo widget
  const handleAddWidget = (type: WidgetType, title: string, size: WidgetSize) => {
    if (!currentLayout) return;
    
    // Encontrar una posición disponible
    const position = findAvailablePosition();
    
    addWidget({
      layoutId: currentLayout.id,
      widgetData: {
        type,
        title,
        size,
        position,
        config: {} // Config por defecto
      }
    });
    
    setIsAddWidgetOpen(false);
  };
  
  // Encontrar una posición disponible en el grid
  const findAvailablePosition = () => {
    // Lógica simple: colocar en siguiente posición Y disponible
    const maxY = currentLayout?.widgets.reduce((max, widget) => 
      Math.max(max, widget.position.y), 0) || 0;
    
    return { x: 0, y: maxY + 2 };
  };
  
  // Si está cargando, mostrar indicador
  if (isLoadingLayouts || isLoadingCurrentLayout) {
    return (
      <div className="flex justify-center items-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }
  
  // Si no hay layout, mostrar mensaje
  if (!currentLayout) {
    return (
      <div className="flex flex-col items-center justify-center h-96 space-y-4">
        <h2 className="text-2xl font-semibold text-gray-700">
          No hay dashboard configurado
        </h2>
        <Button 
          onClick={() => createLayout({ 
            name: 'Mi Dashboard', 
            isDefault: true,
            widgets: [] 
          })}
        >
          <LayoutDashboard className="mr-2 h-4 w-4" />
          Crear Dashboard
        </Button>
      </div>
    );
  }
  
  return (
    <div className={`dashboard-container ${className}`}>
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-4">
          <h2 className="text-2xl font-bold">Dashboard</h2>
          
          {layouts.length > 0 && (
            <LayoutsSelector 
              layouts={layouts}
              currentLayoutId={currentLayout.id}
              onSelectLayout={setCurrentLayout}
              onSetDefault={setDefaultLayout}
              onDelete={deleteLayout}
            />
          )}
        </div>
        
        <div className="flex gap-2">
          <Button 
            variant={isEditing ? "default" : "outline"} 
            onClick={() => setIsEditing(!isEditing)}
          >
            {isEditing ? "Guardar cambios" : "Personalizar"}
          </Button>
          
          {isEditing && (
            <Button onClick={() => setIsAddWidgetOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Añadir Widget
            </Button>
          )}
        </div>
      </div>
      
      <ResponsiveGridLayout
        className="layout"
        layouts={{ lg: getLayoutItems() }}
        breakpoints={{ lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 }}
        cols={{ lg: 4, md: 4, sm: 2, xs: 1, xxs: 1 }}
        rowHeight={200}
        isDraggable={isEditing}
        isResizable={false}
        onLayoutChange={handleLayoutChange}
        containerPadding={[16, 16]}
        margin={[16, 16]}
      >
        {getLayoutItems().map(item => (
          <div key={item.i}>
            <Widget
              widget={item.widget}
              isEditing={isEditing}
              onRemove={() => handleWidgetRemove(item.widget.id)}
              onResize={(newSize) => handleWidgetResize(item.widget.id, newSize)}
            >
              <WidgetContent widget={item.widget} />
            </Widget>
          </div>
        ))}
      </ResponsiveGridLayout>
      
      <AddWidgetDialog 
        isOpen={isAddWidgetOpen}
        onClose={() => setIsAddWidgetOpen(false)}
        onAddWidget={handleAddWidget}
      />
    </div>
  );
}