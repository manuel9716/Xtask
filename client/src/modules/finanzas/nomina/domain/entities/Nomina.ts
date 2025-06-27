import { z } from 'zod';

/**
 * Entidad principal de Nómina
 */
export interface Nomina {
  id: number;
  proyectoId: number;
  recursoId: number;
  mes: string; // Formato: "2025-06"
  salarioMensual: number;
  bonificacion?: number;
  horasTotales: number;
  dedicacion: number;
  estado: 'pendiente' | 'pagado' | 'aprobado';
  totalPagar: number;
  fechaPago?: string;
  creadoPor: number;
  createdAt: string;
  updatedAt: string;
}

/**
 * DTO para crear registro de nómina
 */
export interface CrearNominaDTO {
  proyectoId: number;
  recursoId: number;
  mes: string;
  bonificacion?: number;
  fechaPago?: string;
}

/**
 * Vista extendida de nómina con datos de recurso y proyecto
 */
export interface NominaConDetalles extends Nomina {
  recurso: {
    id: number;
    perfil: string;
    salarioMensual: number;
    valorHora: number;
    meses: number;
    diasAlMes: number;
    horasPorDia: number;
    dedicacionPorcentaje: number;
    origen: string;
    totalHoras: number;
    totalEstimado: number;
    empleadoVinculadoId?: number;
  };
  proyecto: {
    id: number;
    nombre: string;
    monto: number;
  };
}

/**
 * Resumen de nómina por proyecto
 */
export interface ResumenNominaProyecto {
  proyectoId: number;
  nombreProyecto: string;
  totalRecursos: number;
  totalPendiente: number;
  totalPagado: number;
  totalAprobado: number;
  costoMensualTotal: number;
}

/**
 * Filtros para consulta de nómina
 */
export interface FiltrosNomina {
  proyectoId?: number;
  mes?: string;
  estado?: 'pendiente' | 'pagado' | 'aprobado';
  perfil?: string;
}

/**
 * Esquemas de validación con Zod
 */
export const crearNominaSchema = z.object({
  proyectoId: z.number().min(1, 'Proyecto requerido'),
  recursoId: z.number().min(1, 'Recurso requerido'),
  mes: z.string().min(7, 'Mes en formato YYYY-MM requerido'),
  bonificacion: z.number().min(0).optional(),
  fechaPago: z.string().optional(),
});

export const actualizarEstadoNominaSchema = z.object({
  estado: z.enum(['pendiente', 'pagado', 'aprobado']),
  fechaPago: z.string().optional(),
  bonificacion: z.number().min(0).optional(),
});

/**
 * Utilidades para cálculos de nómina
 */
export const calculosNomina = {
  /**
   * Calcula el total a pagar incluyendo bonificaciones
   */
  calcularTotalPagar: (salarioMensual: number, bonificacion: number = 0): number => {
    return salarioMensual + bonificacion;
  },

  /**
   * Calcula las horas totales del mes para un recurso
   */
  calcularHorasMes: (diasAlMes: number, horasPorDia: number, dedicacion: number): number => {
    return diasAlMes * horasPorDia * (dedicacion / 100);
  },

  /**
   * Determina el color del estado
   */
  colorEstado: (estado: string): string => {
    switch (estado) {
      case 'pendiente': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'aprobado': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'pagado': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  },

  /**
   * Formatea el mes para mostrar
   */
  formatearMes: (mes: string): string => {
    const fecha = new Date(mes + '-01');
    return fecha.toLocaleDateString('es-CO', { 
      year: 'numeric', 
      month: 'long' 
    });
  }
};