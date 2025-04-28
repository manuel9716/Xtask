/**
 * @file Cliente API para microlearning
 * @description Implementa las operaciones REST para interactuar con el backend de microlearning
 */

import { apiRequest } from '@/utils/apiHelpers';
import { 
  MicroLearningContenido, 
  MicroLearningRecomendacion,
  MicroLearningHistorial,
  FiltrosMicroLearning,
  ContextoRecomendacion,
  ActualizacionProgresoMicroLearning
} from '../../domain/entities/MicroLearning';

const API_BASE_URL = '/api/microlearning';

/**
 * Obtiene el listado de todo el contenido de micro-aprendizaje
 */
export async function obtenerContenido(filtros?: FiltrosMicroLearning): Promise<MicroLearningContenido[]> {
  let url = `${API_BASE_URL}/contenido`;
  
  // Construir query params si hay filtros
  if (filtros) {
    const params = new URLSearchParams();
    
    if (filtros.busqueda) params.append('busqueda', filtros.busqueda);
    if (filtros.categoria) params.append('categoria', filtros.categoria);
    if (filtros.tipoContenido) params.append('tipoContenido', filtros.tipoContenido);
    if (filtros.nivel) params.append('nivel', filtros.nivel);
    if (filtros.duracionMaxima) params.append('duracionMaxima', filtros.duracionMaxima.toString());
    if (filtros.departamento) params.append('departamento', filtros.departamento);
    if (filtros.cargo) params.append('cargo', filtros.cargo);
    if (filtros.soloActivos !== undefined) params.append('soloActivos', filtros.soloActivos.toString());
    
    url += `?${params.toString()}`;
  }
  
  const response = await apiRequest('GET', url);
  return await response.json();
}

/**
 * Obtiene un contenido específico por su ID
 */
export async function obtenerContenidoPorId(id: number): Promise<MicroLearningContenido> {
  const response = await apiRequest('GET', `${API_BASE_URL}/contenido/${id}`);
  return await response.json();
}

/**
 * Obtiene recomendaciones personalizadas para un empleado
 */
export async function obtenerRecomendaciones(contexto: ContextoRecomendacion): Promise<MicroLearningRecomendacion[]> {
  const response = await apiRequest('POST', `${API_BASE_URL}/recomendaciones`, contexto);
  return await response.json();
}

/**
 * Obtiene recomendaciones contextuales basadas en la página/actividad actual
 */
export async function obtenerRecomendacionesContextuales(
  empleadoId: number, 
  contexto: { pagina?: string; actividad?: string }
): Promise<MicroLearningRecomendacion[]> {
  const response = await apiRequest(
    'POST', 
    `${API_BASE_URL}/recomendaciones/contextuales`,
    { empleadoId, ...contexto }
  );
  return await response.json();
}

/**
 * Obtiene el historial de micro-aprendizaje de un empleado
 */
export async function obtenerHistorialEmpleado(empleadoId: number): Promise<MicroLearningHistorial[]> {
  const response = await apiRequest('GET', `${API_BASE_URL}/historial/${empleadoId}`);
  return await response.json();
}

/**
 * Actualiza el progreso de un empleado en un contenido (visto, completado)
 */
export async function actualizarProgresoContenido(
  actualizacion: ActualizacionProgresoMicroLearning
): Promise<MicroLearningRecomendacion> {
  const response = await apiRequest('POST', `${API_BASE_URL}/progreso`, actualizacion);
  return await response.json();
}

/**
 * Registra una valoración de un empleado sobre un contenido
 */
export async function registrarValoracion(
  empleadoId: number,
  contenidoId: number,
  valoracion: number,
  comentario?: string
): Promise<MicroLearningHistorial> {
  const response = await apiRequest('POST', `${API_BASE_URL}/valoracion`, {
    empleadoId,
    contenidoId,
    valoracion,
    comentario
  });
  return await response.json();
}

/**
 * Obtiene estadísticas de uso de micro-aprendizaje para un empleado
 */
export async function obtenerEstadisticasEmpleado(
  empleadoId: number
): Promise<any> {
  const response = await apiRequest('GET', `${API_BASE_URL}/estadisticas/empleado/${empleadoId}`);
  return await response.json();
}

/**
 * Obtiene estadísticas globales de uso de micro-aprendizaje
 */
export async function obtenerEstadisticasGlobales(): Promise<any> {
  const response = await apiRequest('GET', `${API_BASE_URL}/estadisticas/globales`);
  return await response.json();
}