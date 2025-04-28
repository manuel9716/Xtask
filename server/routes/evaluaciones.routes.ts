/**
 * @file evaluaciones.routes.ts
 * @description Rutas para gestionar evaluaciones de desempeño
 */

import { Router, Request, Response } from "express";
import { db } from "../db";
import { evaluaciones, EstadoEvaluacion, TipoEvaluacion, insertEvaluacionSchema } from "../../shared/schema";
import { eq, and, desc, sql, like, gte, lte, or } from "drizzle-orm";
import { ZodError } from "zod";
import { z } from "zod";

const evaluacionesRouter = Router();

// Obtener todas las evaluaciones con filtros opcionales
evaluacionesRouter.get('/', async (req: Request, res: Response) => {
  try {
    const { 
      empleadoId, 
      evaluadorId, 
      tipo, 
      estado, 
      fechaDesde, 
      fechaHasta, 
      busqueda 
    } = req.query;

    // Preparar las condiciones para el filtro
    let conditions = [];

    if (empleadoId) {
      conditions.push(eq(evaluaciones.empleadoId, Number(empleadoId)));
    }

    if (evaluadorId) {
      conditions.push(eq(evaluaciones.evaluadorId, Number(evaluadorId)));
    }

    if (tipo) {
      conditions.push(eq(evaluaciones.tipo, String(tipo)));
    }

    if (estado) {
      conditions.push(eq(evaluaciones.estado, String(estado)));
    }

    if (fechaDesde) {
      conditions.push(gte(evaluaciones.fechaInicio, new Date(String(fechaDesde))));
    }

    if (fechaHasta) {
      conditions.push(lte(evaluaciones.fechaInicio, new Date(String(fechaHasta))));
    }

    if (busqueda) {
      conditions.push(
        or(
          like(evaluaciones.titulo, `%${busqueda}%`),
          like(evaluaciones.descripcion || '', `%${busqueda}%`)
        )
      );
    }

    // Construcción de la consulta final
    let query = db.select().from(evaluaciones);
    
    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }

    // Ordenar por fecha de inicio descendente (más recientes primero)
    query = query.orderBy(desc(evaluaciones.fechaInicio));
    
    const result = await query.execute();
    
    res.json(result);
  } catch (error) {
    console.error('Error al obtener evaluaciones:', error);
    res.status(500).json({ error: 'Error al obtener las evaluaciones' });
  }
});

// Obtener evaluación por ID
evaluacionesRouter.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    const [evaluacion] = await db
      .select()
      .from(evaluaciones)
      .where(eq(evaluaciones.id, Number(id)))
      .execute();
    
    if (!evaluacion) {
      return res.status(404).json({ error: 'Evaluación no encontrada' });
    }
    
    res.json(evaluacion);
  } catch (error) {
    console.error('Error al obtener evaluación:', error);
    res.status(500).json({ error: 'Error al obtener la evaluación' });
  }
});

// Obtener evaluaciones por empleado
evaluacionesRouter.get('/empleado/:empleadoId', async (req: Request, res: Response) => {
  try {
    const { empleadoId } = req.params;
    
    const result = await db
      .select()
      .from(evaluaciones)
      .where(eq(evaluaciones.empleadoId, Number(empleadoId)))
      .orderBy(desc(evaluaciones.fechaInicio))
      .execute();
    
    res.json(result);
  } catch (error) {
    console.error('Error al obtener evaluaciones del empleado:', error);
    res.status(500).json({ error: 'Error al obtener las evaluaciones del empleado' });
  }
});

// Crear evaluación
evaluacionesRouter.post('/', async (req: Request, res: Response) => {
  try {
    const validatedData = insertEvaluacionSchema.parse(req.body);
    
    const [nuevaEvaluacion] = await db
      .insert(evaluaciones)
      .values({
        ...validatedData,
        estado: validatedData.estado || EstadoEvaluacion.PENDIENTE,
        createdAt: new Date(),
        updatedAt: new Date()
      })
      .returning();
    
    res.status(201).json(nuevaEvaluacion);
  } catch (error) {
    if (error instanceof ZodError) {
      return res.status(400).json({ error: error.errors });
    }
    
    console.error('Error al crear evaluación:', error);
    res.status(500).json({ error: 'Error al crear la evaluación' });
  }
});

