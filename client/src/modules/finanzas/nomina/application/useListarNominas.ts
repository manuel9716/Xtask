import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { Payroll } from '@shared/schema';

/**
 * Hook para listar nóminas con filtros y paginación
 */
export function useListarNominas() {
  const [filtros, setFiltros] = useState({
    page: 1,
    limit: 10,
    empleadoId: undefined as number | undefined,
    mes: undefined as number | undefined,
    anio: undefined as number | undefined,
    estado: undefined as string | undefined,
  });

  // Crear query string para los filtros
  const queryParams = new URLSearchParams();
  queryParams.append('page', filtros.page.toString());
  queryParams.append('limit', filtros.limit.toString());
  
  if (filtros.empleadoId) {
    queryParams.append('empleadoId', filtros.empleadoId.toString());
  }
  
  if (filtros.mes) {
    queryParams.append('mes', filtros.mes.toString());
  }
  
  if (filtros.anio) {
    queryParams.append('anio', filtros.anio.toString());
  }
  
  if (filtros.estado) {
    queryParams.append('estado', filtros.estado);
  }

  const queryKey = ['/api/nomina', filtros];

  // Consultar la API de nóminas
  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey,
    queryFn: async () => {
      const response = await fetch(`/api/nomina?${queryParams.toString()}`);
      if (!response.ok) {
        throw new Error('Error al obtener nóminas');
      }
      return response.json();
    },
  });

  // Manejar cambios en los filtros
  const cambiarFiltros = (nuevosFiltros: Partial<typeof filtros>) => {
    setFiltros(prev => ({
      ...prev,
      ...nuevosFiltros,
      // Resetear a página 1 cuando cambian los filtros que no son de paginación
      page: 'page' in nuevosFiltros ? nuevosFiltros.page || 1 : 1
    }));
  };

  // Funciones para paginación
  const irAPagina = (page: number) => {
    cambiarFiltros({ page });
  };

  const siguientePagina = () => {
    if (data && data.pagination && filtros.page < data.pagination.totalPages) {
      irAPagina(filtros.page + 1);
    }
  };

  const paginaAnterior = () => {
    if (filtros.page > 1) {
      irAPagina(filtros.page - 1);
    }
  };

  // Extraer datos de respuesta
  const nominas: Payroll[] = data?.nominas || [];
  const pagination = data?.pagination || {
    page: filtros.page,
    limit: filtros.limit,
    total: 0,
    totalPages: 0
  };

  return {
    nominas,
    isLoading,
    isError,
    error,
    filtros,
    cambiarFiltros,
    pagination,
    irAPagina,
    siguientePagina,
    paginaAnterior,
    refetch
  };
}