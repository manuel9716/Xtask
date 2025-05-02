import { Indicador } from "../../domain/entities/Indicador";
import { KpiRepository } from "../../domain/repositories/KpiRepository";

/**
 * Caso de uso: Listar los KPIs de un usuario para un mes específico
 */
export class ListarKpisUsuarioUseCase {
  constructor(private kpiRepository: KpiRepository) {}

  /**
   * Ejecuta el caso de uso para listar los KPIs de un usuario
   */
  async execute(params: {
    userId: number;
    mes: string; // formato: "YYYY-MM"
  }): Promise<Indicador[]> {
    // Formatear y validar el mes (YYYY-MM)
    if (!/^\d{4}-\d{2}$/.test(params.mes)) {
      throw new Error("El formato del mes debe ser YYYY-MM");
    }

    // Obtener los KPIs a través del repositorio
    return this.kpiRepository.getKpisByUserAndMonth(
      params.userId,
      params.mes
    );
  }

  /**
   * Obtiene los meses para los que un usuario tiene KPIs registrados
   */
  async obtenerMesesConKpis(userId: number): Promise<string[]> {
    // Esta función requiere extender el repositorio o usar otra estrategia
    // para obtener todos los meses únicos para los que un usuario tiene KPIs.
    // Es una propuesta para extender la funcionalidad.
    
    // Por ahora, podemos retornar un array vacío
    return [];
  }
}