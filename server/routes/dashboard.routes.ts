import express, { Request, Response } from 'express';
import { storage } from '../storage';
import { v4 as uuidv4 } from 'uuid';

const dashboardRouter = express.Router();

// Datos iniciales para un layout por defecto
const DEFAULT_LAYOUT = {
  id: 'default',
  name: 'Default',
  isDefault: true,
  widgets: [
    {
      id: 'widget-1',
      type: 'PROJECTS_OVERVIEW',
      title: 'Proyectos en curso',
      size: 'LARGE',
      position: { x: 0, y: 0 },
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: 'widget-2',
      type: 'BUDGET_SUMMARY',
      title: 'Resumen de presupuestos',
      size: 'MEDIUM',
      position: { x: 2, y: 0 },
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: 'widget-3',
      type: 'TASKS_OVERVIEW',
      title: 'Tareas pendientes',
      size: 'MEDIUM',
      position: { x: 3, y: 0 },
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: 'widget-4',
      type: 'RECENT_ACTIVITY',
      title: 'Actividad reciente',
      size: 'LARGE',
      position: { x: 0, y: 2 },
      createdAt: new Date(),
      updatedAt: new Date()
    }
  ],
  createdAt: new Date(),
  updatedAt: new Date()
};

// Objeto para almacenar los layouts (en memoria)
const dashboardLayouts = new Map();
// Inicializar con un layout por defecto
dashboardLayouts.set('default', DEFAULT_LAYOUT);

// GET /api/dashboard/layouts - Obtener todos los layouts
dashboardRouter.get('/layouts', (req: Request, res: Response) => {
  try {
    // En producción, filtrar por el usuario autenticado (req.user.id)
    const userLayouts = Array.from(dashboardLayouts.values());
    res.json(userLayouts);
  } catch (error: any) {
    console.error('Error al obtener layouts de dashboard:', error);
    res.status(500).json({ error: error.message });
  }
});

// GET /api/dashboard/layouts/default - Obtener el layout por defecto
dashboardRouter.get('/layouts/default', (req: Request, res: Response) => {
  try {
    // Buscar el layout marcado como default
    const defaultLayout = Array.from(dashboardLayouts.values()).find(
      (layout: any) => layout.isDefault
    );
    
    if (!defaultLayout) {
      return res.status(404).json({ error: 'No se encontró un layout por defecto' });
    }
    
    res.json(defaultLayout);
  } catch (error: any) {
    console.error('Error al obtener layout por defecto:', error);
    res.status(500).json({ error: error.message });
  }
});

// GET /api/dashboard/layouts/:id - Obtener un layout específico
dashboardRouter.get('/layouts/:id', (req: Request, res: Response) => {
  try {
    const layoutId = req.params.id;
    const layout = dashboardLayouts.get(layoutId);
    
    if (!layout) {
      return res.status(404).json({ error: 'Layout no encontrado' });
    }
    
    res.json(layout);
  } catch (error: any) {
    console.error('Error al obtener layout:', error);
    res.status(500).json({ error: error.message });
  }
});

// POST /api/dashboard/layouts - Crear un nuevo layout
dashboardRouter.post('/layouts', (req: Request, res: Response) => {
  try {
    const { name, isDefault = false, widgets = [] } = req.body;
    
    // Validar datos mínimos
    if (!name) {
      return res.status(400).json({ error: 'El nombre es obligatorio' });
    }
    
    // Generar ID único
    const id = uuidv4();
    
    // Si se marca como default, desmarcar los otros
    if (isDefault) {
      for (const [layoutId, layout] of dashboardLayouts.entries()) {
        if (layout.isDefault) {
          dashboardLayouts.set(layoutId, { ...layout, isDefault: false, updatedAt: new Date() });
        }
      }
    }
    
    // Procesar los widgets asignando IDs y timestamps
    const processedWidgets = widgets.map((widget: any) => ({
      ...widget,
      id: uuidv4(),
      createdAt: new Date(),
      updatedAt: new Date()
    }));
    
    // Crear el nuevo layout
    const newLayout = {
      id,
      name,
      isDefault,
      widgets: processedWidgets,
      createdAt: new Date(),
      updatedAt: new Date(),
      // En producción, guardar el ID del usuario
      // userId: req.user.id
    };
    
    // Guardar en memoria
    dashboardLayouts.set(id, newLayout);
    
    res.status(201).json(newLayout);
  } catch (error: any) {
    console.error('Error al crear layout:', error);
    res.status(500).json({ error: error.message });
  }
});

