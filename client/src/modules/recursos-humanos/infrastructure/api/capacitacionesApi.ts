/**
 * @file API de Capacitaciones
 * @description Implementación de la API para gestionar capacitaciones y formaciones
 */

import { apiRequest } from "@/lib/queryClient";
import { 
  Capacitacion, 
  EmpleadoCapacitacion,
  CrearCapacitacionDTO, 
  ActualizarCapacitacionDTO, 
  InscribirEmpleadoDTO,
  FiltrosCapacitacion
} from "../../domain/entities/Capacitacion";
import { convertirFiltrosAQueryParams } from "@/utils/apiHelpers";

const BASE_URL = "/api/capacitaciones";

/**
 * Obtiene todas las capacitaciones con filtros opcionales
 */
export async function listarCapacitaciones(filtros?: FiltrosCapacitacion): Promise<Capacitacion[]> {
  const queryParams = convertirFiltrosAQueryParams(filtros);
  const url = queryParams ? `${BASE_URL}?${queryParams}` : BASE_URL;
  
  const response = await apiRequest("GET", url);
  const data = await response.json();
  
  // Convertir fechas de string a objetos Date
  return data.map((capacitacion: any) => ({
    ...capacitacion,
    fechaInicio: capacitacion.fechaInicio ? new Date(capacitacion.fechaInicio) : undefined,
    fechaFin: capacitacion.fechaFin ? new Date(capacitacion.fechaFin) : undefined,
    createdAt: capacitacion.createdAt ? new Date(capacitacion.createdAt) : undefined,
    updatedAt: capacitacion.updatedAt ? new Date(capacitacion.updatedAt) : undefined,
  }));
}

/**
 * Obtiene una capacitación por su ID
 */
export async function obtenerCapacitacionPorId(id: number): Promise<Capacitacion | null> {
  try {
    const response = await apiRequest("GET", `${BASE_URL}/${id}`);
    
    if (response.status === 404) {
      return null;
    }
    
    const capacitacion = await response.json();
    
    // Convertir fechas de string a objetos Date
    return {
      ...capacitacion,
      fechaInicio: capacitacion.fechaInicio ? new Date(capacitacion.fechaInicio) : undefined,
      fechaFin: capacitacion.fechaFin ? new Date(capacitacion.fechaFin) : undefined,
      createdAt: capacitacion.createdAt ? new Date(capacitacion.createdAt) : undefined,
      updatedAt: capacitacion.updatedAt ? new Date(capacitacion.updatedAt) : undefined,
    };
  } catch (error) {
    console.error("Error al obtener capacitación:", error);
    return null;
  }
}

/**
 * Obtiene capacitaciones programadas (futuras)
 */
export async function obtenerCapacitacionesProgramadas(): Promise<Capacitacion[]> {
  const response = await apiRequest("GET", `${BASE_URL}/estado/programadas`);
  const data = await response.json();
  
  // Convertir fechas de string a objetos Date
  return data.map((capacitacion: any) => ({
    ...capacitacion,
    fechaInicio: capacitacion.fechaInicio ? new Date(capacitacion.fechaInicio) : undefined,
    fechaFin: capacitacion.fechaFin ? new Date(capacitacion.fechaFin) : undefined,
    createdAt: capacitacion.createdAt ? new Date(capacitacion.createdAt) : undefined,
    updatedAt: capacitacion.updatedAt ? new Date(capacitacion.updatedAt) : undefined,
  }));
}

/**
 * Obtiene capacitaciones en curso
 */
export async function obtenerCapacitacionesEnCurso(): Promise<Capacitacion[]> {
  const response = await apiRequest("GET", `${BASE_URL}/estado/en-curso`);
  const data = await response.json();
  
  // Convertir fechas de string a objetos Date
  return data.map((capacitacion: any) => ({
    ...capacitacion,
    fechaInicio: capacitacion.fechaInicio ? new Date(capacitacion.fechaInicio) : undefined,
    fechaFin: capacitacion.fechaFin ? new Date(capacitacion.fechaFin) : undefined,
    createdAt: capacitacion.createdAt ? new Date(capacitacion.createdAt) : undefined,
    updatedAt: capacitacion.updatedAt ? new Date(capacitacion.updatedAt) : undefined,
  }));
}

/**
 * Obtiene capacitaciones por empleado
 */
export async function obtenerCapacitacionesPorEmpleado(empleadoId: number): Promise<Capacitacion[]> {
  const response = await apiRequest("GET", `${BASE_URL}/empleado/${empleadoId}`);
  const data = await response.json();
  
  // Convertir fechas de string a objetos Date
  return data.map((capacitacion: any) => ({
    ...capacitacion,
    fechaInicio: capacitacion.fechaInicio ? new Date(capacitacion.fechaInicio) : undefined,
    fechaFin: capacitacion.fechaFin ? new Date(capacitacion.fechaFin) : undefined,
    createdAt: capacitacion.createdAt ? new Date(capacitacion.createdAt) : undefined,
    updatedAt: capacitacion.updatedAt ? new Date(capacitacion.updatedAt) : undefined,
  }));
}

/**
 * Crea una nueva capacitación
 */
export async function crearCapacitacion(capacitacion: CrearCapacitacionDTO): Promise<Capacitacion> {
  const response = await apiRequest("POST", BASE_URL, capacitacion);
  const nuevaCapacitacion = await response.json();
  
  // Convertir fechas de string a objetos Date
  return {
    ...nuevaCapacitacion,
    fechaInicio: nuevaCapacitacion.fechaInicio ? new Date(nuevaCapacitacion.fechaInicio) : undefined,
    fechaFin: nuevaCapacitacion.fechaFin ? new Date(nuevaCapacitacion.fechaFin) : undefined,
    createdAt: nuevaCapacitacion.createdAt ? new Date(nuevaCapacitacion.createdAt) : undefined,
    updatedAt: nuevaCapacitacion.updatedAt ? new Date(nuevaCapacitacion.updatedAt) : undefined,
  };
}

