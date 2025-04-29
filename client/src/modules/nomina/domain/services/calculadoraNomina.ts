import { Employee } from "@shared/schema";

export interface ResultadoCalculoNomina {
  salarioBase: number;
  salarioBruto: number;
  retencionFiscal: number;
  seguridadSocial: number;
  otrasDeduciones: number;
  salarioNeto: number;
}

interface ConfiguracionCalculos {
  retencionFiscalPorcentaje: number;
  seguridadSocialPorcentaje: number;
  otrasDeducciones: number;
}

// Configuración por defecto para cálculos de nómina
const configuracionPorDefecto: ConfiguracionCalculos = {
  retencionFiscalPorcentaje: 10, // 10% retención fiscal
  seguridadSocialPorcentaje: 8,  // 8% seguridad social
  otrasDeducciones: 0            // Otras deducciones en valor absoluto
};

export function calcularNominaEmpleado(
  empleado: Employee, 
  config: Partial<ConfiguracionCalculos> = {}
): ResultadoCalculoNomina {
  // Combinamos la configuración por defecto con la proporcionada
  const configuracion = {
    ...configuracionPorDefecto,
    ...config
  };

  // Obtener el salario base del empleado
  const salarioBase = empleado.salary ? parseFloat(empleado.salary) : 0;
  
  // Si no hay salario base, devolvemos valores en cero
  if (salarioBase === 0) {
    return {
      salarioBase: 0,
      salarioBruto: 0,
      retencionFiscal: 0,
      seguridadSocial: 0,
      otrasDeduciones: 0,
      salarioNeto: 0
    };
  }
  
  // Por ahora, el salario bruto es igual al salario base
  // En una implementación más completa, podría incluir bonificaciones, horas extra, etc.
  const salarioBruto = salarioBase;
  
  // Calcular deducciones
  const retencionFiscal = salarioBruto * (configuracion.retencionFiscalPorcentaje / 100);
  const seguridadSocial = salarioBruto * (configuracion.seguridadSocialPorcentaje / 100);
  const otrasDeduciones = configuracion.otrasDeducciones;
  
  // Calcular salario neto
  const salarioNeto = salarioBruto - retencionFiscal - seguridadSocial - otrasDeduciones;
  
  return {
    salarioBase,
    salarioBruto,
    retencionFiscal,
    seguridadSocial,
    otrasDeduciones,
    salarioNeto
  };
}

export function calcularTotalNomina(resultados: ResultadoCalculoNomina[]): ResultadoCalculoNomina {
  // Inicializar totales
  const totales: ResultadoCalculoNomina = {
    salarioBase: 0,
    salarioBruto: 0,
    retencionFiscal: 0,
    seguridadSocial: 0,
    otrasDeduciones: 0,
    salarioNeto: 0
  };
  
  // Sumar los valores de todos los empleados
  resultados.forEach(resultado => {
    totales.salarioBase += resultado.salarioBase;
    totales.salarioBruto += resultado.salarioBruto;
    totales.retencionFiscal += resultado.retencionFiscal;
    totales.seguridadSocial += resultado.seguridadSocial;
    totales.otrasDeduciones += resultado.otrasDeduciones;
    totales.salarioNeto += resultado.salarioNeto;
  });
  
  return totales;
}