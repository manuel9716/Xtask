/**
 * API de Empleados
 * Implementa la comunicación con el backend para gestionar empleados
 */

import { Empleado, CrearEmpleadoDTO, ActualizarEmpleadoDTO, FiltrosEmpleadoRRHH, EstadoEmpleado, mapeoEstadoEmpleado } from "../../domain/entities/Empleado";
import { EmpleadoRepository, PaginatedResponse, PaginationOptions } from "../../domain/repositories/EmpleadoRepository";
import { apiRequest, queryClient } from "@/lib/queryClient";

export class EmpleadosApi implements EmpleadoRepository {
  private apiUrl = "/api/recursos-humanos/empleados";
  
  /**
   * Mapea un objeto de empleado de la API al modelo de dominio
   */
  private mapToDomainModel(empleadoData: any): Empleado {
    return new Empleado({
      id: empleadoData.id,
      nombres: empleadoData.firstName,
      apellidos: empleadoData.lastName,
      cargo: empleadoData.position,
      departamento: empleadoData.department,
      fechaContratacion: new Date(empleadoData.hireDate),
      estado: mapeoEstadoEmpleado[empleadoData.contractStatus] || EstadoEmpleado.ACTIVO,
      salario: Number(empleadoData.salary),
      direccion: empleadoData.address,
      telefono: empleadoData.phone,
      correo: empleadoData.email,
      fechaNacimiento: empleadoData.birthDate ? new Date(empleadoData.birthDate) : undefined,
      numeroIdentificacion: empleadoData.identityNumber,
      seguridadSocial: empleadoData.socialSecurityNumber,
      cuentaBancaria: empleadoData.bankAccount,
      contactoEmergencia: empleadoData.emergencyContact,
      telefonoEmergencia: empleadoData.emergencyPhone,
      notas: empleadoData.notes,
      fotoUrl: empleadoData.photoUrl,
      proyectoPrincipalId: empleadoData.idEmployedProyects,
      createdAt: new Date(empleadoData.createdAt),
      updatedAt: empleadoData.updatedAt ? new Date(empleadoData.updatedAt) : undefined
    });
  }
  
  /**
   * Mapea un modelo de dominio a un objeto para la API
   */
  private mapToApiModel(empleado: CrearEmpleadoDTO | ActualizarEmpleadoDTO): any {
    const apiModel: any = {
      firstName: empleado.nombres,
      lastName: empleado.apellidos,
      position: empleado.cargo,
      department: empleado.departamento
    };
    
    if ('fechaContratacion' in empleado && empleado.fechaContratacion) {
      apiModel.hireDate = empleado.fechaContratacion.toISOString().split('T')[0];
    }
    
    if ('estado' in empleado && empleado.estado) {
      apiModel.contractStatus = mapeoEstadoEmpleado[empleado.estado];
    }
    
    if ('salario' in empleado && empleado.salario !== undefined) {
      apiModel.salary = empleado.salario;
    }
    
    if ('direccion' in empleado) apiModel.address = empleado.direccion;
    if ('telefono' in empleado) apiModel.phone = empleado.telefono;
    if ('correo' in empleado) apiModel.email = empleado.correo;
    
    if ('fechaNacimiento' in empleado && empleado.fechaNacimiento) {
      apiModel.birthDate = empleado.fechaNacimiento.toISOString().split('T')[0];
    }
    
    if ('numeroIdentificacion' in empleado) apiModel.identityNumber = empleado.numeroIdentificacion;
    if ('seguridadSocial' in empleado) apiModel.socialSecurityNumber = empleado.seguridadSocial;
    if ('cuentaBancaria' in empleado) apiModel.bankAccount = empleado.cuentaBancaria;
    if ('contactoEmergencia' in empleado) apiModel.emergencyContact = empleado.contactoEmergencia;
    if ('telefonoEmergencia' in empleado) apiModel.emergencyPhone = empleado.telefonoEmergencia;
    if ('notas' in empleado) apiModel.notes = empleado.notas;
    if ('fotoUrl' in empleado) apiModel.photoUrl = empleado.fotoUrl;
    if ('proyectoPrincipalId' in empleado) apiModel.idEmployedProyects = empleado.proyectoPrincipalId;
    
    if ('id' in empleado) apiModel.id = empleado.id;
    
    return apiModel;
  }
  
  /**
   * Convierte filtros del dominio a parámetros para la API
   */
  private convertFilters(filtros?: FiltrosEmpleadoRRHH): URLSearchParams {
    const params = new URLSearchParams();
    
    if (!filtros) return params;
    
    if (filtros.nombre) params.append('nombre', filtros.nombre);
    if (filtros.departamento) params.append('departamento', filtros.departamento);
    
    if (filtros.estado) {
      params.append('estado', mapeoEstadoEmpleado[filtros.estado]);
    }
    
    if (filtros.fechaContratacionDesde) {
      params.append('fechaContratacionDesde', filtros.fechaContratacionDesde.toISOString().split('T')[0]);
    }
    
    if (filtros.fechaContratacionHasta) {
      params.append('fechaContratacionHasta', filtros.fechaContratacionHasta.toISOString().split('T')[0]);
    }
    
    return params;
  }
  
