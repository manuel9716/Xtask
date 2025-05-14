import { Router, Request, Response } from 'express';
import { db } from '../db';
import { projects, employees, users, employeeProjects } from '../../shared/schema';
import { eq, sql, and, desc } from 'drizzle-orm';
import { EstadoProyecto } from '@shared/schema';
import { z } from 'zod';
import { authRequired } from '../middlewares/auth';

// Definimos el enrutador para proyectos
const proyectosRouter = Router();

// GET /api/proyectos/indicadores - Obtener indicadores de proyectos
proyectosRouter.get('/indicadores', async (req: Request, res: Response) => {
  try {
    // Obtener todos los proyectos para calcular indicadores
    const allProjects = await db.select().from(projects);
    
    // Calcular indicadores
    const totalProyectos = allProjects.length;
    
    const proyectosActivos = allProjects.filter(p => p.status === 'active').length;
    const proyectosPausados = allProjects.filter(p => p.status === 'paused').length;
    const proyectosFinalizados = allProjects.filter(p => p.status === 'completed').length;
    
    // Proyectos retrasados: aquellos activos cuya fecha fin prevista ya pasó
    const ahora = new Date();
    const proyectosRetrasados = allProjects.filter(p => 
      p.status === 'active' && 
      p.endDate && 
      new Date(p.endDate) < ahora
    ).length;
    
    // Calcular presupuesto total y de proyectos activos
    const presupuestoTotal = allProjects.reduce(
      (sum, p) => sum + parseFloat(p.budget), 
      0
    );
    
    const presupuestoActivos = allProjects
      .filter(p => p.status === 'active')
      .reduce((sum, p) => sum + parseFloat(p.budget), 0);
    
    // Enviar indicadores
    res.json({
      totalProyectos,
      proyectosActivos,
      proyectosPausados,
      proyectosFinalizados,
      proyectosRetrasados,
      presupuestoTotal,
      presupuestoActivos
    });
  } catch (error: any) {
    console.error('Error al obtener indicadores:', error);
    res.status(500).json({ error: error.message });
  }
});

// GET /api/proyectos - Listar proyectos con filtros y paginación
proyectosRouter.get('/', async (req: Request, res: Response) => {
  try {
    // Parámetros de paginación y filtrado
    const page = Number(req.query.page) || 1;
    const pageSize = Number(req.query.pageSize) || 10;
    const offset = (page - 1) * pageSize;
    
    // Consulta base
    let query = db.select().from(projects);
    
    // Aplicar filtros
    if (req.query.estado) {
      const estadoFiltro = req.query.estado.toString();
      // Mapear el estado de dominio (español) al estado de base de datos (inglés)
      let dbStatus;
      switch (estadoFiltro) {
        case EstadoProyecto.ACTIVO:
          dbStatus = 'active';
          break;
        case EstadoProyecto.PAUSADO:
          dbStatus = 'paused';
          break;
        case EstadoProyecto.RETRASADO:
          dbStatus = 'delayed';
          break;
        case EstadoProyecto.FINALIZADO:
          dbStatus = 'completed';
          break;
        case EstadoProyecto.CANCELADO:
          dbStatus = 'cancelled';
          break;
        case EstadoProyecto.ARCHIVADO:
          dbStatus = 'archived';
          break;
      }
      
      if (dbStatus) {
        query = query.where(eq(projects.status, dbStatus));
      }
    }
    
    if (req.query.busqueda) {
      const busqueda = req.query.busqueda.toString();
      // Implementar búsqueda por texto en nombre o descripción
      // Este es un filtro simplificado, en producción deberías usar búsqueda de texto completo
      // o una función LIKE más robusta
      query = query.where(sql`${projects.name} ILIKE ${'%' + busqueda + '%'} OR ${projects.description} ILIKE ${'%' + busqueda + '%'}`);
    }
    
    // Aplicar paginación después de los filtros
    const totalQuery = query;
    query = query.limit(pageSize).offset(offset);
    
    // Ejecutar consulta
    const result = await query;
    
    // Transformar resultados al formato esperado en el frontend
    const proyectos = result.map(p => {
      // Mapear estado de la base de datos al estado de dominio
      let estadoDominio;
      switch (p.status) {
        case 'active': estadoDominio = EstadoProyecto.ACTIVO; break;
        case 'paused': estadoDominio = EstadoProyecto.PAUSADO; break;
        case 'delayed': estadoDominio = EstadoProyecto.RETRASADO; break;
        case 'completed': estadoDominio = EstadoProyecto.FINALIZADO; break;
        case 'cancelled': estadoDominio = EstadoProyecto.CANCELADO; break;
        case 'archived': estadoDominio = EstadoProyecto.ARCHIVADO; break;
        default: estadoDominio = EstadoProyecto.ACTIVO;
      }
      
      return {
        id: p.id,
        nombre: p.name,
        descripcion: p.description || '',
        fechaInicio: p.startDate,
        fechaFinPrevista: p.endDate,
        fechaFinReal: null, // Pendiente de implementar en base de datos
        estado: estadoDominio,
        presupuesto: parseFloat(p.budget),
        responsableId: p.managerId,
        clienteId: null, // Pendiente de implementar en base de datos
        tags: [], // Pendiente de implementar en base de datos
        createdAt: p.createdAt,
        updatedAt: p.createdAt // Pendiente de implementar en base de datos
      };
    });
    
    // Contar el total para la paginación después de aplicar los filtros, pero sin paginación
    const totalResult = await totalQuery;
    const total = totalResult.length;
    
    // Enviar respuesta con formato adecuado para el frontend
    res.json({
      data: proyectos,
      pagina: page,
      porPagina: pageSize,
      total,
      totalPaginas: Math.ceil(total / pageSize)
    });
  } catch (error: any) {
    console.error('Error al obtener proyectos:', error);
    res.status(500).json({ error: error.message });
  }
});

