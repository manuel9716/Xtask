import { apiRequest } from '@/lib/queryClient';
import { ResultadoCalculoNomina } from '../../domain/services/CalculoNominaEmpleado';

/**
 * Interfaz para las nóminas generadas
 */
export interface NominaGenerada {
  id: number;
  empleadoId: number;
  periodo: string;
  fechaGeneracion: string;
  salarioBase: string;
  totalIngresos: string;
  totalDeducciones: string;
  salarioNeto: string;
  estado: 'pendiente' | 'pagada' | 'cancelada';
  fechaPago?: string;
  pdfUrl?: string;
}

/**
 * Controlador para gestionar operaciones de nómina
 */
export class NominaController {
  
  /**
   * Obtener todas las nóminas generadas para un empleado
   * @param empleadoId ID del empleado
   * @returns Lista de nóminas generadas
   */
  static async obtenerNominasEmpleado(empleadoId: number): Promise<NominaGenerada[]> {
    try {
      const response = await apiRequest('GET', `/api/finanzas/nomina/empleado/${empleadoId}`);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error al obtener nóminas del empleado');
      }
      
      return response.json();
    } catch (error) {
      console.error('Error al obtener nóminas:', error);
      throw error;
    }
  }
  
  /**
   * Generar una nueva nómina para un empleado
   * @param datosNomina Datos calculados de la nómina
   * @returns Nómina generada
   */
  static async generarNomina(datosNomina: ResultadoCalculoNomina): Promise<NominaGenerada> {
    try {
      const response = await apiRequest('POST', '/api/finanzas/nomina/generar', datosNomina);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error al generar la nómina');
      }
      
      return response.json();
    } catch (error) {
      console.error('Error al generar nómina:', error);
      throw error;
    }
  }
  
  /**
   * Marcar una nómina como pagada
   * @param nominaId ID de la nómina
   * @returns Nómina actualizada
   */
  static async marcarNominaPagada(nominaId: number): Promise<NominaGenerada> {
    try {
      const response = await apiRequest('PATCH', `/api/finanzas/nomina/${nominaId}/marcar-pagada`);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error al marcar la nómina como pagada');
      }
      
      return response.json();
    } catch (error) {
      console.error('Error al marcar nómina como pagada:', error);
      throw error;
    }
  }
  
  /**
   * Cancelar una nómina
   * @param nominaId ID de la nómina
   * @returns Nómina actualizada
   */
  static async cancelarNomina(nominaId: number): Promise<NominaGenerada> {
    try {
      const response = await apiRequest('PATCH', `/api/finanzas/nomina/${nominaId}/cancelar`);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error al cancelar la nómina');
      }
      
      return response.json();
    } catch (error) {
      console.error('Error al cancelar nómina:', error);
      throw error;
    }
  }
  
  /**
   * Obtener el desprendible de una nómina en formato PDF
   * @param nominaId ID de la nómina
   * @returns URL del PDF generado
   */
  static async obtenerDesprendiblePDF(nominaId: number): Promise<string> {
    try {
      const response = await apiRequest('GET', `/api/finanzas/nomina/${nominaId}/desprendible-url`);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error al obtener la URL del desprendible');
      }
      
      const data = await response.json();
      return data.pdfUrl;
    } catch (error) {
      console.error('Error al obtener URL del desprendible:', error);
      throw error;
    }
  }
}