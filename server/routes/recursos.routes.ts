import express, { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { db } from '../db';
import { recursosFinancieros, budgets } from '@shared/schema';
import { eq, and } from 'drizzle-orm';

const recursosRouter = express.Router();

// Middleware de autenticación
function isAuthenticated(req: Request, res: Response, next: Function) {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: "No autorizado: Token requerido" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'xtask-secret-key') as { userId: number };
    req.user = { id: decoded.userId } as any;
    next();
  } catch (error) {
    return res.status(401).json({ error: "Token inválido o expirado" });
  }
}

// GET /api/finanzas/recursos/:presupuestoId - Listar recursos de un presupuesto
recursosRouter.get('/:presupuestoId', isAuthenticated, async (req: Request, res: Response) => {
  try {
    const presupuestoId = parseInt(req.params.presupuestoId);
    
    if (isNaN(presupuestoId)) {
      return res.status(400).json({ error: 'ID de presupuesto inválido' });
    }

    // Verificar que el presupuesto existe
    const presupuesto = await db
      .select()
      .from(budgets)
      .where(eq(budgets.id, presupuestoId))
      .limit(1);

    if (presupuesto.length === 0) {
      return res.status(404).json({ error: 'Presupuesto no encontrado' });
    }

    // Obtener todos los recursos del presupuesto
    const recursos = await db
      .select()
      .from(recursosFinancieros)
      .where(eq(recursosFinancieros.presupuestoId, presupuestoId));

    // Transformar los datos para el frontend
    const recursosTransformados = recursos.map(recurso => ({
      id: recurso.id,
      presupuestoId: recurso.presupuestoId,
      perfil: recurso.perfil,
      salarioMensual: parseFloat(recurso.salarioMensual),
      valorHora: parseFloat(recurso.valorHora),
      meses: recurso.meses,
      diasAlMes: recurso.diasAlMes,
      horasPorDia: recurso.horasPorDia,
      dedicacionPorcentaje: parseFloat(recurso.dedicacionPorcentaje),
      origen: recurso.origen,
      totalHoras: recurso.totalHoras,
      totalEstimado: parseFloat(recurso.totalEstimado),
      creadoPor: recurso.creadoPor,
      createdAt: recurso.createdAt,
      updatedAt: recurso.updatedAt,
    }));

    res.json(recursosTransformados);
  } catch (error: any) {
    console.error('Error al obtener recursos:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// GET /api/finanzas/recursos/:presupuestoId/resumen - Obtener resumen de costos
recursosRouter.get('/:presupuestoId/resumen', isAuthenticated, async (req: Request, res: Response) => {
  try {
    const presupuestoId = parseInt(req.params.presupuestoId);
    
    if (isNaN(presupuestoId)) {
      return res.status(400).json({ error: 'ID de presupuesto inválido' });
    }

    // Obtener todos los recursos del presupuesto
    const recursos = await db
      .select()
      .from(recursosFinancieros)
      .where(eq(recursosFinancieros.presupuestoId, presupuestoId));

    // Calcular resumen
    const totalGeneral = recursos.reduce((sum, recurso) => sum + parseFloat(recurso.totalEstimado), 0);
    
    const totalPorOrigen = recursos.reduce((acc, recurso) => {
      const origen = recurso.origen as 'INTERNO' | 'EXTERNO';
      acc[origen] = (acc[origen] || 0) + parseFloat(recurso.totalEstimado);
      return acc;
    }, { INTERNO: 0, EXTERNO: 0 });

    const totalPorPerfil = recursos.reduce((acc, recurso) => {
      acc[recurso.perfil] = (acc[recurso.perfil] || 0) + parseFloat(recurso.totalEstimado);
      return acc;
    }, {} as Record<string, number>);

    const resumen = {
      totalGeneral,
      totalPorOrigen,
      totalPorPerfil,
      totalRecursos: recursos.length,
      promedioPorRecurso: recursos.length > 0 ? totalGeneral / recursos.length : 0
    };

    res.json(resumen);
  } catch (error: any) {
    console.error('Error al calcular resumen:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// POST /api/finanzas/recursos - Crear nuevo recurso
recursosRouter.post('/', isAuthenticated, async (req: Request, res: Response) => {
  try {
    const {
      presupuestoId,
      perfil,
      salarioMensual,
      valorHora,
      meses,
      diasAlMes,
      horasPorDia,
      dedicacionPorcentaje,
      origen
    } = req.body;

    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ error: 'Usuario no autenticado' });
    }

    // Validaciones básicas
    if (!presupuestoId || !perfil || !salarioMensual || !valorHora || !meses || !diasAlMes || !horasPorDia || !dedicacionPorcentaje || !origen) {
      return res.status(400).json({ error: 'Todos los campos son requeridos' });
    }

    // Verificar que el presupuesto existe
    const presupuesto = await db
      .select()
      .from(budgets)
      .where(eq(budgets.id, presupuestoId))
      .limit(1);

    if (presupuesto.length === 0) {
      return res.status(404).json({ error: 'Presupuesto no encontrado' });
    }

    // Calcular valores automáticamente
    const horasTotales = diasAlMes * horasPorDia * meses;
    const horasProyecto = horasTotales * (dedicacionPorcentaje / 100);
    const totalEstimado = valorHora * horasProyecto;

    // Crear el recurso
    const [nuevoRecurso] = await db
      .insert(recursosFinancieros)
      .values({
        presupuestoId,
        perfil,
        salarioMensual: salarioMensual.toString(),
        valorHora: valorHora.toString(),
        meses,
        diasAlMes,
        horasPorDia,
        dedicacionPorcentaje: dedicacionPorcentaje.toString(),
        origen,
        totalHoras: Math.round(horasProyecto),
        totalEstimado: totalEstimado.toString(),
        creadoPor: userId,
      })
      .returning();

    // Transformar para el frontend
    const recursoTransformado = {
      id: nuevoRecurso.id,
      presupuestoId: nuevoRecurso.presupuestoId,
      perfil: nuevoRecurso.perfil,
      salarioMensual: parseFloat(nuevoRecurso.salarioMensual),
      valorHora: parseFloat(nuevoRecurso.valorHora),
      meses: nuevoRecurso.meses,
      diasAlMes: nuevoRecurso.diasAlMes,
      horasPorDia: nuevoRecurso.horasPorDia,
      dedicacionPorcentaje: parseFloat(nuevoRecurso.dedicacionPorcentaje),
      origen: nuevoRecurso.origen,
      totalHoras: nuevoRecurso.totalHoras,
      totalEstimado: parseFloat(nuevoRecurso.totalEstimado),
      creadoPor: nuevoRecurso.creadoPor,
      createdAt: nuevoRecurso.createdAt,
      updatedAt: nuevoRecurso.updatedAt,
    };

    res.status(201).json(recursoTransformado);
  } catch (error: any) {
    console.error('Error al crear recurso:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// PATCH /api/finanzas/recursos/:id - Actualizar recurso
recursosRouter.patch('/:id', isAuthenticated, async (req: Request, res: Response) => {
  try {
    const resourceId = parseInt(req.params.id);
    const updateData = req.body;

    if (isNaN(resourceId)) {
      return res.status(400).json({ error: 'ID de recurso inválido' });
    }

    // Verificar que el recurso existe
    const recursoExistente = await db
      .select()
      .from(recursosFinancieros)
      .where(eq(recursosFinancieros.id, resourceId))
      .limit(1);

    if (recursoExistente.length === 0) {
      return res.status(404).json({ error: 'Recurso no encontrado' });
    }

    // Recalcular valores si se actualizan campos relevantes
    let updateValues = { ...updateData };
    
    if (updateData.diasAlMes || updateData.horasPorDia || updateData.meses || updateData.dedicacionPorcentaje || updateData.valorHora) {
      const recurso = recursoExistente[0];
      const diasAlMes = updateData.diasAlMes || recurso.diasAlMes;
      const horasPorDia = updateData.horasPorDia || recurso.horasPorDia;
      const meses = updateData.meses || recurso.meses;
      const dedicacionPorcentaje = updateData.dedicacionPorcentaje || parseFloat(recurso.dedicacionPorcentaje);
      const valorHora = updateData.valorHora || parseFloat(recurso.valorHora);

      const horasTotales = diasAlMes * horasPorDia * meses;
      const horasProyecto = horasTotales * (dedicacionPorcentaje / 100);
      const totalEstimado = valorHora * horasProyecto;

      updateValues.totalHoras = Math.round(horasProyecto);
      updateValues.totalEstimado = totalEstimado.toString();
    }

    // Convertir números a strings para campos decimales
    if (updateValues.salarioMensual) updateValues.salarioMensual = updateValues.salarioMensual.toString();
    if (updateValues.valorHora) updateValues.valorHora = updateValues.valorHora.toString();
    if (updateValues.dedicacionPorcentaje) updateValues.dedicacionPorcentaje = updateValues.dedicacionPorcentaje.toString();

    // Actualizar el recurso
    const [recursoActualizado] = await db
      .update(recursosFinancieros)
      .set({ ...updateValues, updatedAt: new Date() })
      .where(eq(recursosFinancieros.id, resourceId))
      .returning();

    // Transformar para el frontend
    const recursoTransformado = {
      id: recursoActualizado.id,
      presupuestoId: recursoActualizado.presupuestoId,
      perfil: recursoActualizado.perfil,
      salarioMensual: parseFloat(recursoActualizado.salarioMensual),
      valorHora: parseFloat(recursoActualizado.valorHora),
      meses: recursoActualizado.meses,
      diasAlMes: recursoActualizado.diasAlMes,
      horasPorDia: recursoActualizado.horasPorDia,
      dedicacionPorcentaje: parseFloat(recursoActualizado.dedicacionPorcentaje),
      origen: recursoActualizado.origen,
      totalHoras: recursoActualizado.totalHoras,
      totalEstimado: parseFloat(recursoActualizado.totalEstimado),
      creadoPor: recursoActualizado.creadoPor,
      createdAt: recursoActualizado.createdAt,
      updatedAt: recursoActualizado.updatedAt,
    };

    res.json(recursoTransformado);
  } catch (error: any) {
    console.error('Error al actualizar recurso:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// DELETE /api/finanzas/recursos/:id - Eliminar recurso
recursosRouter.delete('/:id', isAuthenticated, async (req: Request, res: Response) => {
  try {
    const resourceId = parseInt(req.params.id);

    if (isNaN(resourceId)) {
      return res.status(400).json({ error: 'ID de recurso inválido' });
    }

    // Verificar que el recurso existe
    const recursoExistente = await db
      .select()
      .from(recursosFinancieros)
      .where(eq(recursosFinancieros.id, resourceId))
      .limit(1);

    if (recursoExistente.length === 0) {
      return res.status(404).json({ error: 'Recurso no encontrado' });
    }

    // Eliminar el recurso
    await db
      .delete(recursosFinancieros)
      .where(eq(recursosFinancieros.id, resourceId));

    res.status(204).send();
  } catch (error: any) {
    console.error('Error al eliminar recurso:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

export default recursosRouter;