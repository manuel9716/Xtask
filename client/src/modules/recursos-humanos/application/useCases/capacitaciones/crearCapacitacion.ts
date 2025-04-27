/**
 * Caso de uso: Crear Capacitación
 * Permite crear un nuevo programa de capacitación para empleados
 */

import { CapacitacionRepository } from "../../../domain/repositories/CapacitacionRepository";
import { EmpleadoRepository } from "../../../domain/repositories/EmpleadoRepository";
import { CrearCapacitacionDTO, EstadoCapacitacion, Capacitacion } from "../../../domain/entities/Capacitacion";

export class CrearCapacitacionUseCase {
  constructor(
    private capacitacionRepository: CapacitacionRepository,
    private empleadoRepository: EmpleadoRepository
  ) {}

  /**
   * Ejecuta el caso de uso para crear una nueva capacitación
   * @param capacitacionData Datos de la capacitación a crear
   * @returns La capacitación creada
   */
  async execute(capacitacionData: CrearCapacitacionDTO): Promise<Capacitacion> {
    // Validar que el responsable exista
    await this.validarResponsable(capacitacionData.responsableId);
    
    // Validar datos de la capacitación
    this.validarDatosCapacitacion(capacitacionData);
    
    // Lógica de aplicación: crear capacitación en estado PLANIFICADA
    const capacitacionCompleta = {
      ...capacitacionData,
      // Aseguramos que el estado inicial sea siempre PLANIFICADA
      estado: EstadoCapacitacion.PLANIFICADA
    };
    
    return this.capacitacionRepository.crearCapacitacion(capacitacionCompleta);
  }

  /**
   * Valida que el responsable de la capacitación exista
   * @param responsableId ID del empleado responsable
   * @throws Error si el responsable no existe
   */
  private async validarResponsable(responsableId: number): Promise<void> {
    const responsable = await this.empleadoRepository.obtenerEmpleadoPorId(responsableId);
    if (!responsable) {
      throw new Error(`No se encontró el responsable con ID: ${responsableId}`);
    }
  }

  /**
   * Valida los datos de la capacitación
   * @param capacitacionData Datos de la capacitación a validar
   * @throws Error si los datos no cumplen las reglas del dominio
   */
  private validarDatosCapacitacion(capacitacionData: CrearCapacitacionDTO): void {
    // Validar que el nombre no esté vacío
    if (!capacitacionData.nombre || capacitacionData.nombre.trim() === '') {
      throw new Error('El nombre de la capacitación es obligatorio');
    }
    
    // Validar fechas
    if (!capacitacionData.fechaInicio || !capacitacionData.fechaFin) {
      throw new Error('Las fechas de inicio y fin son obligatorias');
    }
    
    // La fecha de inicio debe ser anterior a la fecha de fin
    const fechaInicio = new Date(capacitacionData.fechaInicio);
    const fechaFin = new Date(capacitacionData.fechaFin);
    
    if (fechaInicio >= fechaFin) {
      throw new Error('La fecha de inicio debe ser anterior a la fecha de fin');
    }
    
    // Validar duración en horas
    if (capacitacionData.duracionHoras <= 0) {
      throw new Error('La duración de la capacitación debe ser mayor que cero');
    }
    
    // Si es modalidad virtual, debe tener enlace virtual
    if (capacitacionData.modalidad === 'VIRTUAL' && !capacitacionData.enlaceVirtual) {
      throw new Error('Las capacitaciones virtuales deben tener un enlace virtual');
    }
    
    // Si es modalidad presencial, debe tener ubicación
    if (capacitacionData.modalidad === 'PRESENCIAL' && !capacitacionData.ubicacion) {
      throw new Error('Las capacitaciones presenciales deben tener una ubicación');
    }
    
    // Validar cupo máximo si se proporciona
    if (capacitacionData.cupoMaximo !== undefined && capacitacionData.cupoMaximo <= 0) {
      throw new Error('El cupo máximo debe ser mayor que cero');
    }
    
    // Validar costo si se proporciona
    if (capacitacionData.costo !== undefined && capacitacionData.costo < 0) {
      throw new Error('El costo no puede ser negativo');
    }
  }
}