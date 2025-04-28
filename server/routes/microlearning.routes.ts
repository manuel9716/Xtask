/**
 * @file Rutas de API para el módulo de microlearning
 * @description Define endpoints para gestionar contenido, recomendaciones e historial de microlearning
 */

import { Router, Request, Response } from 'express';
import { db } from '../db';
import { 
  microLearningContenido, 
  microLearningRecomendaciones,
  microLearningHistorial,
  insertMicroLearningContenidoSchema,
  insertMicroLearningRecomendacionSchema,
  insertMicroLearningHistorialSchema
} from '@shared/schema/microlearning';
import { eq, and, inArray, gte, lte, like, or, desc, sql } from 'drizzle-orm';
import { z } from 'zod';

// Crear router
const microLearningRouter = Router();

// GET /api/microlearning/contenido - Obtener todo el contenido de microlearning
microLearningRouter.get('/contenido', async (req: Request, res: Response) => {
  try {
    // Extraer parámetros de consulta para filtrado
    const {
      busqueda,
      categoria,
      tipoContenido,
      nivel,
      duracionMaxima,
      departamento,
      cargo,
      soloActivos
    } = req.query;

    // Construir consulta base
    let query = db.select().from(microLearningContenido);

    // Aplicar filtros si existen
    if (busqueda) {
      const busquedaStr = `%${busqueda}%`;
      query = query.where(
        or(
          like(microLearningContenido.titulo, busquedaStr),
          like(microLearningContenido.descripcion, busquedaStr),
          like(microLearningContenido.tags, busquedaStr)
        )
      );
    }

    if (categoria) {
      query = query.where(eq(microLearningContenido.categoria, categoria as string));
    }

    if (tipoContenido) {
      query = query.where(eq(microLearningContenido.tipoContenido, tipoContenido as string));
    }

    if (nivel) {
      query = query.where(eq(microLearningContenido.nivel, nivel as string));
    }

    if (duracionMaxima && !isNaN(Number(duracionMaxima))) {
      query = query.where(lte(microLearningContenido.duracionMinutos, Number(duracionMaxima)));
    }

    if (departamento) {
      query = query.where(eq(microLearningContenido.departamentoRelevante, departamento as string));
    }

    if (cargo) {
      query = query.where(eq(microLearningContenido.cargoRelevante, cargo as string));
    }

    if (soloActivos === 'true') {
      query = query.where(eq(microLearningContenido.activo, true));
    }

    // Ejecutar consulta
    const contenidos = await query;
    
    res.json(contenidos);
  } catch (error) {
    console.error('Error al obtener contenido de microlearning:', error);
    res.status(500).json({ error: 'Error al obtener contenido de microlearning' });
  }
});

// GET /api/microlearning/contenido/:id - Obtener un contenido específico
microLearningRouter.get('/contenido/:id', async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    
    if (isNaN(id)) {
      return res.status(400).json({ error: 'ID inválido' });
    }
    
    const [contenido] = await db
      .select()
      .from(microLearningContenido)
      .where(eq(microLearningContenido.id, id));
    
    if (!contenido) {
      return res.status(404).json({ error: 'Contenido no encontrado' });
    }
    
    res.json(contenido);
  } catch (error) {
    console.error('Error al obtener contenido de microlearning:', error);
    res.status(500).json({ error: 'Error al obtener contenido de microlearning' });
  }
});

