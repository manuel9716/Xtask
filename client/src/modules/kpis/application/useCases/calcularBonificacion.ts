import { 
  calcularPorcentajeCumplimientoGlobal, 
  calcularMontoBonificacion,
  Bonificacion, 
  EstadoBonificacion 
} from "../../domain/entities/Bonificacion";
import { KpiRepository } from "../../domain/repositories/KpiRepository";

/**
 * Caso de uso para calcular la bonificación mensual de un empleado
 * Este caso de uso implementa la lógica de negocio para:
 * 1. Obtener los KPIs evaluados de un usuario para un mes específico
 * 2. Calcular el porcentaje de cumplimiento global
 * 3. Calcular el monto de bonificación basado en el salario variable
 * 4. Crear o actualizar el registro de bonificación
 */
export class CalcularBonificacionUseCase {
  constructor(private kpiRepository: KpiRepository) {}

  /**
   * Ejecuta el cálculo de la bonificación
   * @param userId ID del usuario/empleado
   * @param mes Mes en formato YYYY-MM
   * @param salarioBase Salario base del empleado
   * @param salarioVariable Componente variable del salario (bonificación máxima)
   * @returns Registro de bonificación con los cálculos
   */
  async execute(
    userId: number,
    mes: string,
    salarioBase: number,
    salarioVariable: number
  ): Promise<Bonificacion> {
    // Obtener todos los KPIs evaluados para el mes
    const kpis = await this.kpiRepository.getUserKpis(userId);
    
    // Filtrar KPIs que ya tengan un porcentaje de cumplimiento calculado
    const kpisEvaluados = kpis.filter(kpi => 
      kpi.porcentajeCumplimiento !== undefined && 
      kpi.porcentajeCumplimiento !== null
    );
    
    // Calcular el porcentaje de cumplimiento global
    const porcentajeCumplimientoGlobal = calcularPorcentajeCumplimientoGlobal(
      kpisEvaluados.map(kpi => ({
        porcentajePeso: kpi.porcentajePeso,
        porcentajeCumplimiento: kpi.porcentajeCumplimiento
      }))
    );
    
    // Calcular el monto de bonificación
    const bonificacionTotal = calcularMontoBonificacion(
      salarioVariable,
      porcentajeCumplimientoGlobal
    );
    
    // Crear o actualizar la bonificación en el repositorio
    return this.kpiRepository.calcularBonificacion(
      userId,
      mes,
      salarioBase,
      salarioVariable
    );
  }
}