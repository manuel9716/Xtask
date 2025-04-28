/**
 * @file capacitaciones.routes.ts
 * @description Rutas para gestionar capacitaciones y formaciones
 */

import { Router, Request, Response } from "express";
import { db } from "../db";
import { capacitaciones, empleadoCapacitaciones, EstadoCapacitacion, TipoCapacitacion, insertCapacitacionSchema, insertEmpleadoCapacitacionSchema } from "../../shared/schema";
import { eq, and, desc, sql, like, gte, lte, or, isNull } from "drizzle-orm";
import { ZodError } from "zod";
import { z } from "zod";

const capacitacionesRouter = Router();

// Obtener todas las capacitaciones con filtros opcionales
capacitacionesRouter.get('/', async (req: Request, res: Response) => {
  try {
    const { 
      responsableId, 
      tipo, 
      estado, 
      fechaDesde, 
      fechaHasta, 
      modalidad,
      proveedor,
      busqueda 
    } = req.query;

    // Preparar las condiciones para el filtro
    let conditions = [];

    if (responsableId) {
      conditions.push(eq(capacitaciones.responsableId, Number(responsableId)));
    }

    if (tipo) {
      conditions.push(eq(capacitaciones.tipo, String(tipo)));
    }

    if (estado) {
      conditions.push(eq(capacitaciones.estado, String(estado)));
    }

    if (fechaDesde) {
      conditions.push(gte(capacitaciones.fechaInicio, new Date(String(fechaDesde))));
    }

    if (fechaHasta) {
      conditions.push(lte(capacitaciones.fechaInicio, new Date(String(fechaHasta))));
    }

    if (modalidad) {
      conditions.push(eq(capacitaciones.modalidad, String(modalidad)));
    }

    if (proveedor) {
      conditions.push(eq(capacitaciones.proveedor || '', String(proveedor)));
    }

    if (busqueda) {
      conditions.push(
        or(
          like(capacitaciones.titulo, `%${busqueda}%`),
          like(capacitaciones.descripcion || '', `%${busqueda}%`),
          like(capacitaciones.objetivos || '', `%${busqueda}%`),
          like(capacitaciones.contenido || '', `%${busqueda}%`)
        )
      );
    }

    // Construcción de la consulta final
    let query = db.select().from(capacitaciones);
    
    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }

    // Ordenar por fecha de inicio descendente (más recientes primero)
    query = query.orderBy(desc(capacitaciones.fechaInicio));
    
    const result = await query.execute();
    
    res.json(result);
  } catch (error) {
    console.error('Error al obtener capacitaciones:', error);
    res.status(500).json({ error: 'Error al obtener las capacitaciones' });
  }
});

// Obtener capacitación por ID
capacitacionesRouter.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    const [capacitacion] = await db
      .select()
      .from(capacitaciones)
      .where(eq(capacitaciones.id, Number(id)))
      .execute();
    
    if (!capacitacion) {
      return res.status(404).json({ error: 'Capacitación no encontrada' });
    }
    
    res.json(capacitacion);
  } catch (error) {
    console.error('Error al obtener capacitación:', error);
    res.status(500).json({ error: 'Error al obtener la capacitación' });
  }
});

// Obtener capacitaciones programadas (futuras)
capacitacionesRouter.get('/estado/programadas', async (req: Request, res: Response) => {
  try {
    const today = new Date();
    
    const result = await db
      .select()
      .from(capacitaciones)
      .where(
        and(
          eq(capacitaciones.estado, EstadoCapacitacion.PROGRAMADA),
          gte(capacitaciones.fechaInicio, today)
        )
      )
      .orderBy(capacitaciones.fechaInicio)
      .execute();
    
    res.json(result);
  } catch (error) {
    console.error('Error al obtener capacitaciones programadas:', error);
    res.status(500).json({ error: 'Error al obtener las capacitaciones programadas' });
  }
});

// Obtener capacitaciones en curso
capacitacionesRouter.get('/estado/en-curso', async (req: Request, res: Response) => {
  try {
    const today = new Date();
    
    const result = await db
      .select()
      .from(capacitaciones)
      .where(
        and(
          eq(capacitaciones.estado, EstadoCapacitacion.EN_CURSO),
          lte(capacitaciones.fechaInicio, today),
          gte(capacitaciones.fechaFin, today)
        )
      )
      .orderBy(capacitaciones.fechaInicio)
      .execute();
    
    res.json(result);
  } catch (error) {
    console.error('Error al obtener capacitaciones en curso:', error);
    res.status(500).json({ error: 'Error al obtener las capacitaciones en curso' });
  }
});

