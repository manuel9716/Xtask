import { Router, Request, Response } from "express";
import { db } from "../db";
import { 
  userKpis, 
  bonificacionesMensuales, 
  EstadoKpi, 
  EstadoBonificacion,
  employees,
  users
} from "@shared/schema";
import { eq, and, sql } from "drizzle-orm";
import { 
  calcularPorcentajeCumplimiento, 
  determinarEstadoKpi 
} from "../../client/src/modules/kpis/domain/entities/Indicador";
import { 
  calcularMontoBonificacion,
  calcularPorcentajeCumplimientoGlobal 
} from "../../client/src/modules/kpis/domain/entities/Bonificacion";
import { verifyToken } from "./auth.routes";

// Crear router para KPIs
const kpiRouter = Router();

// Implementamos nuestro propio middleware para asegurar la autenticación
function isAuthenticated(req: Request, res: Response, next: Function) {
  // Verificamos si hay un token JWT en la cabecera de autorización
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: "No autorizado: Token requerido" });
  }

  try {
    // Importamos verifyToken de auth.routes.ts, pero lo usamos como middleware
    return verifyToken(req, res, next);
  } catch (error) {
    return res.status(401).json({ error: "No autorizado: Token inválido" });
  }
}

/**
 * Obtiene la lista de empleados disponibles para asignar KPIs
 * GET /api/kpis/empleados
 */