// POST /api/microlearning/recomendaciones - Obtener recomendaciones personalizadas
microLearningRouter.post('/recomendaciones', async (req: Request, res: Response) => {
  try {
    // Validar entrada con Zod
    const schema = z.object({
      empleadoId: z.number(),
      departamento: z.string().optional(),
      cargo: z.string().optional(),
      habilidades: z.array(z.string()).optional(),
      intereses: z.array(z.string()).optional(),
      historialCompletado: z.array(z.number()).optional(),
      paginaActual: z.string().optional(),
      actividadActual: z.string().optional()
    });
    
    const resultado = schema.safeParse(req.body);
    
    if (!resultado.success) {
      return res.status(400).json({ 
        error: 'Datos de contexto inválidos',
        detalles: resultado.error.format()
      });
    }
    
    const contexto = resultado.data;
    
    // Construir consulta para encontrar recomendaciones relevantes
    let query = db
      .select({
        id: microLearningRecomendaciones.id,
        empleadoId: microLearningRecomendaciones.empleadoId,
        contenidoId: microLearningRecomendaciones.contenidoId,
        relevancia: microLearningRecomendaciones.relevancia,
        visto: microLearningRecomendaciones.visto,
        completado: microLearningRecomendaciones.completado,
        fechaVisto: microLearningRecomendaciones.fechaVisto,
        fechaCompletado: microLearningRecomendaciones.fechaCompletado,
        createdAt: microLearningRecomendaciones.createdAt,
        updatedAt: microLearningRecomendaciones.updatedAt,
        contenido: microLearningContenido
      })
      .from(microLearningRecomendaciones)
      .innerJoin(
        microLearningContenido,
        eq(microLearningRecomendaciones.contenidoId, microLearningContenido.id)
      )
      .where(eq(microLearningRecomendaciones.empleadoId, contexto.empleadoId))
      .orderBy(desc(microLearningRecomendaciones.relevancia));
    
    // Añadir filtros adicionales si se proporcionan
    if (contexto.historialCompletado && contexto.historialCompletado.length > 0) {
      query = query.where(
        sql`${microLearningRecomendaciones.contenidoId} NOT IN (${contexto.historialCompletado.join(',')})`
      );
    }
    
    const recomendaciones = await query;
    
    // Si no hay recomendaciones almacenadas, generar algunas basadas en el contexto
    if (recomendaciones.length === 0) {
      // Construir consulta para contenido relevante
      let contenidoQuery = db
        .select()
        .from(microLearningContenido)
        .where(eq(microLearningContenido.activo, true))
        .limit(5);
      
      if (contexto.departamento) {
        contenidoQuery = contenidoQuery.where(
          eq(microLearningContenido.departamentoRelevante, contexto.departamento)
        );
      }
      
      if (contexto.cargo) {
        contenidoQuery = contenidoQuery.where(
          eq(microLearningContenido.cargoRelevante, contexto.cargo)
        );
      }
      
      const contenidoRelevante = await contenidoQuery;
      
      // Crear recomendaciones temporales (no persistentes)
      const recomendacionesGeneradas = contenidoRelevante.map(contenido => ({
        id: 0, // ID temporal
        empleadoId: contexto.empleadoId,
        contenidoId: contenido.id,
        relevancia: Math.floor(Math.random() * 40) + 60, // Relevancia entre 60-100
        visto: false,
        completado: false,
        createdAt: new Date(),
        updatedAt: new Date(),
        contenido
      }));
      
      return res.json(recomendacionesGeneradas);
    }
    
    res.json(recomendaciones);
  } catch (error) {
    console.error('Error al obtener recomendaciones:', error);
    res.status(500).json({ error: 'Error al obtener recomendaciones' });
  }
});

