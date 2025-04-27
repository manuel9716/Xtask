import { Router, Request, Response } from "express";
import { db } from "../db";
import { employeeProjects, employees, projects, users } from "@shared/schema";
import { eq, and, sql } from "drizzle-orm";

const employeeProjectsRouter = Router();

// Obtener todos los proyectos asignados a un empleado
employeeProjectsRouter.get('/:employeeId', async (req: Request, res: Response) => {
  try {
    const employeeId = parseInt(req.params.employeeId);
    if (isNaN(employeeId)) {
      return res.status(400).json({ error: 'ID de empleado inválido' });
    }

    // Verificar que el empleado existe
    const [employee] = await db
      .select()
      .from(employees)
      .where(eq(employees.id, employeeId))
      .limit(1);

    if (!employee) {
      return res.status(404).json({ error: 'Empleado no encontrado' });
    }

    // Array para almacenar todos los proyectos del empleado
    const proyectos = [];
    
    // 1. Verificar si tiene un proyecto principal asignado
    if (employee.id_employed_proyects) {
      console.log(`Empleado ${employeeId} tiene proyecto principal: ${employee.id_employed_proyects}`);
      
      const [proyectoPrincipal] = await db
        .select({
          id: projects.id,
          name: projects.name,
          description: projects.description,
          startDate: projects.startDate,
          endDate: projects.endDate,
          budget: projects.budget,
          remainingBudget: projects.remainingBudget,
          managerId: projects.managerId,
          status: projects.status,
          category: projects.category,
          createdAt: projects.createdAt,
          esPrincipal: sql`true`.as('esPrincipal')
        })
        .from(projects)
        .where(eq(projects.id, employee.id_employed_proyects))
        .limit(1);
      
      if (proyectoPrincipal) {
        proyectos.push(proyectoPrincipal);
        console.log(`Proyecto principal encontrado: ${proyectoPrincipal.name}`);
      }
    }

    // 2. Consultar asignaciones en la tabla de relación
    const assignments = await db
      .select({
        employeeProjectId: employeeProjects.id,
        projectId: employeeProjects.projectId,
        role: employeeProjects.role
      })
      .from(employeeProjects)
      .where(and(
        eq(employeeProjects.employeeId, employeeId),
        eq(employeeProjects.isActive, true)
      ));
    
    // Si hay asignaciones, obtener los detalles de cada proyecto
    if (assignments.length > 0) {
      console.log(`Empleado ${employeeId} tiene ${assignments.length} asignaciones de proyectos`);
      
      // Obtener los proyectos correspondientes
      const projectIds = assignments.map(a => a.projectId);
      
      // Usamos consultas más seguras para evitar problemas con el SQL IN
      for (const projectId of projectIds) {
        // Saltamos si ya incluimos este proyecto como principal
        if (employee.id_employed_proyects === projectId) {
          console.log(`Saltando proyecto ${projectId} porque ya está como principal`);
          continue;
        }
        
        const [proyecto] = await db
          .select({
            id: projects.id,
            name: projects.name,
            description: projects.description,
            startDate: projects.startDate,
            endDate: projects.endDate,
            budget: projects.budget,
            remainingBudget: projects.remainingBudget,
            managerId: projects.managerId,
            status: projects.status,
            category: projects.category,
            createdAt: projects.createdAt,
            esPrincipal: sql`false`.as('esPrincipal')
          })
          .from(projects)
          .where(eq(projects.id, projectId))
          .limit(1);
        
        if (proyecto) {
          proyectos.push(proyecto);
          console.log(`Proyecto adicional encontrado: ${proyecto.name}`);
        }
      }
    }

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
    const [employee] = await db
      .select()
      .from(employees)
      .where(eq(employees.id, employeeId))
      .limit(1);

    if (!employee) {
      return res.status(404).json({ error: 'Empleado no encontrado' });
    }

    // Verificar que el proyecto existe
    const [project] = await db
      .select()
      .from(projects)
      .where(eq(projects.id, projectId))
      .limit(1);

    if (!project) {
      return res.status(404).json({ error: 'Proyecto no encontrado' });
    }

    // Verificar si ya existe una asignación activa
    const [existingAssignment] = await db
      .select()
      .from(employeeProjects)
      .where(and(
        eq(employeeProjects.employeeId, employeeId),
        eq(employeeProjects.projectId, projectId),
        eq(employeeProjects.isActive, true)
      ))
      .limit(1);

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
    const [assignment] = await db
      .select()
      .from(employeeProjects)
      .where(and(
        eq(employeeProjects.employeeId, employeeId),
        eq(employeeProjects.projectId, projectId),
        eq(employeeProjects.isActive, true)
      ))
      .limit(1);

    if (!assignment) {
      return res.status(404).json({ error: 'Asignación no encontrada' });
    }

    // Desactivar la asignación (soft delete)
    await db.update(employeeProjects)
      .set({ isActive: false })
      .where(eq(employeeProjects.id, assignment.id));
    
    // Si este proyecto era también el proyecto principal, eliminarlo de id_employed_proyects
    const [employee] = await db
      .select()
      .from(employees)
      .where(eq(employees.id, employeeId))
      .limit(1);
    
    if (employee && employee.id_employed_proyects === projectId) {
      console.log(`Eliminando proyecto ${projectId} como principal del empleado ${employeeId}`);
      await db.update(employees)
        .set({ id_employed_proyects: null })
        .where(eq(employees.id, employeeId));
    }

    return res.status(200).json({ message: 'Proyecto desasignado correctamente' });
  } catch (error) {
    console.error('Error al desasignar proyecto del empleado:', error);
    return res.status(500).json({ error: 'Error al desasignar proyecto del empleado' });
  }
});