kpiRouter.get("/empleados", isAuthenticated, async (req: Request, res: Response) => {
  try {
    // Obtener todos los empleados de la tabla employees
    const empleados = await db
      .select({
        id: employees.id,
        userId: employees.userId, 
        nombreCompleto: sql`concat(${employees.firstName}, ' ', ${employees.lastName})`,
        position: employees.position,
        department: employees.department
      })
      .from(employees)
      .where(sql`${employees.contractStatus} = 'active'`);
    
    res.json(empleados);
  } catch (error: any) {
    console.error("Error al obtener empleados:", error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * Obtiene los KPIs del usuario actual para un mes específico
 * GET /api/kpis/mis-kpis?mes=YYYY-MM
 */
kpiRouter.get("/mis-kpis", isAuthenticated, async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    const mes = req.query.mes as string;
    
    if (!mes || !/^\d{4}-\d{2}$/.test(mes)) {
      return res.status(400).json({ error: "Formato de mes inválido. Use YYYY-MM" });
    }
    
    const kpis = await db
      .select()
      .from(userKpis)
      .where(
        and(
          eq(userKpis.userId, userId as number),
          eq(userKpis.mes, mes)
        )
      );
    
    res.json(kpis);
  } catch (error: any) {
    console.error("Error al obtener KPIs:", error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * Obtiene un KPI específico por ID
 * GET /api/kpis/:id
 */
kpiRouter.get("/:id", isAuthenticated, async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    const userId = req.user?.id;
    
    if (isNaN(id)) {
      return res.status(400).json({ error: "ID de KPI inválido" });
    }
    
    const [kpi] = await db
      .select()
      .from(userKpis)
      .where(
        and(
          eq(userKpis.id, id),
          eq(userKpis.userId, userId as number)
        )
      );
    
    if (!kpi) {
      return res.status(404).json({ error: "KPI no encontrado" });
    }
    
    res.json(kpi);
  } catch (error: any) {
    console.error("Error al obtener KPI:", error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * Crea un nuevo KPI
 * POST /api/kpis
 */
kpiRouter.post("/", isAuthenticated, async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    const { descripcion, formula, valorEsperado, porcentajePeso, mes, empleadoId } = req.body;
    
    // Si se proporciona empleadoId, usamos ese ID, de lo contrario usamos el ID del usuario actual
    const targetUserId = empleadoId || userId;
    
    // Validar datos
    if (!descripcion || !formula || !mes) {
      return res.status(400).json({ error: "Faltan campos requeridos" });
    }
    
    if (!/^\d{4}-\d{2}$/.test(mes)) {
      return res.status(400).json({ error: "Formato de mes inválido. Use YYYY-MM" });
    }
    
    if (porcentajePeso <= 0 || porcentajePeso > 100) {
      return res.status(400).json({ error: "El porcentaje de peso debe estar entre 0 y 100" });
    }
    
    // Validar valor esperado
    const valorEsperadoNum = parseFloat(valorEsperado);
    if (isNaN(valorEsperadoNum) || valorEsperadoNum <= 0) {
      return res.status(400).json({ error: "El valor esperado debe ser un número mayor que cero" });
    }
    
    // Crear KPI
    const [kpi] = await db
      .insert(userKpis)
      .values({
        userId: targetUserId as number,
        descripcion,
        formula,
        valorEsperado: valorEsperadoNum,
        porcentajePeso: parseFloat(porcentajePeso),
        mes,
        estado: EstadoKpi.PENDIENTE,
        createdAt: new Date(),
        updatedAt: new Date()
      })
      .returning();
    
    res.status(201).json(kpi);
  } catch (error: any) {
    console.error("Error al crear KPI:", error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * Actualiza un KPI existente
 * PATCH /api/kpis/:id
 */
kpiRouter.patch("/:id", isAuthenticated, async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    const userId = req.user?.id;
    const { descripcion, formula, valorEsperado, porcentajePeso, mes } = req.body;
    
    if (isNaN(id)) {
      return res.status(400).json({ error: "ID de KPI inválido" });
    }
    
    // Verificar existencia y propiedad del KPI
    const [existingKpi] = await db
      .select()
      .from(userKpis)
      .where(
        and(
          eq(userKpis.id, id),
          eq(userKpis.userId, userId as number)
        )
      );
    
    if (!existingKpi) {
      return res.status(404).json({ error: "KPI no encontrado" });
    }
    
    // Validar que no esté validado
    if (existingKpi.validadoPor) {
      return res.status(400).json({ error: "No se puede modificar un KPI que ya ha sido validado" });
    }
    
    // Validar mes si se está actualizando
    if (mes && !/^\d{4}-\d{2}$/.test(mes)) {
      return res.status(400).json({ error: "Formato de mes inválido. Use YYYY-MM" });
    }
    
    // Validar porcentaje
    const porcentajePesoNum = parseFloat(porcentajePeso);
    if (porcentajePeso && (isNaN(porcentajePesoNum) || porcentajePesoNum <= 0 || porcentajePesoNum > 100)) {
      return res.status(400).json({ error: "El porcentaje de peso debe estar entre 0 y 100" });
    }
    
    // Actualizar KPI
    const [updatedKpi] = await db
      .update(userKpis)
      .set({
        ...(descripcion && { descripcion }),
        ...(formula && { formula }),
        ...(valorEsperado && { valorEsperado: parseFloat(valorEsperado) }),
        ...(porcentajePeso && { porcentajePeso: porcentajePesoNum }),
        ...(mes && { mes }),
        updatedAt: new Date()
      })
      .where(
        and(
          eq(userKpis.id, id),
          eq(userKpis.userId, userId as number)
        )
      )
      .returning();
    
    res.json(updatedKpi);
  } catch (error: any) {
    console.error("Error al actualizar KPI:", error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * Registra el resultado de un KPI y calcula su cumplimiento
 * PATCH /api/kpis/:id/resultado
 */
kpiRouter.patch("/:id/resultado", isAuthenticated, async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    const userId = req.user?.id;
    const { valorObtenido } = req.body;
    
    if (isNaN(id)) {
      return res.status(400).json({ error: "ID de KPI inválido" });
    }
    
    // Validar valor obtenido
    const valorObtenidoNum = parseFloat(valorObtenido);
    if (isNaN(valorObtenidoNum) || valorObtenidoNum < 0) {
      return res.status(400).json({ error: "El valor obtenido debe ser un número positivo" });
    }
    
    // Verificar existencia y propiedad del KPI
    const [existingKpi] = await db
      .select()
      .from(userKpis)
      .where(
        and(
          eq(userKpis.id, id),
          eq(userKpis.userId, userId as number)
        )
      );
    
    if (!existingKpi) {
      return res.status(404).json({ error: "KPI no encontrado" });
    }
    
    // Validar que no esté validado
    if (existingKpi.validadoPor) {
      return res.status(400).json({ error: "No se puede modificar un KPI que ya ha sido validado" });
    }
    
    // Calcular porcentaje de cumplimiento
    const valorEsperado = Number(existingKpi.valorEsperado);
    const porcentajeCumplimiento = calcularPorcentajeCumplimiento(valorObtenidoNum, valorEsperado);
    
    // Determinar el estado del KPI
    const estado = determinarEstadoKpi(porcentajeCumplimiento);
    
    // Actualizar KPI con el resultado y cálculos
    const [updatedKpi] = await db
      .update(userKpis)
      .set({
        valorObtenido: String(valorObtenidoNum),
        porcentajeCumplimiento: String(porcentajeCumplimiento),
        estado,
        updatedAt: new Date()
      })
      .where(
        and(
          eq(userKpis.id, id),
          eq(userKpis.userId, userId as number)
        )
      )
      .returning();
    
    res.json(updatedKpi);
  } catch (error: any) {
    console.error("Error al registrar resultado:", error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * Valida un KPI por parte de un supervisor
 * PATCH /api/kpis/:id/validar
 */
kpiRouter.patch("/:id/validar", isAuthenticated, async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    const validadorId = req.user?.id;
    const { aprobado, comentarios } = req.body;
    
    if (isNaN(id)) {
      return res.status(400).json({ error: "ID de KPI inválido" });
    }
    
    // TODO: Verificar si el usuario tiene rol de supervisor o jefe
    // Esta validación depende de cómo estén implementados los roles en la aplicación
    
    // Verificar existencia del KPI
    const [existingKpi] = await db
      .select()
      .from(userKpis)
      .where(eq(userKpis.id, id));
    
    if (!existingKpi) {
      return res.status(404).json({ error: "KPI no encontrado" });
    }
    
    // Validar que el validador sea diferente del usuario del KPI
    if (existingKpi.userId === validadorId) {
      return res.status(400).json({ error: "No puedes validar tus propios KPIs" });
    }
    
    // Actualizar KPI con la validación
    const [updatedKpi] = await db
      .update(userKpis)
      .set({
        validadoPor: validadorId as number,
        fechaValidacion: new Date(),
        comentariosValidacion: comentarios,
        updatedAt: new Date()
      })
      .where(eq(userKpis.id, id))
      .returning();
    
    res.json(updatedKpi);
  } catch (error: any) {
    console.error("Error al validar KPI:", error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * Elimina un KPI
 * DELETE /api/kpis/:id
 */
kpiRouter.delete("/:id", isAuthenticated, async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    const userId = req.user?.id;
    
    if (isNaN(id)) {
      return res.status(400).json({ error: "ID de KPI inválido" });
    }
    
    // Verificar existencia y propiedad del KPI
    const [existingKpi] = await db
      .select()
      .from(userKpis)
      .where(
        and(
          eq(userKpis.id, id),
          eq(userKpis.userId, userId as number)
        )
      );
    
    if (!existingKpi) {
      return res.status(404).json({ error: "KPI no encontrado" });
    }
    
    // Validar que no esté validado
    if (existingKpi.validadoPor) {
      return res.status(400).json({ error: "No se puede eliminar un KPI que ya ha sido validado" });
    }
    
    // Eliminar KPI
    await db
      .delete(userKpis)
      .where(
        and(
          eq(userKpis.id, id),
          eq(userKpis.userId, userId as number)
        )
      );
    
    res.json({ success: true });
  } catch (error: any) {
    console.error("Error al eliminar KPI:", error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * Obtiene la bonificación del usuario actual para un mes específico
 * GET /api/kpis/bonificacion?mes=YYYY-MM
 */
kpiRouter.get("/bonificacion", isAuthenticated, async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    const mes = req.query.mes as string;
    
    if (!mes || !/^\d{4}-\d{2}$/.test(mes)) {
      return res.status(400).json({ error: "Formato de mes inválido. Use YYYY-MM" });
    }
    
    const [bonificacion] = await db
      .select()
      .from(bonificacionesMensuales)
      .where(
        and(
          eq(bonificacionesMensuales.userId, userId as number),
          eq(bonificacionesMensuales.mes, mes)
        )
      );
    
    if (!bonificacion) {
      return res.status(404).json({ error: "Bonificación no encontrada" });
    }
    
    res.json(bonificacion);
  } catch (error: any) {
    console.error("Error al obtener bonificación:", error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * Obtiene el historial de bonificaciones del usuario actual
 * GET /api/kpis/bonificaciones/historial
 */
kpiRouter.get("/bonificaciones/historial", isAuthenticated, async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    
    const bonificaciones = await db
      .select()
      .from(bonificacionesMensuales)
      .where(eq(bonificacionesMensuales.userId, userId as number))
      .orderBy(bonificacionesMensuales.mes);
    
    res.json(bonificaciones);
  } catch (error: any) {
    console.error("Error al obtener historial de bonificaciones:", error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * Calcula y/o actualiza la bonificación del usuario para un mes específico
 * POST /api/kpis/calcular-bonificacion
 */
kpiRouter.post("/calcular-bonificacion", isAuthenticated, async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    const { mes, salarioBase, salarioVariable } = req.body;
    
    // Validar datos
    if (!mes || !/^\d{4}-\d{2}$/.test(mes)) {
      return res.status(400).json({ error: "Formato de mes inválido. Use YYYY-MM" });
    }
    
    if (isNaN(salarioBase) || isNaN(salarioVariable) || salarioBase < 0 || salarioVariable < 0) {
      return res.status(400).json({ error: "Los valores salariales deben ser números positivos" });
    }
    
    // Obtener los KPIs del usuario para el mes
    const kpis = await db
      .select()
      .from(userKpis)
      .where(
        and(
          eq(userKpis.userId, userId as number),
          eq(userKpis.mes, mes)
        )
      );
    
    if (kpis.length === 0) {
      return res.status(400).json({ error: "No hay KPIs definidos para calcular la bonificación" });
    }
    
    // Verificar que todos los KPIs tengan valores obtenidos
    const kpisSinResultados = kpis.filter(kpi => kpi.valorObtenido === null);
    if (kpisSinResultados.length > 0) {
      return res.status(400).json({ 
        error: `Hay ${kpisSinResultados.length} KPI(s) sin resultados registrados` 
      });
    }
    
    // Preparar los datos para el cálculo global
    const kpisConResultados = kpis.map(kpi => ({
      porcentajeCumplimiento: Number(kpi.porcentajeCumplimiento || 0),
      porcentajePeso: Number(kpi.porcentajePeso)
    }));
    
    // Calcular el porcentaje global de cumplimiento
    const porcentajeCumplimientoGlobal = calcularPorcentajeCumplimientoGlobal(kpisConResultados);
    
    // Calcular la bonificación utilizando el salario base y el porcentaje de cumplimiento
    const bonificacionTotal = calcularMontoBonificacion(
      Number(salarioBase), 
      porcentajeCumplimientoGlobal
    );
    
    // Verificar si ya existe una bonificación para el mes
    const [bonificacionExistente] = await db
      .select()
      .from(bonificacionesMensuales)
      .where(
        and(
          eq(bonificacionesMensuales.userId, userId as number),
          eq(bonificacionesMensuales.mes, mes)
        )
      );
    
    let resultado;
    
    if (bonificacionExistente) {
      // Actualizar bonificación existente
      const [updatedBonificacion] = await db
        .update(bonificacionesMensuales)
        .set({
          salarioBase: String(salarioBase),
          salarioVariable: String(salarioVariable),
          bonificacionTotal: String(bonificacionTotal),
          porcentajeCumplimientoGlobal: String(porcentajeCumplimientoGlobal),
          estado: EstadoBonificacion.CALCULADA,
          updatedAt: new Date()
        })
        .where(eq(bonificacionesMensuales.id, bonificacionExistente.id))
        .returning();
      
      resultado = updatedBonificacion;
    } else {
      // Crear nueva bonificación
      const [newBonificacion] = await db
        .insert(bonificacionesMensuales)
        .values({
          userId: userId as number,
          mes,
          salarioBase: String(salarioBase),
          salarioVariable: String(salarioVariable),
          bonificacionTotal: String(bonificacionTotal),
          porcentajeCumplimientoGlobal: String(porcentajeCumplimientoGlobal),
          estado: EstadoBonificacion.CALCULADA,
          createdAt: new Date(),
          updatedAt: new Date()
        })
        .returning();
      
      resultado = newBonificacion;
    }
    
    res.json(resultado);
  } catch (error: any) {
    console.error("Error al calcular bonificación:", error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * Aprueba o rechaza una bonificación
 * PATCH /api/kpis/bonificacion/:id/aprobar
 */
kpiRouter.patch("/bonificacion/:id/aprobar", isAuthenticated, async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    const aprobadorId = req.user?.id;
    const { aprobada, comentarios } = req.body;
    
    if (isNaN(id)) {
      return res.status(400).json({ error: "ID de bonificación inválido" });
    }
    
    // Verificar existencia de la bonificación
    const [bonificacion] = await db
      .select()
      .from(bonificacionesMensuales)
      .where(eq(bonificacionesMensuales.id, id));
    
    if (!bonificacion) {
      return res.status(404).json({ error: "Bonificación no encontrada" });
    }
    
    // Verificar si el estado actual permite aprobación
    if (bonificacion.estado === EstadoBonificacion.APROBADA || bonificacion.estado === EstadoBonificacion.RECHAZADA) {
      return res.status(400).json({ 
        error: `La bonificación ya ha sido ${bonificacion.estado.toLowerCase()}` 
      });
    }
    
    // TODO: Verificar si el usuario tiene rol de supervisor o jefe
    
    // Actualizar estado de la bonificación
    const estado = aprobada ? EstadoBonificacion.APROBADA : EstadoBonificacion.RECHAZADA;
    
    const [updatedBonificacion] = await db
      .update(bonificacionesMensuales)
      .set({
        estado,
        aprobadaPor: aprobadorId as number,
        comentariosAprobacion: comentarios,
        fechaAprobacion: new Date(),
        updatedAt: new Date()
      })
      .where(eq(bonificacionesMensuales.id, id))
      .returning();
    
    res.json(updatedBonificacion);
  } catch (error: any) {
    console.error("Error al aprobar/rechazar bonificación:", error);
    res.status(500).json({ error: error.message });
  }
});

export default kpiRouter;