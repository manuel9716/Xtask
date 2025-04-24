import { Employee } from '@shared/schema';

/**
 * Interfaces para análisis de RRHH
 */
export interface MetricsRRHH {
  totalEmpleados: number;
  empleadosPorContrato: {
    tipo: string;
    cantidad: number;
  }[];
  empleadosPorDepartamento: {
    departamento: string;
    cantidad: number;
  }[];
  promedioSalarial: {
    general: number;
    porDepartamento: {
      departamento: string;
      promedio: number;
    }[];
  };
  empleadosNuevosMes: number;
  proyectosConEmpleados: {
    proyecto: string;
    cantidadEmpleados: number;
  }[];
}

/**
 * Servicio para análisis de datos de RRHH
 */
export class AnalisisRRHHService {
  /**
   * Transformar datos de empleados en métricas para reportes
   * @param empleados Lista de empleados
   * @param proyectos Lista de proyectos (opcional)
   * @returns Métricas calculadas para reportes
   */
  static calcularMetricas(empleados: Employee[], proyectos: any[] = []): MetricsRRHH {
    // Cálculo de totales básicos
    const totalEmpleados = empleados.length;
    
    // Empleados por tipo de contrato
    const empleadosPorContrato: Record<string, number> = {};
    empleados.forEach(emp => {
      const tipo = this.formatearTipoContrato(emp.contractType || 'fulltime');
      empleadosPorContrato[tipo] = (empleadosPorContrato[tipo] || 0) + 1;
    });
    
    const empleadosPorContratoArray = Object.entries(empleadosPorContrato).map(([tipo, cantidad]) => ({
      tipo,
      cantidad
    }));
    
    // Empleados por departamento
    const empleadosPorDepartamento: Record<string, number> = {};
    empleados.forEach(emp => {
      const depto = emp.department || 'Sin departamento';
      empleadosPorDepartamento[depto] = (empleadosPorDepartamento[depto] || 0) + 1;
    });
    
    const empleadosPorDepartamentoArray = Object.entries(empleadosPorDepartamento).map(([departamento, cantidad]) => ({
      departamento,
      cantidad
    }));
    
    // Promedio salarial
    const salarios = empleados
      .map(emp => Number(emp.salary) || 0)
      .filter(salary => salary > 0);
    
    const promedioGeneral = salarios.length > 0
      ? salarios.reduce((sum, salary) => sum + salary, 0) / salarios.length
      : 0;
    
    // Promedio salarial por departamento
    const salariosPorDepartamento: Record<string, number[]> = {};
    empleados.forEach(emp => {
      const depto = emp.department || 'Sin departamento';
      const salario = Number(emp.salary) || 0;
      
      if (salario > 0) {
        if (!salariosPorDepartamento[depto]) {
          salariosPorDepartamento[depto] = [];
        }
        
        salariosPorDepartamento[depto].push(salario);
      }
    });
    
    const promedioSalarialPorDepartamento = Object.entries(salariosPorDepartamento).map(([departamento, salarios]) => ({
      departamento,
      promedio: salarios.reduce((sum, salary) => sum + salary, 0) / salarios.length
    }));
    
    // Empleados nuevos en el último mes
    const fechaActual = new Date();
    const primerDiaMesActual = new Date(fechaActual.getFullYear(), fechaActual.getMonth(), 1);
    
    const empleadosNuevosMes = empleados.filter(emp => {
      if (!emp.hireDate) return false;
      const fechaContratacion = new Date(emp.hireDate);
      return fechaContratacion >= primerDiaMesActual;
    }).length;
    
    // Proyectos con empleados
    // Nota: esto es un placeholder; en una implementación real, necesitaríamos
    // la relación entre proyectos y empleados
    const proyectosConEmpleados = proyectos.map(proyecto => ({
      proyecto: proyecto.name || `Proyecto #${proyecto.id}`,
      cantidadEmpleados: Math.floor(Math.random() * 10) // Simulación, en realidad se haría una consulta
    }));
    
    return {
      totalEmpleados,
      empleadosPorContrato: empleadosPorContratoArray,
      empleadosPorDepartamento: empleadosPorDepartamentoArray,
      promedioSalarial: {
        general: promedioGeneral,
        porDepartamento: promedioSalarialPorDepartamento
      },
      empleadosNuevosMes,
      proyectosConEmpleados
    };
  }
  
  /**
   * Formatear el tipo de contrato para mostrar en reportes
   * @param tipo Tipo de contrato en el sistema
   * @returns Tipo de contrato formateado para mostrar al usuario
   */
  private static formatearTipoContrato(tipo: string): string {
    switch (tipo) {
      case 'fulltime':
        return 'Tiempo completo';
      case 'parttime':
        return 'Tiempo parcial';
      case 'contractor':
        return 'Contratista';
      case 'temporary':
        return 'Temporal';
      case 'internship':
        return 'Pasantía';
      default:
        return tipo;
    }
  }
}