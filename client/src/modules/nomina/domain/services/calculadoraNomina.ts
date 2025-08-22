import { TipoContrato, ClaseRiesgoARL } from "@shared/schema";

/**
 * Constantes legales colombianas 2025
 */
export const CONSTANTES_COLOMBIA = {
  SMLV: 1_300_000, // Salario Mínimo Legal Vigente 2025
  UVT: 47_065,      // Unidad de Valor Tributario 2025
  AUXILIO_TRANSPORTE: 162_000, // Auxilio de transporte 2025
  
  // Porcentajes de seguridad social empleado
  SALUD_EMPLEADO: 4.0,      // 4%
  PENSION_EMPLEADO: 4.0,    // 4%
  
  // Porcentajes de seguridad social empleador
  SALUD_EMPLEADOR: 8.5,     // 8.5%
  PENSION_EMPLEADOR: 12.0,  // 12%
  
  // Porcentajes parafiscales empleador
  SENA: 2.0,               // 2%
  ICBF: 3.0,               // 3%
  CAJA_COMPENSACION: 4.0,  // 4%
  
  // ARL según clase de riesgo (empleador)
  ARL_PORCENTAJES: {
    "I": 0.522,   // 0.522%
    "II": 1.044,  // 1.044%
    "III": 2.436, // 2.436%
    "IV": 4.350,  // 4.350%
    "V": 6.960    // 6.960%
  } as Record<ClaseRiesgoARL, number>,
  
  // Prestaciones sociales
  CESANTIAS: 8.33,         // 8.33% anual
  INTERESES_CESANTIAS: 12, // 12% anual sobre cesantías
  PRIMA: 8.33,             // 8.33% anual
  VACACIONES: 4.17,        // 4.17% anual
  
  // Límites de cotización
  COTIZACION_MINIMA: 1,    // 1 SMLV
  COTIZACION_MAXIMA: 25,   // 25 SMLV
  
  // Límite auxilio de transporte
  LIMITE_AUXILIO_TRANSPORTE: 2 // 2 SMLV
};

/**
 * Tipos de datos para cálculos de nómina
 */
export interface EmpleadoNomina {
  id: number;
  nombre: string;
  apellido: string;
  identificacion: string;
  tipoContrato: TipoContrato;
  salarioBase?: number;
  salarioPorHora?: number;
  horasPorSemana?: number;
  honorarios?: number;
  claseRiesgoArl?: ClaseRiesgoARL;
  auxilioTransporte: boolean;
  bonificaciones?: number;
  requiereSeguridadSocial: boolean;
}

export interface DevengadosNomina {
  salarioBasico: number;
  auxilioTransporte: number;
  horasExtras: number;
  bonificaciones: number;
  totalDevengado: number;
}

export interface DeduccionesNomina {
  saludEmpleado: number;
  pensionEmpleado: number;
  retencionFuente: number;
  otrasDeduciones: number;
  totalDeducciones: number;
}

export interface PrestacionesNomina {
  cesantias: number;
  interesesCesantias: number;
  prima: number;
  vacaciones: number;
  totalPrestaciones: number;
}

export interface CostosEmpleadorNomina {
  saludEmpleador: number;
  pensionEmpleador: number;
  arl: number;
  sena: number;
  icbf: number;
  cajaCompensacion: number;
  totalCostosEmpleador: number;
}

export interface ResultadoCalculoNomina {
  empleado: {
    id: number;
    nombre: string;
    apellido: string;
    tipoContrato: TipoContrato;
  };
  devengados: DevengadosNomina;
  deducciones: DeduccionesNomina;
  prestaciones: PrestacionesNomina;
  costosEmpleador: CostosEmpleadorNomina;
  netoAPagar: number;
  costoTotalEmpleador: number;
}

/**
 * Calculadora principal de nómina según ley colombiana
 */
export class CalculadoraNominaColombiana {
  
