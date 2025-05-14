import { Router, Request, Response } from 'express';
import { db } from '../db';
import { tasks } from '@shared/schema';
import { eq, and } from 'drizzle-orm';
import { authRequired } from '../middlewares/auth';
import { z } from 'zod';

const tasksRouter = Router();

// Aplicar middleware de autenticación a todas las rutas
tasksRouter.use(authRequired);

// Esquema de validación para crear/actualizar tareas
const taskSchema = z.object({
  title: z.string().min(3, 'El título debe tener al menos 3 caracteres'),
  description: z.string().optional().nullable(),
  status: z.enum(['todo', 'in_progress', 'completed']),
  priority: z.enum(['low', 'medium', 'high']),
  dueDate: z.string().optional().nullable(),
  projectId: z.number(),
  assigneeId: z.number().optional().nullable()
});

// GET - Obtener tareas (con filtro opcional por proyecto)
tasksRouter.get('/', async (req: Request, res: Response) => {
  try {
    let query = db.select().from(tasks);
    
    // Filtrar por proyecto si se proporciona projectId
    if (req.query.projectId) {
      const projectId = Number(req.query.projectId);
      if (!isNaN(projectId)) {
        query = query.where(eq(tasks.projectId, projectId));
      }
    }
    
    const result = await query;
    res.json(result);
  } catch (error: any) {
    console.error('Error al obtener tareas:', error);
    res.status(500).json({ error: error.message });
  }
});

// POST - Crear una nueva tarea
tasksRouter.post('/', async (req: Request, res: Response) => {
  try {
    const validatedData = taskSchema.parse(req.body);
    
    // Asignar usuario actual como creador
    const data = {
      ...validatedData,
      createdAt: new Date()
    };
    
    const [newTask] = await db.insert(tasks).values(data).returning();
    
    res.status(201).json(newTask);
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors });
    }
    console.error('Error al crear tarea:', error);
    res.status(500).json({ error: error.message });
  }
});

// GET - Obtener una tarea específica
tasksRouter.get('/:id', async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ error: 'ID de tarea inválido' });
    }
    
    const [task] = await db.select().from(tasks).where(eq(tasks.id, id));
    
    if (!task) {
      return res.status(404).json({ error: 'Tarea no encontrada' });
    }
    
    res.json(task);
  } catch (error: any) {
    console.error('Error al obtener tarea:', error);
    res.status(500).json({ error: error.message });
  }
});

// PATCH - Actualizar una tarea
tasksRouter.patch('/:id', async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ error: 'ID de tarea inválido' });
    }
    
    // Verificar que la tarea existe
    const [existingTask] = await db.select().from(tasks).where(eq(tasks.id, id));
    
    if (!existingTask) {
      return res.status(404).json({ error: 'Tarea no encontrada' });
    }
    
    // Validar solo los campos proporcionados
    const updateSchema = taskSchema.partial();
    const validatedData = updateSchema.parse(req.body);
    
    // Actualizar la tarea
    const [updatedTask] = await db
      .update(tasks)
      .set(validatedData)
      .where(eq(tasks.id, id))
      .returning();
    
    res.json(updatedTask);
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors });
    }
    console.error('Error al actualizar tarea:', error);
    res.status(500).json({ error: error.message });
  }
});

// DELETE - Eliminar una tarea
tasksRouter.delete('/:id', async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ error: 'ID de tarea inválido' });
    }
    
    // Verificar que la tarea existe
    const [existingTask] = await db.select().from(tasks).where(eq(tasks.id, id));
    
    if (!existingTask) {
      return res.status(404).json({ error: 'Tarea no encontrada' });
    }
    
    // Eliminar la tarea
    await db.delete(tasks).where(eq(tasks.id, id));
    
    res.status(200).json({ message: 'Tarea eliminada correctamente' });
  } catch (error: any) {
    console.error('Error al eliminar tarea:', error);
    res.status(500).json({ error: error.message });
  }
});

export default tasksRouter;