// GET /api/proyectos/:id - Obtener un proyecto por ID
proyectosRouter.get('/:id', async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    const result = await db.select().from(projects).where(eq(projects.id, id)).limit(1);
    
    if (result.length === 0) {
      return res.status(404).json({ error: 'Proyecto no encontrado' });
    }
    
    const p = result[0];
    
    // Mapear estado de la base de datos al estado de dominio
    let estadoDominio;
    switch (p.status) {
      case 'active': estadoDominio = EstadoProyecto.ACTIVO; break;
      case 'paused': estadoDominio = EstadoProyecto.PAUSADO; break;
      case 'delayed': estadoDominio = EstadoProyecto.RETRASADO; break;
      case 'completed': estadoDominio = EstadoProyecto.FINALIZADO; break;
      case 'cancelled': estadoDominio = EstadoProyecto.CANCELADO; break;
      case 'archived': estadoDominio = EstadoProyecto.ARCHIVADO; break;
      default: estadoDominio = EstadoProyecto.ACTIVO;
    }
    
    // Transformar al formato esperado en el frontend
    const proyecto = {
      id: p.id,
      nombre: p.name,
      descripcion: p.description || '',
      fechaInicio: p.startDate,
      fechaFinPrevista: p.endDate,
      fechaFinReal: null, // Pendiente de implementar en base de datos
      estado: estadoDominio,
      presupuesto: parseFloat(p.budget),
      responsableId: p.managerId,
      clienteId: null, // Pendiente de implementar en base de datos
      tags: [], // Pendiente de implementar en base de datos
      createdAt: p.createdAt,
      updatedAt: p.createdAt // Pendiente de implementar en base de datos
    };
    
    res.json(proyecto);
  } catch (error: any) {
    console.error('Error al obtener proyecto:', error);
    res.status(500).json({ error: error.message });
  }
});

// POST /api/proyectos - Crear un nuevo proyecto
proyectosRouter.post('/', async (req: Request, res: Response) => {
  try {
    // Transformar datos del frontend al formato de la base de datos
    const {
      nombre,
      descripcion,
      fechaInicio,
      fechaFinPrevista,
      presupuesto,
      responsableId,
      estado
    } = req.body;
    
    // Si tenemos un responsableId, necesitamos obtener el user_id asociado
    let userId = null;
    if (responsableId) {
      // Obtener el employee para encontrar su user_id
      const [empleado] = await db.select().from(employees).where(eq(employees.id, responsableId));
      if (empleado) {
        userId = empleado.userId;
      }
    }
    
    // Mapear estado de dominio a estado de base de datos
    let dbStatus = 'active'; // Valor por defecto
    if (estado) {
      if (estado === EstadoProyecto.FINALIZADO) dbStatus = 'completed';
      else if (estado === EstadoProyecto.PAUSADO) dbStatus = 'paused';
      else if (estado === EstadoProyecto.RETRASADO) dbStatus = 'delayed';
      else if (estado === EstadoProyecto.ACTIVO) dbStatus = 'active';
    }
    
    // Crear proyecto en la base de datos
    const [nuevoProyecto] = await db.insert(projects).values({
      name: nombre,
      description: descripcion,
      startDate: new Date(fechaInicio),
      endDate: fechaFinPrevista ? new Date(fechaFinPrevista) : null,
      budget: presupuesto.toString(),
      remainingBudget: presupuesto.toString(),
      managerId: userId, // Ahora usamos el user_id, no el employee_id
      status: dbStatus,
      category: null
    }).returning();
    
    // Mapear estado de la base de datos al estado de dominio
    let estadoDominio = EstadoProyecto.ACTIVO;
    if (nuevoProyecto.status === 'completed') estadoDominio = EstadoProyecto.FINALIZADO;
    else if (nuevoProyecto.status === 'paused') estadoDominio = EstadoProyecto.PAUSADO;
    else if (nuevoProyecto.status === 'delayed') estadoDominio = EstadoProyecto.RETRASADO;
    
    // Transformar al formato esperado en el frontend
    const proyecto = {
      id: nuevoProyecto.id,
      nombre: nuevoProyecto.name,
      descripcion: nuevoProyecto.description || '',
      fechaInicio: nuevoProyecto.startDate,
      fechaFinPrevista: nuevoProyecto.endDate,
      fechaFinReal: null,
      estado: estadoDominio,
      presupuesto: parseFloat(nuevoProyecto.budget),
      responsableId: nuevoProyecto.managerId,
      clienteId: null,
      tags: [],
      createdAt: nuevoProyecto.createdAt,
      updatedAt: nuevoProyecto.createdAt
    };
    
    res.status(201).json(proyecto);
  } catch (error: any) {
    console.error('Error al crear proyecto:', error);
    res.status(500).json({ error: error.message });
  }
});