  /**
   * Calcula la nómina de un empleado según su tipo de contrato
   */
  static calcularNominaEmpleado(
    empleado: EmpleadoNomina,
    horasExtras: { diurnas?: number; nocturnas?: number; dominicales?: number } = {}
  ): ResultadoCalculoNomina {
    
    switch (empleado.tipoContrato) {
      case TipoContrato.INDEFINIDO:
      case TipoContrato.FIJO:
      case TipoContrato.OBRA_O_LABOR:
        return this.calcularContratoFijo(empleado, horasExtras);
        
      case TipoContrato.POR_HORAS:
        return this.calcularContratoPorHoras(empleado, horasExtras);
        
      case TipoContrato.PRESTACION_SERVICIOS:
        return this.calcularPrestacionServicios(empleado);
        
      default:
        throw new Error(`Tipo de contrato no soportado: ${empleado.tipoContrato}`);
    }
  }

  /**
   * Cálculo para contratos indefinidos, fijos y obra o labor
   */
  private static calcularContratoFijo(
    empleado: EmpleadoNomina,
    horasExtras: { diurnas?: number; nocturnas?: number; dominicales?: number }
  ): ResultadoCalculoNomina {
    
    const salarioBase = empleado.salarioBase || 0;
    
    // Validar salario mínimo
    if (salarioBase < CONSTANTES_COLOMBIA.SMLV) {
      throw new Error(`El salario base (${salarioBase}) no puede ser menor al SMLV (${CONSTANTES_COLOMBIA.SMLV})`);
    }

    // DEVENGADOS
    const valorHora = salarioBase / 240; // 240 horas mes (30 días x 8 horas)
    const horasExtrasDiurnas = (horasExtras.diurnas || 0) * valorHora * 1.25;
    const horasExtrasNocturnas = (horasExtras.nocturnas || 0) * valorHora * 1.75;
    const horasExtrasDominicales = (horasExtras.dominicales || 0) * valorHora * 2.0;
    const totalHorasExtras = horasExtrasDiurnas + horasExtrasNocturnas + horasExtrasDominicales;
    
    const auxilioTransporte = (empleado.auxilioTransporte && salarioBase <= CONSTANTES_COLOMBIA.SMLV * CONSTANTES_COLOMBIA.LIMITE_AUXILIO_TRANSPORTE) 
      ? CONSTANTES_COLOMBIA.AUXILIO_TRANSPORTE 
      : 0;
    
    const bonificaciones = empleado.bonificaciones || 0;
    const totalDevengado = salarioBase + auxilioTransporte + totalHorasExtras + bonificaciones;

    // DEDUCCIONES
    const baseCotizacion = Math.min(
      Math.max(salarioBase, CONSTANTES_COLOMBIA.SMLV), 
      CONSTANTES_COLOMBIA.SMLV * CONSTANTES_COLOMBIA.COTIZACION_MAXIMA
    );
    
    const saludEmpleado = baseCotizacion * (CONSTANTES_COLOMBIA.SALUD_EMPLEADO / 100);
    const pensionEmpleado = baseCotizacion * (CONSTANTES_COLOMBIA.PENSION_EMPLEADO / 100);
    const retencionFuente = this.calcularRetencionFuente(totalDevengado);
    const totalDeducciones = saludEmpleado + pensionEmpleado + retencionFuente;

    // PRESTACIONES SOCIALES (proporción mensual)
    const cesantias = salarioBase * (CONSTANTES_COLOMBIA.CESANTIAS / 100);
    const interesesCesantias = cesantias * (CONSTANTES_COLOMBIA.INTERESES_CESANTIAS / 100);
    const prima = salarioBase * (CONSTANTES_COLOMBIA.PRIMA / 100);
    const vacaciones = salarioBase * (CONSTANTES_COLOMBIA.VACACIONES / 100);
    const totalPrestaciones = cesantias + interesesCesantias + prima + vacaciones;

    // COSTOS EMPLEADOR
    const saludEmpleador = baseCotizacion * (CONSTANTES_COLOMBIA.SALUD_EMPLEADOR / 100);
    const pensionEmpleador = baseCotizacion * (CONSTANTES_COLOMBIA.PENSION_EMPLEADOR / 100);
    const arl = baseCotizacion * (CONSTANTES_COLOMBIA.ARL_PORCENTAJES[empleado.claseRiesgoArl || ClaseRiesgoARL.I] / 100);
    const sena = salarioBase * (CONSTANTES_COLOMBIA.SENA / 100);
    const icbf = salarioBase * (CONSTANTES_COLOMBIA.ICBF / 100);
    const cajaCompensacion = salarioBase * (CONSTANTES_COLOMBIA.CAJA_COMPENSACION / 100);
    const totalCostosEmpleador = saludEmpleador + pensionEmpleador + arl + sena + icbf + cajaCompensacion + totalPrestaciones;

    return {
      empleado: {
        id: empleado.id,
        nombre: empleado.nombre,
        apellido: empleado.apellido,
        tipoContrato: empleado.tipoContrato
      },
      devengados: {
        salarioBasico: salarioBase,
        auxilioTransporte,
        horasExtras: totalHorasExtras,
        bonificaciones,
        totalDevengado
      },
      deducciones: {
        saludEmpleado,
        pensionEmpleado,
        retencionFuente,
        otrasDeduciones: 0,
        totalDeducciones
      },
      prestaciones: {
        cesantias,
        interesesCesantias,
        prima,
        vacaciones,
        totalPrestaciones
      },
      costosEmpleador: {
        saludEmpleador,
        pensionEmpleador,
        arl,
        sena,
        icbf,
        cajaCompensacion,
        totalCostosEmpleador
      },
      netoAPagar: totalDevengado - totalDeducciones,
      costoTotalEmpleador: totalDevengado + totalCostosEmpleador
    };
  }

