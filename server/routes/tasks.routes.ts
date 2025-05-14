import express, { Request, Response } from 'express';
import { storage } from '../storage';
import { eq, and } from 'drizzle-orm';
import { tasks } from '@shared/schema';
import { verifyToken } from '../middlewares/auth';

const router = express.Router();

// Aplicar middleware de autenticación
router.use(verifyToken);

// Obtener todas las tareas o filtrar por proyecto
router.get('/', async (req: Request, res: Response) => {
  try {
    const projectId = req.query.projectId ? parseInt(req.query.projectId as string) : undefined;
    
    const tareas = await storage.getAllTasks(projectId);
    
    res.json(tareas);
  } catch (error: any) {
    console.error('Error al obtener tareas:', error);
    res.status(500).json({ 
      error: 'Error al obtener las tareas',
      details: error.message 
    });
  }
});

// Obtener una tarea específica por ID
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    const tarea = await storage.getTask(id);
    
    if (!tarea) {
      return res.status(404).json({ error: 'Tarea no encontrada' });
    }
    
    res.json(tarea);
  } catch (error: any) {
    console.error(`Error al obtener tarea ${req.params.id}:`, error);
    res.status(500).json({ 
      error: 'Error al obtener la tarea',
      details: error.message 
    });
  }
});

// Crear una nueva tarea
router.post('/', async (req: Request, res: Response) => {
  try {
    const { title, description, status, priority, projectId, assignedTo } = req.body;
    
    if (!title || !projectId) {
      return res.status(400).json({ error: 'Título y projectId son requeridos' });
    }
    
    const task = await storage.createTask({
      title,
      description,
      status: status || 'pending',
      priority: priority || 'medium',
      projectId,
      assignedTo,
      createdBy: req.user?.userId
    });
    
    res.status(201).json(task);
  } catch (error: any) {
    console.error('Error al crear tarea:', error);
    res.status(500).json({ 
      error: 'Error al crear la tarea',
      details: error.message 
    });
  }
});

// Actualizar una tarea existente
router.patch('/:id', async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    const { title, description, status, priority, assignedTo } = req.body;
    
    // Verificar si la tarea existe
    const existingTask = await storage.getTask(id);
    if (!existingTask) {
      return res.status(404).json({ error: 'Tarea no encontrada' });
    }
    
    // Actualizar la tarea
    const updatedTask = await storage.updateTask(id, {
      title,
      description,
      status,
      priority,
      assignedTo,
      updatedBy: req.user?.userId
    });
    
    res.json(updatedTask);
  } catch (error: any) {
    console.error(`Error al actualizar tarea ${req.params.id}:`, error);
    res.status(500).json({ 
      error: 'Error al actualizar la tarea',
      details: error.message 
    });
  }
});

// Eliminar una tarea
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    
    // Verificar si la tarea existe
    const existingTask = await storage.getTask(id);
    if (!existingTask) {
      return res.status(404).json({ error: 'Tarea no encontrada' });
    }
    
    // Eliminar la tarea
    await storage.deleteTask(id);
    
    res.status(204).send();
  } catch (error: any) {
    console.error(`Error al eliminar tarea ${req.params.id}:`, error);
    res.status(500).json({ 
      error: 'Error al eliminar la tarea',
      details: error.message 
    });
  }
});

export default router;