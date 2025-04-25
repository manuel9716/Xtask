import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { 
  DashboardLayout, 
  Widget, 
  CreateWidgetData, 
  UpdateWidgetData, 
  CreateDashboardLayoutData,
  UpdateDashboardLayoutData 
} from '../../domain/entities/Widget';
import { dashboardRepository } from '../../infrastructure/di/container';

/**
 * Hook para gestionar el dashboard y sus layouts
 */
export function useDashboard() {
  const queryClient = useQueryClient();
  const [currentLayoutId, setCurrentLayoutId] = useState<string | null>(null);

  // Carga de layouts disponibles
  const layoutsQuery = useQuery<DashboardLayout[], Error>({
    queryKey: ['dashboard', 'layouts'],
    queryFn: () => dashboardRepository.getUserLayouts(),
  });

  // Carga del layout actual (predeterminado o seleccionado)
  const currentLayoutQuery = useQuery<DashboardLayout, Error>({
    queryKey: ['dashboard', 'layout', currentLayoutId],
    queryFn: () => 
      currentLayoutId 
        ? dashboardRepository.getLayoutById(currentLayoutId)
        : dashboardRepository.getDefaultLayout(),
    enabled: !layoutsQuery.isLoading, // Solo se ejecuta cuando la lista de layouts está cargada
  });

  // Establecer un layout específico como actual
  const setCurrentLayout = (layoutId: string) => {
    setCurrentLayoutId(layoutId);
  };

  // Mutación para crear un nuevo layout
  const createLayoutMutation = useMutation({
    mutationFn: (data: CreateDashboardLayoutData) => dashboardRepository.createLayout(data),
    onSuccess: (newLayout) => {
      // Actualizar caché de layouts y cambiar al nuevo layout
      queryClient.invalidateQueries({ queryKey: ['dashboard', 'layouts'] });
      setCurrentLayoutId(newLayout.id);
    },
  });

  // Mutación para actualizar un layout existente
  const updateLayoutMutation = useMutation({
    mutationFn: ({ layoutId, data }: { layoutId: string, data: UpdateDashboardLayoutData }) => 
      dashboardRepository.updateLayout(layoutId, data),
    onSuccess: (updatedLayout) => {
      // Actualizar caché de layouts
      queryClient.invalidateQueries({ queryKey: ['dashboard', 'layouts'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard', 'layout', updatedLayout.id] });
    },
  });

  // Mutación para eliminar un layout
  const deleteLayoutMutation = useMutation({
    mutationFn: (layoutId: string) => dashboardRepository.deleteLayout(layoutId),
    onSuccess: () => {
      // Actualizar caché de layouts y cambiar al layout predeterminado
      queryClient.invalidateQueries({ queryKey: ['dashboard', 'layouts'] });
      setCurrentLayoutId(null);
    },
  });

  // Mutación para establecer un layout como predeterminado
  const setDefaultLayoutMutation = useMutation({
    mutationFn: (layoutId: string) => dashboardRepository.setDefaultLayout(layoutId),
    onSuccess: () => {
      // Actualizar caché de layouts
      queryClient.invalidateQueries({ queryKey: ['dashboard', 'layouts'] });
    },
  });

  // Mutación para añadir un widget a un layout
  const addWidgetMutation = useMutation({
    mutationFn: ({ layoutId, widgetData }: { layoutId: string, widgetData: CreateWidgetData }) => 
      dashboardRepository.addWidget(layoutId, widgetData),
    onSuccess: (_, variables) => {
      // Actualizar caché del layout específico
      queryClient.invalidateQueries({ queryKey: ['dashboard', 'layout', variables.layoutId] });
    },
  });

  // Mutación para actualizar un widget existente
  const updateWidgetMutation = useMutation({
    mutationFn: ({ 
      layoutId, 
      widgetId, 
      data 
    }: { 
      layoutId: string, 
      widgetId: string, 
      data: UpdateWidgetData 
    }) => dashboardRepository.updateWidget(layoutId, widgetId, data),
    onSuccess: (_, variables) => {
      // Actualizar caché del layout específico
      queryClient.invalidateQueries({ queryKey: ['dashboard', 'layout', variables.layoutId] });
    },
  });

  // Mutación para eliminar un widget
  const removeWidgetMutation = useMutation({
    mutationFn: ({ layoutId, widgetId }: { layoutId: string, widgetId: string }) => 
      dashboardRepository.removeWidget(layoutId, widgetId),
    onSuccess: (_, variables) => {
      // Actualizar caché del layout específico
      queryClient.invalidateQueries({ queryKey: ['dashboard', 'layout', variables.layoutId] });
    },
  });

  // Mutación para actualizar las posiciones de múltiples widgets de una vez
  const updatePositionsMutation = useMutation({
    mutationFn: ({ 
      layoutId, 
      positions 
    }: { 
      layoutId: string, 
      positions: Array<{ id: string, position: { x: number, y: number } }> 
    }) => dashboardRepository.updateWidgetsPositions(layoutId, positions),
    onSuccess: (_, variables) => {
      // Actualizar caché del layout específico
      queryClient.invalidateQueries({ queryKey: ['dashboard', 'layout', variables.layoutId] });
    },
  });

  return {
    // Queries
    layouts: layoutsQuery.data || [],
    currentLayout: currentLayoutQuery.data,
    isLoadingLayouts: layoutsQuery.isLoading,
    isLoadingCurrentLayout: currentLayoutQuery.isLoading,
    
    // Acciones para layouts
    setCurrentLayout,
    createLayout: createLayoutMutation.mutate,
    updateLayout: updateLayoutMutation.mutate,
    deleteLayout: deleteLayoutMutation.mutate,
    setDefaultLayout: setDefaultLayoutMutation.mutate,
    
    // Acciones para widgets
    addWidget: addWidgetMutation.mutate,
    updateWidget: updateWidgetMutation.mutate,
    removeWidget: removeWidgetMutation.mutate,
    updatePositions: updatePositionsMutation.mutate,
    
    // Estado de las operaciones
    isCreatingLayout: createLayoutMutation.isPending,
    isUpdatingLayout: updateLayoutMutation.isPending,
    isDeletingLayout: deleteLayoutMutation.isPending,
    isSettingDefaultLayout: setDefaultLayoutMutation.isPending,
    isAddingWidget: addWidgetMutation.isPending,
    isUpdatingWidget: updateWidgetMutation.isPending,
    isRemovingWidget: removeWidgetMutation.isPending,
    isUpdatingPositions: updatePositionsMutation.isPending,
  };
}