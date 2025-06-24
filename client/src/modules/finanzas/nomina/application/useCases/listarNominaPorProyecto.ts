import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { nominaApi } from '../../infrastructure/api/nominaApi';
import { FiltrosNomina } from '../../domain/entities/Nomina';
import { useToast } from '@/hooks/use-toast';

/**
 * Hook para obtener proyectos con recursos asignados
 */
export function useProyectosConRecursos() {
  return useQuery({
    queryKey: ['/api/nomina/proyectos'],
    queryFn: () => nominaApi.obtenerProyectosConRecursos(),
  });
}

/**
 * Hook para obtener recursos de un proyecto para nómina
 */
export function useRecursosPorProyecto(proyectoId: number | null, filtros?: FiltrosNomina) {
  return useQuery({
    queryKey: ['/api/nomina', proyectoId, filtros],
    queryFn: () => nominaApi.obtenerRecursosPorProyecto(proyectoId!, filtros),
    enabled: !!proyectoId,
  });
}

/**
 * Hook para obtener resumen de nómina por proyecto
 */
export function useResumenNominaProyecto(proyectoId: number | null, mes?: string) {
  return useQuery({
    queryKey: ['/api/nomina', proyectoId, 'resumen', mes],
    queryFn: () => nominaApi.obtenerResumenProyecto(proyectoId!, mes),
    enabled: !!proyectoId,
  });
}

/**
 * Hook para registrar pago de nómina
 */
export function useRegistrarPago() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({ proyectoId, data }: { proyectoId: number; data: any }) =>
      nominaApi.registrarPago(proyectoId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ 
        queryKey: ['/api/nomina', variables.proyectoId] 
      });
      queryClient.invalidateQueries({ 
        queryKey: ['/api/nomina/metricas'] 
      });
      toast({
        title: 'Pago registrado',
        description: 'El pago de nómina se ha registrado exitosamente',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error al registrar pago',
        description: error.message || 'No se pudo registrar el pago',
        variant: 'destructive',
      });
    },
  });
}

/**
 * Hook para actualizar estado de nómina
 */
export function useActualizarEstado() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({ 
      nominaId, 
      estado, 
      fechaPago, 
      bonificacion 
    }: { 
      nominaId: number; 
      estado: 'pendiente' | 'pagado' | 'aprobado';
      fechaPago?: string;
      bonificacion?: number;
    }) =>
      nominaApi.actualizarEstado(nominaId, estado, fechaPago, bonificacion),
    onSuccess: () => {
      queryClient.invalidateQueries({ 
        queryKey: ['/api/nomina'] 
      });
      queryClient.invalidateQueries({ 
        queryKey: ['/api/nomina/metricas'] 
      });
      toast({
        title: 'Estado actualizado',
        description: 'El estado de la nómina se ha actualizado correctamente',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error al actualizar estado',
        description: error.message || 'No se pudo actualizar el estado',
        variant: 'destructive',
      });
    },
  });
}

/**
 * Hook para obtener historial de un recurso
 */
export function useHistorialRecurso(recursoId: number | null) {
  return useQuery({
    queryKey: ['/api/nomina/recurso', recursoId, 'historial'],
    queryFn: () => nominaApi.obtenerHistorialRecurso(recursoId!),
    enabled: !!recursoId,
  });
}

/**
 * Hook para obtener métricas de nómina
 */
export function useMetricasNomina(proyectoId?: number) {
  return useQuery({
    queryKey: ['/api/nomina/metricas', proyectoId],
    queryFn: () => nominaApi.obtenerMetricas(proyectoId),
  });
}