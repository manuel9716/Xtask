import { Indicador, calcularPorcentajeCumplimiento, determinarEstadoKpi } from "../../domain/entities/Indicador";
import { KpiRepository } from "../../domain/repositories/KpiRepository";

/**
 * Caso de uso: Evaluar un KPI registrando su valor obtenido
 * y calculando su porcentaje de cumplimiento
 */
export class EvaluarKpiUseCase {
  constructor(private kpiRepository: KpiRepository) {}

  /**
   * Ejecuta el caso de uso para evaluar un KPI
   */
  async execute(params: {
    kpiId: number;
    valorObtenido: number;
  }): Promise<Indicador> {
    // Validaciones de negocio
    if (params.valorObtenido < 0) {
      throw new Error("El valor obtenido no puede ser negativo");
    }

    // Obtener el KPI actual
    const kpi = await this.kpiRepository.getKpiById(params.kpiId);
    if (!kpi) {
      throw new Error(`No se encontró el KPI con id ${params.kpiId}`);
    }

    // Verificar que el KPI no esté ya validado por un superior
    if (kpi.validadoPor) {
      throw new Error("No se puede evaluar un KPI que ya ha sido validado");
    }

    // Calcular el porcentaje de cumplimiento
    const valorEsperado = kpi.valorEsperado;
    const porcentajeCumplimiento = calcularPorcentajeCumplimiento(
      params.valorObtenido,
      valorEsperado
    );

    // Determinar el estado del KPI basado en el porcentaje de cumplimiento
    const estado = determinarEstadoKpi(porcentajeCumplimiento);

    // Actualizar el KPI con el resultado y cálculos
    return this.kpiRepository.evaluarKpi(params.kpiId, params.valorObtenido);
  }
}