import { 
  EmpleadoRRHH, 
  CrearEmpleadoRRHH, 
  ActualizarEmpleadoRRHH, 
  FiltrosEmpleadoRRHH, 
  EmpleadoResumenRRHH 
} from '../../domain/entities/Empleado';
import { EmpleadoRepository } from '../../domain/repositories/EmpleadoRepository';
import { apiRequest } from '@/lib/queryClient';

/**
 * Implementación del repositorio de empleados usando la API REST
 * Esta clase adapta las llamadas HTTP a la interfaz del repositorio
 */
export class EmpleadosApiRepository implements EmpleadoRepository {
  private baseUrl = '/api/recursos-humanos/empleados';

  /**
   * Obtiene todos los empleados aplicando filtros opcionales
   * @param filtros Criterios de filtrado opcionales
   * @param pagina Número de página para paginación (por defecto 1)
   * @param porPagina Cantidad de elementos por página (por defecto 10)
   * @returns Lista paginada de empleados que coinciden con los filtros
   */
  async listarEmpleados(
    filtros?: FiltrosEmpleadoRRHH, 
    pagina: number = 1, 
    porPagina: number = 10
  ): Promise<{
    empleados: EmpleadoResumenRRHH[];
    total: number;
    pagina: number;
    porPagina: number;
    totalPaginas: number;
  }> {
    // Construir parámetros de consulta
    const params = new URLSearchParams();
    params.append('pagina', pagina.toString());
    params.append('porPagina', porPagina.toString());

    // Añadir filtros si existen
    if (filtros) {
      if (filtros.nombre) params.append('nombre', filtros.nombre);
      if (filtros.departamento) params.append('departamento', filtros.departamento);
      if (filtros.estado) params.append('estado', filtros.estado);
      if (filtros.posicion) params.append('posicion', filtros.posicion);
      if (filtros.fechaContratacionDesde) params.append('fechaDesde', filtros.fechaContratacionDesde.toISOString());
      if (filtros.fechaContratacionHasta) params.append('fechaHasta', filtros.fechaContratacionHasta.toISOString());
      if (filtros.habilidades && filtros.habilidades.length > 0) {
        filtros.habilidades.forEach(h => params.append('habilidades', h));
      }
    }

    // Realizar la petición HTTP
    const response = await fetch(`${this.baseUrl}?${params.toString()}`);
    
    if (!response.ok) {
      throw new Error(`Error al listar empleados: ${response.status} ${response.statusText}`);
    }

    return await response.json();
  }