// Obtener capacitaciones por empleado
capacitacionesRouter.get('/empleado/:empleadoId', async (req: Request, res: Response) => {
  try {
    const { empleadoId } = req.params;
    
    // Primero obtenemos los IDs de capacitaciones donde está inscrito el empleado
    const inscripciones = await db
      .select()
      .from(empleadoCapacitaciones)
      .where(eq(empleadoCapacitaciones.empleadoId, Number(empleadoId)))
      .execute();
    
    const capacitacionIds = inscripciones.map(i => i.capacitacionId);
    
    if (capacitacionIds.length === 0) {
      return res.json([]);
    }
    
    // Luego obtenemos los detalles de esas capacitaciones
    const result = await db
      .select()
      .from(capacitaciones)
      .where(
        sql`${capacitaciones.id} IN (${capacitacionIds.join(',')})`
      )
      .orderBy(desc(capacitaciones.fechaInicio))
      .execute();
    
    res.json(result);
  } catch (error) {
    console.error('Error al obtener capacitaciones del empleado:', error);
    res.status(500).json({ error: 'Error al obtener las capacitaciones del empleado' });
  }
});

// Crear capacitación
capacitacionesRouter.post('/', async (req: Request, res: Response) => {
  try {
    const validatedData = insertCapacitacionSchema.parse(req.body);
    
    const [nuevaCapacitacion] = await db
      .insert(capacitaciones)
      .values({
        ...validatedData,
        estado: validatedData.estado || EstadoCapacitacion.PROGRAMADA,
        createdAt: new Date(),
        updatedAt: new Date()
      })
      .returning();
    
    res.status(201).json(nuevaCapacitacion);
  } catch (error) {
    if (error instanceof ZodError) {
      return res.status(400).json({ error: error.errors });
    }
    
    console.error('Error al crear capacitación:', error);
    res.status(500).json({ error: 'Error al crear la capacitación' });
  }
});

// Actualizar capacitación
capacitacionesRouter.patch('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    // Schema para validar actualización parcial
    const updateCapacitacionSchema = insertCapacitacionSchema.partial();
    const validatedData = updateCapacitacionSchema.parse(req.body);
    
    const [capacitacion] = await db
      .select()
      .from(capacitaciones)
      .where(eq(capacitaciones.id, Number(id)))
      .execute();
    
    if (!capacitacion) {
      return res.status(404).json({ error: 'Capacitación no encontrada' });
    }
    
    const [capacitacionActualizada] = await db
      .update(capacitaciones)
      .set({
        ...validatedData,
        updatedAt: new Date()
      })
      .where(eq(capacitaciones.id, Number(id)))
      .returning();
    
    res.json(capacitacionActualizada);
  } catch (error) {
    if (error instanceof ZodError) {
      return res.status(400).json({ error: error.errors });
    }
    
    console.error('Error al actualizar capacitación:', error);
    res.status(500).json({ error: 'Error al actualizar la capacitación' });
  }
});

// Cambiar estado de capacitación
capacitacionesRouter.patch('/:id/estado', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { estado } = req.body;
    
    // Validar estado
    if (!Object.values(EstadoCapacitacion).includes(estado as EstadoCapacitacion)) {
      return res.status(400).json({ error: 'Estado no válido' });
    }
    
    const [capacitacion] = await db
      .select()
      .from(capacitaciones)
      .where(eq(capacitaciones.id, Number(id)))
      .execute();
    
    if (!capacitacion) {
      return res.status(404).json({ error: 'Capacitación no encontrada' });
    }
    
    const [capacitacionActualizada] = await db
      .update(capacitaciones)
      .set({
        estado: estado as EstadoCapacitacion,
        updatedAt: new Date()
      })
      .where(eq(capacitaciones.id, Number(id)))
      .returning();
    
    res.json(capacitacionActualizada);
  } catch (error) {
    console.error('Error al cambiar estado de capacitación:', error);
    res.status(500).json({ error: 'Error al cambiar el estado de la capacitación' });
  }
});

// Eliminar capacitación
capacitacionesRouter.delete('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    const [capacitacion] = await db
      .select()
      .from(capacitaciones)
      .where(eq(capacitaciones.id, Number(id)))
      .execute();
    
    if (!capacitacion) {
      return res.status(404).json({ error: 'Capacitación no encontrada' });
    }
    
    // Alternativa más segura: En lugar de eliminar, cambiar a estado CANCELADA
    const [capacitacionCancelada] = await db
      .update(capacitaciones)
      .set({
        estado: EstadoCapacitacion.CANCELADA,
        updatedAt: new Date()
      })
      .where(eq(capacitaciones.id, Number(id)))
      .returning();
    
    res.json({ message: 'Capacitación cancelada correctamente', capacitacion: capacitacionCancelada });
    
    // Opción para eliminar por completo (usar solo si es absolutamente necesario)
    /*
    await db
      .delete(capacitaciones)
      .where(eq(capacitaciones.id, Number(id)))
      .execute();
    
    res.json({ message: 'Capacitación eliminada correctamente' });
    */
  } catch (error) {
    console.error('Error al eliminar capacitación:', error);
    res.status(500).json({ error: 'Error al eliminar la capacitación' });
  }
});

