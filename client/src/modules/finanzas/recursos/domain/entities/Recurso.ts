import { z } from 'zod';

/**
 * Origen del recurso técnico
 */
export type OrigenRecurso = 'INTERNO' | 'EXTERNO';

/**
 * Perfiles técnicos disponibles
 */
export type PerfilTecnico = 
  | 'ARQUITECTO'
  | 'DESARROLLADOR_SENIOR'
  | 'DESARROLLADOR_JUNIOR'
  | 'QA_SENIOR'
  | 'QA_JUNIOR'
  | 'DEVOPS'
  | 'SCRUM_MASTER'
  | 'PRODUCT_OWNER'
  | 'DISEÑADOR_UX'
  | 'ANALISTA_DATOS'
  | 'CONSULTOR'
  | 'OTRO';

/**
 * Entidad Recurso que representa un recurso técnico asignado a un presupuesto
 */
export interface Recurso {
  id: number;
  presupuestoId: number;
  perfil: PerfilTecnico;
  salarioMensual: number;
  valorHora: number;
  meses: number;
  diasAlMes: number;
  horasPorDia: number;
  dedicacionPorcentaje: number;
  origen: OrigenRecurso;
  totalHoras: number;
  totalEstimado: number;
  creadoPor: number;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * DTO para la creación de un recurso
 */
export interface CrearRecursoDTO {
  presupuestoId: number;
  perfil: PerfilTecnico;
  salarioMensual: number;
  valorHora: number;
  meses: number;
  diasAlMes: number;
  horasPorDia: number;
  dedicacionPorcentaje: number;
  origen: OrigenRecurso;
  creadoPor: number;
}

/**
 * DTO para actualizar un recurso
 */
export interface ActualizarRecursoDTO {
  perfil?: PerfilTecnico;
  salarioMensual?: number;
  valorHora?: number;
  meses?: number;
  diasAlMes?: number;
  horasPorDia?: number;
  dedicacionPorcentaje?: number;
  origen?: OrigenRecurso;
}

/**
 * Resumen de costos por tipo
 */
export interface ResumenCostos {
  totalGeneral: number;
  totalPorOrigen: Record<OrigenRecurso, number>;
  totalPorPerfil: Record<PerfilTecnico, number>;
  totalRecursos: number;
  promedioPorRecurso: number;
}

/**
 * Esquema de validación para crear recurso
 */
export const crearRecursoSchema = z.object({
  presupuestoId: z.number().positive("ID de presupuesto requerido"),
  perfil: z.enum([
    'ARQUITECTO',
    'DESARROLLADOR_SENIOR', 
    'DESARROLLADOR_JUNIOR',
    'QA_SENIOR',
    'QA_JUNIOR',
    'DEVOPS',
    'SCRUM_MASTER',
    'PRODUCT_OWNER',
    'DISEÑADOR_UX',
    'ANALISTA_DATOS',
    'CONSULTOR',
    'OTRO'
  ]),
  salarioMensual: z.number().min(0, "El salario mensual debe ser positivo"),
  valorHora: z.number().min(0, "El valor hora debe ser positivo"),
  meses: z.number().min(1, "Debe ser al menos 1 mes").max(36, "Máximo 36 meses"),
  diasAlMes: z.number().min(1, "Mínimo 1 día al mes").max(31, "Máximo 31 días"),
  horasPorDia: z.number().min(1, "Mínimo 1 hora por día").max(24, "Máximo 24 horas"),
  dedicacionPorcentaje: z.number().min(1, "Mínimo 1%").max(100, "Máximo 100%"),
  origen: z.enum(['INTERNO', 'EXTERNO']),
  creadoPor: z.number().positive("Usuario requerido")
});

/**
 * Esquema de validación para actualizar recurso
 */
export const actualizarRecursoSchema = crearRecursoSchema.partial().omit({
  presupuestoId: true,
  creadoPor: true
});

/**
 * Funciones de cálculo básicas para recursos
 */
export const calcularRecurso = {
  /**
   * Calcula las horas totales del proyecto
   */
  horasTotales: (diasAlMes: number, horasPorDia: number, meses: number): number => {
    return diasAlMes * horasPorDia * meses;
  },

  /**
   * Calcula las horas dedicadas al proyecto según el porcentaje
   */
  horasProyecto: (horasTotales: number, dedicacionPorcentaje: number): number => {
    return horasTotales * (dedicacionPorcentaje / 100);
  },

  /**
   * Calcula el valor total estimado
   */
  valorEstimado: (valorHora: number, horasProyecto: number): number => {
    return valorHora * horasProyecto;
  },

  /**
   * Calcula todos los valores de un recurso
   */
  completarRecurso: (data: CrearRecursoDTO): Omit<Recurso, 'id' | 'createdAt' | 'updatedAt'> => {
    const horasTotales = calcularRecurso.horasTotales(
      data.diasAlMes, 
      data.horasPorDia, 
      data.meses
    );
    
    const horasProyecto = calcularRecurso.horasProyecto(
      horasTotales, 
      data.dedicacionPorcentaje
    );
    
    const totalEstimado = calcularRecurso.valorEstimado(
      data.valorHora, 
      horasProyecto
    );

    return {
      ...data,
      totalHoras: horasProyecto,
      totalEstimado
    };
  }
};

/**
 * Utilidades para cálculos de costos de recursos
 */
export const calculadoraCostos = {
  /**
   * Calcula el resumen de costos basado en una lista de recursos
   */
  calcularResumen: (recursos: Recurso[]): ResumenCostos => {
    const totalGeneral = recursos.reduce((sum, recurso) => sum + recurso.totalEstimado, 0);
    
    const totalPorOrigen = recursos.reduce((acc, recurso) => {
      acc[recurso.origen] = (acc[recurso.origen] || 0) + recurso.totalEstimado;
      return acc;
    }, {} as Record<string, number>);

    const totalPorPerfil = recursos.reduce((acc, recurso) => {
      acc[recurso.perfil] = (acc[recurso.perfil] || 0) + recurso.totalEstimado;
      return acc;
    }, {} as Record<string, number>);

    return {
      totalGeneral,
      totalPorOrigen: {
        INTERNO: totalPorOrigen.INTERNO || 0,
        EXTERNO: totalPorOrigen.EXTERNO || 0
      },
      totalPorPerfil: totalPorPerfil as any,
      totalRecursos: recursos.length,
      promedioPorRecurso: recursos.length > 0 ? totalGeneral / recursos.length : 0
    };
  },

  /**
   * Calcula el costo mensual promedio de un recurso
   */
  costoMensual: (recurso: Recurso): number => {
    return recurso.totalEstimado / recurso.meses;
  },

  /**
   * Calcula la eficiencia por hora (costo/hora)
   */
  costoPorHora: (recurso: Recurso): number => {
    return recurso.totalEstimado / recurso.totalHoras;
  }
};