// POST /api/microlearning/recomendaciones/contextuales - Obtener recomendaciones basadas en contexto actual
microLearningRouter.post('/recomendaciones/contextuales', async (req: Request, res: Response) => {
  try {
    // Validar entrada con Zod
    const schema = z.object({
      empleadoId: z.number(),
      pagina: z.string().optional(),
      actividad: z.string().optional()
    });
    
    const resultado = schema.safeParse(req.body);
    
    if (!resultado.success) {
      return res.status(400).json({ 
        error: 'Datos contextuales inválidos',
        detalles: resultado.error.format()
      });
    }
    
    const { empleadoId, pagina, actividad } = resultado.data;
    
    // Obtener empleado para contexto
    // En un sistema real, obtendríamos el departamento y cargo del empleado
    const departamento = "Tecnología"; // Valor de ejemplo
    const cargo = "Desarrollador"; // Valor de ejemplo
    
    // Determinar palabras clave basadas en el contexto de página/actividad
    let palabrasClave: string[] = [];
    
    if (pagina?.includes('capacitaciones')) {
      palabrasClave.push('aprendizaje', 'formación', 'capacitación');
    } else if (pagina?.includes('evaluaciones')) {
      palabrasClave.push('desempeño', 'evaluación', 'feedback');
    } else if (pagina?.includes('empleados')) {
      palabrasClave.push('recursos humanos', 'personal', 'talento');
    }
    
    if (actividad?.includes('visualizacion')) {
      palabrasClave.push('dashboard', 'análisis', 'métricas');
    }
    
    // Construir condición para búsqueda por palabras clave
    const condicionesPalabrasClave = palabrasClave.map(palabra => 
      or(
        like(microLearningContenido.titulo, `%${palabra}%`),
        like(microLearningContenido.descripcion, `%${palabra}%`),
        like(microLearningContenido.tags, `%${palabra}%`)
      )
    );
    
    // Obtener contenido relevante al contexto
    const contenidoContextual = await db
      .select()
      .from(microLearningContenido)
      .where(
        and(
          eq(microLearningContenido.activo, true),
          or(
            eq(microLearningContenido.departamentoRelevante, departamento),
            eq(microLearningContenido.cargoRelevante, cargo),
            ...condicionesPalabrasClave
          )
        )
      )
      .limit(5);
    
    // Crear recomendaciones basadas en el contenido encontrado
    const recomendacionesContextuales = contenidoContextual.map(contenido => {
      // Calcular relevancia basada en cuántas palabras clave coinciden
      let relevancia = 70; // Base de relevancia
      palabrasClave.forEach(palabra => {
        if (
          contenido.titulo.toLowerCase().includes(palabra.toLowerCase()) ||
          (contenido.descripcion && contenido.descripcion.toLowerCase().includes(palabra.toLowerCase())) ||
          (contenido.tags && contenido.tags.toLowerCase().includes(palabra.toLowerCase()))
        ) {
          relevancia += 5; // Aumentar relevancia por cada coincidencia
        }
      });
      
      // Limitar a máximo 100
      relevancia = Math.min(relevancia, 100);
      
      return {
        id: 0, // ID temporal
        empleadoId,
        contenidoId: contenido.id,
        relevancia,
        visto: false,
        completado: false,
        createdAt: new Date(),
        updatedAt: new Date(),
        contenido
      };
    });
    
    res.json(recomendacionesContextuales);
  } catch (error) {
    console.error('Error al obtener recomendaciones contextuales:', error);
    res.status(500).json({ error: 'Error al obtener recomendaciones contextuales' });
  }
});

// GET /api/microlearning/historial/:empleadoId - Obtener historial de un empleado
microLearningRouter.get('/historial/:empleadoId', async (req: Request, res: Response) => {
  try {
    const empleadoId = parseInt(req.params.empleadoId);
    
    if (isNaN(empleadoId)) {
      return res.status(400).json({ error: 'ID de empleado inválido' });
    }
    
    const historial = await db
      .select({
        id: microLearningHistorial.id,
        empleadoId: microLearningHistorial.empleadoId,
        contenidoId: microLearningHistorial.contenidoId,
        valoracion: microLearningHistorial.valoracion,
        comentario: microLearningHistorial.comentario,
        tiempoCompletadoMinutos: microLearningHistorial.tiempoCompletadoMinutos,
        fechaCompletado: microLearningHistorial.fechaCompletado,
        createdAt: microLearningHistorial.createdAt,
        updatedAt: microLearningHistorial.updatedAt,
        contenido: microLearningContenido
      })
      .from(microLearningHistorial)
      .innerJoin(
        microLearningContenido,
        eq(microLearningHistorial.contenidoId, microLearningContenido.id)
      )
      .where(eq(microLearningHistorial.empleadoId, empleadoId))
      .orderBy(desc(microLearningHistorial.fechaCompletado));
    
    res.json(historial);
  } catch (error) {
    console.error('Error al obtener historial:', error);
    res.status(500).json({ error: 'Error al obtener historial' });
  }
});

