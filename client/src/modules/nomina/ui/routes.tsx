import { Route, useRoute } from 'wouter';
import { MainLayout } from '@/layouts/main-layout';
import ListadoNominaPage from './pages/ListadoNominaPage';
import { DetalleNominaPage } from './pages/DetalleNominaPage';

// Componente auxiliar para manejar parámetros de ruta para DetalleNominaPage
function DetalleNominaRoute() {
  // useRoute de wouter captura el parámetro de ruta correctamente
  const [, params] = useRoute('/nomina/:id');
  const nominaId = params?.id || '';
  
  return <DetalleNominaPage nominaId={nominaId} />;
}

export function NominaRoutes() {
  return (
    <>
      <Route path="/nomina/listado">
        <MainLayout>
          <ListadoNominaPage />
        </MainLayout>
      </Route>
      
      <Route path="/nomina/:id">
        <MainLayout>
          <DetalleNominaRoute />
        </MainLayout>
      </Route>
    </>
  );
}