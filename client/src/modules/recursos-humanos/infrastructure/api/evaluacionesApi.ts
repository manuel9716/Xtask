/**
 * @file API de Evaluaciones
 * @description Implementación de la API para gestionar evaluaciones de desempeño
 */

import { apiRequest } from "@/lib/queryClient";
import { 
  Evaluacion, 
  CrearEvaluacionDTO, 
  ActualizarEvaluacionDTO, 
  CompletarEvaluacionDTO,
  FiltrosEvaluacion
} from "../../domain/entities/Evaluacion";
import { convertirFiltrosAQueryParams } from "@/utils/apiHelpers";

const BASE_URL = "/api/evaluaciones";

/**
 * Obtiene todas las evaluaciones con filtros opcionales
 */
export async function listarEvaluaciones(filtros?: FiltrosEvaluacion): Promise<Evaluacion[]> {
  const queryParams = convertirFiltrosAQueryParams(filtros);
  const url = queryParams ? `${BASE_URL}?${queryParams}` : BASE_URL;
  
  const response = await apiRequest("GET", url);
  const data = await response.json();
  
  // Convertir fechas de string a objetos Date
  return data.map((evaluacion: any) => ({
    ...evaluacion,
    fechaInicio: evaluacion.fechaInicio ? new Date(evaluacion.fechaInicio) : undefined,
    fechaFin: evaluacion.fechaFin ? new Date(evaluacion.fechaFin) : undefined,
    createdAt: evaluacion.createdAt ? new Date(evaluacion.createdAt) : undefined,
    updatedAt: evaluacion.updatedAt ? new Date(evaluacion.updatedAt) : undefined,
  }));
}

/**
 * Obtiene una evaluación por su ID
 */
export async function obtenerEvaluacionPorId(id: number): Promise<Evaluacion | null> {
  try {
    const response = await apiRequest("GET", `${BASE_URL}/${id}`);
    
    if (response.status === 404) {
      return null;
    }
    
    const evaluacion = await response.json();
    
    // Convertir fechas de string a objetos Date
    return {
      ...evaluacion,
      fechaInicio: evaluacion.fechaInicio ? new Date(evaluacion.fechaInicio) : undefined,
      fechaFin: evaluacion.fechaFin ? new Date(evaluacion.fechaFin) : undefined,
      createdAt: evaluacion.createdAt ? new Date(evaluacion.createdAt) : undefined,
      updatedAt: evaluacion.updatedAt ? new Date(evaluacion.updatedAt) : undefined,
    };
  } catch (error) {
    console.error("Error al obtener evaluación:", error);
    return null;
  }
}

/**
 * Obtiene evaluaciones por empleado
 */
export async function obtenerEvaluacionesPorEmpleado(empleadoId: number): Promise<Evaluacion[]> {
  const response = await apiRequest("GET", `${BASE_URL}/empleado/${empleadoId}`);
  const data = await response.json();
  
  // Convertir fechas de string a objetos Date
  return data.map((evaluacion: any) => ({
    ...evaluacion,
    fechaInicio: evaluacion.fechaInicio ? new Date(evaluacion.fechaInicio) : undefined,
    fechaFin: evaluacion.fechaFin ? new Date(evaluacion.fechaFin) : undefined,
    createdAt: evaluacion.createdAt ? new Date(evaluacion.createdAt) : undefined,
    updatedAt: evaluacion.updatedAt ? new Date(evaluacion.updatedAt) : undefined,
  }));
}

/**
 * Crea una nueva evaluación
 */
