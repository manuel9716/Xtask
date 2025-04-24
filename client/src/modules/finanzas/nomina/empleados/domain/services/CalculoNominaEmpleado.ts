import { Employee } from '@shared/schema';

/**
 * Interfaz para conceptos de nómina (ingresos o deducciones)
 */
export interface ConceptoNomina {
  nombre: string;
  valor: number;
  esDeduccion: boolean;
}

/**
 * Interfaz para configuración del cálculo de nómina
 */
export interface ConfiguracionNomina {
  porcentajeSalud: number;
  porcentajePension: number;
  porcentajeRetencion?: number;
  aplicarPrimaServicios?: boolean;
  aplicarBonificacion?: boolean;
  aplicarHorasExtra?: {
    cantidad: number;
    valorHora: number;
  }
  configuracionPersonalizada?: ConceptoNomina[];
}

/**
 * Interfaz para el resultado del cálculo de nómina
 */
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
 * Clase de servicio para cálculos de nómina
 */
export class CalculoNominaService {
  /**
   * Calcular la nómina para un empleado
   * @param empleado Datos del empleado
   * @param configuracion Configuración para el cálculo
   * @param fechaInicio Fecha de inicio del período de nómina
   * @param fechaFin Fecha de fin del período de nómina
   * @returns Resultado del cálculo de nómina
   */
  static calcularNomina(
    empleado: Employee,
    configuracion: ConfiguracionNomina,
    fechaInicio: Date,
    fechaFin: Date
  ): ResultadoCalculoNomina {
    // Obtener el salario base del empleado (asegurar que sea un número)
    const salarioBase = empleado.salary ? parseFloat(empleado.salary) : 0;
    
    if (salarioBase <= 0) {
      throw new Error('El empleado no tiene un salario base válido');
    }
    
    // Inicializar arrays para ingresos y deducciones
    const ingresos: ConceptoNomina[] = [];
    const deducciones: ConceptoNomina[] = [];
    
    // Agregar el salario base como ingreso
    ingresos.push({
      nombre: 'Salario base',
      valor: salarioBase,
      esDeduccion: false
    });
    
    // Calcular bonificaciones si aplican
    if (configuracion.aplicarBonificacion) {
      const valorBonificacion = salarioBase * 0.1; // 10% del salario base
      ingresos.push({
        nombre: 'Bonificación',
        valor: valorBonificacion,
        esDeduccion: false
      });
    }
    
    // Calcular horas extra si aplican
    if (configuracion.aplicarHorasExtra && configuracion.aplicarHorasExtra.cantidad > 0) {
      const { cantidad, valorHora } = configuracion.aplicarHorasExtra;
      const valorHorasExtra = cantidad * valorHora;
      ingresos.push({
        nombre: `Horas Extra (${cantidad})`,
        valor: valorHorasExtra,
        esDeduccion: false
      });
    }
    
    // Calcular prima de servicios si aplica
    if (configuracion.aplicarPrimaServicios) {
      const valorPrima = salarioBase * 0.0833; // Aproximadamente un mes de salario divido en 12
      ingresos.push({
        nombre: 'Prima de Servicios',
        valor: valorPrima,
        esDeduccion: false
      });
    }
    
    // Agregar conceptos personalizados de ingresos
    if (configuracion.configuracionPersonalizada) {
      configuracion.configuracionPersonalizada
        .filter(concepto => !concepto.esDeduccion)
        .forEach(concepto => ingresos.push(concepto));
    }
    
    // Calcular deducciones obligatorias
    // Salud
    const valorSalud = salarioBase * (configuracion.porcentajeSalud / 100);
    deducciones.push({
      nombre: 'Aportes a Salud',
      valor: valorSalud,
      esDeduccion: true
    });
    
    // Pensión
    const valorPension = salarioBase * (configuracion.porcentajePension / 100);
    deducciones.push({
      nombre: 'Aportes a Pensión',
      valor: valorPension,
      esDeduccion: true
    });
    
    // Retención en la fuente (si aplica)
    if (configuracion.porcentajeRetencion && configuracion.porcentajeRetencion > 0) {
      const valorRetencion = salarioBase * (configuracion.porcentajeRetencion / 100);
      deducciones.push({
        nombre: 'Retención en la Fuente',
        valor: valorRetencion,
        esDeduccion: true
      });
    }
    
    // Agregar conceptos personalizados de deducciones
    if (configuracion.configuracionPersonalizada) {
      configuracion.configuracionPersonalizada
        .filter(concepto => concepto.esDeduccion)
        .forEach(concepto => deducciones.push(concepto));
    }
    
    // Calcular totales
    const totalIngresos = ingresos.reduce((sum, item) => sum + item.valor, 0);
    const totalDeducciones = deducciones.reduce((sum, item) => sum + item.valor, 0);
    const salarioNeto = totalIngresos - totalDeducciones;
    
    // Formatear fechas para el período
    const formatoFecha = (fecha: Date) => {
      return fecha.toISOString().split('T')[0]; // Formato YYYY-MM-DD
    };
    
    // Retornar el resultado completo
    return {
      empleadoId: empleado.id,
      nombreEmpleado: empleado.fullName || `${empleado.id}`,
      salarioBase,
      periodo: {
        fechaInicio: formatoFecha(fechaInicio),
        fechaFin: formatoFecha(fechaFin)
      },
      ingresos,
      deducciones,
      totalIngresos,
      totalDeducciones,
      salarioNeto
    };
  }
  
  /**
   * Obtener una configuración de nómina por defecto
   * @returns Configuración básica para cálculos
   */
  static obtenerConfiguracionPorDefecto(): ConfiguracionNomina {
    return {
      porcentajeSalud: 4,
      porcentajePension: 4,
      porcentajeRetencion: 0
    };
  }
}