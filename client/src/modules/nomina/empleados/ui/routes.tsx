import { Route, useRoute } from 'wouter';
import { MainLayout } from '@/layouts/main-layout';
import EmpleadosPage from './pages/EmpleadosPage';
import EmpleadoDetallePage from './pages/EmpleadoDetallePage';
import EditarEmpleadoPage from './pages/EditarEmpleadoPage';

// Componente auxiliar para manejar parámetros de ruta de detalles
function EmpleadoDetalleRoute() {
  const [, params] = useRoute('/admin/nomina/empleados/:id');
  return <EmpleadoDetallePage />;
}

// Componente auxiliar para manejar parámetros de ruta de edición
function EditarEmpleadoRoute() {
  const [, params] = useRoute('/admin/nomina/empleados/:id/editar');
  return <EditarEmpleadoPage />;
}

export const EmpleadosRoutes = () => {
  return (
    <>
      {/* Listado de empleados */}
      <Route path="/admin/nomina/empleados">
        <MainLayout>
          <EmpleadosPage />
        </MainLayout>
      </Route>
      
      {/* Detalle de empleado */}
      <Route path="/admin/nomina/empleados/:id">
        <MainLayout>
          <EmpleadoDetalleRoute />
        </MainLayout>
      </Route>
      
      {/* Edición de empleado */}
      <Route path="/admin/nomina/empleados/:id/editar">
        <MainLayout>
          <EditarEmpleadoRoute />
        </MainLayout>
      </Route>
    </>
  );
}