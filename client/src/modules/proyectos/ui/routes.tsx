import { Route } from 'wouter';
import { ListaProyectos } from './views/ListaProyectos';
import { DetalleProyecto } from './views/DetalleProyecto';
import { NuevoProyecto } from './views/NuevoProyecto';
import { EditarProyecto } from './views/EditarProyecto';

export function ProyectosRoutes() {
  return (
    <>
      <Route path="/" component={ListaProyectos} />
      <Route path="/nuevo" component={NuevoProyecto} />
      <Route path="/:id" component={DetalleProyecto} />
      <Route path="/:id/editar" component={EditarProyecto} />
    </>
  );
}