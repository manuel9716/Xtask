/**
 * Caso de uso: Crear Evaluación
 * Permite crear una nueva evaluación de desempeño
 */

import { CrearEvaluacionDTO, EstadoEvaluacion, Evaluacion } from "../../../domain/entities/Evaluacion";
import { EvaluacionRepository } from "../../../domain/repositories/EvaluacionRepository";
import { EmpleadoRepository } from "../../../domain/repositories/EmpleadoRepository";

export class CrearEvaluacionUseCase {
  constructor(
    private evaluacionRepository: EvaluacionRepository,
    private empleadoRepository: EmpleadoRepository
  ) {}

  /**
   * Ejecuta el caso de uso para crear una nueva evaluación
   * @param evaluacionData Datos de la evaluación a crear
   * @returns La evaluación creada
   */
  async execute(evaluacionData: CrearEvaluacionDTO): Promise<Evaluacion> {
    // Validar que los empleados (evaluado y evaluador) existan
    await this.validarEmpleados(evaluacionData.empleadoId, evaluacionData.evaluadorId);
    
    // Validar otros datos de la evaluación
    this.validarDatosEvaluacion(evaluacionData);
    
    // Lógica de aplicación: crear evaluación en estado PENDIENTE
    const evaluacionCompleta = {
      ...evaluacionData,
      // Aseguramos que el estado inicial sea siempre PENDIENTE
      estado: EstadoEvaluacion.PENDIENTE
    };
    
    return this.evaluacionRepository.crearEvaluacion(evaluacionCompleta);
  }

  /**
   * Valida que el empleado evaluado y el evaluador existan
   * @param empleadoId ID del empleado evaluado
   * @param evaluadorId ID del empleado evaluador
   * @throws Error si alguno de los empleados no existe
   */
  private async validarEmpleados(empleadoId: number, evaluadorId: number): Promise<void> {
    // Validar que el empleado evaluado exista
    const empleado = await this.empleadoRepository.obtenerEmpleadoPorId(empleadoId);
    if (!empleado) {
      throw new Error(`No se encontró el empleado a evaluar con ID: ${empleadoId}`);
    }
    
    // Validar que el evaluador exista
    const evaluador = await this.empleadoRepository.obtenerEmpleadoPorId(evaluadorId);
    if (!evaluador) {
      throw new Error(`No se encontró el empleado evaluador con ID: ${evaluadorId}`);
    }
    
    // Verificar que el evaluado y el evaluador sean diferentes
    if (empleadoId === evaluadorId) {
      throw new Error('El empleado evaluado no puede ser su propio evaluador');
    }
  }

  /**
   * Valida los datos de la evaluación
   * @param evaluacionData Datos de la evaluación a validar
   * @throws Error si los datos no cumplen las reglas del dominio
   */
  private validarDatosEvaluacion(evaluacionData: CrearEvaluacionDTO): void {
    // Validar que el período no esté vacío
    if (!evaluacionData.periodo || evaluacionData.periodo.trim() === '') {
      throw new Error('El período de evaluación es obligatorio');
    }
    
    // Validar fechas
    if (!evaluacionData.fechaInicio || !evaluacionData.fechaFin) {
      throw new Error('Las fechas de inicio y fin son obligatorias');
    }
    
    // La fecha de inicio debe ser anterior a la fecha de fin
    const fechaInicio = new Date(evaluacionData.fechaInicio);
    const fechaFin = new Date(evaluacionData.fechaFin);
    
    if (fechaInicio >= fechaFin) {
      throw new Error('La fecha de inicio debe ser anterior a la fecha de fin');
    }
    
    // La fecha de inicio no puede ser en el pasado (más de 30 días)
    const hoy = new Date();
    const limitePasado = new Date();
    limitePasado.setDate(limitePasado.getDate() - 30);
    
    if (fechaInicio < limitePasado) {
      throw new Error('La fecha de inicio no puede ser más de 30 días en el pasado');
    }
  }
}