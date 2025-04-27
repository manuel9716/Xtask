import { Router, Request, Response } from "express";
import { db } from "../db";
import { employeeProjects, employees, projects, users } from "@shared/schema";
import { eq, and } from "drizzle-orm";

const employeeProjectsRouter = Router();

// Obtener todos los proyectos asignados a un empleado
employeeProjectsRouter.get('/:employeeId', async (req: Request, res: Response) => {
  try {
    const employeeId = parseInt(req.params.employeeId);
    if (isNaN(employeeId)) {
      return res.status(400).json({ error: 'ID de empleado inválido' });
    }

    // Verificar que el empleado existe
    const employee = await db.query.employees.findFirst({
      where: eq(employees.id, employeeId)
    });

    if (!employee) {
      return res.status(404).json({ error: 'Empleado no encontrado' });
    }

    // Obtener las asignaciones de proyectos para este empleado
    const assignments = await db.query.employeeProjects.findMany({
      where: and(
        eq(employeeProjects.employeeId, employeeId),
        eq(employeeProjects.isActive, true)
      ),
      with: {
        project: true
      }
    });

    // Formatear los datos para la respuesta
    const proyectos = assignments.map(assignment => assignment.project);

    return res.status(200).json({
      empleadoId: employeeId,
      cantidadProyectos: proyectos.length,
      proyectos
    });
  } catch (error) {
    console.error('Error al obtener proyectos del empleado:', error);
    return res.status(500).json({ error: 'Error al obtener proyectos del empleado' });
  }
});

// Asignar un proyecto a un empleado
employeeProjectsRouter.post('/:employeeId/assign', async (req: Request, res: Response) => {
  try {
    const employeeId = parseInt(req.params.employeeId);
    const { projectId, role, assignedBy } = req.body;
    
    if (isNaN(employeeId) || !projectId) {
      return res.status(400).json({ error: 'Datos inválidos para asignar proyecto' });
    }

    // Verificar que el empleado existe
    const employee = await db.query.employees.findFirst({
      where: eq(employees.id, employeeId)
    });

    if (!employee) {
      return res.status(404).json({ error: 'Empleado no encontrado' });
    }

    // Verificar que el proyecto existe
    const project = await db.query.projects.findFirst({
      where: eq(projects.id, projectId)
    });

    if (!project) {
      return res.status(404).json({ error: 'Proyecto no encontrado' });
    }

    // Verificar si ya existe una asignación activa
    const existingAssignment = await db.query.employeeProjects.findFirst({
      where: and(
        eq(employeeProjects.employeeId, employeeId),
        eq(employeeProjects.projectId, projectId),
        eq(employeeProjects.isActive, true)
      )
    });

    if (existingAssignment) {
      return res.status(409).json({ error: 'El empleado ya está asignado a este proyecto' });
    }

    // Crear la asignación
    const [assignment] = await db.insert(employeeProjects).values({
      employeeId,
      projectId,
      role: role || 'member',
      assignedBy: assignedBy || (req.user?.id || 1), // Usar el ID del usuario autenticado o fallback a 1
      isActive: true
    }).returning();

    return res.status(201).json(assignment);
  } catch (error) {
    console.error('Error al asignar proyecto al empleado:', error);
    return res.status(500).json({ error: 'Error al asignar proyecto al empleado' });
  }
});

// Desasignar un proyecto de un empleado
employeeProjectsRouter.post('/:employeeId/unassign/:projectId', async (req: Request, res: Response) => {
  try {
    const employeeId = parseInt(req.params.employeeId);
    const projectId = parseInt(req.params.projectId);
    
    if (isNaN(employeeId) || isNaN(projectId)) {
      return res.status(400).json({ error: 'IDs inválidos' });
    }

    // Buscar la asignación activa
    const assignment = await db.query.employeeProjects.findFirst({
      where: and(
        eq(employeeProjects.employeeId, employeeId),
        eq(employeeProjects.projectId, projectId),
        eq(employeeProjects.isActive, true)
      )
    });

    if (!assignment) {
      return res.status(404).json({ error: 'Asignación no encontrada' });
    }

    // Desactivar la asignación (soft delete)
    await db.update(employeeProjects)
      .set({ isActive: false })
      .where(eq(employeeProjects.id, assignment.id));

    return res.status(200).json({ message: 'Proyecto desasignado correctamente' });
  } catch (error) {
    console.error('Error al desasignar proyecto del empleado:', error);
    return res.status(500).json({ error: 'Error al desasignar proyecto del empleado' });
  }
});

export default employeeProjectsRouter;