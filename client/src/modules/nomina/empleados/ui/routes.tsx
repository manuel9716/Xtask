import { Route, useRoute } from 'wouter';
import { MainLayout } from '@/layouts/main-layout';
import EmpleadosPage from './pages/EmpleadosPage';
import EmpleadoDetallePage from './pages/EmpleadoDetallePage';
import EditarEmpleadoPage from './pages/EditarEmpleadoPage';

// Componente auxiliar para manejar parámetros de ruta de detalles
function EmpleadoDetalleRoute() {
  // EmpleadoDetallePage ya usa useParams internamente
  return <EmpleadoDetallePage />;
}

// Componente auxiliar para manejar parámetros de ruta de edición
function EditarEmpleadoRoute() {
  // EditarEmpleadoPage ya usa useParams internamente
  return <EditarEmpleadoPage />;
}

export const EmpleadosRoutes = () => {
  return (
    <>
      {/* Listado de empleados */}
      <Route path="/">
        <MainLayout>
          <EmpleadosPage />
        </MainLayout>
      </Route>
      
      {/* Detalle de empleado */}
      <Route path="/:id">
        <MainLayout>
          <EmpleadoDetalleRoute />
        </MainLayout>
      </Route>
      
      {/* Edición de empleado */}
      <Route path="/:id/editar">
        <MainLayout>
          <EditarEmpleadoRoute />
        </MainLayout>
      </Route>
    </>
  );
}