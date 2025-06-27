import { Router, Request, Response } from 'express';
import { db } from '../db';
import { recursosFinancieros, budgets } from '@shared/schema';
import { eq, and, sql } from 'drizzle-orm';

const nominaRouter = Router();

/**
 * GET /api/nomina/proyectos
 * Obtiene todos los proyectos con información de recursos
 */
nominaRouter.get('/proyectos', async (req: Request, res: Response) => {
  try {
    // Obtener todos los proyectos
    const result = await db.execute(sql`
      SELECT 
        b.id,
        b.name as nombre,
        b.amount as monto
      FROM budgets b 
      ORDER BY b.name
    `);

    const proyectosConMetricas = [];
    
    for (const row of result.rows) {
      // Contar recursos y calcular costo total para cada proyecto
      const recursosResult = await db.execute(sql`
        SELECT 
          COUNT(*)::int as total_recursos,
          COALESCE(SUM(total_estimado), 0)::numeric as costo_total
        FROM recursos_financieros 
        WHERE presupuesto_id = ${row.id}
      `);

      const metrics = recursosResult.rows[0];
      
      proyectosConMetricas.push({
        id: row.id,
        nombre: row.nombre,
        monto: row.monto,
        totalRecursos: metrics.total_recursos,
        costoTotal: Number(metrics.costo_total || 0)
      });
    }

    res.json(proyectosConMetricas);
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

    // Validar proyectoId
    if (!proyectoId || isNaN(Number(proyectoId))) {
      return res.status(400).json({ message: 'ID de proyecto inválido' });
    }

    const projectId = Number(proyectoId);
    const mesActual = (mes as string) || new Date().toISOString().slice(0, 7);

    // Obtener recursos del proyecto
    const allRecursos = await db
      .select()
      .from(recursosFinancieros);

    let recursos = allRecursos.filter(r => r.presupuestoId === projectId);
    
    if (perfil) {
      recursos = recursos.filter(r => r.perfil === perfil);
    }

    recursos.sort((a, b) => a.perfil.localeCompare(b.perfil));

    // Obtener datos del proyecto
    const proyecto = await db
      .select()
      .from(budgets)
      .where(eq(budgets.id, projectId))
      .limit(1);

    const proyectoData = proyecto[0];

    // Transformar recursos a formato de nómina
    const resultado = recursos.map(recurso => {
      const horasTotales = (recurso.diasAlMes || 22) * (recurso.horasPorDia || 8) * ((recurso.dedicacionPorcentaje || 100) / 100);
      
      return {
        id: recurso.id,
        proyectoId: projectId,
        recursoId: recurso.id,
        mes: mesActual,
        salarioMensual: recurso.salarioMensual,
        bonificacion: 0,
        horasTotales: Math.round(horasTotales),
        dedicacion: recurso.dedicacionPorcentaje,
        estado: 'pendiente',
        totalPagar: recurso.salarioMensual,
        fechaPago: null,
        creadoPor: recurso.creadoPor,
        createdAt: recurso.createdAt,
        updatedAt: recurso.updatedAt,
        recurso: {
          id: recurso.id,
          perfil: recurso.perfil,
          salarioMensual: recurso.salarioMensual,
          valorHora: recurso.valorHora,
          meses: recurso.meses,
          diasAlMes: recurso.diasAlMes,
          horasPorDia: recurso.horasPorDia,
          dedicacionPorcentaje: recurso.dedicacionPorcentaje,
          origen: recurso.origen,
          totalHoras: recurso.totalHoras,
          totalEstimado: recurso.totalEstimado,
        },
        proyecto: proyectoData ? {
          id: proyectoData.id,
          nombre: proyectoData.name,
          monto: proyectoData.amount,
        } : null
      };
    });

    // Filtrar por estado si se especifica
    const resultadoFinal = estado && estado !== '' 
      ? (estado === 'pendiente' ? resultado : [])
      : resultado;

    res.json(resultadoFinal);
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

    // Obtener datos del proyecto
    const proyecto = await db
      .select()
      .from(budgets)
      .where(eq(budgets.id, Number(proyectoId)))
      .limit(1);

    if (proyecto.length === 0) {
      return res.status(404).json({ message: 'Proyecto no encontrado' });
    }

    // Obtener recursos del proyecto
    const recursos = await db
      .select()
      .from(recursosFinancieros)
      .where(eq(recursosFinancieros.presupuestoId, projectId));

    if (recursos.length === 0) {
      return res.status(404).json({ message: 'Proyecto sin recursos asignados' });
    }

    // Calcular métricas
    const totalRecursos = recursos.length;
    const costoMensualTotal = recursos.reduce((total, recurso) => total + Number(recurso.salarioMensual || 0), 0);

    const resumen = {
      proyectoId: projectId,
      nombreProyecto: proyecto[0].name,
      totalRecursos: totalRecursos,
      totalPendiente: costoMensualTotal, // Simulado - todos pendientes
      totalPagado: 0, // Simulado
      totalAprobado: 0, // Simulado
      costoMensualTotal: costoMensualTotal,
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
    const { recursoId, mes, bonificacion = 0, fechaPago, estado = 'pendiente', metodoPago = 'transferencia', referenciaPSE } = req.body;

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
      metodoPago,
      referenciaPSE: referenciaPSE || null,
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

    let result;
    if (proyectoId && typeof proyectoId === 'string' && !isNaN(Number(proyectoId))) {
      const projectIdNum = Number(proyectoId);
      result = await db.execute(sql`
        SELECT 
          COUNT(*)::int as recursos_activos,
          COALESCE(SUM(salario_mensual), 0)::numeric as total_mensual
        FROM recursos_financieros 
        WHERE presupuesto_id = ${projectIdNum}
      `);
    } else {
      result = await db.execute(sql`
        SELECT 
          COUNT(*)::int as recursos_activos,
          COALESCE(SUM(salario_mensual), 0)::numeric as total_mensual
        FROM recursos_financieros
      `);
    }

    const metrics = result.rows[0];
    const totalMensual = Number(metrics.total_mensual || 0);

    const resultado = {
      totalMensual: totalMensual,
      pendientePago: totalMensual, // Simulado - todos pendientes
      pagadoMes: 0, // Simulado
      recursosActivos: Number(metrics.recursos_activos || 0),
    };

    res.json(resultado);
  } catch (error) {
    console.error('Error al obtener métricas:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
});

export default nominaRouter;