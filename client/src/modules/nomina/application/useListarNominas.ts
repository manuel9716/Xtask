import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { FiltrosNomina, ResultadoPaginadoNominas } from '../domain/entities/Nomina';

/**
 * Hook para listar nóminas con paginación y filtros
 */
export function useListarNominas() {
  // Estado para los filtros
  const [filtros, setFiltros] = useState<FiltrosNomina>({
    page: 1,
    pageSize: 10
  });
  
  // Construir URL con los parámetros de filtro
  const construirURL = () => {
    const params = new URLSearchParams();
    
    if (filtros.empleadoId) {
      params.append('empleadoId', filtros.empleadoId.toString());
    }
    
    if (filtros.mes) {
      params.append('mes', filtros.mes.toString());
    }
    
    if (filtros.anio) {
      params.append('anio', filtros.anio.toString());
    }
    
    if (filtros.estado) {
      params.append('estado', filtros.estado);
    }
    
    if (filtros.page) {
      params.append('page', filtros.page.toString());
    }
    
    if (filtros.pageSize) {
      params.append('pageSize', filtros.pageSize.toString());
    }
    
    return `/api/nomina/v1/listar?${params.toString()}`;
  };
  
  // Consulta para obtener las nóminas
  const {
    data,
    isLoading,
    isError,
    error,
    refetch
  } = useQuery({
    queryKey: ['/api/nomina/v1/listar', filtros],
    queryFn: async () => {
      console.log("Enviando filtros:", filtros);
      const response = await fetch(construirURL());
      
      if (!response.ok) {
        throw new Error('Error al obtener las nóminas');
      }
      
      return await response.json();
    }
  });
  
  // Extraer datos de la respuesta
  const resultado: ResultadoPaginadoNominas = data || {
    nominas: [],
    pagination: {
      page: filtros.page || 1,
      pageSize: filtros.pageSize || 10,
      totalItems: 0,
      totalPages: 0
    }
  };
  
  console.log("Datos recibidos:", data);
  
  // Función para cambiar los filtros
  const cambiarFiltros = (nuevosFiltros: Partial<FiltrosNomina>) => {
    setFiltros(prev => ({
      ...prev,
      ...nuevosFiltros,
      // Si cambian los filtros, volver a la página 1
      page: Object.keys(nuevosFiltros).some(key => key !== 'page' && key !== 'pageSize') ? 1 : nuevosFiltros.page || prev.page
    }));
  };
  
  // Función para ir a una página específica
  const irAPagina = (pagina: number) => {
    if (pagina < 1 || pagina > resultado.pagination.totalPages) {
      return;
    }
    
    cambiarFiltros({ page: pagina });
  };
  
  return {
    nominas: resultado.nominas,
    pagination: resultado.pagination,
    isLoading,
    isError,
    error,
    filtros,
    cambiarFiltros,
    irAPagina,
    refetch
  };
}