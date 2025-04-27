/**
 * Caso de uso: Ver Detalle de Nómina
 * Permite obtener los detalles completos de un registro de nómina
 * y generar su desprendible si se solicita
 */

import { EmpleadoRepository } from "../../../domain/repositories/EmpleadoRepository";
import { NominaRepository, RegistroNomina } from "../../../domain/repositories/NominaRepository";

export class VerDetalleNominaUseCase {
  constructor(
    private nominaRepository: NominaRepository,
    private empleadoRepository: EmpleadoRepository
  ) {}

  /**
   * Ejecuta el caso de uso para obtener los detalles de un registro de nómina
   * @param nominaId ID del registro de nómina
   * @returns Detalles del registro de nómina
   * @throws Error si el registro no existe
   */
  async execute(nominaId: number): Promise<RegistroNomina> {
    // Obtener el registro de nómina
    const nomina = await this.nominaRepository.obtenerNominaPorId(nominaId);
    if (!nomina) {
      throw new Error(`No se encontró el registro de nómina con ID: ${nominaId}`);
    }
    
    return nomina;
  }

  /**
   * Ejecuta el caso de uso para generar el desprendible de nómina en PDF
   * @param nominaId ID del registro de nómina
   * @returns Buffer con el contenido del PDF
   * @throws Error si el registro no existe
   */
  async executeGenerarDesprendible(nominaId: number): Promise<Buffer> {
    // Verificar que el registro de nómina exista
    const nomina = await this.nominaRepository.obtenerNominaPorId(nominaId);
    if (!nomina) {
      throw new Error(`No se encontró el registro de nómina con ID: ${nominaId}`);
    }
    
    // Generar el desprendible
    return this.nominaRepository.generarDesprendibleNomina(nominaId);
  }

  /**
   * Ejecuta el caso de uso para marcar un registro de nómina como pagado
   * @param nominaId ID del registro de nómina
   * @param fechaPago Fecha de pago
   * @param metodoPago Método de pago utilizado
   * @returns Registro de nómina actualizado
   * @throws Error si el registro no existe o ya está pagado
   */
  async executeMarcarPagado(
    nominaId: number, 
    fechaPago: Date,
    metodoPago?: string
  ): Promise<RegistroNomina> {
    // Verificar que el registro de nómina exista
    const nomina = await this.nominaRepository.obtenerNominaPorId(nominaId);
    if (!nomina) {
      throw new Error(`No se encontró el registro de nómina con ID: ${nominaId}`);
    }
    
    // Verificar que no esté ya pagado
    if (nomina.estado === 'PAGADA') {
      throw new Error('Este registro de nómina ya está marcado como pagado');
    }
    
    // Marcar como pagado
    return this.nominaRepository.marcarComoPagado(nominaId, fechaPago, metodoPago);
  }

  /**
   * Ejecuta el caso de uso para obtener un registro de nómina con datos adicionales del empleado
   * @param nominaId ID del registro de nómina
   * @returns Registro de nómina con datos adicionales del empleado
   * @throws Error si el registro no existe
   */
  async executeConDatosEmpleado(nominaId: number): Promise<RegistroNomina & {
    nombreEmpleado: string;
    departamentoEmpleado: string;
    cargoEmpleado: string;
  }> {
    // Obtener el registro de nómina
    const nomina = await this.execute(nominaId);
    
    // Obtener datos del empleado
    const empleado = await this.empleadoRepository.obtenerEmpleadoPorId(nomina.empleadoId);
    if (!empleado) {
      throw new Error(`No se encontró el empleado asociado a esta nómina (ID: ${nomina.empleadoId})`);
    }
    
    // Combinar los datos
    return {
      ...nomina,
      nombreEmpleado: empleado.nombreCompleto,
      departamentoEmpleado: empleado.departamento,
      cargoEmpleado: empleado.cargo
    };
  }
}