// PATCH /api/dashboard/layouts/:id - Actualizar un layout
dashboardRouter.patch('/layouts/:id', (req: Request, res: Response) => {
  try {
    const layoutId = req.params.id;
    const { name, isDefault, widgets } = req.body;
    
    // Verificar que existe el layout
    const existingLayout = dashboardLayouts.get(layoutId);
    if (!existingLayout) {
      return res.status(404).json({ error: 'Layout no encontrado' });
    }
    
    // Si se marca como default, desmarcar los otros
    if (isDefault) {
      for (const [id, layout] of dashboardLayouts.entries()) {
        if (id !== layoutId && layout.isDefault) {
          dashboardLayouts.set(id, { ...layout, isDefault: false, updatedAt: new Date() });
        }
      }
    }
    
    // Actualizar el layout
    const updatedLayout = {
      ...existingLayout,
      name: name !== undefined ? name : existingLayout.name,
      isDefault: isDefault !== undefined ? isDefault : existingLayout.isDefault,
      widgets: widgets !== undefined ? widgets : existingLayout.widgets,
      updatedAt: new Date()
    };
    
    // Guardar en memoria
    dashboardLayouts.set(layoutId, updatedLayout);
    
    res.json(updatedLayout);
  } catch (error: any) {
    console.error('Error al actualizar layout:', error);
    res.status(500).json({ error: error.message });
  }
});

// DELETE /api/dashboard/layouts/:id - Eliminar un layout
dashboardRouter.delete('/layouts/:id', (req: Request, res: Response) => {
  try {
    const layoutId = req.params.id;
    
    // Verificar que existe el layout
    if (!dashboardLayouts.has(layoutId)) {
      return res.status(404).json({ error: 'Layout no encontrado' });
    }
    
    // No permitir eliminar el layout por defecto
    const layout = dashboardLayouts.get(layoutId);
    if (layout.isDefault) {
      return res.status(400).json({ error: 'No se puede eliminar el layout por defecto' });
    }
    
    // Eliminar de memoria
    dashboardLayouts.delete(layoutId);
    
    res.status(204).send();
  } catch (error: any) {
    console.error('Error al eliminar layout:', error);
    res.status(500).json({ error: error.message });
  }
});

// POST /api/dashboard/layouts/:id/default - Establecer un layout como predeterminado
dashboardRouter.post('/layouts/:id/default', (req: Request, res: Response) => {
  try {
    const layoutId = req.params.id;
    
    // Verificar que existe el layout
    if (!dashboardLayouts.has(layoutId)) {
      return res.status(404).json({ error: 'Layout no encontrado' });
    }
    
    // Desmarcar los otros layouts como default
    for (const [id, layout] of dashboardLayouts.entries()) {
      if (id !== layoutId && layout.isDefault) {
        dashboardLayouts.set(id, { ...layout, isDefault: false, updatedAt: new Date() });
      }
    }
    
    // Marcar este layout como default
    const layout = dashboardLayouts.get(layoutId);
    const updatedLayout = {
      ...layout,
      isDefault: true,
      updatedAt: new Date()
    };
    
    // Guardar en memoria
    dashboardLayouts.set(layoutId, updatedLayout);
    
    res.json(updatedLayout);
  } catch (error: any) {
    console.error('Error al establecer layout por defecto:', error);
    res.status(500).json({ error: error.message });
  }
});

