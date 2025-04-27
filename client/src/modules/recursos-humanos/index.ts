/**
 * Punto de entrada para el módulo de Recursos Humanos
 * Exporta los componentes y definiciones principales del módulo
 */

// Exportar entidades del dominio
export * from './domain/entities/Empleado';
export * from './domain/entities/Evaluacion';
export * from './domain/entities/Capacitacion';

// Exportar repositorios
export * from './domain/repositories/EmpleadoRepository';

// Exportar casos de uso
export { CrearEmpleadoUseCase } from './application/useCases/crearEmpleado';

// Exportar componentes de UI
export { EmpleadoCard } from './ui/components/EmpleadoCard';

// Exportar vistas
export { default as ListaEmpleados } from './ui/views/ListaEmpleados';
export { default as RRHHDashboardPage } from './ui/views/RRHHDashboardPage';

// Exportar componentes adicionales
export { RRHHDashboard } from './ui/components/RRHHDashboard';

// Exportar funciones de API
export {
  obtenerEmpleados,
  obtenerEmpleadoPorId,
  crearEmpleado,
  actualizarEmpleado,
  eliminarEmpleado
} from './infrastructure/api/empleadosApi';

// Definición de rutas del módulo
export const recursosHumanosRoutes = [
  {
    path: '/admin/recursos-humanos/empleados',
    component: () => import('./ui/views/ListaEmpleados').then(module => module.default)
  },
  {
    path: '/admin/recursos-humanos',
    component: () => import('./ui/views/RRHHDashboardPage').then(module => module.default)
  },
  // Comentamos estas rutas temporalmente para depurar el problema
  // {
  //   path: '/admin/recursos-humanos/dashboard',
  //   component: () => import('./ui/views/RRHHDashboardPage').then(module => module.default)
  // }
  // Futuras rutas:
  // { path: '/admin/recursos-humanos/empleados/nuevo', component: () => import('./ui/views/CrearEditarEmpleado').then(module => module.default) },
  // { path: '/admin/recursos-humanos/empleados/:id', component: () => import('./ui/views/DetalleEmpleado').then(module => module.default) },
  // { path: '/admin/recursos-humanos/empleados/:id/editar', component: () => import('./ui/views/CrearEditarEmpleado').then(module => module.default) },
  // { path: '/admin/recursos-humanos/evaluaciones', component: () => import('./ui/views/ListaEvaluaciones').then(module => module.default) },
  // { path: '/admin/recursos-humanos/capacitaciones', component: () => import('./ui/views/ListaCapacitaciones').then(module => module.default) },
];