// Inscribir empleado a capacitación
capacitacionesRouter.post('/:id/inscripciones', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { empleadoId, comentarios } = req.body;
    
    // Validar datos
    if (!empleadoId) {
      return res.status(400).json({ error: 'ID de empleado requerido' });
    }
    
    // Verificar que la capacitación existe
    const [capacitacion] = await db
      .select()
      .from(capacitaciones)
      .where(eq(capacitaciones.id, Number(id)))
      .execute();
    
    if (!capacitacion) {
      return res.status(404).json({ error: 'Capacitación no encontrada' });
    }
    
    // Verificar que el empleado no esté ya inscrito
    const [inscripcionExistente] = await db
      .select()
      .from(empleadoCapacitaciones)
      .where(
        and(
          eq(empleadoCapacitaciones.capacitacionId, Number(id)),
          eq(empleadoCapacitaciones.empleadoId, Number(empleadoId))
        )
      )
      .execute();
    
    if (inscripcionExistente) {
      return res.status(400).json({ error: 'El empleado ya está inscrito en esta capacitación' });
    }
    
    // Crear inscripción
    const [nuevaInscripcion] = await db
      .insert(empleadoCapacitaciones)
      .values({
        capacitacionId: Number(id),
        empleadoId: Number(empleadoId),
        asistencia: false,
        completado: false,
        comentarios,
        fechaInscripcion: new Date()
      })
      .returning();
    
    res.status(201).json(nuevaInscripcion);
  } catch (error) {
    console.error('Error al inscribir empleado:', error);
    res.status(500).json({ error: 'Error al inscribir al empleado en la capacitación' });
  }
});

// Cancelar inscripción
capacitacionesRouter.delete('/:id/inscripciones/:empleadoId', async (req: Request, res: Response) => {
  try {
    const { id, empleadoId } = req.params;
    
    // Verificar que la inscripción existe
    const [inscripcion] = await db
      .select()
      .from(empleadoCapacitaciones)
      .where(
        and(
          eq(empleadoCapacitaciones.capacitacionId, Number(id)),
          eq(empleadoCapacitaciones.empleadoId, Number(empleadoId))
        )
      )
      .execute();
    
    if (!inscripcion) {
      return res.status(404).json({ error: 'Inscripción no encontrada' });
    }
    
    // Eliminar inscripción
    await db
      .delete(empleadoCapacitaciones)
      .where(
        and(
          eq(empleadoCapacitaciones.capacitacionId, Number(id)),
          eq(empleadoCapacitaciones.empleadoId, Number(empleadoId))
        )
      )
      .execute();
    
    res.json({ message: 'Inscripción cancelada correctamente' });
  } catch (error) {
    console.error('Error al cancelar inscripción:', error);
    res.status(500).json({ error: 'Error al cancelar la inscripción' });
  }
});

// Obtener inscripciones a una capacitación
capacitacionesRouter.get('/:id/inscripciones', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    const inscripciones = await db
      .select()
      .from(empleadoCapacitaciones)
      .where(eq(empleadoCapacitaciones.capacitacionId, Number(id)))
      .execute();
    
    res.json(inscripciones);
  } catch (error) {
    console.error('Error al obtener inscripciones:', error);
    res.status(500).json({ error: 'Error al obtener las inscripciones' });
  }
});

// Registrar asistencia
capacitacionesRouter.patch('/:id/inscripciones/:empleadoId/asistencia', async (req: Request, res: Response) => {
  try {
    const { id, empleadoId } = req.params;
    const { asistio } = req.body;
    
    if (asistio === undefined) {
      return res.status(400).json({ error: 'Se debe especificar si el empleado asistió' });
    }
    
    // Verificar que la inscripción existe
    const [inscripcion] = await db
      .select()
      .from(empleadoCapacitaciones)
      .where(
        and(
          eq(empleadoCapacitaciones.capacitacionId, Number(id)),
          eq(empleadoCapacitaciones.empleadoId, Number(empleadoId))
        )
      )
      .execute();
    
    if (!inscripcion) {
      return res.status(404).json({ error: 'Inscripción no encontrada' });
    }
    
    // Actualizar asistencia
    const [inscripcionActualizada] = await db
      .update(empleadoCapacitaciones)
      .set({
        asistencia: Boolean(asistio)
      })
      .where(
        and(
          eq(empleadoCapacitaciones.capacitacionId, Number(id)),
          eq(empleadoCapacitaciones.empleadoId, Number(empleadoId))
        )
      )
      .returning();
    
    res.json(inscripcionActualizada);
  } catch (error) {
    console.error('Error al registrar asistencia:', error);
    res.status(500).json({ error: 'Error al registrar la asistencia' });
  }
});

