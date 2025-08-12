import { create } from 'zustand';
import { queryClient } from '@/lib/queryClient';

interface NominaState {
  isReloading: boolean;
  reloadDashboard: () => void;
}

export const useNominaStore = create<NominaState>((set) => ({
  isReloading: false,
  
  reloadDashboard: () => {
    set({ isReloading: true });
    
    // Invalidar las queries del dashboard para refrescar datos
    queryClient.invalidateQueries({ queryKey: ['/api/nomina-modulo/dashboard'] });
    queryClient.invalidateQueries({ queryKey: ['/api/empleados'] });
    queryClient.invalidateQueries({ queryKey: ['/api/nominas'] });
    
    // Simular un pequeño delay para mostrar el estado de recarga
    setTimeout(() => {
      set({ isReloading: false });
    }, 500);
  },
}));