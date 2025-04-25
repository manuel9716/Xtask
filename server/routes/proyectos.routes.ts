import { Router, Request, Response } from 'express';
import { storage } from '../storage';
import { EstadoProyecto } from '../../shared/schema';

const proyectosRouter = Router();

// Obtener listado de proyectos (con filtros y paginación)
proyectosRouter.get('/', async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const pageSize = parseInt(req.query.pageSize as string) || 10;
    const busqueda = req.query.busqueda as string;
    const estado = req.query.estado as string;
    
    // Obtener todos los proyectos
    const proyectos = await storage.getAllProjects();
    
    // Aplicar filtros si hay
    let proyectosFiltrados = proyectos;
    
    if (busqueda) {
      const busquedaLower = busqueda.toLowerCase();
      proyectosFiltrados = proyectosFiltrados.filter(
        proyecto => 
          proyecto.nombre.toLowerCase().includes(busquedaLower) || 
          proyecto.descripcion.toLowerCase().includes(busquedaLower)
      );
    }
    
    if (estado) {
      proyectosFiltrados = proyectosFiltrados.filter(
        proyecto => proyecto.estado === estado
      );
    }
    
    // Paginación
    const total = proyectosFiltrados.length;
    const totalPaginas = Math.ceil(total / pageSize);
    const inicio = (page - 1) * pageSize;
    const fin = inicio + pageSize;
    const proyectosPaginados = proyectosFiltrados.slice(inicio, fin);
    
    res.json({
      data: proyectosPaginados,
      total,
      pagina: page,
      totalPaginas,
      porPagina: pageSize
    });
  } catch (error) {
    console.error('Error al obtener proyectos:', error);
    res.status(500).json({ error: 'Error al obtener proyectos' });
  }
});

// Obtener un proyecto por ID
proyectosRouter.get('/:id', async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    const proyecto = await storage.getProject(id);
    
    if (!proyecto) {
      return res.status(404).json({ error: 'Proyecto no encontrado' });
    }
    
    res.json(proyecto);
  } catch (error) {
    console.error('Error al obtener proyecto:', error);
    res.status(500).json({ error: 'Error al obtener proyecto' });
  }
});

// Crear un nuevo proyecto
proyectosRouter.post('/', async (req: Request, res: Response) => {
  try {
    const { nombre, descripcion, fechaInicio, fechaFinPrevista, presupuesto, responsableId, clienteId, tags } = req.body;
    
    const nuevoProyecto = await storage.createProject({
      nombre,
      descripcion,
      fechaInicio: new Date(fechaInicio),
      fechaFinPrevista: fechaFinPrevista ? new Date(fechaFinPrevista) : null,
      fechaFinReal: null,
      estado: EstadoProyecto.ACTIVO,
      presupuesto,
      responsableId,
      clienteId,
      tags: tags || []
    });
    
    res.status(201).json(nuevoProyecto);
  } catch (error) {
    console.error('Error al crear proyecto:', error);
    res.status(500).json({ error: 'Error al crear proyecto' });
  }
});

// Actualizar un proyecto
proyectosRouter.patch('/:id', async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    const proyecto = await storage.getProject(id);
    
    if (!proyecto) {
      return res.status(404).json({ error: 'Proyecto no encontrado' });
    }
    
    const { nombre, descripcion, fechaInicio, fechaFinPrevista, fechaFinReal, presupuesto, responsableId, clienteId, tags } = req.body;
    
    const proyectoActualizado = await storage.updateProject(id, {
      ...(nombre !== undefined && { nombre }),
      ...(descripcion !== undefined && { descripcion }),
      ...(fechaInicio !== undefined && { fechaInicio: new Date(fechaInicio) }),
      ...(fechaFinPrevista !== undefined && { fechaFinPrevista: fechaFinPrevista ? new Date(fechaFinPrevista) : null }),
      ...(fechaFinReal !== undefined && { fechaFinReal: fechaFinReal ? new Date(fechaFinReal) : null }),
      ...(presupuesto !== undefined && { presupuesto }),
      ...(responsableId !== undefined && { responsableId }),
      ...(clienteId !== undefined && { clienteId }),
      ...(tags !== undefined && { tags })
    });
    
    res.json(proyectoActualizado);
  } catch (error) {
    console.error('Error al actualizar proyecto:', error);
    res.status(500).json({ error: 'Error al actualizar proyecto' });
  }
});