// POST /api/microlearning/progreso - Actualizar progreso (visto/completado)
microLearningRouter.post('/progreso', async (req: Request, res: Response) => {
  try {
    // Validar entrada con Zod
    const schema = z.object({
      empleadoId: z.number(),
      contenidoId: z.number(),
      visto: z.boolean().optional(),
      completado: z.boolean().optional(),
      tiempoCompletadoMinutos: z.number().optional()
    });
    
    const resultado = schema.safeParse(req.body);
    
    if (!resultado.success) {
      return res.status(400).json({ 
        error: 'Datos de progreso inválidos',
        detalles: resultado.error.format()
      });
    }
    
    const { empleadoId, contenidoId, visto, completado, tiempoCompletadoMinutos } = resultado.data;
    
    // Verificar si ya existe una recomendación para este empleado y contenido
    const [recomendacionExistente] = await db
      .select()
      .from(microLearningRecomendaciones)
      .where(
        and(
          eq(microLearningRecomendaciones.empleadoId, empleadoId),
          eq(microLearningRecomendaciones.contenidoId, contenidoId)
        )
      );
    
    let recomendacion;
    
    if (recomendacionExistente) {
      // Actualizar recomendación existente
      const actualizaciones: any = {};
      
      if (visto !== undefined) {
        actualizaciones.visto = visto;
        if (visto && !recomendacionExistente.fechaVisto) {
          actualizaciones.fechaVisto = new Date();
        }
      }
      
      if (completado !== undefined) {
        actualizaciones.completado = completado;
        if (completado && !recomendacionExistente.fechaCompletado) {
          actualizaciones.fechaCompletado = new Date();
        }
      }
      
      actualizaciones.updatedAt = new Date();
      
      const [recomendacionActualizada] = await db
        .update(microLearningRecomendaciones)
        .set(actualizaciones)
        .where(eq(microLearningRecomendaciones.id, recomendacionExistente.id))
        .returning();
      
      recomendacion = recomendacionActualizada;
      
      // Si se marca como completado, registrar en historial
      if (completado && !recomendacionExistente.completado) {
        await db.insert(microLearningHistorial).values({
          empleadoId,
          contenidoId,
          tiempoCompletadoMinutos,
          fechaCompletado: new Date()
        });
      }
    } else {
      // Crear nueva recomendación
      const nuevaRecomendacion = {
        empleadoId,
        contenidoId,
        relevancia: 80, // Relevancia predeterminada
        visto: visto || false,
        completado: completado || false,
        fechaVisto: visto ? new Date() : null,
        fechaCompletado: completado ? new Date() : null
      };
      
      const [recomendacionCreada] = await db
        .insert(microLearningRecomendaciones)
        .values(nuevaRecomendacion)
        .returning();
      
      recomendacion = recomendacionCreada;
      
      // Si se marca como completado, registrar en historial
      if (completado) {
        await db.insert(microLearningHistorial).values({
          empleadoId,
          contenidoId,
          tiempoCompletadoMinutos,
          fechaCompletado: new Date()
        });
      }
    }
    
    // Obtener contenido asociado para incluir en la respuesta
    const [contenido] = await db
      .select()
      .from(microLearningContenido)
      .where(eq(microLearningContenido.id, contenidoId));
    
    res.json({
      ...recomendacion,
      contenido
    });
  } catch (error) {
    console.error('Error al actualizar progreso:', error);
    res.status(500).json({ error: 'Error al actualizar progreso' });
  }
});

