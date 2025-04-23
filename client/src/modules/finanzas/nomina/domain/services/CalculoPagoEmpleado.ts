import { Employee } from '@shared/schema';

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
    deduccionesAdicionales: { concepto: string; monto: number }[] = [],
    beneficiosAdicionales: { concepto: string; monto: number }[] = []
  ): ResultadoCalculoPago {
    if (!empleado.salary) {
      throw new Error(`El empleado ${empleado.id} no tiene un salario definido`);
    }

    // Convertir el salario a número desde string (decimal en la BD)
    const sueldoBruto = parseFloat(empleado.salary.toString());
    
    // Calcular deducciones fijas (si están definidas en el empleado)
    const deduccionesFijas = 
      empleado.baseDeductions ? parseFloat(empleado.baseDeductions.toString()) : 0;
    
    // Calcular deducciones adicionales
    const montoDeduccionesAdicionales = deduccionesAdicionales.reduce(
      (total, deduccion) => total + deduccion.monto, 0
    );
    
    // Calcular beneficios fijos (si están definidos en el empleado)
    const beneficiosFijos = 
      empleado.baseBenefits ? parseFloat(empleado.baseBenefits.toString()) : 0;
    
    // Calcular beneficios adicionales
    const montoBeneficiosAdicionales = beneficiosAdicionales.reduce(
      (total, beneficio) => total + beneficio.monto, 0
    );
    
    // Calcular impuestos basados en la tasa del empleado o una tasa por defecto
    const tasaImpuestos = empleado.taxRate 
      ? parseFloat(empleado.taxRate.toString()) 
      : 0.1; // 10% por defecto
    
    const impuestos = sueldoBruto * tasaImpuestos;
    
    // Calcular sueldo neto
    const sueldoNeto = sueldoBruto - deduccionesFijas - montoDeduccionesAdicionales - impuestos + beneficiosFijos + montoBeneficiosAdicionales;
    
    // Crear detalles para mostrar en el PDF
    const detalles = {
      conceptos: {
        ingresos: [
          { concepto: 'Sueldo Base', monto: sueldoBruto }
        ],
        beneficios: [
          { concepto: 'Beneficios Fijos', monto: beneficiosFijos },
          ...beneficiosAdicionales
        ],
        deducciones: [
          { concepto: 'Deducciones Fijas', monto: deduccionesFijas },
          { concepto: 'Impuestos', monto: impuestos },
          ...deduccionesAdicionales
        ]
      },
      totales: {
        totalIngresos: sueldoBruto + beneficiosFijos + montoBeneficiosAdicionales,
        totalDeducciones: deduccionesFijas + montoDeduccionesAdicionales + impuestos,
        totalNeto: sueldoNeto
      },
      empleado: {
        id: empleado.id,
        nombre: empleado.userId, // Idealmente deberíamos tener el nombre del empleado
        puesto: empleado.position,
        departamento: empleado.department,
        tipoContrato: empleado.contractType
      }
    };
    
    return {
      empleadoId: empleado.id,
      sueldoBruto,
      deduccionesFijas,
      deduccionesAdicionales: montoDeduccionesAdicionales,
      impuestos,
      beneficiosFijos,
      beneficiosAdicionales: montoBeneficiosAdicionales,
      sueldoNeto,
      detalles
    };
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
    const totalBruto = resultados.reduce((total, r) => total + r.sueldoBruto, 0);
    const totalNeto = resultados.reduce((total, r) => total + r.sueldoNeto, 0);
    const totalDeducciones = resultados.reduce(
      (total, r) => total + r.deduccionesFijas + r.deduccionesAdicionales, 0
    );
    const totalBeneficios = resultados.reduce(
      (total, r) => total + r.beneficiosFijos + r.beneficiosAdicionales, 0
    );
    const totalImpuestos = resultados.reduce((total, r) => total + r.impuestos, 0);
    
    return {
      totalBruto,
      totalNeto,
      totalDeducciones,
      totalBeneficios,
      totalImpuestos
    };
  }
}