// POST /api/dashboard/layouts/:id/widgets - Añadir un widget a un layout
dashboardRouter.post('/layouts/:id/widgets', (req: Request, res: Response) => {
  try {
    const layoutId = req.params.id;
    const widgetData = req.body;
    
    // Verificar que existe el layout
    if (!dashboardLayouts.has(layoutId)) {
      return res.status(404).json({ error: 'Layout no encontrado' });
    }
    
    // Validar datos mínimos
    if (!widgetData.type || !widgetData.title || !widgetData.size || !widgetData.position) {
      return res.status(400).json({ error: 'Faltan datos obligatorios del widget' });
    }
    
    // Crear widget con ID y timestamps
    const newWidget = {
      ...widgetData,
      id: uuidv4(),
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    // Añadir al layout
    const layout = dashboardLayouts.get(layoutId);
    const updatedLayout = {
      ...layout,
      widgets: [...layout.widgets, newWidget],
      updatedAt: new Date()
    };
    
    // Guardar en memoria
    dashboardLayouts.set(layoutId, updatedLayout);
    
    res.status(201).json(newWidget);
  } catch (error: any) {
    console.error('Error al añadir widget:', error);
    res.status(500).json({ error: error.message });
  }
});

// PATCH /api/dashboard/layouts/:id/widgets/:widgetId - Actualizar un widget
dashboardRouter.patch('/layouts/:id/widgets/:widgetId', (req: Request, res: Response) => {
  try {
    const layoutId = req.params.id;
    const widgetId = req.params.widgetId;
    const updates = req.body;
    
    // Verificar que existe el layout
    if (!dashboardLayouts.has(layoutId)) {
      return res.status(404).json({ error: 'Layout no encontrado' });
    }
    
    // Obtener el layout y encontrar el widget
    const layout = dashboardLayouts.get(layoutId);
    const widgetIndex = layout.widgets.findIndex((w: any) => w.id === widgetId);
    
    if (widgetIndex === -1) {
      return res.status(404).json({ error: 'Widget no encontrado' });
    }
    
    // Actualizar el widget
    const widget = layout.widgets[widgetIndex];
    const updatedWidget = {
      ...widget,
      ...updates,
      id: widget.id, // Asegurar que no cambia el ID
      updatedAt: new Date()
    };
    
    // Actualizar el array de widgets
    const updatedWidgets = [...layout.widgets];
    updatedWidgets[widgetIndex] = updatedWidget;
    
    // Actualizar el layout
    const updatedLayout = {
      ...layout,
      widgets: updatedWidgets,
      updatedAt: new Date()
    };
    
    // Guardar en memoria
    dashboardLayouts.set(layoutId, updatedLayout);
    
    res.json(updatedWidget);
  } catch (error: any) {
    console.error('Error al actualizar widget:', error);
    res.status(500).json({ error: error.message });
  }
});

// DELETE /api/dashboard/layouts/:id/widgets/:widgetId - Eliminar un widget
dashboardRouter.delete('/layouts/:id/widgets/:widgetId', (req: Request, res: Response) => {
  try {
    const layoutId = req.params.id;
    const widgetId = req.params.widgetId;
    
    // Verificar que existe el layout
    if (!dashboardLayouts.has(layoutId)) {
      return res.status(404).json({ error: 'Layout no encontrado' });
    }
    
    // Obtener el layout y filtrar el widget
    const layout = dashboardLayouts.get(layoutId);
    const updatedWidgets = layout.widgets.filter((w: any) => w.id !== widgetId);
    
    // Comprobar si se encontró el widget
    if (updatedWidgets.length === layout.widgets.length) {
      return res.status(404).json({ error: 'Widget no encontrado' });
    }
    
    // Actualizar el layout
    const updatedLayout = {
      ...layout,
      widgets: updatedWidgets,
      updatedAt: new Date()
    };
    
    // Guardar en memoria
    dashboardLayouts.set(layoutId, updatedLayout);
    
    res.status(204).send();
  } catch (error: any) {
    console.error('Error al eliminar widget:', error);
    res.status(500).json({ error: error.message });
  }
});

// PATCH /api/dashboard/layouts/:id/positions - Actualizar posiciones de widgets
dashboardRouter.patch('/layouts/:id/positions', (req: Request, res: Response) => {
  try {
    const layoutId = req.params.id;
    const { positions } = req.body;
    
    // Verificar datos mínimos
    if (!positions || !Array.isArray(positions)) {
      return res.status(400).json({ error: 'Se requiere un array de posiciones' });
    }
    
    // Verificar que existe el layout
    if (!dashboardLayouts.has(layoutId)) {
      return res.status(404).json({ error: 'Layout no encontrado' });
    }
    
    // Obtener el layout
    const layout = dashboardLayouts.get(layoutId);
    
    // Crear un mapa para actualizar eficientemente
    const positionsMap = new Map();
    positions.forEach((p: any) => {
      positionsMap.set(p.id, p.position);
    });
    
    // Actualizar las posiciones de los widgets
    const updatedWidgets = layout.widgets.map((widget: any) => {
      const newPosition = positionsMap.get(widget.id);
      if (newPosition) {
        return {
          ...widget,
          position: newPosition,
          updatedAt: new Date()
        };
      }
      return widget;
    });
    
    // Actualizar el layout
    const updatedLayout = {
      ...layout,
      widgets: updatedWidgets,
      updatedAt: new Date()
    };
    
    // Guardar en memoria
    dashboardLayouts.set(layoutId, updatedLayout);
    
    res.json(updatedWidgets);
  } catch (error: any) {
    console.error('Error al actualizar posiciones:', error);
    res.status(500).json({ error: error.message });
  }
});

export default dashboardRouter;