  /**
   * Obtiene una lista paginada de empleados
   */
  async listarEmpleados(
    filtros?: FiltrosEmpleadoRRHH,
    paginacion?: PaginationOptions
  ): Promise<PaginatedResponse<Empleado>> {
    // Convertir filtros a parámetros de consulta
    const params = this.convertFilters(filtros);
    
    // Añadir parámetros de paginación
    if (paginacion) {
      params.append('page', paginacion.page.toString());
      params.append('pageSize', paginacion.pageSize.toString());
    }
    
    // Construir URL
    const url = `${this.apiUrl}?${params.toString()}`;
    
    // Realizar petición
    const response = await apiRequest('GET', url);
    const responseData = await response.json();
    
    // Mapear datos de respuesta a modelos de dominio
    const empleados = responseData.data.map((empleado: any) => this.mapToDomainModel(empleado));
    
    return {
      data: empleados,
      total: responseData.total,
      page: responseData.page,
      pageSize: responseData.pageSize,
      totalPages: responseData.totalPages
    };
  }
  
  /**
   * Obtiene un empleado por su ID
   */
  async obtenerEmpleadoPorId(id: number): Promise<Empleado | null> {
    try {
      const response = await apiRequest('GET', `${this.apiUrl}/${id}`);
      const empleadoData = await response.json();
      return this.mapToDomainModel(empleadoData);
    } catch (error) {
      // Si es un error 404, devolver null
      if (error instanceof Response && error.status === 404) {
        return null;
      }
      throw error;
    }
  }
  
  /**
   * Crea un nuevo empleado
   */
  async crearEmpleado(empleado: CrearEmpleadoDTO): Promise<Empleado> {
    const apiModel = this.mapToApiModel(empleado);
    const response = await apiRequest('POST', this.apiUrl, apiModel);
    const empleadoData = await response.json();
    
    // Invalidar caché de consultas
    queryClient.invalidateQueries({ queryKey: [this.apiUrl] });
    
    return this.mapToDomainModel(empleadoData);
  }
  
  /**
   * Actualiza un empleado existente
   */
  async actualizarEmpleado(empleado: ActualizarEmpleadoDTO): Promise<Empleado> {
    const apiModel = this.mapToApiModel(empleado);
    const response = await apiRequest('PATCH', `${this.apiUrl}/${empleado.id}`, apiModel);
    const empleadoData = await response.json();
    
    // Invalidar caché de consultas relacionadas
    queryClient.invalidateQueries({ queryKey: [this.apiUrl] });
    queryClient.invalidateQueries({ queryKey: [`${this.apiUrl}/${empleado.id}`] });
    
    return this.mapToDomainModel(empleadoData);
  }
  
  /**
   * Elimina o desactiva un empleado
   */
  async eliminarEmpleado(id: number): Promise<boolean> {
    try {
      await apiRequest('DELETE', `${this.apiUrl}/${id}`);
      
      // Invalidar caché de consultas relacionadas
      queryClient.invalidateQueries({ queryKey: [this.apiUrl] });
      queryClient.invalidateQueries({ queryKey: [`${this.apiUrl}/${id}`] });
      
      return true;
    } catch (error) {
      return false;
    }
  }
  
  /**
   * Cambia el estado de un empleado
   */
  async cambiarEstadoEmpleado(id: number, estado: string): Promise<Empleado> {
    const response = await apiRequest('PATCH', `${this.apiUrl}/${id}/estado`, { estado });
    const empleadoData = await response.json();
    
    // Invalidar caché de consultas relacionadas
    queryClient.invalidateQueries({ queryKey: [this.apiUrl] });
    queryClient.invalidateQueries({ queryKey: [`${this.apiUrl}/${id}`] });
    
    return this.mapToDomainModel(empleadoData);
  }
  
  /**
   * Obtiene estadísticas básicas de empleados
   */
  async obtenerEstadisticasEmpleados(): Promise<{
    total: number;
    activos: number;
    inactivos: number;
    nuevosMes: number;
  }> {
    const response = await apiRequest('GET', `${this.apiUrl}/estadisticas`);
    return await response.json();
  }
  
  /**
   * Obtiene todos los empleados sin paginación
   */
  async obtenerTodosEmpleados(): Promise<Empleado[]> {
    // Usar paginación con un límite muy alto para obtener todos
    const params = new URLSearchParams({ pageSize: '1000' });
    const response = await apiRequest('GET', `${this.apiUrl}?${params.toString()}`);
    const responseData = await response.json();
    
    return responseData.data.map((empleado: any) => this.mapToDomainModel(empleado));
  }
  
  /**
   * Busca empleados por nombre o identificador
   */
  async buscarEmpleados(termino: string): Promise<Empleado[]> {
    const params = new URLSearchParams({ termino });
    const response = await apiRequest('GET', `${this.apiUrl}/buscar?${params.toString()}`);
    const empleadosData = await response.json();
    
    return empleadosData.map((empleado: any) => this.mapToDomainModel(empleado));
  }
}