// POST /api/microlearning/valoracion - Registrar valoración de contenido
microLearningRouter.post('/valoracion', async (req: Request, res: Response) => {
  try {
    // Validar entrada con Zod
    const schema = z.object({
      empleadoId: z.number(),
      contenidoId: z.number(),
      valoracion: z.number().min(1).max(5),
      comentario: z.string().optional()
    });
    
    const resultado = schema.safeParse(req.body);
    
    if (!resultado.success) {
      return res.status(400).json({ 
        error: 'Datos de valoración inválidos',
        detalles: resultado.error.format()
      });
    }
    
    const { empleadoId, contenidoId, valoracion, comentario } = resultado.data;
    
    // Verificar si ya existe un registro en el historial
    const [historialExistente] = await db
      .select()
      .from(microLearningHistorial)
      .where(
        and(
          eq(microLearningHistorial.empleadoId, empleadoId),
          eq(microLearningHistorial.contenidoId, contenidoId)
        )
      );
    
    let historial;
    
    if (historialExistente) {
      // Actualizar historial existente
      const [historialActualizado] = await db
        .update(microLearningHistorial)
        .set({
          valoracion,
          comentario,
          updatedAt: new Date()
        })
        .where(eq(microLearningHistorial.id, historialExistente.id))
        .returning();
      
      historial = historialActualizado;
    } else {
      // Crear nuevo registro de historial
      const [nuevoHistorial] = await db
        .insert(microLearningHistorial)
        .values({
          empleadoId,
          contenidoId,
          valoracion,
          comentario,
          fechaCompletado: new Date()
        })
        .returning();
      
      historial = nuevoHistorial;
      
      // También marcar como completado en recomendaciones si no lo estaba
      const [recomendacionExistente] = await db
        .select()
        .from(microLearningRecomendaciones)
        .where(
          and(
            eq(microLearningRecomendaciones.empleadoId, empleadoId),
            eq(microLearningRecomendaciones.contenidoId, contenidoId)
          )
        );
      
      if (recomendacionExistente) {
        await db
          .update(microLearningRecomendaciones)
          .set({
            completado: true,
            fechaCompletado: new Date(),
            updatedAt: new Date()
          })
          .where(eq(microLearningRecomendaciones.id, recomendacionExistente.id));
      } else {
        await db
          .insert(microLearningRecomendaciones)
          .values({
            empleadoId,
            contenidoId,
            relevancia: 80,
            visto: true,
            completado: true,
            fechaVisto: new Date(),
            fechaCompletado: new Date()
          });
      }
    }
    
    // Obtener contenido asociado para incluir en la respuesta
    const [contenido] = await db
      .select()
      .from(microLearningContenido)
      .where(eq(microLearningContenido.id, contenidoId));
    
    res.json({
      ...historial,
      contenido
    });
  } catch (error) {
    console.error('Error al registrar valoración:', error);
    res.status(500).json({ error: 'Error al registrar valoración' });
  }
});