  /**
   * Cálculo para contratos por horas
   */
  private static calcularContratoPorHoras(
    empleado: EmpleadoNomina,
    horasExtras: { diurnas?: number; nocturnas?: number; dominicales?: number }
  ): ResultadoCalculoNomina {
    
    const salarioPorHora = empleado.salarioPorHora || 0;
    const horasPorSemana = empleado.horasPorSemana || 0;
    
    // Validar valor hora mínimo (proporcional SMLV)
    const valorHoraMinimo = CONSTANTES_COLOMBIA.SMLV / 240;
    if (salarioPorHora < valorHoraMinimo) {
      throw new Error(`El valor por hora (${salarioPorHora}) no puede ser menor al proporcional SMLV (${valorHoraMinimo})`);
    }

    // Calcular salario mensual proporcional
    const horasMes = (horasPorSemana * 4.33); // 4.33 semanas promedio por mes
    const salarioBaseMensual = salarioPorHora * horasMes;
    
    // DEVENGADOS (similares al contrato fijo pero proporcionales)
    const horasExtrasDiurnas = (horasExtras.diurnas || 0) * salarioPorHora * 1.25;
    const horasExtrasNocturnas = (horasExtras.nocturnas || 0) * salarioPorHora * 1.75;
    const horasExtrasDominicales = (horasExtras.dominicales || 0) * salarioPorHora * 2.0;
    const totalHorasExtras = horasExtrasDiurnas + horasExtrasNocturnas + horasExtrasDominicales;
    
    const bonificaciones = empleado.bonificaciones || 0;
    const totalDevengado = salarioBaseMensual + totalHorasExtras + bonificaciones;

    // DEDUCCIONES (proporcionales solo si requiere seguridad social)
    let saludEmpleado = 0;
    let pensionEmpleado = 0;
    
    if (empleado.requiereSeguridadSocial) {
      const baseCotizacion = Math.max(salarioBaseMensual, CONSTANTES_COLOMBIA.SMLV);
      saludEmpleado = baseCotizacion * (CONSTANTES_COLOMBIA.SALUD_EMPLEADO / 100);
      pensionEmpleado = baseCotizacion * (CONSTANTES_COLOMBIA.PENSION_EMPLEADO / 100);
    }
    
    const retencionFuente = this.calcularRetencionFuente(totalDevengado);
    const totalDeducciones = saludEmpleado + pensionEmpleado + retencionFuente;

    // PRESTACIONES (proporcionales)
    const proporcionPrestaciones = salarioBaseMensual / CONSTANTES_COLOMBIA.SMLV;
    const cesantias = salarioBaseMensual * (CONSTANTES_COLOMBIA.CESANTIAS / 100) * proporcionPrestaciones;
    const interesesCesantias = cesantias * (CONSTANTES_COLOMBIA.INTERESES_CESANTIAS / 100);
    const prima = salarioBaseMensual * (CONSTANTES_COLOMBIA.PRIMA / 100) * proporcionPrestaciones;
    const vacaciones = salarioBaseMensual * (CONSTANTES_COLOMBIA.VACACIONES / 100) * proporcionPrestaciones;
    const totalPrestaciones = cesantias + interesesCesantias + prima + vacaciones;

    // COSTOS EMPLEADOR (proporcionales)
    let saludEmpleador = 0;
    let pensionEmpleador = 0;
    let arl = 0;
    let sena = 0;
    let icbf = 0;
    let cajaCompensacion = 0;
    
    if (empleado.requiereSeguridadSocial) {
      const baseCotizacion = Math.max(salarioBaseMensual, CONSTANTES_COLOMBIA.SMLV);
      saludEmpleador = baseCotizacion * (CONSTANTES_COLOMBIA.SALUD_EMPLEADOR / 100);
      pensionEmpleador = baseCotizacion * (CONSTANTES_COLOMBIA.PENSION_EMPLEADOR / 100);
      arl = baseCotizacion * (CONSTANTES_COLOMBIA.ARL_PORCENTAJES[empleado.claseRiesgoArl || ClaseRiesgoARL.I] / 100);
      sena = salarioBaseMensual * (CONSTANTES_COLOMBIA.SENA / 100);
      icbf = salarioBaseMensual * (CONSTANTES_COLOMBIA.ICBF / 100);
      cajaCompensacion = salarioBaseMensual * (CONSTANTES_COLOMBIA.CAJA_COMPENSACION / 100);
    }
    
    const totalCostosEmpleador = saludEmpleador + pensionEmpleador + arl + sena + icbf + cajaCompensacion + totalPrestaciones;

    return {
      empleado: {
        id: empleado.id,
        nombre: empleado.nombre,
        apellido: empleado.apellido,
        tipoContrato: empleado.tipoContrato
      },
      devengados: {
        salarioBasico: salarioBaseMensual,
        auxilioTransporte: 0, // Contratos por horas no reciben auxilio
        horasExtras: totalHorasExtras,
        bonificaciones,
        totalDevengado
      },
      deducciones: {
        saludEmpleado,
        pensionEmpleado,
        retencionFuente,
        otrasDeduciones: 0,
        totalDeducciones
      },
      prestaciones: {
        cesantias,
        interesesCesantias,
        prima,
        vacaciones,
        totalPrestaciones
      },
      costosEmpleador: {
        saludEmpleador,
        pensionEmpleador,
        arl,
        sena,
        icbf,
        cajaCompensacion,
        totalCostosEmpleador
      },
      netoAPagar: totalDevengado - totalDeducciones,
      costoTotalEmpleador: totalDevengado + totalCostosEmpleador
    };
  }

