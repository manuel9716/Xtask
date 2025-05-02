import { Indicador, EstadoKpi } from "../../domain/entities/Indicador";
import { KpiRepository } from "../../domain/repositories/KpiRepository";

/**
 * Caso de uso: Crear un nuevo KPI para un usuario
 */
export class CrearKpiUseCase {
  constructor(private kpiRepository: KpiRepository) {}

  /**
   * Ejecuta el caso de uso para crear un nuevo KPI
   */
  async execute(params: {
    userId: number;
    descripcion: string;
    formula: string;
    valorEsperado: number;
    porcentajePeso: number;
    mes: string; // formato: "YYYY-MM"
  }): Promise<Indicador> {
    // Validaciones de negocio
    if (params.porcentajePeso <= 0 || params.porcentajePeso > 100) {
      throw new Error("El porcentaje de peso debe estar entre 0 y 100");
    }

    if (params.valorEsperado <= 0) {
      throw new Error("El valor esperado debe ser mayor que cero");
    }

    // Formatear y validar el mes (YYYY-MM)
    if (!/^\d{4}-\d{2}$/.test(params.mes)) {
      throw new Error("El formato del mes debe ser YYYY-MM");
    }

    // Verificamos que la fecha sea válida
    const [year, month] = params.mes.split("-").map(Number);
    const date = new Date(year, month - 1);
    if (isNaN(date.getTime()) || date.getMonth() !== month - 1) {
      throw new Error("La fecha proporcionada no es válida");
    }

    // Crear el KPI con estado inicial PENDIENTE
    const nuevoKpi: Omit<Indicador, 'id' | 'createdAt' | 'updatedAt'> = {
      userId: params.userId,
      descripcion: params.descripcion,
      formula: params.formula,
      valorEsperado: params.valorEsperado,
      porcentajePeso: params.porcentajePeso,
      mes: params.mes,
      estado: EstadoKpi.PENDIENTE
    };

    // Persistir el KPI usando el repositorio
    return this.kpiRepository.createKpi(nuevoKpi);
  }
}