export async function crearEvaluacion(evaluacion: CrearEvaluacionDTO): Promise<Evaluacion> {
  const response = await apiRequest("POST", BASE_URL, evaluacion);
  const nuevaEvaluacion = await response.json();
  
  // Convertir fechas de string a objetos Date
  return {
    ...nuevaEvaluacion,
    fechaInicio: nuevaEvaluacion.fechaInicio ? new Date(nuevaEvaluacion.fechaInicio) : undefined,
    fechaFin: nuevaEvaluacion.fechaFin ? new Date(nuevaEvaluacion.fechaFin) : undefined,
    createdAt: nuevaEvaluacion.createdAt ? new Date(nuevaEvaluacion.createdAt) : undefined,
    updatedAt: nuevaEvaluacion.updatedAt ? new Date(nuevaEvaluacion.updatedAt) : undefined,
  };
}

/**
 * Actualiza una evaluación existente
 */
export async function actualizarEvaluacion(evaluacion: ActualizarEvaluacionDTO): Promise<Evaluacion> {
  const response = await apiRequest("PATCH", `${BASE_URL}/${evaluacion.id}`, evaluacion);
  const evaluacionActualizada = await response.json();
  
  // Convertir fechas de string a objetos Date
  return {
    ...evaluacionActualizada,
    fechaInicio: evaluacionActualizada.fechaInicio ? new Date(evaluacionActualizada.fechaInicio) : undefined,
    fechaFin: evaluacionActualizada.fechaFin ? new Date(evaluacionActualizada.fechaFin) : undefined,
    createdAt: evaluacionActualizada.createdAt ? new Date(evaluacionActualizada.createdAt) : undefined,
    updatedAt: evaluacionActualizada.updatedAt ? new Date(evaluacionActualizada.updatedAt) : undefined,
  };
}

/**
 * Cambia el estado de una evaluación
 */
export async function cambiarEstadoEvaluacion(id: number, estado: string): Promise<Evaluacion> {
  const response = await apiRequest("PATCH", `${BASE_URL}/${id}/estado`, { estado });
  const evaluacionActualizada = await response.json();
  
  // Convertir fechas de string a objetos Date
  return {
    ...evaluacionActualizada,
    fechaInicio: evaluacionActualizada.fechaInicio ? new Date(evaluacionActualizada.fechaInicio) : undefined,
    fechaFin: evaluacionActualizada.fechaFin ? new Date(evaluacionActualizada.fechaFin) : undefined,
    createdAt: evaluacionActualizada.createdAt ? new Date(evaluacionActualizada.createdAt) : undefined,
    updatedAt: evaluacionActualizada.updatedAt ? new Date(evaluacionActualizada.updatedAt) : undefined,
  };
}

/**
 * Completa una evaluación con calificación y comentarios
 */
export async function completarEvaluacion(datos: CompletarEvaluacionDTO): Promise<Evaluacion> {
  // Utilizamos la misma ruta de actualización pero con los datos específicos para completar
  const response = await apiRequest("PATCH", `${BASE_URL}/${datos.id}`, {
    ...datos,
    estado: "COMPLETADA"
  });
  
  const evaluacionCompletada = await response.json();
  
  // Convertir fechas de string a objetos Date
  return {
    ...evaluacionCompletada,
    fechaInicio: evaluacionCompletada.fechaInicio ? new Date(evaluacionCompletada.fechaInicio) : undefined,
    fechaFin: evaluacionCompletada.fechaFin ? new Date(evaluacionCompletada.fechaFin) : undefined,
    createdAt: evaluacionCompletada.createdAt ? new Date(evaluacionCompletada.createdAt) : undefined,
    updatedAt: evaluacionCompletada.updatedAt ? new Date(evaluacionCompletada.updatedAt) : undefined,
  };
}

/**
 * Elimina una evaluación (archivarla)
 */
export async function eliminarEvaluacion(id: number): Promise<{ success: boolean }> {
  const response = await apiRequest("DELETE", `${BASE_URL}/${id}`);
  const result = await response.json();
  
  return { success: !!result.evaluacion };
}

/**
 * Obtiene estadísticas de evaluaciones por departamento
 */
export async function obtenerEstadisticasPorDepartamento(): Promise<any> {
  const response = await apiRequest("GET", `${BASE_URL}/estadisticas/departamento`);
  return await response.json();
}