  /**
   * Obtiene un empleado por su identificador
   * @param id Identificador único del empleado
   * @returns Empleado encontrado o undefined si no existe
   */
  async obtenerEmpleadoPorId(id: number): Promise<EmpleadoRRHH | undefined> {
    try {
      const response = await fetch(`${this.baseUrl}/${id}`);
      
      if (response.status === 404) {
        return undefined;
      }

      if (!response.ok) {
        throw new Error(`Error al obtener empleado: ${response.status} ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error en obtenerEmpleadoPorId:', error);
      return undefined;
    }
  }

  /**
   * Crea un nuevo empleado
   * @param empleado Datos del empleado a crear
   * @returns Empleado creado con su identificador asignado
   */
  async crearEmpleado(empleado: CrearEmpleadoRRHH): Promise<EmpleadoRRHH> {
    const response = await apiRequest('POST', this.baseUrl, empleado);
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      throw new Error(errorData?.message || `Error al crear empleado: ${response.status} ${response.statusText}`);
    }

    return await response.json();
  }

  /**
   * Actualiza los datos de un empleado existente
   * @param id Identificador único del empleado
   * @param empleado Datos parciales a actualizar
   * @returns Empleado actualizado o undefined si no existe
   */
  async actualizarEmpleado(id: number, empleado: ActualizarEmpleadoRRHH): Promise<EmpleadoRRHH | undefined> {
    try {
      const response = await apiRequest('PATCH', `${this.baseUrl}/${id}`, empleado);
      
      if (response.status === 404) {
        return undefined;
      }

      if (!response.ok) {
        throw new Error(`Error al actualizar empleado: ${response.status} ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error en actualizarEmpleado:', error);
      return undefined;
    }
  }

  /**
   * Elimina lógicamente un empleado (cambia su estado a INACTIVO)
   * @param id Identificador único del empleado
   * @returns true si se pudo eliminar, false si no existe
   */
  async eliminarEmpleado(id: number): Promise<boolean> {
    try {
      const response = await apiRequest('DELETE', `${this.baseUrl}/${id}`, {});
      
      if (response.status === 404) {
        return false;
      }

      return response.ok;
    } catch (error) {
      console.error('Error en eliminarEmpleado:', error);
      return false;
    }
  }

  /**
   * Obtiene una lista de empleados por departamento
   * @param departamento Nombre del departamento
   * @returns Lista de empleados del departamento
   */
  async obtenerEmpleadosPorDepartamento(departamento: string): Promise<EmpleadoResumenRRHH[]> {
    const params = new URLSearchParams();
    params.append('departamento', departamento);

    const response = await fetch(`${this.baseUrl}?${params.toString()}`);
    
    if (!response.ok) {
      throw new Error(`Error al obtener empleados por departamento: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    return data.empleados || [];
  }

  /**
   * Obtiene una lista de empleados por supervisor
   * @param supervisorId Identificador del supervisor
   * @returns Lista de empleados a cargo del supervisor
   */
  async obtenerEmpleadosPorSupervisor(supervisorId: number): Promise<EmpleadoResumenRRHH[]> {
    const params = new URLSearchParams();
    params.append('supervisor', supervisorId.toString());

    const response = await fetch(`${this.baseUrl}?${params.toString()}`);
    
    if (!response.ok) {
      throw new Error(`Error al obtener empleados por supervisor: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    return data.empleados || [];
  }

  /**
   * Busca empleados por habilidades específicas
   * @param habilidades Lista de habilidades a buscar
   * @returns Lista de empleados que tienen las habilidades especificadas
   */
  async buscarEmpleadosPorHabilidades(habilidades: string[]): Promise<EmpleadoResumenRRHH[]> {
    const params = new URLSearchParams();
    habilidades.forEach(habilidad => {
      params.append('habilidades', habilidad);
    });

    const response = await fetch(`${this.baseUrl}?${params.toString()}`);
    
    if (!response.ok) {
      throw new Error(`Error al buscar empleados por habilidades: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    return data.empleados || [];
  }
}

// Funciones de ayuda para acceder desde los componentes

/**
 * Obtiene un listado paginado de empleados
 */
export const obtenerEmpleados = async (
  filtros?: FiltrosEmpleadoRRHH, 
  pagina: number = 1, 
  porPagina: number = 10
) => {
  const repository = new EmpleadosApiRepository();
  return await repository.listarEmpleados(filtros, pagina, porPagina);
};

/**
 * Obtiene un empleado por su ID
 */
export const obtenerEmpleadoPorId = async (id: number) => {
  const repository = new EmpleadosApiRepository();
  return await repository.obtenerEmpleadoPorId(id);
};

/**
 * Crea un nuevo empleado
 */
export const crearEmpleado = async (empleado: CrearEmpleadoRRHH) => {
  const repository = new EmpleadosApiRepository();
  return await repository.crearEmpleado(empleado);
};

/**
 * Actualiza un empleado existente
 */
export const actualizarEmpleado = async (id: number, empleado: ActualizarEmpleadoRRHH) => {
  const repository = new EmpleadosApiRepository();
  return await repository.actualizarEmpleado(id, empleado);
};

/**
 * Elimina lógicamente un empleado (cambia su estado a INACTIVO)
 */
export const eliminarEmpleado = async (id: number) => {
  const repository = new EmpleadosApiRepository();
  return await repository.eliminarEmpleado(id);
};