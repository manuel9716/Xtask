import { PresupuestoEstado } from '../entities/Presupuesto';

/**
 * Servicio de dominio para calcular el porcentaje de ejecución y determinar el estado
 * del presupuesto basado en los umbrales
 */
export class CalculoEjecucion {
  /**
   * Calcula el porcentaje de ejecución de un presupuesto
   * @param gastado Monto gastado
   * @param monto Monto total del presupuesto
   * @returns Porcentaje de ejecución (0-100)
   */
  calcularPorcentajeEjecucion(gastado: number, monto: number): number {
    if (monto <= 0) return 0;
    return (gastado / monto) * 100;
  }

  /**
   * Determina el estado de un presupuesto basado en el porcentaje de ejecución
   * y las reglas de negocio
   * @param porcentajeEjecucion Porcentaje de ejecución (0-100)
   * @returns Estado del presupuesto según las reglas de negocio
   */
  determinarEstado(porcentajeEjecucion: number): PresupuestoEstado {
    if (porcentajeEjecucion >= 95) {
      return 'COMPLETADO';
    } else if (porcentajeEjecucion >= 80) {
      return 'ALERTA';
    } else {
      return 'ACTIVO';
    }
  }

  /**
   * Función combinada que calcula el porcentaje y determina el estado
   * @param gastado Monto gastado
   * @param monto Monto total del presupuesto
   * @returns Objeto con el porcentaje de ejecución y el estado
   */
  calcularEjecucionYEstado(gastado: number, monto: number): { porcentajeEjecucion: number, estado: PresupuestoEstado } {
    const porcentajeEjecucion = this.calcularPorcentajeEjecucion(gastado, monto);
    const estado = this.determinarEstado(porcentajeEjecucion);
    
    return {
      porcentajeEjecucion,
      estado
    };
  }
}