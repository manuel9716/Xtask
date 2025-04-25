import { FiltrosProyecto, Proyecto, ResultadoProyectos, IndicadoresProyectos } from '../entities/Proyecto';
import { EstadoProyecto } from '@shared/schema';

export interface CrearProyectoData {
  nombre: string;
  descripcion: string;
  fechaInicio: Date | string;
  fechaFinPrevista?: Date | string | null;
  presupuesto: number;
  responsableId?: number | null;
  clienteId?: number | null;
  tags?: string[];
}

export interface ActualizarProyectoData {
  nombre?: string;
  descripcion?: string;
  fechaInicio?: Date | string;
  fechaFinPrevista?: Date | string | null;
  fechaFinReal?: Date | string | null;
  presupuesto?: number;
  responsableId?: number | null;
  clienteId?: number | null;
  tags?: string[];
}

export interface CambiarEstadoData {
  estado: EstadoProyecto;
  comentario?: string;
}

export interface ProyectoRepository {
  listarProyectos(pagina: number, porPagina: number, filtros?: FiltrosProyecto): Promise<ResultadoProyectos>;
  obtenerProyecto(id: number): Promise<Proyecto>;
  crearProyecto(data: CrearProyectoData): Promise<Proyecto>;
  actualizarProyecto(id: number, data: ActualizarProyectoData): Promise<Proyecto>;
  cambiarEstado(id: number, data: CambiarEstadoData): Promise<Proyecto>;
  eliminarProyecto(id: number): Promise<void>;
  obtenerIndicadores(): Promise<IndicadoresProyectos>;
}