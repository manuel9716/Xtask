import { apiRequest } from '@/lib/queryClient';
import { Proyecto, FiltrosProyecto, ResultadoProyectos, IndicadoresProyectos } from '../../domain/entities/Proyecto';
import { CrearProyectoData, ActualizarProyectoData, CambiarEstadoData } from '../../domain/repositories/ProyectoRepository';

const API_URL = '/api/proyectos';

// Listar proyectos con paginación y filtros
export async function listarProyectos(params: { 
  page: number; 
  pageSize: number; 
  filtros?: FiltrosProyecto 
}): Promise<{
  data: Proyecto[];
  pagina: number;
  porPagina: number;
  total: number;
  totalPaginas: number;
}> {
  const queryParams = new URLSearchParams();
  queryParams.append('page', params.page.toString());
  queryParams.append('pageSize', params.pageSize.toString());
  
  // Añadir filtros si existen
  if (params.filtros) {
    if (params.filtros.busqueda) {
      queryParams.append('busqueda', params.filtros.busqueda);
    }
    
    if (params.filtros.estado) {
      queryParams.append('estado', params.filtros.estado);
    }
    
    if (params.filtros.fechaInicio) {
      queryParams.append('fechaInicio', params.filtros.fechaInicio.toISOString());
    }
    
    if (params.filtros.fechaFin) {
      queryParams.append('fechaFin', params.filtros.fechaFin.toISOString());
    }
    
    if (params.filtros.responsableId) {
      queryParams.append('responsableId', params.filtros.responsableId.toString());
    }
    
    if (params.filtros.clienteId) {
      queryParams.append('clienteId', params.filtros.clienteId.toString());
    }
  }
  
  const url = `${API_URL}?${queryParams.toString()}`;
  const response = await apiRequest('GET', url);
  return response.json();
}

// Obtener un proyecto por ID
export async function obtenerProyecto(id: number): Promise<Proyecto> {
  const response = await apiRequest('GET', `${API_URL}/${id}`);
  return response.json();
}

// Crear un nuevo proyecto
export async function crearProyecto(data: CrearProyectoData): Promise<Proyecto> {
  const response = await apiRequest('POST', API_URL, data);
  return response.json();
}

// Actualizar un proyecto existente
export async function actualizarProyecto(id: number, data: ActualizarProyectoData): Promise<Proyecto> {
  const response = await apiRequest('PATCH', `${API_URL}/${id}`, data);
  return response.json();
}

// Cambiar el estado de un proyecto
export async function cambiarEstadoProyecto(id: number, data: CambiarEstadoData): Promise<Proyecto> {
  const response = await apiRequest('PATCH', `${API_URL}/${id}/estado`, data);
  return response.json();
}

// Eliminar un proyecto
export async function eliminarProyecto(id: number): Promise<void> {
  await apiRequest('DELETE', `${API_URL}/${id}`);
}

// Obtener indicadores/métricas de proyectos
export async function obtenerIndicadoresProyectos(): Promise<IndicadoresProyectos> {
  const response = await apiRequest('GET', `${API_URL}/indicadores`);
  return response.json();
}