// PATCH /api/proyectos/:id - Actualizar un proyecto
proyectosRouter.patch('/:id', async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    
    // Verificar si el proyecto existe
    const existingProject = await db.select().from(projects).where(eq(projects.id, id)).limit(1);
    
    if (existingProject.length === 0) {
      return res.status(404).json({ error: 'Proyecto no encontrado' });
    }
    
    // Transformar datos del frontend al formato de la base de datos
    const {
      nombre,
      descripcion,
      fechaInicio,
      fechaFinPrevista,
      fechaFinReal,
      presupuesto,
      responsableId,
      clienteId,
      tags
    } = req.body;
    
    // Si tenemos un responsableId, necesitamos obtener el user_id asociado
    let userId = undefined;
    if (responsableId !== undefined) {
      if (responsableId === null) {
        userId = null;
      } else {
        // Obtener el employee para encontrar su user_id
        const [empleado] = await db.select().from(employees).where(eq(employees.id, responsableId));
        if (empleado) {
          userId = empleado.userId;
        }
      }
    }
    
    // Actualizar proyecto en la base de datos
    const [proyectoActualizado] = await db.update(projects)
      .set({
        name: nombre !== undefined ? nombre : undefined,
        description: descripcion !== undefined ? descripcion : undefined,
        startDate: fechaInicio !== undefined ? new Date(fechaInicio) : undefined,
        endDate: fechaFinPrevista !== undefined ? 
                (fechaFinPrevista === null ? null : new Date(fechaFinPrevista)) : 
                undefined,
        budget: presupuesto !== undefined ? presupuesto.toString() : undefined,
        remainingBudget: presupuesto !== undefined ? presupuesto.toString() : undefined,
        managerId: userId
      })
      .where(eq(projects.id, id))
      .returning();
    
    // Si no se actualizó el proyecto
    if (!proyectoActualizado) {
      return res.status(404).json({ error: 'Error al actualizar el proyecto' });
    }
    
    // Mapear estado de la base de datos al estado de dominio
    let estadoDominio;
    switch (proyectoActualizado.status) {
      case 'active': estadoDominio = EstadoProyecto.ACTIVO; break;
      case 'paused': estadoDominio = EstadoProyecto.PAUSADO; break;
      case 'delayed': estadoDominio = EstadoProyecto.RETRASADO; break;
      case 'completed': estadoDominio = EstadoProyecto.FINALIZADO; break;
      case 'cancelled': estadoDominio = EstadoProyecto.CANCELADO; break;
      case 'archived': estadoDominio = EstadoProyecto.ARCHIVADO; break;
      default: estadoDominio = EstadoProyecto.ACTIVO;
    }
    
    // Transformar al formato esperado en el frontend
    const proyecto = {
      id: proyectoActualizado.id,
      nombre: proyectoActualizado.name,
      descripcion: proyectoActualizado.description || '',
      fechaInicio: proyectoActualizado.startDate,
      fechaFinPrevista: proyectoActualizado.endDate,
      fechaFinReal: fechaFinReal, // Pendiente de implementar en base de datos
      estado: estadoDominio,
      presupuesto: parseFloat(proyectoActualizado.budget),
      responsableId: proyectoActualizado.managerId,
      clienteId: clienteId !== undefined ? clienteId : null,
      tags: tags !== undefined ? tags : [],
      createdAt: proyectoActualizado.createdAt,
      updatedAt: proyectoActualizado.createdAt // Pendiente de implementar en base de datos
    };
    
    res.json(proyecto);
  } catch (error: any) {
    console.error('Error al actualizar proyecto:', error);
    res.status(500).json({ error: error.message });
  }
});

