/**
 * Caso de uso: Obtener Indicadores RRHH
 * Proporciona métricas y KPIs de recursos humanos
 */

import { Empleado } from "../../domain/entities/Empleado";
import { EmpleadoRepository } from "../../domain/repositories/EmpleadoRepository";
import { MetricasGeneralesRRHH, MetricasEvolucionEmpleados, RRHHMetricsService } from "../../domain/services/RRHHMetricsService";

export class ObtenerIndicadoresRRHHUseCase {
  private metricsService: RRHHMetricsService;
  
  constructor(private empleadoRepository: EmpleadoRepository) {
    this.metricsService = new RRHHMetricsService();
  }

  /**
   * Ejecuta el caso de uso para obtener métricas generales de RRHH
   * @returns Métricas generales de recursos humanos
   */
  async executeGenerales(): Promise<MetricasGeneralesRRHH> {
    // Obtener todos los empleados para cálculos
    const empleados = await this.empleadoRepository.obtenerTodosEmpleados();
    
    // Calcular métricas usando el servicio de dominio
    return this.metricsService.calcularMetricasGenerales(empleados);
  }

  /**
   * Ejecuta el caso de uso para obtener datos de evolución de personal
   * @param periodos Número de periodos a considerar (por defecto 6)
   * @param tipoPeriodo Tipo de periodo (mes, trimestre, año)
   * @returns Datos de evolución de personal
   */
  async executeEvolucion(
    periodos: number = 6,
    tipoPeriodo: 'mes' | 'trimestre' | 'año' = 'mes'
  ): Promise<MetricasEvolucionEmpleados[]> {
    // Obtener todos los empleados para cálculos
    const empleados = await this.empleadoRepository.obtenerTodosEmpleados();
    
    // Generar datos de evolución usando el servicio de dominio
    return this.metricsService.generarEvolucionEmpleados(empleados, periodos, tipoPeriodo);
  }

  /**
   * Ejecuta el caso de uso para obtener distribución de salarios por departamento
   * @returns Distribución de salarios agrupados por departamento
   */
  async executeDistribucionSalarios(): Promise<Record<string, number[]>> {
    // Obtener todos los empleados para cálculos
    const empleados = await this.empleadoRepository.obtenerTodosEmpleados();
    
    // Calcular distribución de salarios usando el servicio de dominio
    return this.metricsService.calcularDistribucionSalarios(empleados);
  }

  /**
   * Ejecuta el caso de uso para proyectar costos de nómina
   * @param meses Número de meses a proyectar (por defecto 12)
   * @param incrementoPorcentual Incremento porcentual anual (por defecto 0)
   * @returns Proyección de costos de nómina por mes
   */
  async executeProyeccionNomina(
    meses: number = 12,
    incrementoPorcentual: number = 0
  ): Promise<{ mes: string; costo: number }[]> {
    // Obtener todos los empleados para cálculos
    const empleados = await this.empleadoRepository.obtenerTodosEmpleados();
    
    // Proyectar costos de nómina usando el servicio de dominio
    return this.metricsService.proyectarCostosNomina(empleados, meses, incrementoPorcentual);
  }

  /**
   * Ejecuta el caso de uso para obtener estadísticas básicas de empleados
   * Esta versión es más ligera y eficiente que las métricas completas
   * @returns Estadísticas básicas de empleados
   */
  async executeEstadisticasBasicas(): Promise<{
    total: number;
    activos: number;
    inactivos: number;
    nuevosMes: number;
  }> {
    // Usar método optimizado del repositorio si está disponible
    return this.empleadoRepository.obtenerEstadisticasEmpleados();
  }
}