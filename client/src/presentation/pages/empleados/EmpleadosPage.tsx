import { useEmpleadoss } from '@/application/hooks/empleados/useEmpleadoss';
import { EmpleadosList } from '@/presentation/components/features/empleados/EmpleadosList';

/**
 * Página principal de empleados
 */
export function EmpleadosPage() {
  const { data: empleadoss, isLoading, error } = useEmpleadoss();

  if (isLoading) return <div>Cargando...</div>;
  if (error) return <div>Error: {(error as Error).message}</div>;

  return (
    <div>
      <h1>Empleados</h1>
      <EmpleadosList empleadoss={empleadoss || []} />
    </div>
  );
}
