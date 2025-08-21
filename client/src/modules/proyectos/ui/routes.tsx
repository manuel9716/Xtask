import { Route } from 'wouter';
import { ListaProyectos } from './views/ListaProyectos';
import { DetalleProyecto } from './views/DetalleProyecto';
import { NuevoProyecto } from './views/NuevoProyecto';
import { EditarProyecto } from './views/EditarProyecto';

export function ProyectosRoutes() {
  return (
    <>
      <Route path="/admin/proyectos/:id" component={DetalleProyecto} />
      <Route path="/admin/proyectos/:id/editar" component={EditarProyecto} />
    </>
  );
}