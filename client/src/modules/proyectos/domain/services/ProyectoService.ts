import { Proyecto, ResultadoProyectos, IndicadoresProyectos, FiltrosProyecto } from '../entities/Proyecto';
import { ProyectoRepository, CrearProyectoData, ActualizarProyectoData, CambiarEstadoData } from '../repositories/ProyectoRepository';

/**
 * Servicio que implementa la lógica de negocio para proyectos
 * Actúa como fachada entre los casos de uso y el repositorio
 */
export class ProyectoService {
  constructor(private repository: ProyectoRepository) {}

  // Métodos principales que delegan en el repositorio
  async listarProyectos(
    pagina: number = 1, 
    porPagina: number = 10, 
    filtros?: FiltrosProyecto
  ): Promise<ResultadoProyectos> {
    return this.repository.listarProyectos(pagina, porPagina, filtros);
  }

  async obtenerProyecto(id: number): Promise<Proyecto> {
    return this.repository.obtenerProyecto(id);
  }

  async crearProyecto(data: CrearProyectoData): Promise<Proyecto> {
    // Aquí podríamos añadir validaciones o lógica de negocio adicional
    return this.repository.crearProyecto(data);
  }

  async actualizarProyecto(id: number, data: ActualizarProyectoData): Promise<Proyecto> {
    return this.repository.actualizarProyecto(id, data);
  }

  async cambiarEstado(id: number, data: CambiarEstadoData): Promise<Proyecto> {
    return this.repository.cambiarEstado(id, data);
  }

  async eliminarProyecto(id: number): Promise<void> {
    return this.repository.eliminarProyecto(id);
  }

  async obtenerIndicadores(): Promise<IndicadoresProyectos> {
    return this.repository.obtenerIndicadores();
  }

  // Métodos de lógica de negocio para cálculos sobre proyectos
  calcularProgreso(proyecto: Proyecto): number {
    // Si está finalizado, 100%
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
  
  estaRetrasado(proyecto: Proyecto): boolean {
    // Un proyecto está retrasado si está activo y su fecha de fin prevista ya pasó
    if (proyecto.estado !== 'ACTIVO') return false;
    if (!proyecto.fechaFinPrevista) return false;
    
    const fechaFin = new Date(proyecto.fechaFinPrevista);
    const hoy = new Date();
    
    return fechaFin < hoy;
  }
  
  calcularDiasRestantes(proyecto: Proyecto): number | null {
    if (!proyecto.fechaFinPrevista) return null;
    
    const ahora = new Date();
    const fechaFin = new Date(proyecto.fechaFinPrevista);
    
    // Si el proyecto ya debería haber terminado
    if (ahora > fechaFin) return 0;
    
    // Calcular diferencia en días
    const diffTime = fechaFin.getTime() - ahora.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return diffDays;
  }
}