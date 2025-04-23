import { Route } from 'wouter';
import { MainLayout } from '@/layouts/main-layout';
import { PresupuestosPage } from './pages/PresupuestosPage';
import { ListadoNominaPage } from '../nomina/ui/pages/ListadoNominaPage';
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
        <ListadoNominaPage />
      </MainLayout>
    </Route>
    
    <Route path="/finanzas/nomina/:nominaId">
      <MainLayout>
        <DetalleNominaRoute />
      </MainLayout>
    </Route>
  </>
);

// Componente auxiliar para manejar parámetros de ruta
function DetalleNominaRoute() {
  // useRoute de wouter captura el parámetro de ruta
  const [, params] = window.location.pathname.match(/\/finanzas\/nomina\/(\d+)/) || [];
  const nominaId = params;
  
  return <DetalleNominaPage nominaId={nominaId} />;
}