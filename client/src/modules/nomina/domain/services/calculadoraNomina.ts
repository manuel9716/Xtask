/**
 * Servicio para cálculos de nómina
 */

/**
 * Estructura de resultados de cálculo de nómina
 */
export interface ResultadoCalculoNomina {
  salarioBase: number;
  salarioBruto: number;
  retencionFiscal: number;
  seguridadSocial: number;
  otrasDeduciones: number;
  salarioNeto: number;
}

/**
 * Constantes para cálculos de nómina (porcentajes)
 */
export const PORCENTAJES_NOMINA = {
  RETENCION_FISCAL: 0.12, // 12% de retención fiscal
  SEGURIDAD_SOCIAL: 0.04, // 4% de seguridad social
  OTRAS_DEDUCCIONES: 0.02, // 2% de otras deducciones (fondo de pensiones, etc)
};

/**
 * Calcula todos los valores de nómina para un empleado
 * @param salarioBase Salario base del empleado
 * @param complementos Complementos salariales (bonos, horas extra, etc) - opcional
 * @returns Objeto con todos los cálculos de nómina
 */
export function calcularTotalesNomina(
  salarioBase: number,
  complementos: number = 0
): ResultadoCalculoNomina {
  // Cálculo de salario bruto (base + complementos)
  const salarioBruto = salarioBase + complementos;
  
  // Cálculo de retenciones
  const retencionFiscal = salarioBruto * PORCENTAJES_NOMINA.RETENCION_FISCAL;
  const seguridadSocial = salarioBruto * PORCENTAJES_NOMINA.SEGURIDAD_SOCIAL;
  const otrasDeduciones = salarioBruto * PORCENTAJES_NOMINA.OTRAS_DEDUCCIONES;
  
  // Total deducciones
  const totalDeducciones = retencionFiscal + seguridadSocial + otrasDeduciones;
  
  // Salario neto (bruto - deducciones)
  const salarioNeto = salarioBruto - totalDeducciones;
  
  return {
    salarioBase,
    salarioBruto,
    retencionFiscal,
    seguridadSocial, 
    otrasDeduciones,
    salarioNeto,
  };
}

/**
 * Calcula los totales para un grupo de empleados
 * @param calculosIndividuales Array de cálculos individuales
 * @returns Objeto con los totales de nómina
 */
export function calcularTotalesGenerales(
  calculosIndividuales: ResultadoCalculoNomina[]
): ResultadoCalculoNomina {
  const totales: ResultadoCalculoNomina = {
    salarioBase: 0,
    salarioBruto: 0,
    retencionFiscal: 0,
    seguridadSocial: 0,
    otrasDeduciones: 0,
    salarioNeto: 0,
  };
  
  // Sumar todos los valores
  calculosIndividuales.forEach((calculo) => {
    totales.salarioBase += calculo.salarioBase;
    totales.salarioBruto += calculo.salarioBruto;
    totales.retencionFiscal += calculo.retencionFiscal;
    totales.seguridadSocial += calculo.seguridadSocial;
    totales.otrasDeduciones += calculo.otrasDeduciones;
    totales.salarioNeto += calculo.salarioNeto;
  });
  
  return totales;
}

/**
 * Valida que los cálculos de nómina sean correctos
 * @param calculo Objeto con los cálculos a validar
 * @returns true si los cálculos son válidos, false en caso contrario
 */
export function validarCalculosNomina(calculo: ResultadoCalculoNomina): boolean {
  // Verificar que no haya valores negativos
  if (
    calculo.salarioBase < 0 ||
    calculo.salarioBruto < 0 ||
    calculo.retencionFiscal < 0 ||
    calculo.seguridadSocial < 0 ||
    calculo.otrasDeduciones < 0 ||
    calculo.salarioNeto < 0
  ) {
    return false;
  }
  
  // Verificar que el salario neto sea correcto (bruto - deducciones)
  const totalDeducciones = 
    calculo.retencionFiscal + 
    calculo.seguridadSocial + 
    calculo.otrasDeduciones;
  
  const salarioNetoCalculado = calculo.salarioBruto - totalDeducciones;
  
  // Permitir un pequeño margen de error por redondeos
  const margenError = 0.01;
  return Math.abs(calculo.salarioNeto - salarioNetoCalculado) <= margenError;
}