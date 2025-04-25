import { useQuery } from '@tanstack/react-query';
import { Proyecto } from '../../domain/entities/Proyecto';
import { ProyectoService } from '../../domain/services/ProyectoService';
import { proyectosApi } from '../../infrastructure/api/proyectosApi';

/**
 * Hook para obtener un proyecto por su ID
 * Implementa el caso de uso "Obtener Proyecto por ID"
 */
export function useObtenerProyecto(id?: number) {
  const {
    data: proyecto,
    isLoading,
    isError,
    error,
    refetch
  } = useQuery<Proyecto, Error>({
    queryKey: ['/api/proyectos', id],
    queryFn: async () => {
      if (!id) throw new Error('ID de proyecto no especificado');
      return await proyectosApi.obtenerProyectoPorId(id);
    },
    enabled: !!id,  // Solo ejecutar si hay un ID
  });
  
  // Calcular información adicional sobre el proyecto si existe
  const proyectoConDetalles = proyecto ? {
    ...proyecto,
    progreso: ProyectoService.calcularProgreso(proyecto),
    retrasado: ProyectoService.estaRetrasado(proyecto),
    diasRestantes: ProyectoService.calcularDiasRestantes(proyecto)
  } : undefined;
  
  return {
    proyecto: proyectoConDetalles,
    isLoading,
    isError,
    error,
    refetch
  };
}