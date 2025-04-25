import { EstadoProyecto, Proyecto } from '../entities/Proyecto';

/**
 * Servicio para realizar operaciones y lógica de negocio con proyectos
 * Se puede usar para cálculos, validaciones complejas, y reglas de negocio
 */
export class ProyectoService {
  /**
   * Calcula si un proyecto está retrasado basado en su fecha de fin prevista
   * @param proyecto El proyecto a evaluar
   * @returns true si el proyecto está retrasado, false si no
   */
  static estaRetrasado(proyecto: Proyecto): boolean {
    // Si no tiene fecha de fin prevista, no puede estar retrasado
    if (!proyecto.fechaFinPrevista) return false;
    
    // Si ya está finalizado o cancelado, no está retrasado
    if (proyecto.estado === EstadoProyecto.FINALIZADO || 
        proyecto.estado === EstadoProyecto.CANCELADO ||
        proyecto.estado === EstadoProyecto.ARCHIVADO) {
      return false;
    }
    
    // Comprobar si la fecha actual es posterior a la fecha prevista
    const hoy = new Date();
    const fechaFin = new Date(proyecto.fechaFinPrevista);
    return hoy > fechaFin;
  }
  
  /**
   * Calcula el porcentaje de progreso del proyecto (simulado, ya que no tenemos tareas)
   * Si el proyecto está finalizado, retorna 100%
   * En un caso real, este cálculo podría basarse en el porcentaje de tareas completadas
   */
  static calcularProgreso(proyecto: Proyecto): number {
    if (proyecto.estado === EstadoProyecto.FINALIZADO) {
      return 100;
    }
    
    if (!proyecto.fechaFinPrevista || !proyecto.fechaInicio) {
      return 0;
    }
    
    // Calcular progreso basado en el tiempo transcurrido vs tiempo total planificado
    const fechaInicio = new Date(proyecto.fechaInicio).getTime();
    const fechaFin = new Date(proyecto.fechaFinPrevista).getTime();
    const hoy = new Date().getTime();
    
    // Si no ha comenzado aún
    if (hoy < fechaInicio) return 0;
    
    // Si ya pasó la fecha fin
    if (hoy > fechaFin) return 95; // 95% si no está marcado como finalizado
    
    // Progreso basado en tiempo transcurrido
    const tiempoTotal = fechaFin - fechaInicio;
    const tiempoTranscurrido = hoy - fechaInicio;
    const porcentaje = Math.round((tiempoTranscurrido / tiempoTotal) * 100);
    
    // Limitar a un máximo de 95% si no está finalizado
    return Math.min(porcentaje, 95);
  }
  
  /**
   * Calcula los días restantes hasta la fecha de fin prevista
   * Retorna un número negativo si ya pasó la fecha
   */
  static calcularDiasRestantes(proyecto: Proyecto): number | null {
    if (!proyecto.fechaFinPrevista) return null;
    
    const hoy = new Date();
    const fechaFin = new Date(proyecto.fechaFinPrevista);
    const diferencia = fechaFin.getTime() - hoy.getTime();
    
    return Math.ceil(diferencia / (1000 * 60 * 60 * 24));
  }
  
  /**
   * Genera estadísticas agregadas a partir de una colección de proyectos
   */
  static generarEstadisticas(proyectos: Proyecto[]): {
    totalProyectos: number;
    proyectosActivos: number;
    proyectosPausados: number;
    proyectosFinalizados: number;
    proyectosRetrasados: number;
    presupuestoTotal: number;
    presupuestoActivos: number;
  } {
    // Valores iniciales
    let totalProyectos = proyectos.length;
    let proyectosActivos = 0;
    let proyectosPausados = 0;
    let proyectosFinalizados = 0;
    let proyectosRetrasados = 0;
    let presupuestoTotal = 0;
    let presupuestoActivos = 0;
    
    // Calcular estadísticas
    proyectos.forEach(proyecto => {
      // Contar por estado
      if (proyecto.estado === EstadoProyecto.ACTIVO) {
        proyectosActivos++;
        presupuestoActivos += proyecto.presupuesto;
      } else if (proyecto.estado === EstadoProyecto.PAUSADO) {
        proyectosPausados++;
      } else if (proyecto.estado === EstadoProyecto.FINALIZADO) {
        proyectosFinalizados++;
      }
      
      // Acumular presupuesto total (solo de proyectos no archivados)
      if (proyecto.estado !== EstadoProyecto.ARCHIVADO) {
        presupuestoTotal += proyecto.presupuesto;
      }
      
      // Contar retrasados
      if (this.estaRetrasado(proyecto)) {
        proyectosRetrasados++;
      }
    });
    
    return {
      totalProyectos,
      proyectosActivos,
      proyectosPausados,
      proyectosFinalizados,
      proyectosRetrasados,
      presupuestoTotal,
      presupuestoActivos
    };
  }
}