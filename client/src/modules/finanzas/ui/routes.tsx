import { Route, useRoute } from 'wouter';
import { MainLayout } from '@/layouts/main-layout';
import { PresupuestosPage } from './pages/PresupuestosPage';
import { NominaPage } from './pages/NominaPage';
import { DetalleNominaPage } from '../nomina/ui/pages/DetalleNominaPage';

export const FinanzasRoutes = () => (
  <>
    <Route path="/finanzas/presupuestos">
      <MainLayout>
        <PresupuestosPage />
      </MainLayout>
    </Route>
    
    <Route path="/finanzas/nomina">
      <MainLayout>
        <NominaPage />
      </MainLayout>
    </Route>
    
    <Route path="/finanzas/nomina/:id">
      <MainLayout>
        <DetalleNominaRoute />
      </MainLayout>
    </Route>
  </>
);

// Componente auxiliar para manejar parámetros de ruta
function DetalleNominaRoute() {
  // useRoute de wouter captura el parámetro de ruta correctamente
  const [, params] = useRoute('/finanzas/nomina/:id');
  const nominaId = params?.id;
  
  return <DetalleNominaPage nominaId={nominaId} />;
}