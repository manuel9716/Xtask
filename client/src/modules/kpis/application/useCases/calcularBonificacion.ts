import { Bonificacion, EstadoBonificacion, calcularBonificacion, calcularPorcentajeCumplimientoGlobal } from "../../domain/entities/Bonificacion";
import { KpiRepository } from "../../domain/repositories/KpiRepository";

/**
 * Caso de uso: Calcular la bonificación mensual de un usuario
 * basada en sus KPIs y datos salariales
 */
export class CalcularBonificacionUseCase {
  constructor(private kpiRepository: KpiRepository) {}

  /**
   * Ejecuta el caso de uso para calcular la bonificación mensual
   */
  async execute(params: {
    userId: number;
    mes: string; // formato: "YYYY-MM"
    salarioBase: number;
    salarioVariable: number;
  }): Promise<Bonificacion> {
    // Validaciones de negocio
    if (params.salarioBase < 0 || params.salarioVariable < 0) {
      throw new Error("Los valores salariales no pueden ser negativos");
    }

    // Formatear y validar el mes (YYYY-MM)
    if (!/^\d{4}-\d{2}$/.test(params.mes)) {
      throw new Error("El formato del mes debe ser YYYY-MM");
    }

    // Obtener todos los KPIs del usuario para el mes
    const kpis = await this.kpiRepository.getKpisByUserAndMonth(
      params.userId,
      params.mes
    );

    // Verificar que existan KPIs para el mes
    if (kpis.length === 0) {
      throw new Error("No hay KPIs definidos para calcular la bonificación del mes");
    }

    // Verificar que todos los KPIs tengan valores obtenidos
    const kpisSinResultados = kpis.filter(kpi => kpi.valorObtenido === undefined);
    if (kpisSinResultados.length > 0) {
      throw new Error(`Hay ${kpisSinResultados.length} KPI(s) sin resultados registrados`);
    }

    // Preparar los datos para el cálculo global
    const kpisConResultados = kpis.map(kpi => ({
      porcentajeCumplimiento: kpi.porcentajeCumplimiento || 0,
      porcentajePeso: kpi.porcentajePeso
    }));

    // Calcular el porcentaje global de cumplimiento
    const porcentajeCumplimientoGlobal = calcularPorcentajeCumplimientoGlobal(kpisConResultados);

    // Calcular la bonificación basada en el porcentaje global de cumplimiento
    const bonificacionTotal = calcularBonificacion(params.salarioVariable, porcentajeCumplimientoGlobal);

    // Registrar la bonificación
    return this.kpiRepository.calcularBonificacion(
      params.userId,
      params.mes,
      params.salarioBase,
      params.salarioVariable
    );
  }
}