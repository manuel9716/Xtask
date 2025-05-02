import { db } from "@/lib/db";
import { eq, and } from "drizzle-orm";
import { 
  userKpis,
  bonificacionesMensuales,
  EstadoKpi,
  EstadoBonificacion,
  UserKpi,
  BonificacionMensual,
  InsertUserKpi,
  InsertBonificacionMensual
} from "@shared/schema";
import { Indicador } from "../../domain/entities/Indicador";
import { Bonificacion } from "../../domain/entities/Bonificacion";
import { KpiRepository } from "../../domain/repositories/KpiRepository";
import { calcularPorcentajeCumplimiento, determinarEstadoKpi } from "../../domain/entities/Indicador";
import { calcularBonificacion, calcularPorcentajeCumplimientoGlobal } from "../../domain/entities/Bonificacion";

/**
 * Adaptador para la base de datos que implementa el repositorio de KPIs
 * usando Drizzle ORM
 */
export class KpiDbAdapter implements KpiRepository {
  /**
   * Convierte un UserKpi de la BD a un Indicador del dominio
   */
  private mapToIndicador(dbKpi: UserKpi): Indicador {
    return {
      id: dbKpi.id,
      userId: dbKpi.userId,
      descripcion: dbKpi.descripcion,
      formula: dbKpi.formula,
      valorEsperado: Number(dbKpi.valorEsperado),
      valorObtenido: dbKpi.valorObtenido ? Number(dbKpi.valorObtenido) : undefined,
      porcentajePeso: Number(dbKpi.porcentajePeso),
      porcentajeCumplimiento: dbKpi.porcentajeCumplimiento 
        ? Number(dbKpi.porcentajeCumplimiento) 
        : undefined,
      mes: dbKpi.mes,
      estado: dbKpi.estado as EstadoKpi,
      validadoPor: dbKpi.validadoPor || undefined,
      fechaValidacion: dbKpi.fechaValidacion || undefined,
      comentariosValidacion: dbKpi.comentariosValidacion || undefined,
      createdAt: dbKpi.createdAt,
      updatedAt: dbKpi.updatedAt
    };
  }

  /**
   * Convierte una BonificacionMensual de la BD a una Bonificacion del dominio
   */
  private mapToBonificacion(dbBonificacion: BonificacionMensual): Bonificacion {
    return {
      id: dbBonificacion.id,
      userId: dbBonificacion.userId,
      mes: dbBonificacion.mes,
      salarioBase: Number(dbBonificacion.salarioBase),
      salarioVariable: Number(dbBonificacion.salarioVariable),
      bonificacionTotal: Number(dbBonificacion.bonificacionTotal),
      porcentajeCumplimientoGlobal: Number(dbBonificacion.porcentajeCumplimientoGlobal),
      estado: dbBonificacion.estado as EstadoBonificacion,
      aprobadoPor: dbBonificacion.aprobadoPor || undefined,
      fechaAprobacion: dbBonificacion.fechaAprobacion || undefined,
      comentarios: dbBonificacion.comentarios || undefined,
      createdAt: dbBonificacion.createdAt,
      updatedAt: dbBonificacion.updatedAt
    };
  }

  // Implementación de los métodos del repositorio
  async getKpisByUserAndMonth(userId: number, mes: string): Promise<Indicador[]> {
    const dbKpis = await db
      .select()
      .from(userKpis)
      .where(and(
        eq(userKpis.userId, userId),
        eq(userKpis.mes, mes)
      ));
    
    return dbKpis.map(this.mapToIndicador);
  }

  async getKpiById(id: number): Promise<Indicador | null> {
    const [dbKpi] = await db
      .select()
      .from(userKpis)
      .where(eq(userKpis.id, id));
    
    return dbKpi ? this.mapToIndicador(dbKpi) : null;
  }

  async createKpi(kpi: Omit<Indicador, 'id' | 'createdAt' | 'updatedAt'>): Promise<Indicador> {
    // Preparamos los datos para inserción según el schema de Drizzle
    const insertData: InsertUserKpi = {
      userId: kpi.userId,
      descripcion: kpi.descripcion,
      formula: kpi.formula,
      valorEsperado: kpi.valorEsperado,
      valorObtenido: kpi.valorObtenido,
      porcentajePeso: kpi.porcentajePeso,
      porcentajeCumplimiento: kpi.porcentajeCumplimiento,
      mes: kpi.mes,
      estado: kpi.estado,
      validadoPor: kpi.validadoPor,
      comentariosValidacion: kpi.comentariosValidacion
    };

    const [dbKpi] = await db
      .insert(userKpis)
      .values(insertData)
      .returning();
    
    return this.mapToIndicador(dbKpi);
  }

  async updateKpi(id: number, kpi: Partial<Indicador>): Promise<Indicador> {
    const [dbKpi] = await db
      .update(userKpis)
      .set({
        ...kpi,
        updatedAt: new Date()
      })
      .where(eq(userKpis.id, id))
      .returning();
    
    return this.mapToIndicador(dbKpi);
  }

