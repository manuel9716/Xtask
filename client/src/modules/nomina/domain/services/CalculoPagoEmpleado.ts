/**
 * Servicio de dominio para calcular pagos de empleados
 */

import { Employee } from '@shared/schema';
import { DetalleDeduccion, DetalleBeneficio } from '../entities/Nomina';

export interface ResultadoCalculoPago {
  sueldoBruto: number;
  sueldoNeto: number;
  deducciones: number;
  beneficios: number;
  impuestos: number;
  detalleDeducciones: DetalleDeduccion[];
  detalleBeneficios: DetalleBeneficio[];
  detalleImpuestos: DetalleDeduccion[];
}

/**
 * Clase para calcular el pago de un empleado
 */
export class CalculoPagoEmpleado {
  /**
   * Calcula el pago para un empleado en un periodo específico
   * @param empleado Datos del empleado
   * @param fechaInicio Inicio del periodo de pago
   * @param fechaFin Fin del periodo de pago
   * @returns Resultado del cálculo con todos los detalles
   */
  public static calcularPago(
    empleado: Employee,
    fechaInicio: Date,
    fechaFin: Date
  ): ResultadoCalculoPago {
    // Convertir salary a número si es string
    const sueldo = typeof empleado.salary === 'string' 
      ? parseFloat(empleado.salary) 
      : (empleado.salary || 0);
    
    // Convertir taxRate a número si es string
    const tasaImpuestos = typeof empleado.taxRate === 'string'
      ? parseFloat(empleado.taxRate)
      : (empleado.taxRate || 0);
    
    // Calcular días del periodo
    const diasPeriodo = this.calcularDiasPeriodo(fechaInicio, fechaFin);
    
    // Calcular sueldo bruto según el periodo
    const sueldoBruto = this.calcularSueldoBruto(sueldo, diasPeriodo);
    
    // Calcular deducciones
    const detalleDeducciones = this.calcularDeducciones(empleado, sueldoBruto);
    const totalDeducciones = detalleDeducciones.reduce(
      (acc, deduccion) => acc + deduccion.monto,
      0
    );
    
    // Calcular impuestos
    const detalleImpuestos = this.calcularImpuestos(empleado, sueldoBruto);
    const totalImpuestos = detalleImpuestos.reduce(
      (acc, impuesto) => acc + impuesto.monto,
      0
    );
    
    // Calcular beneficios
    const detalleBeneficios = this.calcularBeneficios(empleado, sueldoBruto);
    const totalBeneficios = detalleBeneficios.reduce(
      (acc, beneficio) => acc + beneficio.monto,
      0
    );
    
    // Calcular sueldo neto
    const sueldoNeto = sueldoBruto - totalDeducciones - totalImpuestos + totalBeneficios;
    
    return {
      sueldoBruto,
      sueldoNeto,
      deducciones: totalDeducciones,
      beneficios: totalBeneficios,
      impuestos: totalImpuestos,
      detalleDeducciones,
      detalleBeneficios,
      detalleImpuestos
    };
  }
  