// Marcar capacitación como completada para un empleado
capacitacionesRouter.patch('/:id/inscripciones/:empleadoId/completar', async (req: Request, res: Response) => {
  try {
    const { id, empleadoId } = req.params;
    const { calificacion } = req.body;
    
    // Verificar que la inscripción existe
    const [inscripcion] = await db
      .select()
      .from(empleadoCapacitaciones)
      .where(
        and(
          eq(empleadoCapacitaciones.capacitacionId, Number(id)),
          eq(empleadoCapacitaciones.empleadoId, Number(empleadoId))
        )
      )
      .execute();
    
    if (!inscripcion) {
      return res.status(404).json({ error: 'Inscripción no encontrada' });
    }
    
    // Actualizar estado de completado y calificación
    const [inscripcionActualizada] = await db
      .update(empleadoCapacitaciones)
      .set({
        completado: true,
        calificacion: calificacion
      })
      .where(
        and(
          eq(empleadoCapacitaciones.capacitacionId, Number(id)),
          eq(empleadoCapacitaciones.empleadoId, Number(empleadoId))
        )
      )
      .returning();
    
    res.json(inscripcionActualizada);
  } catch (error) {
    console.error('Error al marcar capacitación como completada:', error);
    res.status(500).json({ error: 'Error al marcar la capacitación como completada' });
  }
});

// Obtener estadísticas de capacitaciones
capacitacionesRouter.get('/estadisticas/resumen', async (req: Request, res: Response) => {
  try {
    const today = new Date();
    
    // Capacitaciones por estado
    const porEstado = await db.execute(sql`
      SELECT 
        estado,
        COUNT(*) as total
      FROM 
        capacitaciones
      GROUP BY 
        estado
      ORDER BY 
        total DESC
    `);
    
    // Capacitaciones por tipo
    const porTipo = await db.execute(sql`
      SELECT 
        tipo,
        COUNT(*) as total
      FROM 
        capacitaciones
      GROUP BY 
        tipo
      ORDER BY 
        total DESC
    `);
    
    // Asistencia promedio
    const asistencia = await db.execute(sql`
      SELECT 
        AVG(CASE WHEN asistencia THEN 1 ELSE 0 END) * 100 as porcentaje_asistencia,
        COUNT(*) as total_inscripciones,
        SUM(CASE WHEN asistencia THEN 1 ELSE 0 END) as total_asistencias
      FROM 
        empleado_capacitaciones
    `);
    
    // Capacitaciones completadas vs pendientes
    const completadas = await db.execute(sql`
      SELECT 
        COUNT(*) as total_completadas
      FROM 
        capacitaciones
      WHERE 
        estado = ${EstadoCapacitacion.COMPLETADA}
    `);
    
    const programadas = await db.execute(sql`
      SELECT 
        COUNT(*) as total_programadas
      FROM 
        capacitaciones
      WHERE 
        estado = ${EstadoCapacitacion.PROGRAMADA}
    `);
    
    const enCurso = await db.execute(sql`
      SELECT 
        COUNT(*) as total_en_curso
      FROM 
        capacitaciones
      WHERE 
        estado = ${EstadoCapacitacion.EN_CURSO}
    `);
    
    // Próximas capacitaciones
    const proximas = await db
      .select()
      .from(capacitaciones)
      .where(
        and(
          gte(capacitaciones.fechaInicio, today),
          eq(capacitaciones.estado, EstadoCapacitacion.PROGRAMADA)
        )
      )
      .orderBy(capacitaciones.fechaInicio)
      .limit(5)
      .execute();
    
    res.json({
      porEstado,
      porTipo,
      asistencia: asistencia[0],
      completadas: completadas[0],
      programadas: programadas[0],
      enCurso: enCurso[0],
      proximasCapacitaciones: proximas
    });
  } catch (error) {
    console.error('Error al obtener estadísticas de capacitaciones:', error);
    res.status(500).json({ error: 'Error al obtener estadísticas de capacitaciones' });
  }
});

export default capacitacionesRouter;