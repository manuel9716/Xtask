import { Route } from 'wouter';
import { MainLayout } from '@/layouts/main-layout';
import { ListaProyectos } from './views/ListaProyectos';
import { DetalleProyecto } from './views/DetalleProyecto';
import { NuevoProyecto } from './views/NuevoProyecto';
import { EditarProyecto } from './views/EditarProyecto';

/**
 * Configuración de rutas para el módulo de proyectos
 * Todas las rutas utilizan MainLayout como layout principal
 */
export const ProyectosRoutes = () => {
  return (
    <>
      {/* Listado de proyectos */}
      <Route path="/admin/proyectos">
        <MainLayout>
          <ListaProyectos />
        </MainLayout>
      </Route>
      
      {/* Nuevo proyecto */}
      <Route path="/admin/proyectos/nuevo">
        <MainLayout>
          <NuevoProyecto />
        </MainLayout>
      </Route>
      
      {/* Detalle de proyecto */}
      <Route path="/admin/proyectos/:id">
        <MainLayout>
          <DetalleProyecto />
        </MainLayout>
      </Route>
      
      {/* Editar proyecto */}
      <Route path="/admin/proyectos/:id/editar">
        <MainLayout>
          <EditarProyecto />
        </MainLayout>
      </Route>
    </>
  );
};