  /**
   * Calcula el número de días dentro del periodo de pago
   */
  private static calcularDiasPeriodo(fechaInicio: Date, fechaFin: Date): number {
    const diffTime = Math.abs(fechaFin.getTime() - fechaInicio.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1; // +1 para incluir ambos días
    return diffDays;
  }
  
  /**
   * Calcula el sueldo bruto para el periodo
   */
  private static calcularSueldoBruto(sueldoMensual: number, diasPeriodo: number): number {
    // Asumir que el sueldo es mensual (30 días)
    const sueldoDiario = sueldoMensual / 30;
    return sueldoDiario * diasPeriodo;
  }
  
  /**
   * Calcula las deducciones aplicables al empleado
   */
  private static calcularDeducciones(empleado: Employee, sueldoBruto: number): DetalleDeduccion[] {
    const deducciones: DetalleDeduccion[] = [];
    
    // Seguridad social (fijo 4%)
    const tasaSegSocial = 0.04;
    deducciones.push({
      concepto: 'Seguridad Social',
      monto: sueldoBruto * tasaSegSocial,
      porcentaje: tasaSegSocial * 100,
      esObligatoria: true
    });
    
    // Fondo de pensiones (fijo 4%)
    const tasaPensiones = 0.04;
    deducciones.push({
      concepto: 'Fondo de Pensiones',
      monto: sueldoBruto * tasaPensiones,
      porcentaje: tasaPensiones * 100,
      esObligatoria: true
    });
    
    // Seguro de salud (fijo 2.5%)
    const tasaSalud = 0.025;
    deducciones.push({
      concepto: 'Seguro de Salud',
      monto: sueldoBruto * tasaSalud,
      porcentaje: tasaSalud * 100,
      esObligatoria: true
    });
    
    // Otras deducciones que podrían venir del empleado
    if (empleado.deductions) {
      const otrasDeducciones = typeof empleado.deductions === 'string'
        ? parseFloat(empleado.deductions)
        : empleado.deductions;
      
      if (otrasDeducciones > 0) {
        deducciones.push({
          concepto: 'Otras Deducciones',
          monto: otrasDeducciones,
          esObligatoria: false
        });
      }
    }
    
    return deducciones;
  }
  
  /**
   * Calcula los impuestos aplicables
   */
  private static calcularImpuestos(empleado: Employee, sueldoBruto: number): DetalleDeduccion[] {
    const impuestos: DetalleDeduccion[] = [];
    
    // Impuesto sobre la renta
    const tasaImpuesto = typeof empleado.taxRate === 'string'
      ? parseFloat(empleado.taxRate) / 100
      : (empleado.taxRate || 0) / 100;
    
    if (tasaImpuesto > 0) {
      impuestos.push({
        concepto: 'Impuesto sobre la Renta',
        monto: sueldoBruto * tasaImpuesto,
        porcentaje: tasaImpuesto * 100,
        esObligatoria: true
      });
    } else {
      // Tasa por defecto si no hay una específica
      const tasaPorDefecto = 0.15; // 15%
      impuestos.push({
        concepto: 'Impuesto sobre la Renta (tasa estándar)',
        monto: sueldoBruto * tasaPorDefecto,
        porcentaje: tasaPorDefecto * 100,
        esObligatoria: true
      });
    }
    
    return impuestos;
  }
  
  /**
   * Calcula los beneficios aplicables
   */
  private static calcularBeneficios(empleado: Employee, sueldoBruto: number): DetalleBeneficio[] {
    const beneficios: DetalleBeneficio[] = [];
    
    // Bono por rendimiento (si aplica)
    if (empleado.performanceBonus) {
      const bonusValor = typeof empleado.performanceBonus === 'string'
        ? parseFloat(empleado.performanceBonus)
        : empleado.performanceBonus;
      
      if (bonusValor > 0) {
        beneficios.push({
          concepto: 'Bono por Rendimiento',
          monto: bonusValor,
          descripcion: 'Bono basado en evaluación de desempeño'
        });
      }
    }
    
    // Subsidio de transporte (fijo para todos)
    beneficios.push({
      concepto: 'Subsidio de Transporte',
      monto: 50, // Valor fijo para ejemplo
      descripcion: 'Apoyo para gastos de transporte'
    });
    
    // Otras bonificaciones basadas en antigüedad
    if (empleado.hireDate) {
      const fechaContratacion = new Date(empleado.hireDate);
      const hoy = new Date();
      const aniosAntiguedad = hoy.getFullYear() - fechaContratacion.getFullYear();
      
      if (aniosAntiguedad >= 5) {
        // Bonificación por 5+ años de servicio
        const bonoPorAntiguedad = sueldoBruto * 0.03; // 3% del sueldo bruto
        beneficios.push({
          concepto: 'Bono por Antigüedad',
          monto: bonoPorAntiguedad,
          descripcion: `Por ${aniosAntiguedad} años de servicio`
        });
      }
    }
    
    return beneficios;
  }
}