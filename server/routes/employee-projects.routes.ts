import express, { Request, Response } from 'express';
import { storage } from '../storage';
import { verifyToken } from '../middlewares/auth';

const router = express.Router();

// Aplicar middleware de autenticación
router.use(verifyToken);

// Obtener asignaciones de empleados a un proyecto
router.get('/', async (req: Request, res: Response) => {
  try {
    const projectId = req.query.projectId ? parseInt(req.query.projectId as string) : undefined;
    const employeeId = req.query.employeeId ? parseInt(req.query.employeeId as string) : undefined;
    
    if (!projectId && !employeeId) {
      return res.status(400).json({ error: 'Se requiere projectId o employeeId para filtrar' });
    }
    
    const employeeProjects = await storage.getEmployeeProjects(projectId, employeeId);
    
    res.json(employeeProjects);
  } catch (error: any) {
    console.error('Error al obtener asignaciones:', error);
    res.status(500).json({ 
      error: 'Error al obtener las asignaciones de empleados a proyectos',
      details: error.message 
    });
  }
});

// Obtener una asignación específica
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    const employeeProject = await storage.getEmployeeProject(id);
    
    if (!employeeProject) {
      return res.status(404).json({ error: 'Asignación no encontrada' });
    }
    
    res.json(employeeProject);
  } catch (error: any) {
    console.error(`Error al obtener asignación ${req.params.id}:`, error);
    res.status(500).json({ 
      error: 'Error al obtener la asignación',
      details: error.message 
    });
  }
});

// Crear una nueva asignación
router.post('/', async (req: Request, res: Response) => {
  try {
    const { projectId, employeeId } = req.body;
    
    if (!projectId || !employeeId) {
      return res.status(400).json({ error: 'projectId y employeeId son requeridos' });
    }
    
    // Verificar si la asignación ya existe
    const existingAssignment = await storage.checkEmployeeProjectExists(projectId, employeeId);
    if (existingAssignment) {
      return res.status(409).json({ error: 'El empleado ya está asignado a este proyecto' });
    }
    
    const employeeProject = await storage.createEmployeeProject({
      projectId,
      employeeId,
      isPrimary: false, // Por defecto no es el responsable principal
      assignedBy: req.user?.id, // Usar id en lugar de userId
    });
    
    res.status(201).json(employeeProject);
  } catch (error: any) {
    console.error('Error al crear asignación:', error);
    res.status(500).json({ 
      error: 'Error al crear la asignación',
      details: error.message 
    });
  }
});

// Establecer un empleado como responsable principal
router.patch('/:id/set-primary', async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    
    // Verificar si la asignación existe
    const assignment = await storage.getEmployeeProject(id);
    if (!assignment) {
      return res.status(404).json({ error: 'Asignación no encontrada' });
    }
    
    // Actualizar como responsable principal
    const updatedAssignment = await storage.setEmployeeProjectAsPrimary(id, assignment.projectId);
    
    res.json(updatedAssignment);
  } catch (error: any) {
    console.error(`Error al establecer responsable principal ${req.params.id}:`, error);
    res.status(500).json({ 
      error: 'Error al establecer el responsable principal',
      details: error.message 
    });
  }
});

// Eliminar una asignación
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    
    // Verificar si la asignación existe
    const assignment = await storage.getEmployeeProject(id);
    if (!assignment) {
      return res.status(404).json({ error: 'Asignación no encontrada' });
    }
    
    // Eliminar la asignación
    await storage.deleteEmployeeProject(id);
    
    res.status(204).send();
  } catch (error: any) {
    console.error(`Error al eliminar asignación ${req.params.id}:`, error);
    res.status(500).json({ 
      error: 'Error al eliminar la asignación',
      details: error.message 
    });
  }
});

export default router;