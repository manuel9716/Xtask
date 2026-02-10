import { Empleado } from '../entities/empleados.entity';

/**
 * Filtros para búsqueda de empleados
 */
export interface EmpleadoFiltros {
  proyectoId?: number;
  q?: string;
  estadoContrato?: 'activo' | 'inactivo' | 'suspendido';
  tipoContrato?: string;
  depto?: string;
}

/**
 * Interface de repositorio para Empleado
 * Define los contratos de persistencia
 */
export interface EmpleadoRepository {
  findById(id: number): Promise<Empleado | null>;
  findAll(filtros?: EmpleadoFiltros): Promise<Empleado[]>;
  findByIdentificacion(identificacion: string): Promise<Empleado | null>;
  save(empleado: Empleado): Promise<Empleado>;
  update(id: number, empleado: Partial<Empleado>): Promise<Empleado>;
  delete(id: number): Promise<void>;
  softDelete(id: number): Promise<void>;
  existeIdentificacion(identificacion: string, excludeId?: number): Promise<boolean>;
}
