import { Route } from 'wouter';
import { ListaProyectos } from './views/ListaProyectos';
import DetalleProyecto from './views/DetalleProyecto';
import { NuevoProyecto } from './views/NuevoProyecto';
import { EditarProyecto } from './views/EditarProyecto';
import { GestionEstadosProyectos } from './views/GestionEstadosProyectos';

export function ProyectosRoutes() {
  return (
    <>
      <Route path="/admin/proyectos" component={ListaProyectos} />
      <Route path="/admin/proyectos/nuevo" component={NuevoProyecto} />
      <Route path="/admin/proyectos/estados" component={GestionEstadosProyectos} />
      <Route path="/admin/proyectos/:id" component={DetalleProyecto} />
      <Route path="/admin/proyectos/:id/editar" component={EditarProyecto} />
    </>
  );
}