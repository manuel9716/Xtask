import { PresupuestoEstado } from '../entities/Presupuesto';

/**
 * Servicio de dominio para el cálculo de la ejecución de presupuestos
 * Calcula el porcentaje de ejecución y determina el estado del presupuesto
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
    const porcentaje = (gastado / monto) * 100;
    return Math.min(Math.max(porcentaje, 0), 100); // Limitar entre 0 y 100
  }

  /**
   * Determina el estado de un presupuesto según su porcentaje de ejecución
   * ACTIVO: < 80%
   * ALERTA: Entre 80% y 95%
   * COMPLETADO: >= 95%
   * 
   * @param porcentajeEjecucion Porcentaje de ejecución del presupuesto
   * @returns Estado del presupuesto
   */
  determinarEstado(porcentajeEjecucion: number): PresupuestoEstado {
    if (porcentajeEjecucion < 80) {
      return 'ACTIVO';
    } else if (porcentajeEjecucion < 95) {
      return 'ALERTA';
    } else {
      return 'COMPLETADO';
    }
  }

  /**
   * Actualiza el porcentaje de ejecución y estado de un presupuesto
   * @param gastado Monto gastado
   * @param monto Monto total del presupuesto
   * @returns Objeto con el porcentaje de ejecución y el estado
   */
  actualizarEjecucion(gastado: number, monto: number): { porcentajeEjecucion: number, estado: PresupuestoEstado } {
    const porcentajeEjecucion = this.calcularPorcentajeEjecucion(gastado, monto);
    const estado = this.determinarEstado(porcentajeEjecucion);
    
    return {
      porcentajeEjecucion,
      estado
    };
  }
}