// PATCH /api/proyectos/:id/estado - Cambiar estado de un proyecto
proyectosRouter.patch('/:id/estado', async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    const { estado, comentario } = req.body;
    
    // Verificar si el proyecto existe
    const existingProject = await db.select().from(projects).where(eq(projects.id, id)).limit(1);
    
    if (existingProject.length === 0) {
      return res.status(404).json({ error: 'Proyecto no encontrado' });
    }
    
    // Mapear estado de dominio a estado de base de datos
    let dbStatus = 'active';
    if (estado === EstadoProyecto.FINALIZADO) dbStatus = 'completed';
    else if (estado === EstadoProyecto.PAUSADO) dbStatus = 'paused';
    else if (estado === EstadoProyecto.CANCELADO) dbStatus = 'cancelled';
    else if (estado === EstadoProyecto.ARCHIVADO) dbStatus = 'archived';
    
    // Actualizar estado en la base de datos
    const [proyectoActualizado] = await db.update(projects)
      .set({ status: dbStatus })
      .where(eq(projects.id, id))
      .returning();
    
    // Transformar al formato esperado en el frontend
    const proyecto = {
      id: proyectoActualizado.id,
      nombre: proyectoActualizado.name,
      descripcion: proyectoActualizado.description || '',
      fechaInicio: proyectoActualizado.startDate,
      fechaFinPrevista: proyectoActualizado.endDate,
      fechaFinReal: null, // Pendiente de implementar en base de datos
      estado: estado,
      presupuesto: parseFloat(proyectoActualizado.budget),
      responsableId: proyectoActualizado.managerId,
      clienteId: null, // Pendiente de implementar en base de datos
      tags: [], // Pendiente de implementar en base de datos
      createdAt: proyectoActualizado.createdAt,
      updatedAt: proyectoActualizado.createdAt // Pendiente de implementar en base de datos
    };
    
    res.json(proyecto);
  } catch (error: any) {
    console.error('Error al cambiar estado del proyecto:', error);
    res.status(500).json({ error: error.message });
  }
});

// DELETE /api/proyectos/:id - Eliminar un proyecto
proyectosRouter.delete('/:id', async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    
    // Verificar si el proyecto existe
    const existingProject = await db.select().from(projects).where(eq(projects.id, id)).limit(1);
    
    if (existingProject.length === 0) {
      return res.status(404).json({ error: 'Proyecto no encontrado' });
    }
    
    // Eliminar proyecto (o marcar como inactivo)
    // Opción 1: Eliminación física
    await db.delete(projects).where(eq(projects.id, id));
    
    // Opción 2: Eliminación lógica (como alternativa, marcar como archivado)
    // await db.update(projects)
    //   .set({ status: 'archived' })
    //   .where(eq(projects.id, id));
    
    res.status(204).send();
  } catch (error: any) {
    console.error('Error al eliminar proyecto:', error);
    res.status(500).json({ error: error.message });
  }
});

// GET /api/proyectos/indicadores - Obtener indicadores de proyectos
proyectosRouter.get('/indicadores', async (req: Request, res: Response) => {
  try {
    // Obtener todos los proyectos para calcular indicadores
    const allProjects = await db.select().from(projects);
    
    // Calcular indicadores
    const totalProyectos = allProjects.length;
    
    const proyectosActivos = allProjects.filter(p => p.status === 'active').length;
    const proyectosPausados = allProjects.filter(p => p.status === 'paused').length;
    const proyectosFinalizados = allProjects.filter(p => p.status === 'completed').length;
    
    // Proyectos retrasados: aquellos activos cuya fecha fin prevista ya pasó
    const ahora = new Date();
    const proyectosRetrasados = allProjects.filter(p => 
      p.status === 'active' && 
      p.endDate && 
      new Date(p.endDate) < ahora
    ).length;
    
    // Calcular presupuesto total y de proyectos activos
    const presupuestoTotal = allProjects.reduce(
      (sum, p) => sum + parseFloat(p.budget), 
      0
    );
    
    const presupuestoActivos = allProjects
      .filter(p => p.status === 'active')
      .reduce((sum, p) => sum + parseFloat(p.budget), 0);
    
    // Enviar indicadores
    res.json({
      totalProyectos,
      proyectosActivos,
      proyectosPausados,
      proyectosFinalizados,
      proyectosRetrasados,
      presupuestoTotal,
      presupuestoActivos
    });
  } catch (error: any) {
    console.error('Error al obtener indicadores:', error);
    res.status(500).json({ error: error.message });
  }
});

export default proyectosRouter;