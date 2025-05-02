import { Bonificacion } from "../../domain/entities/Bonificacion";
import { Indicador } from "../../domain/entities/Indicador";
import { KpiRepository } from "../../domain/repositories/KpiRepository";

/**
 * Caso de uso: Aprobar los KPIs mensuales y la bonificación de un usuario
 * por parte de un supervisor
 */
export class AprobarKpisMensualesUseCase {
  constructor(private kpiRepository: KpiRepository) {}

  /**
   * Ejecuta el caso de uso para aprobar KPIs y bonificación mensual
   */
  async execute(params: {
    userId: number;
    mes: string; // formato: "YYYY-MM"
    validadorId: number; // ID del supervisor que valida
    kpis: Array<{
      id: number;
      aprobado: boolean;
      comentario?: string;
    }>;
    bonificacionId: number;
    aprobarBonificacion: boolean;
    comentariosBonificacion?: string;
  }): Promise<{
    kpisValidados: Indicador[];
    bonificacion: Bonificacion;
  }> {
    // Formatear y validar el mes (YYYY-MM)
    if (!/^\d{4}-\d{2}$/.test(params.mes)) {
      throw new Error("El formato del mes debe ser YYYY-MM");
    }

    // Verificar que el validador sea diferente del usuario
    if (params.userId === params.validadorId) {
      throw new Error("Un usuario no puede aprobar sus propios KPIs");
    }

    // Validar cada KPI individualmente
    const kpisPromises = params.kpis.map(async (kpiData) => {
      return this.kpiRepository.validarKpi(
        kpiData.id,
        params.validadorId,
        kpiData.aprobado,
        kpiData.comentario
      );
    });

    const kpisValidados = await Promise.all(kpisPromises);

    // Aprobar o rechazar la bonificación
    const bonificacion = await this.kpiRepository.aprobarBonificacion(
      params.bonificacionId,
      params.validadorId,
      params.aprobarBonificacion,
      params.comentariosBonificacion
    );

    return {
      kpisValidados,
      bonificacion
    };
  }
}