// Actualizar evaluación
evaluacionesRouter.patch('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    // Schema para validar actualización parcial
    const updateEvaluacionSchema = insertEvaluacionSchema.partial();
    const validatedData = updateEvaluacionSchema.parse(req.body);
    
    const [evaluacion] = await db
      .select()
      .from(evaluaciones)
      .where(eq(evaluaciones.id, Number(id)))
      .execute();
    
    if (!evaluacion) {
      return res.status(404).json({ error: 'Evaluación no encontrada' });
    }
    
    const [evaluacionActualizada] = await db
      .update(evaluaciones)
      .set({
        ...validatedData,
        updatedAt: new Date()
      })
      .where(eq(evaluaciones.id, Number(id)))
      .returning();
    
    res.json(evaluacionActualizada);
  } catch (error) {
    if (error instanceof ZodError) {
      return res.status(400).json({ error: error.errors });
    }
    
    console.error('Error al actualizar evaluación:', error);
    res.status(500).json({ error: 'Error al actualizar la evaluación' });
  }
});

// Cambiar estado de evaluación
evaluacionesRouter.patch('/:id/estado', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { estado } = req.body;
    
    // Validar estado
    if (!Object.values(EstadoEvaluacion).includes(estado as EstadoEvaluacion)) {
      return res.status(400).json({ error: 'Estado no válido' });
    }
    
    const [evaluacion] = await db
      .select()
      .from(evaluaciones)
      .where(eq(evaluaciones.id, Number(id)))
      .execute();
    
    if (!evaluacion) {
      return res.status(404).json({ error: 'Evaluación no encontrada' });
    }
    
    const [evaluacionActualizada] = await db
      .update(evaluaciones)
      .set({
        estado: estado as EstadoEvaluacion,
        updatedAt: new Date()
      })
      .where(eq(evaluaciones.id, Number(id)))
      .returning();
    
    res.json(evaluacionActualizada);
  } catch (error) {
    console.error('Error al cambiar estado de evaluación:', error);
    res.status(500).json({ error: 'Error al cambiar el estado de la evaluación' });
  }
});

// Eliminar evaluación
evaluacionesRouter.delete('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    const [evaluacion] = await db
      .select()
      .from(evaluaciones)
      .where(eq(evaluaciones.id, Number(id)))
      .execute();
    
    if (!evaluacion) {
      return res.status(404).json({ error: 'Evaluación no encontrada' });
    }
    
    // Alternativa más segura: En lugar de eliminar, cambiar a estado ARCHIVADO
    const [evaluacionArchivada] = await db
      .update(evaluaciones)
      .set({
        estado: EstadoEvaluacion.ARCHIVADA,
        updatedAt: new Date()
      })
      .where(eq(evaluaciones.id, Number(id)))
      .returning();
    
    res.json({ message: 'Evaluación archivada correctamente', evaluacion: evaluacionArchivada });
    
    // Opción para eliminar por completo (usar solo si es absolutamente necesario)
    /*
    await db
      .delete(evaluaciones)
      .where(eq(evaluaciones.id, Number(id)))
      .execute();
    
    res.json({ message: 'Evaluación eliminada correctamente' });
    */
  } catch (error) {
    console.error('Error al eliminar evaluación:', error);
    res.status(500).json({ error: 'Error al eliminar la evaluación' });
  }
});

// Estadísticas de evaluaciones por departamento
evaluacionesRouter.get('/estadisticas/departamento', async (req: Request, res: Response) => {
  try {
    // Esta consulta es compleja y requiere JOIN con tabla de empleados
    // Implementación simplificada usando SQL raw para estadísticas
    const stats = await db.execute(sql`
      SELECT 
        e.department AS departamento,
        AVG(ev.calificacion) AS promedio_calificacion,
        COUNT(ev.id) AS total_evaluaciones,
        COUNT(CASE WHEN ev.estado = ${EstadoEvaluacion.COMPLETADA} THEN 1 END) AS evaluaciones_completadas,
        COUNT(CASE WHEN ev.estado = ${EstadoEvaluacion.PENDIENTE} THEN 1 END) AS evaluaciones_pendientes
      FROM 
        evaluaciones ev
      JOIN 
        employees e ON ev.empleado_id = e.id
      GROUP BY 
        e.department
      ORDER BY 
        promedio_calificacion DESC
    `);
    
    res.json(stats);
  } catch (error) {
    console.error('Error al obtener estadísticas por departamento:', error);
    res.status(500).json({ error: 'Error al obtener estadísticas por departamento' });
  }
});

export default evaluacionesRouter;