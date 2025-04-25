import { useQuery } from '@tanstack/react-query';
import { EstadoProyecto, FiltrosProyecto, ProyectosPaginados } from '../../domain/entities/Proyecto';
import { ProyectoService } from '../../domain/services/ProyectoService';
import { proyectosApi } from '../../infrastructure/api/proyectosApi';

/**
 * Hook para listar proyectos con filtros y paginación
 * Implementa el caso de uso "Listar Proyectos"
 */
export function useListarProyectos(filtros?: FiltrosProyecto) {
  // Valores por defecto para la paginación
  const filtrosConDefaults: FiltrosProyecto = {
    page: 1,
    pageSize: 10,
    ...filtros
  };
  
  // Consulta para obtener los proyectos
  const {
    data,
    isLoading,
    isError,
    error,
    refetch
  } = useQuery<ProyectosPaginados, Error>({
    queryKey: ['/api/proyectos', filtrosConDefaults],
    queryFn: async () => {
      return await proyectosApi.listarProyectos(filtrosConDefaults);
    }
  });
  
  // Calcular proyectos retrasados si hay datos
  const proyectosRetrasados = data?.data
    ? data.data.filter(proyecto => ProyectoService.estaRetrasado(proyecto))
    : [];
  
  // Calcular progreso para cada proyecto
  const proyectosConProgreso = data?.data
    ? data.data.map(proyecto => ({
        ...proyecto,
        progreso: ProyectoService.calcularProgreso(proyecto),
        retrasado: ProyectoService.estaRetrasado(proyecto)
      }))
    : [];
  
  return {
    proyectos: proyectosConProgreso || [],
    paginacion: data ? {
      total: data.total,
      pagina: data.pagina,
      totalPaginas: data.totalPaginas,
      porPagina: data.porPagina
    } : null,
    isLoading,
    isError,
    error,
    refetch,
    proyectosRetrasados
  };
}

/**
 * Hook para obtener todos los proyectos y sus estadísticas
 * Se usa para el dashboard de indicadores
 */
export function useProyectosEstadisticas() {
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['/api/proyectos/indicadores'],
    queryFn: async () => {
      return await proyectosApi.obtenerIndicadores();
    }
  });
  
  return {
    estadisticas: data,
    isLoading,
    isError,
    error
  };
}