import { EstadoProyecto } from '@shared/schema';

// Define FiltrosProyecto locally since it's not being properly imported
export interface FiltrosProyecto {
  busqueda?: string;
  estado?: string;
  fechaInicio?: Date;
  fechaFin?: Date;
  responsableId?: number;
  clienteId?: number;
}

export { EstadoProyecto };

export interface Proyecto {
  id: number;
  nombre: string;
  descripcion: string;
  fechaInicio: Date;
  fechaFinPrevista: Date | null;
  fechaFinReal: Date | null;
  estado: EstadoProyecto;
  presupuesto: number;
  responsableId: number | null;
  clienteId: number | null;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

// Interfaces para la paginación y filtrado
export interface PaginacionProyectos {
  pagina: number;
  porPagina: number;
  total: number;
  totalPaginas: number;
}

export interface ResultadoProyectos extends PaginacionProyectos {
  proyectos: (Proyecto & { 
    progreso: number;
    retrasado: boolean;
  })[];
  proyectosActivos: Proyecto[];
  proyectosPausados: Proyecto[];
  proyectosFinalizados: Proyecto[];
  proyectosRetrasados: Proyecto[];
}

// Interfaces para indicadores/métricas
export interface IndicadoresProyectos {
  totalProyectos: number;
  proyectosActivos: number;
  proyectosPausados: number;
  proyectosFinalizados: number;
  proyectosRetrasados: number;
  presupuestoTotal: number;
  presupuestoActivos: number;
}