import { Router, Request, Response } from 'express';
import { storage } from '../storage';

const router = Router();

/**
 * GET /api/projects
 * Obtener todos los proyectos
 */
router.get('/', async (req: Request, res: Response) => {
  try {
    const projects = await storage.getProjects();
    res.json(projects);
  } catch (error: any) {
    console.error('Error al obtener proyectos:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/projects/:id
 * Obtener un proyecto por ID
 */
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    const project = await storage.getProject(id);
    
    if (!project) {
      return res.status(404).json({ error: 'Proyecto no encontrado' });
    }
    
    res.json(project);
  } catch (error: any) {
    console.error('Error al obtener proyecto:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/projects
 * Crear un nuevo proyecto
 */
router.post('/', async (req: Request, res: Response) => {
  try {
    const projectData = {
      name: req.body.name,
      description: req.body.description,
      startDate: req.body.startDate,
      endDate: req.body.endDate,
      budget: req.body.budget,
      managerId: req.body.managerId,
      status: req.body.status || 'active',
      category: req.body.category
    };
    
    const newProject = await storage.createProject(projectData);
    res.status(201).json(newProject);
  } catch (error: any) {
    console.error('Error al crear proyecto:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * PUT /api/projects/:id
 * Actualizar un proyecto
 */
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    const updates = {
      name: req.body.name,
      description: req.body.description,
      startDate: req.body.startDate,
      endDate: req.body.endDate,
      budget: req.body.budget,
      managerId: req.body.managerId,
      status: req.body.status,
      category: req.body.category
    };
    
    const updatedProject = await storage.updateProject(id, updates);
    
    if (!updatedProject) {
      return res.status(404).json({ error: 'Proyecto no encontrado' });
    }
    
    res.json(updatedProject);
  } catch (error: any) {
    console.error('Error al actualizar proyecto:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * DELETE /api/projects/:id
 * Eliminar un proyecto
 */
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    const deleted = await storage.deleteProject(id);
    
    if (!deleted) {
      return res.status(404).json({ error: 'Proyecto no encontrado' });
    }
    
    res.status(200).json({ message: 'Proyecto eliminado exitosamente' });
  } catch (error: any) {
    console.error('Error al eliminar proyecto:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
