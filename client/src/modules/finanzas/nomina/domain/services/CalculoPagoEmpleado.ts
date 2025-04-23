import { Employee } from "@shared/schema";

/**
 * Resultado del cálculo de pago a un empleado
 */
export interface ResultadoCalculoPago {
  empleadoId: number;
  sueldoBruto: number;
  deduccionesFijas: number; // Deducciones predefinidas del empleado
  deduccionesAdicionales: number; // Deducciones específicas para este periodo
  impuestos: number;
  beneficiosFijos: number; // Beneficios predefinidos del empleado
  beneficiosAdicionales: number; // Beneficios específicos para este periodo
  sueldoNeto: number;
  detalles: Record<string, any>; // Detalles del cálculo para mostrar en el PDF
}

/**
 * Parámetros adicionales para el cálculo de pago
 */
export interface ParametrosCalculo {
  deduccionesAdicionales?: number[];
  beneficiosAdicionales?: number[];
  horasExtra?: number;
  tarifaHorasExtra?: number;
}

/**
 * Servicio de dominio encargado de calcular el pago a un empleado
 * Implementa la lógica de negocio para el cálculo de pagos
 */
export class CalculoPagoEmpleado {
  /**
   * Calcula el pago para un empleado
   * @param empleado El empleado al que se calculará el pago
   * @param deduccionesAdicionales Deducciones adicionales para este periodo
   * @param beneficiosAdicionales Beneficios adicionales para este periodo
   * @returns El resultado del cálculo de pago
   */
  calcularPago(
    empleado: Employee,
    params?: ParametrosCalculo
  ): ResultadoCalculoPago {
    // Valores por defecto en caso de que no estén definidos en el empleado
    const salarioBruto = parseFloat(empleado.salary || '0');
    const deduccionesFijas = parseFloat(empleado.baseDeductions || '0');
    const beneficiosFijos = parseFloat(empleado.baseBenefits || '0');
    const tasaImpuestos = parseFloat(empleado.taxRate || '0.16'); // 16% por defecto si no está definido
    
    // Deducciones y beneficios adicionales (si se proporcionan)
    const deduccionesAdicionales = (params?.deduccionesAdicionales || []).reduce(
      (total, valor) => total + valor,
      0
    );
    
    const beneficiosAdicionales = (params?.beneficiosAdicionales || []).reduce(
      (total, valor) => total + valor,
      0
    );
    
    // Cálculo de horas extra si aplica
    let pagoHorasExtra = 0;
    if (params?.horasExtra && params?.horasExtra > 0 && params?.tarifaHorasExtra) {
      pagoHorasExtra = params.horasExtra * params.tarifaHorasExtra;
    }
    
    // Base imponible para impuestos (salario + beneficios - algunas deducciones según normativa)
    const baseImponible = salarioBruto + pagoHorasExtra;
    
    // Cálculo de impuestos
    const impuestos = this.calcularImpuestos(baseImponible, tasaImpuestos);
    
    // Cálculo de deducciones totales
    const totalDeducciones = deduccionesFijas + deduccionesAdicionales;
    
    // Cálculo de beneficios totales
    const totalBeneficios = beneficiosFijos + beneficiosAdicionales + pagoHorasExtra;
    
    // Cálculo del sueldo neto
    const sueldoNeto = salarioBruto + totalBeneficios - totalDeducciones - impuestos;
    
    // Conceptos detallados para mostrar en el PDF
    const conceptos = {
      ingresos: [
        { concepto: 'Sueldo Base', monto: salarioBruto }
      ],
      beneficios: [
        { concepto: 'Beneficios Fijos', monto: beneficiosFijos }
      ],
      deducciones: [
        { concepto: 'Deducciones Fijas', monto: deduccionesFijas },
        { concepto: 'Impuestos', monto: impuestos }
      ]
    };
    
    // Agregar horas extra si aplica
    if (pagoHorasExtra > 0) {
      conceptos.beneficios.push({ 
        concepto: `Horas Extra (${params?.horasExtra} hrs)`, 
        monto: pagoHorasExtra 
      });
    }
    
    // Agregar beneficios adicionales si hay
    if (beneficiosAdicionales > 0) {
      conceptos.beneficios.push({ 
        concepto: 'Beneficios Adicionales', 
        monto: beneficiosAdicionales 
      });
    }
    
    // Agregar deducciones adicionales si hay
    if (deduccionesAdicionales > 0) {
      conceptos.deducciones.push({ 
        concepto: 'Deducciones Adicionales', 
        monto: deduccionesAdicionales 
      });
    }
    
    return {
      empleadoId: empleado.id,
      sueldoBruto: salarioBruto,
      deduccionesFijas,
      deduccionesAdicionales,
      impuestos,
      beneficiosFijos,
      beneficiosAdicionales,
      sueldoNeto,
      detalles: {
        conceptos,
        nombre: empleado.position,
        departamento: empleado.department,
        fechaContratacion: empleado.hireDate,
        tipoContrato: empleado.contractType
      }
    };
  }
  
  /**
   * Calcula los impuestos basados en una tasa fija
   * En una implementación real, esto sería mucho más complejo con tramos impositivos
   */
  private calcularImpuestos(baseImponible: number, tasaImpuestos: number): number {
    return baseImponible * tasaImpuestos;
  }
  
  /**
   * Calcula el total a pagar para una lista de empleados
   */
  calcularTotalNomina(resultados: ResultadoCalculoPago[]): {
    totalBruto: number;
    totalNeto: number;
    totalDeducciones: number;
    totalBeneficios: number;
    totalImpuestos: number;
  } {
    return resultados.reduce(
      (acumulado, resultado) => {
        return {
          totalBruto: acumulado.totalBruto + resultado.sueldoBruto,
          totalNeto: acumulado.totalNeto + resultado.sueldoNeto,
          totalDeducciones: acumulado.totalDeducciones + resultado.deduccionesFijas + resultado.deduccionesAdicionales,
          totalBeneficios: acumulado.totalBeneficios + resultado.beneficiosFijos + resultado.beneficiosAdicionales,
          totalImpuestos: acumulado.totalImpuestos + resultado.impuestos
        };
      },
      {
        totalBruto: 0,
        totalNeto: 0,
        totalDeducciones: 0,
        totalBeneficios: 0,
        totalImpuestos: 0
      }
    );
  }
}