// GET /api/microlearning/estadisticas/empleado/:empleadoId - Obtener estadísticas para un empleado
microLearningRouter.get('/estadisticas/empleado/:empleadoId', async (req: Request, res: Response) => {
  try {
    const empleadoId = parseInt(req.params.empleadoId);
    
    if (isNaN(empleadoId)) {
      return res.status(400).json({ error: 'ID de empleado inválido' });
    }
    
    // Consultar total de microlearning completados
    const [totalCompletados] = await db
      .select({ count: sql<number>`count(*)` })
      .from(microLearningHistorial)
      .where(eq(microLearningHistorial.empleadoId, empleadoId));
    
    // Consultar total de valoraciones
    const [totalValoraciones] = await db
      .select({ count: sql<number>`count(*)` })
      .from(microLearningHistorial)
      .where(
        and(
          eq(microLearningHistorial.empleadoId, empleadoId),
          sql`${microLearningHistorial.valoracion} IS NOT NULL`
        )
      );
    
    // Consultar promedio de valoraciones
    const [promedioValoraciones] = await db
      .select({ promedio: sql<number>`AVG(${microLearningHistorial.valoracion})` })
      .from(microLearningHistorial)
      .where(
        and(
          eq(microLearningHistorial.empleadoId, empleadoId),
          sql`${microLearningHistorial.valoracion} IS NOT NULL`
        )
      );
    
    // Consultar tiempo total dedicado
    const [tiempoTotal] = await db
      .select({ total: sql<number>`SUM(${microLearningHistorial.tiempoCompletadoMinutos})` })
      .from(microLearningHistorial)
      .where(
        and(
          eq(microLearningHistorial.empleadoId, empleadoId),
          sql`${microLearningHistorial.tiempoCompletadoMinutos} IS NOT NULL`
        )
      );
    
    // Consultar categorías más vistas
    const categoriasMasVistas = await db
      .select({
        categoria: microLearningContenido.categoria,
        total: sql<number>`count(*)`
      })
      .from(microLearningHistorial)
      .innerJoin(
        microLearningContenido,
        eq(microLearningHistorial.contenidoId, microLearningContenido.id)
      )
      .where(eq(microLearningHistorial.empleadoId, empleadoId))
      .groupBy(microLearningContenido.categoria)
      .orderBy(desc(sql<number>`count(*)`))
      .limit(5);
    
    // Compilar estadísticas
    const estadisticas = {
      totalCompletados: totalCompletados.count || 0,
      totalValoraciones: totalValoraciones.count || 0,
      promedioValoraciones: promedioValoraciones.promedio || 0,
      tiempoTotalMinutos: tiempoTotal.total || 0,
      categoriasMasVistas,
      empleadoId
    };
    
    res.json(estadisticas);
  } catch (error) {
    console.error('Error al obtener estadísticas:', error);
    res.status(500).json({ error: 'Error al obtener estadísticas' });
  }
});

// GET /api/microlearning/estadisticas/globales - Obtener estadísticas globales
microLearningRouter.get('/estadisticas/globales', async (req: Request, res: Response) => {
  try {
    // Consultar total de contenidos
    const [totalContenidos] = await db
      .select({ count: sql<number>`count(*)` })
      .from(microLearningContenido);
    
    // Consultar total de completados
    const [totalCompletados] = await db
      .select({ count: sql<number>`count(*)` })
      .from(microLearningHistorial);
    
    // Consultar promedio de valoraciones
    const [promedioValoraciones] = await db
      .select({ promedio: sql<number>`AVG(${microLearningHistorial.valoracion})` })
      .from(microLearningHistorial)
      .where(sql`${microLearningHistorial.valoracion} IS NOT NULL`);
    
    // Consultar categorías más populares
    const categoriasMasPopulares = await db
      .select({
        categoria: microLearningContenido.categoria,
        total: sql<number>`count(*)`
      })
      .from(microLearningHistorial)
      .innerJoin(
        microLearningContenido,
        eq(microLearningHistorial.contenidoId, microLearningContenido.id)
      )
      .groupBy(microLearningContenido.categoria)
      .orderBy(desc(sql<number>`count(*)`));
    
    // Consultar tipos de contenido más populares
    const tiposContenidoMasPopulares = await db
      .select({
        tipoContenido: microLearningContenido.tipoContenido,
        total: sql<number>`count(*)`
      })
      .from(microLearningHistorial)
      .innerJoin(
        microLearningContenido,
        eq(microLearningHistorial.contenidoId, microLearningContenido.id)
      )
      .groupBy(microLearningContenido.tipoContenido)
      .orderBy(desc(sql<number>`count(*)`));
    
    // Compilar estadísticas
    const estadisticas = {
      totalContenidos: totalContenidos.count || 0,
      totalCompletados: totalCompletados.count || 0,
      promedioValoraciones: promedioValoraciones.promedio || 0,
      categoriasMasPopulares,
      tiposContenidoMasPopulares
    };
    
    res.json(estadisticas);
  } catch (error) {
    console.error('Error al obtener estadísticas globales:', error);
    res.status(500).json({ error: 'Error al obtener estadísticas globales' });
  }
});

export default microLearningRouter;