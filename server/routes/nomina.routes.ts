import { Router, Request, Response } from 'express';
import { db } from '../db';
import { recursosFinancieros, budgets, users } from '@shared/schema';
import { eq, and, sql, desc } from 'drizzle-orm';

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

    // Mes actual por defecto
    const mesActual = (mes as string) || new Date().toISOString().slice(0, 7);

    let query = db
      .select({
        // Datos de nómina (simulados basados en recursos)
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
        // Datos del recurso
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
        // Datos del proyecto
        proyecto: {
          id: budgets.id,
          nombre: budgets.nombre,
          monto: budgets.monto,
        }
      })
      .from(recursosFinancieros)
      .innerJoin(budgets, eq(recursosFinancieros.presupuestoId, budgets.id))
      .where(eq(recursosFinancieros.presupuestoId, Number(proyectoId)));

    // Aplicar filtros
    if (perfil) {
      query = query.where(and(
        eq(recursosFinancieros.presupuestoId, Number(proyectoId)),
        eq(recursosFinancieros.perfil, perfil as string)
      ));
    }

    const recursos = await query.orderBy(recursosFinancieros.perfil);

    // Filtrar por estado si se especifica (simulado ya que no tenemos tabla de nómina real)
    let resultado = recursos;
    if (estado && estado !== '') {
      // Por ahora todos los recursos están en estado "pendiente"
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
 * Obtiene resumen de nómina por proyecto
 */
nominaRouter.get('/:proyectoId/resumen', async (req: Request, res: Response) => {
  try {
    const { proyectoId } = req.params;
    const { mes } = req.query;

    const proyecto = await db
      .select({
        id: budgets.id,
        nombre: budgets.nombre,
        totalRecursos: sql<number>`count(${recursosFinancieros.id})::int`,
        costoMensualTotal: sql<number>`sum(${recursosFinancieros.salarioMensual})::numeric`,
        totalPendiente: sql<number>`sum(${recursosFinancieros.salarioMensual})::numeric`, // Simulado
        totalPagado: sql<number>`0`, // Simulado
        totalAprobado: sql<number>`0`, // Simulado
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
 * Registra un pago de nómina (simulado)
 */
nominaRouter.post('/:proyectoId/pagar', async (req: Request, res: Response) => {
  try {
    const { proyectoId } = req.params;
    const { recursoId, mes, bonificacion = 0, fechaPago, estado = 'pendiente' } = req.body;

    // Validar que el recurso existe
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

    // Por ahora simulamos la respuesta ya que no tenemos tabla de nómina real
    const nominaSimulada = {
      id: Date.now(), // ID temporal
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
      creadoPor: req.user?.id || 1,
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
 * PATCH /api/nomina/:nominaId/estado
 * Actualiza el estado de una nómina (simulado)
 */
nominaRouter.patch('/:nominaId/estado', async (req: Request, res: Response) => {
  try {
    const { nominaId } = req.params;
    const { estado, fechaPago, bonificacion } = req.body;

    // Por ahora simulamos la respuesta
    const nominaActualizada = {
      id: Number(nominaId),
      estado,
      fechaPago,
      bonificacion,
      updatedAt: new Date().toISOString(),
    };

    res.json(nominaActualizada);
  } catch (error) {
    console.error('Error al actualizar estado:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
});

/**
 * GET /api/nomina/recurso/:recursoId/historial
 * Obtiene historial de nómina de un recurso (simulado)
 */
nominaRouter.get('/recurso/:recursoId/historial', async (req: Request, res: Response) => {
  try {
    const { recursoId } = req.params;

    // Simulamos historial de los últimos 6 meses
    const historial = [];
    const fechaActual = new Date();
    
    for (let i = 0; i < 6; i++) {
      const fecha = new Date(fechaActual.getFullYear(), fechaActual.getMonth() - i, 1);
      const mes = fecha.toISOString().slice(0, 7);
      
      historial.push({
        id: Date.now() + i,
        recursoId: Number(recursoId),
        mes,
        estado: i === 0 ? 'pendiente' : (i % 2 === 0 ? 'pagado' : 'aprobado'),
        fechaPago: i === 0 ? null : fecha.toISOString().split('T')[0],
        createdAt: fecha.toISOString(),
      });
    }

    res.json(historial);
  } catch (error) {
    console.error('Error al obtener historial:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
});

/**
 * GET /api/nomina/metricas
 * Obtiene métricas generales de nómina
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
      pendientePago: Number(metricas[0]?.totalMensual || 0), // Simulado - todos pendientes
      pagadoMes: 0, // Simulado
      recursosActivos: Number(metricas[0]?.recursosActivos || 0),
    };

    res.json(resultado);
  } catch (error) {
    console.error('Error al obtener métricas:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
});

export { nominaRouter };