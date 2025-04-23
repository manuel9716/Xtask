import { Presupuesto, PresupuestoEstado } from "../entities/Presupuesto";

/**
 * Servicio de dominio para cálculo de ejecución de presupuestos
 */
export class CalculoEjecucion {
  /**
   * Calcula el porcentaje de ejecución de un presupuesto
   * @param gastado Monto gastado
   * @param monto Monto total del presupuesto
   * @returns Porcentaje de ejecución (0-100)
   */
  static calcularPorcentajeEjecucion(gastado: number, monto: number): number {
    if (monto <= 0) return 0;
    const porcentaje = (gastado / monto) * 100;
    return Math.min(Math.max(porcentaje, 0), 100); // Limitar entre 0 y 100
  }

  /**
   * Determina el estado de un presupuesto en base a su porcentaje de ejecución
   * @param porcentaje Porcentaje de ejecución (0-100)
   * @returns Estado del presupuesto (ACTIVO, ALERTA, COMPLETADO)
   */
  static determinarEstado(porcentaje: number): PresupuestoEstado {
    if (porcentaje >= 95) {
      return 'COMPLETADO';
    } else if (porcentaje >= 80) {
      return 'ALERTA';
    } else {
      return 'ACTIVO';
    }
  }

  /**
   * Actualiza el estado y porcentaje de ejecución de un presupuesto
   * @param presupuesto Presupuesto a actualizar
   * @returns Presupuesto con estado y porcentaje actualizados
   */
  static actualizarEstado(presupuesto: Presupuesto): Presupuesto {
    const porcentaje = this.calcularPorcentajeEjecucion(presupuesto.gastado, presupuesto.monto);
    const estado = this.determinarEstado(porcentaje);
    
    return {
      ...presupuesto,
      porcentajeEjecucion: porcentaje,
      estado
    };
  }
}