// Asignar un proyecto como principal para un empleado
employeeProjectsRouter.post('/:employeeId/set-primary/:projectId', async (req: Request, res: Response) => {
  try {
    const employeeId = parseInt(req.params.employeeId);
    const projectId = parseInt(req.params.projectId);
    
    if (isNaN(employeeId) || isNaN(projectId)) {
      return res.status(400).json({ error: 'IDs inválidos' });
    }

    // Verificar que el empleado existe
    const [employee] = await db
      .select()
      .from(employees)
      .where(eq(employees.id, employeeId))
      .limit(1);

    if (!employee) {
      return res.status(404).json({ error: 'Empleado no encontrado' });
    }

    // Verificar que el proyecto existe
    const [project] = await db
      .select()
      .from(projects)
      .where(eq(projects.id, projectId))
      .limit(1);

    if (!project) {
      return res.status(404).json({ error: 'Proyecto no encontrado' });
    }
    
    // Asignar el proyecto como principal
    await db.update(employees)
      .set({ id_employed_proyects: projectId })
      .where(eq(employees.id, employeeId));
    
    // Verificar si el proyecto ya está asignado al empleado en la tabla de relaciones
    const [existingAssignment] = await db
      .select()
      .from(employeeProjects)
      .where(and(
        eq(employeeProjects.employeeId, employeeId),
        eq(employeeProjects.projectId, projectId)
      ))
      .limit(1);
    
    // Si no existe la asignación en la tabla de relaciones, crear una
    if (!existingAssignment) {
      await db.insert(employeeProjects).values({
        employeeId,
        projectId,
        role: 'member',
        assignedBy: req.user?.id || 1, // Usar el ID del usuario autenticado o fallback a 1
        isActive: true
      });
    } else if (!existingAssignment.isActive) {
      // Si existe pero está inactiva, reactivarla
      await db.update(employeeProjects)
        .set({ isActive: true })
        .where(eq(employeeProjects.id, existingAssignment.id));
    }

    return res.status(200).json({ 
      message: 'Proyecto asignado como principal correctamente',
      empleadoId: employeeId,
      proyectoPrincipalId: projectId
    });
  } catch (error) {
    console.error('Error al asignar proyecto principal al empleado:', error);
    return res.status(500).json({ error: 'Error al asignar proyecto principal al empleado' });
  }
});

export default employeeProjectsRouter;