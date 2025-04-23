import { useQuery } from '@tanstack/react-query';
import { Presupuesto } from '../domain/entities/Presupuesto';
import { PresupuestoRepository } from '../infrastructure/repositories/presupuesto.repository';

/**
 * Opciones para filtrar presupuestos
 */
export interface PresupuestoFilterOptions {
  estado?: string;
  area?: string;
  periodo?: string;
  search?: string;
}

/**
 * Hook para obtener y filtrar la lista de presupuestos
 */
export function useListarPresupuestos(
  organizationId: number = 1,
  filterOptions: PresupuestoFilterOptions = {}
) {
  const presupuestoRepository = new PresupuestoRepository();
  
  // Consultar la lista de presupuestos
  const { 
    data: presupuestos,
    isLoading,
    isError,
    error,
    refetch
  } = useQuery<Presupuesto[], Error>({
    queryKey: ['/api/presupuestos', organizationId, filterOptions],
    queryFn: async () => {
      const allPresupuestos = await presupuestoRepository.getAll(organizationId);
      return filterPresupuestos(allPresupuestos, filterOptions);
    }
  });
  
  /**
   * Función para aplicar filtros a la lista de presupuestos
   */
  function filterPresupuestos(
    presupuestos: Presupuesto[],
    filters: PresupuestoFilterOptions
  ): Presupuesto[] {
    return presupuestos.filter(presupuesto => {
      // Filtro por estado
      if (filters.estado && presupuesto.estado !== filters.estado) {
        return false;
      }
      
      // Filtro por área
      if (filters.area && presupuesto.area !== filters.area) {
        return false;
      }
      
      // Filtro por período
      if (filters.periodo && presupuesto.periodo !== filters.periodo) {
        return false;
      }
      
      // Búsqueda por texto
      if (filters.search) {
        const searchTerm = filters.search.toLowerCase();
        const matchesName = presupuesto.nombre.toLowerCase().includes(searchTerm);
        const matchesArea = presupuesto.area?.toLowerCase().includes(searchTerm);
        
        if (!matchesName && !matchesArea) {
          return false;
        }
      }
      
      return true;
    });
  }
  
  /**
   * Obtiene las áreas únicas de los presupuestos para los filtros
   */
  const getUniqueAreas = (): string[] => {
    if (!presupuestos) return [];
    
    const areas = presupuestos
      .filter(p => p.area)
      .map(p => p.area as string);
      
    return [...new Set(areas)].sort();
  };
  
  return {
    presupuestos: presupuestos || [],
    isLoading,
    isError,
    error,
    refetch,
    getUniqueAreas
  };
}