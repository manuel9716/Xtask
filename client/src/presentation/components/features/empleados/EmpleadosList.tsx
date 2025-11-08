import { Empleados } from '@/domain/models/empleados.model';

interface EmpleadosListProps {
  empleadoss: Empleados[];
}

/**
 * Componente para mostrar lista de empleados
 */
export function EmpleadosList({ empleadoss }: EmpleadosListProps) {
  return (
    <div>
      <h2>Lista de Empleados</h2>
      {/* TODO: Implementar visualización de lista */}
      <ul>
        {empleadoss.map((item) => (
          <li key={item.id}>{JSON.stringify(item)}</li>
        ))}
      </ul>
    </div>
  );
}
