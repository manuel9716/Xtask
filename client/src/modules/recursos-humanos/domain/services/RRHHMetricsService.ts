import { EmpleadoRepository } from '../repositories/EmpleadoRepository';
import { EstadoEmpleado } from '../entities/Empleado';

/**
 * Servicio para calcular métricas y KPIs del módulo de Recursos Humanos
 * Este servicio provee lógica de negocio para analizar datos de RRHH
 */
export class RRHHMetricsService {
  constructor(private empleadoRepository: EmpleadoRepository) {}

  /**
   * Obtiene el total de empleados activos
   * @returns Número total de empleados activos
   */
  async getTotalEmpleadosActivos(): Promise<number> {
    const resultado = await this.empleadoRepository.listarEmpleados({ 
      estado: EstadoEmpleado.ACTIVO 
    }, 1, 1);
    return resultado.total;
  }

  /**
   * Obtiene el número de empleados nuevos en el mes actual
   * @returns Número de empleados contratados en el mes en curso
   */
  async getEmpleadosNuevosMes(): Promise<number> {
    const hoy = new Date();
    const primerDiaMes = new Date(hoy.getFullYear(), hoy.getMonth(), 1);
    
    const resultado = await this.empleadoRepository.listarEmpleados({
      estado: EstadoEmpleado.ACTIVO,
      fechaContratacionDesde: primerDiaMes,
      fechaContratacionHasta: hoy
    }, 1, 1);
    
    return resultado.total;
  }

  /**
   * Obtiene el conteo de empleados por departamento
   * @returns Un objeto con la cantidad de empleados por cada departamento
   */
  async getEmpleadosPorDepartamento(): Promise<Record<string, number>> {
    // Lista de departamentos conocidos
    const departamentos = [
      'Tecnología',
      'Ventas',
      'Marketing',
      'Finanzas',
      'Recursos Humanos',
      'Operaciones',
      'Legal',
      'Administrativo'
    ];

    const resultados: Record<string, number> = {};

    // Obtener el conteo para cada departamento
    for (const departamento of departamentos) {
      const empleados = await this.empleadoRepository.obtenerEmpleadosPorDepartamento(departamento);
      resultados[departamento] = empleados.length;
    }

    return resultados;
  }

  /**
   * Calcula la distribución de empleados por estado
   * @returns Un objeto con la cantidad y porcentaje de empleados en cada estado
   */
  async getDistribucionPorEstado(): Promise<Array<{ estado: EstadoEmpleado, cantidad: number, porcentaje: number }>> {
    const estados = Object.values(EstadoEmpleado);
    const resultados: Array<{ estado: EstadoEmpleado, cantidad: number, porcentaje: number }> = [];
    let totalEmpleados = 0;
    
    // Primero calcular el total de empleados
    const todosResult = await this.empleadoRepository.listarEmpleados({}, 1, 1);
    totalEmpleados = todosResult.total;
    
    if (totalEmpleados === 0) {
      return resultados;
    }
    
    // Obtener el conteo para cada estado
    for (const estado of estados) {
      const estadoResult = await this.empleadoRepository.listarEmpleados({ 
        estado: estado as EstadoEmpleado 
      }, 1, 1);
      
      const cantidad = estadoResult.total;
      const porcentaje = (cantidad / totalEmpleados) * 100;
      
      resultados.push({
        estado: estado as EstadoEmpleado,
        cantidad,
        porcentaje: Math.round(porcentaje * 10) / 10 // Redondear a 1 decimal
      });
    }
    
    return resultados;
  }

  /**
   * Busca empleados con habilidades específicas
   * @param habilidades Lista de habilidades a buscar
   * @returns Cantidad de empleados que tienen esas habilidades
   */
  async getEmpleadosPorHabilidades(habilidades: string[]): Promise<number> {
    const empleados = await this.empleadoRepository.buscarEmpleadosPorHabilidades(habilidades);
    return empleados.length;
  }
}

// Factory para crear el servicio con una implementación concreta del repositorio
export function createRRHHMetricsService(empleadoRepository: EmpleadoRepository): RRHHMetricsService {
  return new RRHHMetricsService(empleadoRepository);
}