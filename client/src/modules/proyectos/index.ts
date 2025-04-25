/**
 * Punto de entrada para el módulo de Proyectos
 * Exporta componentes, entidades y funcionalidades para su uso en la aplicación
 */

// Entidades y tipos de dominio
export { EstadoProyecto } from './domain/entities/Proyecto';
export type { 
  Proyecto,
  CrearProyectoDTO,
  ActualizarProyectoDTO,
  CambiarEstadoProyectoDTO,
  FiltrosProyecto,
  ProyectosPaginados
} from './domain/entities/Proyecto';

// Componentes de UI
export { ProyectoCard } from './ui/components/ProyectoCard';
export { EstadoProyectoBadge } from './ui/components/EstadoProyectoBadge';
export { CambiarEstadoProyectoDialog } from './ui/components/CambiarEstadoProyectoDialog';
export { FiltrosProyecto as FiltrosProyectoComponent } from './ui/components/FiltrosProyecto';
export { ProyectoForm } from './ui/components/ProyectoForm';

// Vistas
export { ListaProyectos } from './ui/views/ListaProyectos';
export { DetalleProyecto } from './ui/views/DetalleProyecto';
export { NuevoProyecto } from './ui/views/NuevoProyecto';
export { EditarProyecto } from './ui/views/EditarProyecto';

// Configuración de rutas
export { ProyectosRoutes } from './ui/routes';

// Hooks de casos de uso (application layer)
export { useListarProyectos } from './application/useCases/listarProyectos';
export { useObtenerProyecto } from './application/useCases/obtenerProyecto';
export { useCrearProyecto } from './application/useCases/crearProyecto';
export { useActualizarProyecto } from './application/useCases/actualizarProyecto';
export { useCambiarEstadoProyecto } from './application/useCases/cambiarEstadoProyecto';
export { useEliminarProyecto } from './application/useCases/eliminarProyecto';

// API client (infraestructura)
export { proyectosApi } from './infrastructure/api/proyectosApi';