/**
 * Actualiza una capacitación existente
 */
export async function actualizarCapacitacion(capacitacion: ActualizarCapacitacionDTO): Promise<Capacitacion> {
  const response = await apiRequest("PATCH", `${BASE_URL}/${capacitacion.id}`, capacitacion);
  const capacitacionActualizada = await response.json();
  
  // Convertir fechas de string a objetos Date
  return {
    ...capacitacionActualizada,
    fechaInicio: capacitacionActualizada.fechaInicio ? new Date(capacitacionActualizada.fechaInicio) : undefined,
    fechaFin: capacitacionActualizada.fechaFin ? new Date(capacitacionActualizada.fechaFin) : undefined,
    createdAt: capacitacionActualizada.createdAt ? new Date(capacitacionActualizada.createdAt) : undefined,
    updatedAt: capacitacionActualizada.updatedAt ? new Date(capacitacionActualizada.updatedAt) : undefined,
  };
}

/**
 * Cambia el estado de una capacitación
 */
export async function cambiarEstadoCapacitacion(id: number, estado: string): Promise<Capacitacion> {
  const response = await apiRequest("PATCH", `${BASE_URL}/${id}/estado`, { estado });
  const capacitacionActualizada = await response.json();
  
  // Convertir fechas de string a objetos Date
  return {
    ...capacitacionActualizada,
    fechaInicio: capacitacionActualizada.fechaInicio ? new Date(capacitacionActualizada.fechaInicio) : undefined,
    fechaFin: capacitacionActualizada.fechaFin ? new Date(capacitacionActualizada.fechaFin) : undefined,
    createdAt: capacitacionActualizada.createdAt ? new Date(capacitacionActualizada.createdAt) : undefined,
    updatedAt: capacitacionActualizada.updatedAt ? new Date(capacitacionActualizada.updatedAt) : undefined,
  };
}

/**
 * Elimina una capacitación (cancelarla)
 */
export async function eliminarCapacitacion(id: number): Promise<{ success: boolean }> {
  const response = await apiRequest("DELETE", `${BASE_URL}/${id}`);
  const result = await response.json();
  
  return { success: !!result.capacitacion };
}

/**
 * Inscribe un empleado en una capacitación
 */
export async function inscribirEmpleado(datos: InscribirEmpleadoDTO): Promise<EmpleadoCapacitacion> {
  const response = await apiRequest("POST", `${BASE_URL}/${datos.capacitacionId}/inscripciones`, {
    empleadoId: datos.empleadoId,
    comentarios: datos.comentarios
  });
  
  const inscripcion = await response.json();
  
  // Convertir fechas de string a objetos Date
  return {
    ...inscripcion,
    fechaInscripcion: inscripcion.fechaInscripcion ? new Date(inscripcion.fechaInscripcion) : new Date(),
  };
}

/**
 * Cancela la inscripción de un empleado en una capacitación
 */
export async function cancelarInscripcion(capacitacionId: number, empleadoId: number): Promise<boolean> {
  const response = await apiRequest("DELETE", `${BASE_URL}/${capacitacionId}/inscripciones/${empleadoId}`);
  const result = await response.json();
  
  return !!result.message;
}

/**
 * Obtiene las inscripciones a una capacitación
 */
export async function obtenerInscripciones(capacitacionId: number): Promise<EmpleadoCapacitacion[]> {
  const response = await apiRequest("GET", `${BASE_URL}/${capacitacionId}/inscripciones`);
  const data = await response.json();
  
  // Convertir fechas de string a objetos Date
  return data.map((inscripcion: any) => ({
    ...inscripcion,
    fechaInscripcion: inscripcion.fechaInscripcion ? new Date(inscripcion.fechaInscripcion) : new Date(),
  }));
}

/**
 * Registra la asistencia de un empleado a una capacitación
 */
export async function registrarAsistencia(capacitacionId: number, empleadoId: number, asistio: boolean): Promise<EmpleadoCapacitacion> {
  const response = await apiRequest("PATCH", `${BASE_URL}/${capacitacionId}/inscripciones/${empleadoId}/asistencia`, {
    asistio
  });
  
  const inscripcionActualizada = await response.json();
  
  // Convertir fechas de string a objetos Date
  return {
    ...inscripcionActualizada,
    fechaInscripcion: inscripcionActualizada.fechaInscripcion ? new Date(inscripcionActualizada.fechaInscripcion) : new Date(),
  };
}

/**
 * Marca una capacitación como completada para un empleado
 */
export async function marcarCompletada(capacitacionId: number, empleadoId: number, calificacion?: number): Promise<EmpleadoCapacitacion> {
  const response = await apiRequest("PATCH", `${BASE_URL}/${capacitacionId}/inscripciones/${empleadoId}/completar`, {
    calificacion
  });
  
  const inscripcionActualizada = await response.json();
  
  // Convertir fechas de string a objetos Date
  return {
    ...inscripcionActualizada,
    fechaInscripcion: inscripcionActualizada.fechaInscripcion ? new Date(inscripcionActualizada.fechaInscripcion) : new Date(),
  };
}

/**
 * Obtiene estadísticas de capacitaciones
 */
export async function obtenerEstadisticasCapacitaciones(): Promise<any> {
  const response = await apiRequest("GET", `${BASE_URL}/estadisticas/resumen`);
  return await response.json();
}