  /**
   * Cálculo para prestación de servicios
   */
  private static calcularPrestacionServicios(empleado: EmpleadoNomina): ResultadoCalculoNomina {
    
    const honorarios = empleado.honorarios || 0;
    
    // DEVENGADOS (solo honorarios)
    const totalDevengado = honorarios;

    // DEDUCCIONES (solo retención en la fuente)
    const retencionFuente = this.calcularRetencionFuenteHonorarios(honorarios);
    const totalDeducciones = retencionFuente;

    // SEGURIDAD SOCIAL (opcional, a cargo del contratista)
    let seguridadSocialContratista = 0;
    if (empleado.requiereSeguridadSocial) {
      // El contratista debe pagar como independiente (12.5% salud + 16% pensión)
      seguridadSocialContratista = honorarios * (12.5 + 16) / 100;
    }

    return {
      empleado: {
        id: empleado.id,
        nombre: empleado.nombre,
        apellido: empleado.apellido,
        tipoContrato: empleado.tipoContrato
      },
      devengados: {
        salarioBasico: honorarios,
        auxilioTransporte: 0,
        horasExtras: 0,
        bonificaciones: 0,
        totalDevengado
      },
      deducciones: {
        saludEmpleado: 0,
        pensionEmpleado: 0,
        retencionFuente,
        otrasDeduciones: seguridadSocialContratista,
        totalDeducciones: retencionFuente + seguridadSocialContratista
      },
      prestaciones: {
        cesantias: 0,
        interesesCesantias: 0,
        prima: 0,
        vacaciones: 0,
        totalPrestaciones: 0
      },
      costosEmpleador: {
        saludEmpleador: 0,
        pensionEmpleador: 0,
        arl: 0,
        sena: 0,
        icbf: 0,
        cajaCompensacion: 0,
        totalCostosEmpleador: 0
      },
      netoAPagar: totalDevengado - retencionFuente - seguridadSocialContratista,
      costoTotalEmpleador: honorarios // Solo los honorarios pactados
    };
  }

