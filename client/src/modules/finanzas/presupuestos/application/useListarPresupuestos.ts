import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Presupuesto } from '../domain/entities/Presupuesto';
import { presupuestoRepository } from '../infrastructure/repositories/presupuesto.pg.repository';

/**
 * Hook de aplicación para listar y filtrar presupuestos
 */
export function useListarPresupuestos(organizationId?: number) {
  const [filtroArea, setFiltroArea] = useState<string | null>(null);
  const [filtroEstado, setFiltroEstado] = useState<string | null>(null);
  
  // Query para obtener los presupuestos
  const {
    data: presupuestos = [],
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['presupuestos', organizationId],
    queryFn: () => presupuestoRepository.listarPresupuestos(organizationId),
  });
  
  // Filtrar los presupuestos según los criterios seleccionados
  const presupuestosFiltrados = useMemo(() => {
    let resultado = [...presupuestos];
    
    // Filtrar por área
    if (filtroArea) {
      resultado = resultado.filter(p => p.area === filtroArea);
    }
    
    // Filtrar por estado
    if (filtroEstado) {
      resultado = resultado.filter(p => p.estado === filtroEstado);
    }
    
    return resultado;
  }, [presupuestos, filtroArea, filtroEstado]);
  
  // Obtener las áreas disponibles para el filtro
  const areasDisponibles = useMemo(() => {
    const areas = new Set<string>();
    presupuestos.forEach(p => {
      if (p.area) areas.add(p.area);
    });
    return Array.from(areas).sort();
  }, [presupuestos]);
  
  // Calcular montos totales para el dashboard
  const estadisticas = useMemo(() => {
    const total = presupuestos.reduce((acc, p) => acc + p.monto, 0);
    const gastado = presupuestos.reduce((acc, p) => acc + p.gastado, 0);
    const porcentajeGlobal = total > 0 ? (gastado / total) * 100 : 0;
    
    const cantidadActivos = presupuestos.filter(p => p.estado === 'ACTIVO').length;
    const cantidadAlerta = presupuestos.filter(p => p.estado === 'ALERTA').length;
    const cantidadCompletados = presupuestos.filter(p => p.estado === 'COMPLETADO').length;
    
    return {
      cantidadTotal: presupuestos.length,
      montoTotal: total,
      montoGastado: gastado,
      porcentajeGlobal,
      cantidadActivos,
      cantidadAlerta,
      cantidadCompletados
    };
  }, [presupuestos]);
  
  return {
    presupuestos,
    presupuestosFiltrados,
    isLoading,
    error,
    refetch,
    filtroArea,
    setFiltroArea,
    filtroEstado,
    setFiltroEstado,
    areasDisponibles,
    estadisticas
  };
}