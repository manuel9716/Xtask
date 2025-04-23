import { useQuery } from '@tanstack/react-query';
import { useState, useMemo } from 'react';
import { Presupuesto, PresupuestoEstado } from '../domain/entities/Presupuesto';
import { presupuestoRepository } from '../infrastructure/repositories/presupuesto.pg.repository';

/**
 * Hook de aplicación para listar y filtrar presupuestos
 */
export function useListarPresupuestos(organizationId?: number) {
  const [filtroNombre, setFiltroNombre] = useState('');
  const [filtroArea, setFiltroArea] = useState<string | null>(null);
  const [filtroEstado, setFiltroEstado] = useState<PresupuestoEstado | null>(null);

  // Consulta para obtener la lista de presupuestos
  const {
    data: presupuestos = [],
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['/api/presupuestos', organizationId],
    queryFn: () => presupuestoRepository.listarPresupuestos(organizationId),
  });

  // Filtrado de presupuestos basado en los filtros aplicados
  const presupuestosFiltrados = useMemo(() => {
    return presupuestos.filter((presupuesto) => {
      // Filtro por nombre
      const matchesNombre = filtroNombre
        ? presupuesto.nombre.toLowerCase().includes(filtroNombre.toLowerCase())
        : true;
      
      // Filtro por área
      const matchesArea = filtroArea
        ? presupuesto.area === filtroArea
        : true;
      
      // Filtro por estado
      const matchesEstado = filtroEstado
        ? presupuesto.estado === filtroEstado
        : true;
      
      return matchesNombre && matchesArea && matchesEstado;
    });
  }, [presupuestos, filtroNombre, filtroArea, filtroEstado]);

  // Obtener áreas únicas para los filtros de selección
  const areas = useMemo(() => {
    const uniqueAreas = new Set<string>();
    presupuestos.forEach((presupuesto) => {
      if (presupuesto.area) {
        uniqueAreas.add(presupuesto.area);
      }
    });
    return Array.from(uniqueAreas);
  }, [presupuestos]);

  // Calcular estadísticas para mostrar en dashboard
  const estadisticas = useMemo(() => {
    let totalPresupuestado = 0;
    let totalGastado = 0;
    const porEstado: Record<PresupuestoEstado, number> = {
      'ACTIVO': 0,
      'ALERTA': 0,
      'COMPLETADO': 0
    };

    presupuestos.forEach((presupuesto) => {
      totalPresupuestado += presupuesto.monto;
      totalGastado += presupuesto.gastado;
      porEstado[presupuesto.estado]++;
    });

    const porcentajeEjecucion = totalPresupuestado > 0
      ? (totalGastado / totalPresupuestado) * 100
      : 0;

    return {
      totalPresupuestado,
      totalGastado,
      porcentajeEjecucion,
      porEstado,
      totalPresupuestos: presupuestos.length
    };
  }, [presupuestos]);

  return {
    presupuestos,
    presupuestosFiltrados,
    isLoading,
    error,
    refetch,
    filtroNombre,
    setFiltroNombre,
    filtroArea,
    setFiltroArea,
    filtroEstado,
    setFiltroEstado,
    areas,
    estadisticas
  };
}