  async evaluarKpi(id: number, valorObtenido: number): Promise<Indicador> {
    // Primero consultamos el KPI para obtener el valor esperado
    const kpi = await this.getKpiById(id);
    if (!kpi) {
      throw new Error(`No se encontró el KPI con id ${id}`);
    }

    // Calculamos el porcentaje de cumplimiento
    const porcentajeCumplimiento = calcularPorcentajeCumplimiento(
      valorObtenido,
      kpi.valorEsperado
    );

    // Determinamos el estado del KPI
    const estado = determinarEstadoKpi(porcentajeCumplimiento);

    // Actualizamos el KPI con los cálculos realizados
    const [dbKpi] = await db
      .update(userKpis)
      .set({
        valorObtenido,
        porcentajeCumplimiento,
        estado,
        updatedAt: new Date()
      })
      .where(eq(userKpis.id, id))
      .returning();
    
    return this.mapToIndicador(dbKpi);
  }

  async validarKpi(
    id: number, 
    validadorId: number, 
    aprobado: boolean, 
    comentarios?: string
  ): Promise<Indicador> {
    // Actualizamos el estado del KPI con la validación
    const [dbKpi] = await db
      .update(userKpis)
      .set({
        validadoPor: validadorId,
        comentariosValidacion: comentarios,
        fechaValidacion: new Date(),
        updatedAt: new Date()
      })
      .where(eq(userKpis.id, id))
      .returning();
    
    return this.mapToIndicador(dbKpi);
  }

  async deleteKpi(id: number): Promise<boolean> {
    const result = await db
      .delete(userKpis)
      .where(eq(userKpis.id, id));
    
    // Verificamos si se eliminó algún registro
    return result.count > 0;
  }

  async getBonificacionByUserAndMonth(userId: number, mes: string): Promise<Bonificacion | null> {
    const [dbBonificacion] = await db
      .select()
      .from(bonificacionesMensuales)
      .where(and(
        eq(bonificacionesMensuales.userId, userId),
        eq(bonificacionesMensuales.mes, mes)
      ));
    
    return dbBonificacion ? this.mapToBonificacion(dbBonificacion) : null;
  }

  async getBonificacionesByUser(userId: number): Promise<Bonificacion[]> {
    const dbBonificaciones = await db
      .select()
      .from(bonificacionesMensuales)
      .where(eq(bonificacionesMensuales.userId, userId));
    
    return dbBonificaciones.map(this.mapToBonificacion);
  }

  async calcularBonificacion(
    userId: number, 
    mes: string,
    salarioBase: number,
    salarioVariable: number
  ): Promise<Bonificacion> {
    // Obtenemos todos los KPIs del usuario para el mes
    const kpis = await this.getKpisByUserAndMonth(userId, mes);
    
    if (kpis.length === 0) {
      throw new Error(`No hay KPIs definidos para el usuario ${userId} en el mes ${mes}`);
    }
    
    // Filtramos solo KPIs que tienen valores obtenidos
    const kpisConResultados = kpis
      .filter(kpi => kpi.valorObtenido !== undefined && kpi.porcentajeCumplimiento !== undefined)
      .map(kpi => ({
        porcentajeCumplimiento: kpi.porcentajeCumplimiento || 0,
        porcentajePeso: kpi.porcentajePeso
      }));
    
    // Calculamos el porcentaje global de cumplimiento
    const porcentajeCumplimientoGlobal = calcularPorcentajeCumplimientoGlobal(kpisConResultados);
    
    // Calculamos la bonificación
    const bonificacionTotal = calcularBonificacion(salarioVariable, porcentajeCumplimientoGlobal);
    
    // Verificamos si ya existe una bonificación para ese mes
    const bonificacionExistente = await this.getBonificacionByUserAndMonth(userId, mes);
    
    if (bonificacionExistente) {
      // Actualizamos la bonificación existente
      const [dbBonificacion] = await db
        .update(bonificacionesMensuales)
        .set({
          salarioBase,
          salarioVariable,
          bonificacionTotal,
          porcentajeCumplimientoGlobal,
          estado: EstadoBonificacion.CALCULADO, // Si se recalcula, vuelve a estado inicial
          updatedAt: new Date()
        })
        .where(eq(bonificacionesMensuales.id, bonificacionExistente.id))
        .returning();
      
      return this.mapToBonificacion(dbBonificacion);
    } else {
      // Creamos una nueva bonificación
      const insertData: InsertBonificacionMensual = {
        userId,
        mes,
        salarioBase,
        salarioVariable,
        bonificacionTotal,
        porcentajeCumplimientoGlobal,
        estado: EstadoBonificacion.CALCULADO
      };
      
      const [dbBonificacion] = await db
        .insert(bonificacionesMensuales)
        .values(insertData)
        .returning();
      
      return this.mapToBonificacion(dbBonificacion);
    }
  }

  async aprobarBonificacion(
    id: number, 
    aprobadorId: number, 
    aprobada: boolean, 
    comentarios?: string
  ): Promise<Bonificacion> {
    // Actualizamos el estado de la bonificación
    const [dbBonificacion] = await db
      .update(bonificacionesMensuales)
      .set({
        estado: aprobada ? EstadoBonificacion.APROBADO : EstadoBonificacion.RECHAZADO,
        aprobadoPor: aprobadorId,
        fechaAprobacion: new Date(),
        comentarios,
        updatedAt: new Date()
      })
      .where(eq(bonificacionesMensuales.id, id))
      .returning();
    
    return this.mapToBonificacion(dbBonificacion);
  }
}