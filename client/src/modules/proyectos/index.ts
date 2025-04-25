/**
 * Exportaciones del módulo de proyectos
 * Este archivo centraliza todas las exportaciones para facilitar la importación
 * desde otros módulos.
 */

// Domain entities
export {
  EstadoProyecto,
  type Proyecto,
  type CrearProyectoDTO,
  type ActualizarProyectoDTO,
  type CambiarEstadoProyectoDTO,
  type FiltrosProyecto,
  type ProyectoMetricas
} from './domain/entities/Proyecto';

// Domain repositories
export { 
  type ProyectoRepository,
  type ProyectosIndicadores 
} from './domain/repositories/ProyectoRepository';

// Domain services
export { ProyectoService } from './domain/services/ProyectoService';

// Application (Use Cases)
export { 
  useProyectos, 
  listarProyectos 
} from './application/useCases/listarProyectos';

export { 
  useProyecto, 
  obtenerProyecto 
} from './application/useCases/obtenerProyecto';

export { 
  useCrearProyecto, 
  crearProyecto 
} from './application/useCases/crearProyecto';

export { 
  useActualizarProyecto, 
  actualizarProyecto 
} from './application/useCases/actualizarProyecto';

export { 
  useCambiarEstadoProyecto, 
  cambiarEstadoProyecto 
} from './application/useCases/cambiarEstadoProyecto';

export { 
  useEliminarProyecto, 
  eliminarProyecto 
} from './application/useCases/eliminarProyecto';

export { 
  useIndicadoresProyectos, 
  obtenerIndicadoresProyectos 
} from './application/useCases/obtenerIndicadores';

// Infrastructure
export { proyectoService } from './infrastructure/di/container';
export { ProyectoApiAdapter } from './infrastructure/api/ProyectoApiAdapter';
export { proyectosApi } from './infrastructure/api/proyectosApi';

// UI Components - exporta según necesidades
// export { ... } from './ui/components/...';
// export { ... } from './ui/views/...';