// Cambiar el estado de un proyecto
proyectosRouter.patch('/:id/estado', async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    const proyecto = await storage.getProject(id);
    
    if (!proyecto) {
      return res.status(404).json({ error: 'Proyecto no encontrado' });
    }
    
    const { estado, comentario } = req.body;
    
    if (!Object.values(EstadoProyecto).includes(estado)) {
      return res.status(400).json({ error: 'Estado no válido' });
    }
    
    // Si se marca como finalizado, establecer la fecha de fin real
    const actualizaciones: any = { estado };
    if (estado === EstadoProyecto.FINALIZADO && !proyecto.fechaFinReal) {
      actualizaciones.fechaFinReal = new Date();
    }
    
    const proyectoActualizado = await storage.updateProject(id, actualizaciones);
    
    res.json(proyectoActualizado);
  } catch (error) {
    console.error('Error al cambiar estado del proyecto:', error);
    res.status(500).json({ error: 'Error al cambiar estado del proyecto' });
  }
});

// Eliminar (archivar) un proyecto
proyectosRouter.delete('/:id', async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    const proyecto = await storage.getProject(id);
    
    if (!proyecto) {
      return res.status(404).json({ error: 'Proyecto no encontrado' });
    }
    
    // Archivar el proyecto en lugar de eliminarlo realmente
    await storage.updateProject(id, {
      estado: EstadoProyecto.ARCHIVADO
    });
    
    res.status(204).send();
  } catch (error) {
    console.error('Error al eliminar proyecto:', error);
    res.status(500).json({ error: 'Error al eliminar proyecto' });
  }
});

// Obtener indicadores/métricas de proyectos
proyectosRouter.get('/indicadores', async (req: Request, res: Response) => {
  try {
    const proyectos = await storage.getAllProjects();
    
    // Calcular indicadores
    const totalProyectos = proyectos.length;
    const proyectosActivos = proyectos.filter(p => p.estado === EstadoProyecto.ACTIVO).length;
    const proyectosPausados = proyectos.filter(p => p.estado === EstadoProyecto.PAUSADO).length;
    const proyectosFinalizados = proyectos.filter(p => p.estado === EstadoProyecto.FINALIZADO).length;
    
    // Calcular proyectos retrasados (aquellos activos con fecha fin prevista pasada)
    const hoy = new Date();
    const proyectosRetrasados = proyectos.filter(p => 
      p.estado === EstadoProyecto.ACTIVO && 
      p.fechaFinPrevista && 
      new Date(p.fechaFinPrevista) < hoy
    ).length;
    
    // Calcular presupuestos
    const presupuestoTotal = proyectos
      .filter(p => p.estado !== EstadoProyecto.ARCHIVADO)
      .reduce((sum, p) => sum + p.presupuesto, 0);
    
    const presupuestoActivos = proyectos
      .filter(p => p.estado === EstadoProyecto.ACTIVO)
      .reduce((sum, p) => sum + p.presupuesto, 0);
    
    res.json({
      totalProyectos,
      proyectosActivos,
      proyectosPausados,
      proyectosFinalizados,
      proyectosRetrasados,
      presupuestoTotal,
      presupuestoActivos
    });
  } catch (error) {
    console.error('Error al obtener indicadores:', error);
    res.status(500).json({ error: 'Error al obtener indicadores' });
  }
});

export default proyectosRouter;