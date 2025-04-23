import { EstadoPresupuesto } from '../entities/Presupuesto';

/**
 * Servicio de dominio para cálculos y evaluaciones relacionados con presupuestos
 * Contiene la lógica de negocio relacionada con los cálculos de ejecución y evaluación de estados
 */
export class CalculoEjecucionService {
  /**
   * Calcula el porcentaje de ejecución de un presupuesto
   * @param gastado Monto gastado
   * @param presupuesto Monto total presupuestado
   * @returns Porcentaje de ejecución (de 0 a 100)
   */
  calcularPorcentajeEjecucion(gastado: number, presupuesto: number): number {
    if (presupuesto <= 0) return 0;
    const porcentaje = (gastado / presupuesto) * 100;
    return Math.min(Math.round(porcentaje * 100) / 100, 100); // Redondear a 2 decimales y máximo 100%
  }

  /**
   * Determina el estado de un presupuesto basado en su porcentaje de ejecución
   * @param porcentajeEjecucion Porcentaje de ejecución del presupuesto
   * @returns Estado del presupuesto (ACTIVO, EN_RIESGO o CRITICO)
   */
  determinarEstado(porcentajeEjecucion: number): EstadoPresupuesto {
    if (porcentajeEjecucion < 80) {
      return EstadoPresupuesto.ACTIVO;
    } else if (porcentajeEjecucion >= 80 && porcentajeEjecucion < 95) {
      return EstadoPresupuesto.EN_RIESGO;
    } else {
      return EstadoPresupuesto.CRITICO;
    }
  }

  /**
   * Valida si un gasto puede ser aplicado a un presupuesto
   * @param montoGasto Monto del gasto a validar
   * @param gastadoActual Monto actual gastado del presupuesto
   * @param montoPresupuesto Monto total del presupuesto
   * @returns Objeto con la validación y mensaje
   */
  validarGasto(montoGasto: number, gastadoActual: number, montoPresupuesto: number): { valido: boolean; mensaje: string } {
    if (montoGasto <= 0) {
      return { valido: false, mensaje: 'El monto del gasto debe ser mayor a cero' };
    }

    const nuevoGastado = gastadoActual + montoGasto;
    if (nuevoGastado > montoPresupuesto) {
      const excedente = nuevoGastado - montoPresupuesto;
      return { 
        valido: false, 
        mensaje: `El gasto excede el presupuesto disponible por ${excedente.toFixed(2)}` 
      };
    }

    return { valido: true, mensaje: 'Gasto válido' };
  }
}