  /**
   * Calcula retención en la fuente según tabla UVT para empleados
   */
  private static calcularRetencionFuente(ingresoMensual: number): number {
    const uvtMensual = ingresoMensual / CONSTANTES_COLOMBIA.UVT;
    
    // Tabla de retención en la fuente 2025 (simplificada)
    if (uvtMensual <= 95) return 0; // Exento
    if (uvtMensual <= 150) return (uvtMensual - 95) * CONSTANTES_COLOMBIA.UVT * 0.19;
    if (uvtMensual <= 360) return ((uvtMensual - 150) * CONSTANTES_COLOMBIA.UVT * 0.28) + (55 * CONSTANTES_COLOMBIA.UVT * 0.19);
    
    // Para ingresos mayores aplicar tabla completa
    return ((uvtMensual - 360) * CONSTANTES_COLOMBIA.UVT * 0.33) + (210 * CONSTANTES_COLOMBIA.UVT * 0.28) + (55 * CONSTANTES_COLOMBIA.UVT * 0.19);
  }

  /**
   * Calcula retención en la fuente para honorarios (prestación de servicios)
   */
  private static calcularRetencionFuenteHonorarios(honorarios: number): number {
    const uvtMensual = honorarios / CONSTANTES_COLOMBIA.UVT;
    
    // Para honorarios hay retención desde el primer peso
    if (uvtMensual <= 27) return honorarios * 0.10; // 10%
    return honorarios * 0.11; // 11%
  }

  /**
   * Calcula el total de nómina para múltiples empleados
   */
  static calcularTotalNomina(resultados: ResultadoCalculoNomina[]): {
    totalDevengados: number;
    totalDeducciones: number;
    totalPrestaciones: number;
    totalCostosEmpleador: number;
    totalNeto: number;
    totalCostoEmpresa: number;
  } {
    return resultados.reduce((totales, resultado) => ({
      totalDevengados: totales.totalDevengados + resultado.devengados.totalDevengado,
      totalDeducciones: totales.totalDeducciones + resultado.deducciones.totalDeducciones,
      totalPrestaciones: totales.totalPrestaciones + resultado.prestaciones.totalPrestaciones,
      totalCostosEmpleador: totales.totalCostosEmpleador + resultado.costosEmpleador.totalCostosEmpleador,
      totalNeto: totales.totalNeto + resultado.netoAPagar,
      totalCostoEmpresa: totales.totalCostoEmpresa + resultado.costoTotalEmpleador
    }), {
      totalDevengados: 0,
      totalDeducciones: 0,
      totalPrestaciones: 0,
      totalCostosEmpleador: 0,
      totalNeto: 0,
      totalCostoEmpresa: 0
    });
  }
}

// Re-exportar para compatibilidad
export const calcularNominaEmpleado = CalculadoraNominaColombiana.calcularNominaEmpleado.bind(CalculadoraNominaColombiana);
export const calcularTotalNomina = CalculadoraNominaColombiana.calcularTotalNomina.bind(CalculadoraNominaColombiana);