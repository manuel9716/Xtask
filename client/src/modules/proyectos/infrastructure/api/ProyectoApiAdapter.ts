import { Proyecto, FiltrosProyecto, ResultadoProyectos, IndicadoresProyectos } from '../../domain/entities/Proyecto';
import { ProyectoRepository, CrearProyectoData, ActualizarProyectoData, CambiarEstadoData } from '../../domain/repositories/ProyectoRepository';
import * as proyectosApi from './proyectosApi';

/**
 * Adaptador que conecta el repositorio de dominio con la implementación de la API
 * Esta clase permite aislar el dominio de la implementación específica de la API
 */
export class ProyectoApiAdapter implements ProyectoRepository {
  async listarProyectos(pagina: number, porPagina: number, filtros?: FiltrosProyecto): Promise<ResultadoProyectos> {
    // Llamar a la API con los parámetros recibidos
    const response = await proyectosApi.listarProyectos({
      page: pagina,
      pageSize: porPagina,
      filtros
    });

    // Transformar la respuesta al formato esperado por el dominio
    const proyectosTransformados = response.data.map(p => ({
      ...p,
      // Calcular progreso y retraso en base a fechas y estado
      progreso: this.calcularProgreso(p),
      retrasado: this.estaRetrasado(p)
    }));

    // Clasificar proyectos por estado
    const proyectosActivos = response.data.filter(p => p.estado === 'ACTIVO');
    const proyectosPausados = response.data.filter(p => p.estado === 'PAUSADO');
    const proyectosFinalizados = response.data.filter(p => p.estado === 'FINALIZADO');
    const proyectosRetrasados = response.data.filter(p => this.estaRetrasado(p));

    return {
      proyectos: proyectosTransformados,
      proyectosActivos,
      proyectosPausados,
      proyectosFinalizados,
      proyectosRetrasados,
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

  // Métodos auxiliares privados para cálculos
  private calcularProgreso(proyecto: Proyecto): number {
    // Implementación simple: si está finalizado, 100%, si no, basado en tiempo transcurrido
    if (proyecto.estado === 'FINALIZADO') return 100;
    if (!proyecto.fechaFinPrevista) return 0;

    const inicio = new Date(proyecto.fechaInicio).getTime();
    const fin = new Date(proyecto.fechaFinPrevista).getTime();
    const ahora = new Date().getTime();
    
    // Si no ha comenzado aún
    if (ahora < inicio) return 0;
    
    // Si ya debería haber terminado
    if (ahora > fin) return 95; // 95% para indicar que falta finalizar
    
    // Progreso basado en tiempo transcurrido
    const duracionTotal = fin - inicio;
    const transcurrido = ahora - inicio;
    const porcentaje = (transcurrido / duracionTotal) * 100;
    
    return Math.min(Math.round(porcentaje), 95); // Máximo 95% si no está finalizado
  }
  
  private estaRetrasado(proyecto: Proyecto): boolean {
    // Un proyecto está retrasado si está activo y su fecha de fin prevista ya pasó
    if (proyecto.estado !== 'ACTIVO') return false;
    if (!proyecto.fechaFinPrevista) return false;
    
    const fechaFin = new Date(proyecto.fechaFinPrevista);
    const hoy = new Date();
    
    return fechaFin < hoy;
  }
}