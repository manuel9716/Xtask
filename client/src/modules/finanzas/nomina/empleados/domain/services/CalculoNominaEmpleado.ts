import { Employee } from '@shared/schema';

/**
 * Interfaces para el cálculo de nómina
 */
export interface ConceptoNomina {
  nombre: string;
  valor: number;
  esDeduccion: boolean;
}

export interface ParametrosCalculoNomina {
  empleado: Employee;
  fechaInicio: Date;
  fechaFin: Date;
  diasTrabajados?: number;
  horasExtras?: number;
  bonificaciones?: ConceptoNomina[];
  deducciones?: ConceptoNomina[];
}

export interface ResultadoCalculoNomina {
  empleadoId: number;
  nombreEmpleado: string;
  salarioBase: number;
  periodo: {
    fechaInicio: string;
    fechaFin: string;
  };
  ingresos: ConceptoNomina[];
  deducciones: ConceptoNomina[];
  totalIngresos: number;
  totalDeducciones: number;
  salarioNeto: number;
}

/**
 * Servicio para calcular la nómina de un empleado
 */
export class CalculoNominaService {
  /**
   * Calcular la nómina de un empleado según parámetros
   * @param params Parámetros para el cálculo de nómina
   * @returns Resultado del cálculo con desglose de conceptos
   */
  calcularNomina(params: ParametrosCalculoNomina): ResultadoCalculoNomina {
    const { empleado, fechaInicio, fechaFin, diasTrabajados = 30, horasExtras = 0 } = params;
    
    // Lista de ingresos (comenzando con el salario base)
    const ingresos: ConceptoNomina[] = [
      {
        nombre: 'Salario Base',
        valor: Number(empleado.salary) || 0,
        esDeduccion: false
      }
    ];
    
    // Añadir bonificaciones si existen
    if (params.bonificaciones && params.bonificaciones.length > 0) {
      ingresos.push(...params.bonificaciones);
    }
    
    // Calcular horas extras si hay
    if (horasExtras > 0) {
      const valorHora = (Number(empleado.salary) || 0) / 240; // 30 días x 8 horas
      const valorHorasExtras = valorHora * horasExtras * 1.25; // 25% adicional
      
      ingresos.push({
        nombre: `Horas Extras (${horasExtras})`,
        valor: valorHorasExtras,
        esDeduccion: false
      });
    }
    
    // Añadir beneficios del empleado si existen
    if (empleado.baseBenefits && Number(empleado.baseBenefits) > 0) {
      ingresos.push({
        nombre: 'Beneficios',
        valor: Number(empleado.baseBenefits),
        esDeduccion: false
      });
    }
    
    // Lista de deducciones
    const deducciones: ConceptoNomina[] = [];
    
    // Calcular deducciones de seguridad social (aprox. 8% del salario base)
    const deduccionSeguridadSocial = (Number(empleado.salary) || 0) * 0.08;
    deducciones.push({
      nombre: 'Seguridad Social',
      valor: deduccionSeguridadSocial,
      esDeduccion: true
    });
    
    // Calcular retención en la fuente según tasa del empleado o valor por defecto
    const tasaRetencion = empleado.taxRate ? Number(empleado.taxRate) / 100 : 0.05;
    const retencionFuente = (Number(empleado.salary) || 0) * tasaRetencion;
    deducciones.push({
      nombre: 'Retención en la Fuente',
      valor: retencionFuente,
      esDeduccion: true
    });
    
    // Añadir deducciones base del empleado si existen
    if (empleado.baseDeductions && Number(empleado.baseDeductions) > 0) {
      deducciones.push({
        nombre: 'Deducciones Base',
        valor: Number(empleado.baseDeductions),
        esDeduccion: true
      });
    }
    
    // Añadir deducciones adicionales si existen
    if (params.deducciones && params.deducciones.length > 0) {
      deducciones.push(...params.deducciones);
    }
    
    // Calcular totales
    const totalIngresos = ingresos.reduce((sum, item) => sum + item.valor, 0);
    const totalDeducciones = deducciones.reduce((sum, item) => sum + item.valor, 0);
    const salarioNeto = totalIngresos - totalDeducciones;
    
    // Generar resultado
    return {
      empleadoId: empleado.id,
      nombreEmpleado: (empleado as any).fullName || `Usuario ${empleado.userId}`,
      salarioBase: Number(empleado.salary) || 0,
      periodo: {
        fechaInicio: fechaInicio.toISOString().split('T')[0],
        fechaFin: fechaFin.toISOString().split('T')[0]
      },
      ingresos,
      deducciones,
      totalIngresos,
      totalDeducciones,
      salarioNeto
    };
  }
}