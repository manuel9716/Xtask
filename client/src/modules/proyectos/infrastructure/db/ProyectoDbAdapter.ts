import { ProyectoRepository, CrearProyectoData, ActualizarProyectoData, CambiarEstadoData } from '../../domain/repositories/ProyectoRepository';
import { Proyecto, FiltrosProyecto, ResultadoProyectos, IndicadoresProyectos } from '../../domain/entities/Proyecto';
import * as proyectosApi from '../api/proyectosApi';

export class ProyectoDbAdapter implements ProyectoRepository {
  async listarProyectos(pagina: number, porPagina: number, filtros?: FiltrosProyecto): Promise<ResultadoProyectos> {
    const response = await proyectosApi.listarProyectos({
      page: pagina,
      pageSize: porPagina,
      filtros
    });
    
    // Transformar la respuesta API al formato de dominio
    return {
      proyectos: response.data.map(proyecto => ({
        ...proyecto,
        progreso: 0, // Esto sería calculado por un servicio de dominio
        retrasado: false // Esto sería calculado por un servicio de dominio
      })),
      proyectosActivos: [],
      proyectosPausados: [],
      proyectosFinalizados: [],
      proyectosRetrasados: [],
      pagina: response.pagina,
      porPagina: response.porPagina,
      total: response.total,
      totalPaginas: response.totalPaginas
    };
  }

  async obtenerProyecto(id: number): Promise<Proyecto> {
    return proyectosApi.obtenerProyecto(id);
  }

  async crearProyecto(data: CrearProyectoData): Promise<Proyecto> {
    return proyectosApi.crearProyecto(data);
  }

  async actualizarProyecto(id: number, data: ActualizarProyectoData): Promise<Proyecto> {
    return proyectosApi.actualizarProyecto(id, data);
  }

  async cambiarEstado(id: number, data: CambiarEstadoData): Promise<Proyecto> {
    return proyectosApi.cambiarEstadoProyecto(id, data);
  }

  async eliminarProyecto(id: number): Promise<void> {
    return proyectosApi.eliminarProyecto(id);
  }

  async obtenerIndicadores(): Promise<IndicadoresProyectos> {
    return proyectosApi.obtenerIndicadoresProyectos();
  }
}