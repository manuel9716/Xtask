import { Router, Request, Response } from 'express';
import { db } from '../db';
import { recursosFinancieros, budgets } from '@shared/schema';
import { eq, and, sql } from 'drizzle-orm';

const nominaRouter = Router();

/**
 * GET /api/nomina/proyectos
 * Obtiene proyectos que tienen recursos asignados
 */
nominaRouter.get('/proyectos', async (req: Request, res: Response) => {
  try {
    const proyectosConRecursos = await db
      .select({
        id: budgets.id,
        nombre: budgets.nombre,
        monto: budgets.monto,
        totalRecursos: sql<number>`count(${recursosFinancieros.id})::int`,
        costoTotal: sql<number>`sum(${recursosFinancieros.totalEstimado})::numeric`
      })
      .from(budgets)
      .innerJoin(recursosFinancieros, eq(budgets.id, recursosFinancieros.presupuestoId))
      .groupBy(budgets.id)
      .orderBy(budgets.nombre);

    res.json(proyectosConRecursos);
  } catch (error) {
    console.error('Error al obtener proyectos con recursos:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
});

/**
 * GET /api/nomina/:proyectoId
 * Obtiene los recursos de un proyecto para gestión de nómina
 */
nominaRouter.get('/:proyectoId', async (req: Request, res: Response) => {
  try {
    const { proyectoId } = req.params;
    const { mes, estado, perfil } = req.query;

    const mesActual = (mes as string) || new Date().toISOString().slice(0, 7);

    let query = db
      .select({
        id: sql<number>`${recursosFinancieros.id}`,
        proyectoId: recursosFinancieros.presupuestoId,
        recursoId: recursosFinancieros.id,
        mes: sql<string>`'${mesActual}'`,
        salarioMensual: recursosFinancieros.salarioMensual,
        bonificacion: sql<number>`0`,
        horasTotales: sql<number>`(${recursosFinancieros.diasAlMes} * ${recursosFinancieros.horasPorDia} * (${recursosFinancieros.dedicacionPorcentaje} / 100))::int`,
        dedicacion: recursosFinancieros.dedicacionPorcentaje,
        estado: sql<string>`'pendiente'`,
        totalPagar: recursosFinancieros.salarioMensual,
        fechaPago: sql<string>`null`,
        creadoPor: recursosFinancieros.creadoPor,
        createdAt: recursosFinancieros.createdAt,
        updatedAt: recursosFinancieros.updatedAt,
        recurso: {
          id: recursosFinancieros.id,
          perfil: recursosFinancieros.perfil,
          salarioMensual: recursosFinancieros.salarioMensual,
          valorHora: recursosFinancieros.valorHora,
          meses: recursosFinancieros.meses,
          diasAlMes: recursosFinancieros.diasAlMes,
          horasPorDia: recursosFinancieros.horasPorDia,
          dedicacionPorcentaje: recursosFinancieros.dedicacionPorcentaje,
          origen: recursosFinancieros.origen,
          totalHoras: recursosFinancieros.totalHoras,
          totalEstimado: recursosFinancieros.totalEstimado,
        },
        proyecto: {
          id: budgets.id,
          nombre: budgets.nombre,
          monto: budgets.monto,
        }
      })
      .from(recursosFinancieros)
      .innerJoin(budgets, eq(recursosFinancieros.presupuestoId, budgets.id))
      .where(eq(recursosFinancieros.presupuestoId, Number(proyectoId)));

    if (perfil) {
      query = query.where(and(
        eq(recursosFinancieros.presupuestoId, Number(proyectoId)),
        eq(recursosFinancieros.perfil, perfil as string)
      ));
    }

    const recursos = await query.orderBy(recursosFinancieros.perfil);
    let resultado = recursos;
    
    if (estado && estado !== '') {
      resultado = estado === 'pendiente' ? recursos : [];
    }

    res.json(resultado);
  } catch (error) {
    console.error('Error al obtener recursos del proyecto:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
});

/**
 * GET /api/nomina/:proyectoId/resumen
 */
nominaRouter.get('/:proyectoId/resumen', async (req: Request, res: Response) => {
  try {
    const { proyectoId } = req.params;

    const proyecto = await db
      .select({
        id: budgets.id,
        nombre: budgets.nombre,
        totalRecursos: sql<number>`count(${recursosFinancieros.id})::int`,
        costoMensualTotal: sql<number>`sum(${recursosFinancieros.salarioMensual})::numeric`,
        totalPendiente: sql<number>`sum(${recursosFinancieros.salarioMensual})::numeric`,
        totalPagado: sql<number>`0`,
        totalAprobado: sql<number>`0`,
      })
      .from(budgets)
      .innerJoin(recursosFinancieros, eq(budgets.id, recursosFinancieros.presupuestoId))
      .where(eq(budgets.id, Number(proyectoId)))
      .groupBy(budgets.id);

    if (proyecto.length === 0) {
      return res.status(404).json({ message: 'Proyecto no encontrado o sin recursos' });
    }

    const resumen = {
      proyectoId: Number(proyectoId),
      nombreProyecto: proyecto[0].nombre,
      totalRecursos: proyecto[0].totalRecursos,
      totalPendiente: Number(proyecto[0].totalPendiente),
      totalPagado: Number(proyecto[0].totalPagado),
      totalAprobado: Number(proyecto[0].totalAprobado),
      costoMensualTotal: Number(proyecto[0].costoMensualTotal),
    };

    res.json(resumen);
  } catch (error) {
    console.error('Error al obtener resumen del proyecto:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
});

/**
 * POST /api/nomina/:proyectoId/pagar
 */
nominaRouter.post('/:proyectoId/pagar', async (req: Request, res: Response) => {
  try {
    const { proyectoId } = req.params;
    const { recursoId, mes, bonificacion = 0, fechaPago, estado = 'pendiente' } = req.body;

    const recurso = await db
      .select()
      .from(recursosFinancieros)
      .where(and(
        eq(recursosFinancieros.id, recursoId),
        eq(recursosFinancieros.presupuestoId, Number(proyectoId))
      ));

    if (recurso.length === 0) {
      return res.status(404).json({ message: 'Recurso no encontrado en el proyecto' });
    }

    const recursoData = recurso[0];
    const totalPagar = Number(recursoData.salarioMensual) + Number(bonificacion);

    const nominaSimulada = {
      id: Date.now(),
      proyectoId: Number(proyectoId),
      recursoId: Number(recursoId),
      mes,
      salarioMensual: Number(recursoData.salarioMensual),
      bonificacion: Number(bonificacion),
      horasTotales: recursoData.totalHoras,
      dedicacion: Number(recursoData.dedicacionPorcentaje),
      estado,
      totalPagar,
      fechaPago,
      creadoPor: (req as any).user?.id || 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    res.status(201).json(nominaSimulada);
  } catch (error) {
    console.error('Error al registrar pago:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
});

/**
 * GET /api/nomina/metricas
 */
nominaRouter.get('/metricas', async (req: Request, res: Response) => {
  try {
    const { proyectoId } = req.query;

    let whereCondition = undefined;
    if (proyectoId) {
      whereCondition = eq(recursosFinancieros.presupuestoId, Number(proyectoId));
    }

    const metricas = await db
      .select({
        totalMensual: sql<number>`sum(${recursosFinancieros.salarioMensual})::numeric`,
        recursosActivos: sql<number>`count(${recursosFinancieros.id})::int`,
      })
      .from(recursosFinancieros)
      .where(whereCondition);

    const resultado = {
      totalMensual: Number(metricas[0]?.totalMensual || 0),
      pendientePago: Number(metricas[0]?.totalMensual || 0),
      pagadoMes: 0,
      recursosActivos: Number(metricas[0]?.recursosActivos || 0),
    };

    res.json(resultado);
  } catch (error) {
    console.error('Error al obtener métricas:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
});

export default nominaRouter;