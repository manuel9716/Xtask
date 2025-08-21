import { apiRequest } from "@/lib/queryClient";
import type { Employee, InsertEmployee, HistorialContrato, NovedadNomina, PrestacionesSociales, ParametrosLegales } from "@shared/schema";

export class EmpleadosApi {
  // Gestión general de empleados
  static async getAllEmpleados() {
    const response = await apiRequest("GET", "/api/employees");
    return response.json();
  }

  static async getEmpleado(id: number) {
    const response = await apiRequest("GET", `/api/employees/${id}`);
    return response.json();
  }

  static async createEmpleado(empleado: any) {
    const response = await apiRequest("POST", "/api/employees", empleado);
    return response.json();
  }
}

export class EmpleadosColombiaApi {
  // Gestión de empleados con marco legal colombiano
  static async getAllEmpleados() {
    const response = await apiRequest("GET", "/api/empleados-colombia");
    return response.json();
  }

  static async getEmpleado(id: number) {
    const response = await apiRequest("GET", `/api/empleados-colombia/${id}`);
    return response.json();
  }

  static async createEmpleado(empleado: InsertEmployee) {
    const response = await apiRequest("POST", "/api/empleados-colombia", empleado);
    return response.json();
  }

  static async updateEmpleado(id: number, empleado: Partial<InsertEmployee>) {
    const response = await apiRequest("PATCH", `/api/empleados-colombia/${id}`, empleado);
    return response.json();
  }

  static async deleteEmpleado(id: number) {
    const response = await apiRequest("DELETE", `/api/empleados-colombia/${id}`);
    return response.json();
  }

  // Gestión de contratos
  static async getHistorialContratos(empleadoId: number) {
    const response = await apiRequest("GET", `/api/empleados-colombia/${empleadoId}/historial-contratos`);
    return response.json();
  }

  static async createCambioContrato(empleadoId: number, cambio: any) {
    const response = await apiRequest("POST", `/api/empleados-colombia/${empleadoId}/cambio-contrato`, cambio);
    return response.json();
  }

  // Prestaciones sociales
  static async getPrestacionesSociales(empleadoId: number, año?: number) {
    const params = año ? `?año=${año}` : '';
    const response = await apiRequest("GET", `/api/empleados-colombia/${empleadoId}/prestaciones${params}`);
    return response.json();
  }

  static async calcularPrestaciones(empleadoId: number, año: number, mes: number) {
    const response = await apiRequest("POST", `/api/empleados-colombia/${empleadoId}/calcular-prestaciones`, { año, mes });
    return response.json();
  }

  // Novedades de nómina
  static async getNovedades(empleadoId: number) {
    const response = await apiRequest("GET", `/api/empleados-colombia/${empleadoId}/novedades`);
    return response.json();
  }

  static async createNovedad(empleadoId: number, novedad: any) {
    const response = await apiRequest("POST", `/api/empleados-colombia/${empleadoId}/novedades`, novedad);
    return response.json();
  }

  static async updateNovedad(empleadoId: number, novedadId: number, novedad: any) {
    const response = await apiRequest("PATCH", `/api/empleados-colombia/${empleadoId}/novedades/${novedadId}`, novedad);
    return response.json();
  }

  static async deleteNovedad(empleadoId: number, novedadId: number) {
    const response = await apiRequest("DELETE", `/api/empleados-colombia/${empleadoId}/novedades/${novedadId}`);
    return response.json();
  }

  // Validaciones legales
  static async validarSalarioMinimo(tipoContrato: string, valor: number, horas?: number) {
    const response = await apiRequest("POST", "/api/empleados-colombia/validar-salario", { 
      tipoContrato, 
      valor, 
      horas 
    });
    return response.json();
  }

  static async getParametrosLegales(año?: number) {
    const params = año ? `?año=${año}` : '';
    const response = await apiRequest("GET", `/api/parametros-legales${params}`);
    return response.json();
  }

  // Cálculos de nómina
  static async calcularNomina(empleadoId: number, periodo: { inicio: string, fin: string }) {
    const response = await apiRequest("POST", `/api/empleados-colombia/${empleadoId}/calcular-nomina`, periodo);
    return response.json();
  }

  static async simularNomina(empleadoId: number, periodo: { inicio: string, fin: string }, novedades?: any[]) {
    const response = await apiRequest("POST", `/api/empleados-colombia/${empleadoId}/simular-nomina`, { 
      periodo, 
      novedades 
    });
    return response.json();
  }
}

// Exportaciones para compatibilidad hacia atrás
export const empleadosApi = new EmpleadosColombiaApi();