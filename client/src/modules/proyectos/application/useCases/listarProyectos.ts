import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { FiltrosProyecto, ResultadoProyectos } from '../../domain/entities/Proyecto';
import { proyectoService } from '../../infrastructure/di/container';

/**
 * Hook para listar proyectos con paginación y filtrado
 */
export function useProyectos(initialPagina: number = 1, initialPorPagina: number = 10) {
  // Estados para paginación y filtros
  const [pagina, setPagina] = useState(initialPagina);
  const [porPagina, setPorPagina] = useState(initialPorPagina);
  const [filtros, setFiltros] = useState<FiltrosProyecto>({});

  // Consulta a la API utilizando TanStack Query
  const queryResult = useQuery<ResultadoProyectos, Error>({
    queryKey: ['/api/proyectos', pagina, porPagina, filtros],
    queryFn: () => proyectoService.listarProyectos(pagina, porPagina, filtros),
  });

  // Función para cambiar de página
  const cambiarPagina = (nuevaPagina: number) => {
    setPagina(nuevaPagina);
  };

  // Función para cambiar tamaño de página
  const cambiarPorPagina = (nuevoPorPagina: number) => {
    setPorPagina(nuevoPorPagina);
    setPagina(1); // Reset a primera página al cambiar el tamaño
  };

  // Función para aplicar filtros
  const aplicarFiltros = (nuevosFiltros: FiltrosProyecto) => {
    setFiltros(nuevosFiltros);
    setPagina(1); // Reset a primera página al aplicar filtros
  };

  return {
    ...queryResult,
    pagina,
    porPagina,
    filtros,
    cambiarPagina,
    cambiarPorPagina,
    aplicarFiltros
  };
}