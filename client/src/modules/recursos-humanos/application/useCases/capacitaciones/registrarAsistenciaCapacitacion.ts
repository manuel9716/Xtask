/**
 * Caso de uso: Registrar Asistencia a Capacitación
 * Permite registrar la asistencia de empleados a una sesión de capacitación
 */

import { AsistenciaCapacitacion } from "../../../domain/entities/Capacitacion";
import { CapacitacionRepository } from "../../../domain/repositories/CapacitacionRepository";
import { EmpleadoRepository } from "../../../domain/repositories/EmpleadoRepository";

export class RegistrarAsistenciaCapacitacionUseCase {
  constructor(
    private capacitacionRepository: CapacitacionRepository,
    private empleadoRepository: EmpleadoRepository
  ) {}

  /**
   * Ejecuta el caso de uso para registrar la asistencia de un empleado a una capacitación
   * @param capacitacionId ID de la capacitación
   * @param asistencia Datos de asistencia (empleado, fecha, asistió, observaciones)
   * @returns true si el registro fue exitoso, false en caso contrario
   */
  async execute(
    capacitacionId: number, 
    asistencia: AsistenciaCapacitacion
  ): Promise<boolean> {
    // Validar que la capacitación exista
    const capacitacion = await this.capacitacionRepository.obtenerCapacitacionPorId(capacitacionId);
    if (!capacitacion) {
      throw new Error(`No se encontró la capacitación con ID: ${capacitacionId}`);
    }
    
    // Validar que el empleado exista
    const empleado = await this.empleadoRepository.obtenerEmpleadoPorId(asistencia.empleadoId);
    if (!empleado) {
      throw new Error(`No se encontró el empleado con ID: ${asistencia.empleadoId}`);
    }
    
    // Validar que el empleado esté inscrito en la capacitación
    if (!capacitacion.participantes.includes(asistencia.empleadoId)) {
      throw new Error(`El empleado no está inscrito en esta capacitación`);
    }
    
    // Validar fecha de asistencia
    this.validarFechaAsistencia(asistencia.fecha, capacitacion.fechaInicio, capacitacion.fechaFin);
    
    // Lógica de aplicación: registrar asistencia
    return this.capacitacionRepository.registrarAsistencia(capacitacionId, asistencia);
  }

  /**
   * Ejecuta el caso de uso para registrar asistencia de múltiples empleados a una capacitación
   * @param capacitacionId ID de la capacitación
   * @param fecha Fecha de la sesión
   * @param registros Lista de {empleadoId, asistio, observaciones}
   * @returns Objeto con resultado del registro (éxito, mensaje, registros exitosos, fallidos)
   */
  async executeBatch(
    capacitacionId: number,
    fecha: Date,
    registros: Array<{
      empleadoId: number;
      asistio: boolean;
      observaciones?: string;
    }>
  ): Promise<{
    exito: boolean;
    mensaje: string;
    exitosos: number[];
    fallidos: {id: number; razon: string}[];
  }> {
    if (!registros || registros.length === 0) {
      return {
        exito: false,
        mensaje: 'No se proporcionaron registros de asistencia',
        exitosos: [],
        fallidos: []
      };
    }
    
    // Validar que la capacitación exista
    const capacitacion = await this.capacitacionRepository.obtenerCapacitacionPorId(capacitacionId);
    if (!capacitacion) {
      throw new Error(`No se encontró la capacitación con ID: ${capacitacionId}`);
    }
    
    // Validar fecha de asistencia
    this.validarFechaAsistencia(fecha, capacitacion.fechaInicio, capacitacion.fechaFin);
    
    // Preparar resultados
    const resultados = {
      exito: false,
      mensaje: '',
      exitosos: [] as number[],
      fallidos: [] as {id: number; razon: string}[]
    };
    
    // Procesar cada registro de asistencia
    for (const registro of registros) {
      try {
        // Crear objeto de asistencia
        const asistencia: AsistenciaCapacitacion = {
          empleadoId: registro.empleadoId,
          fecha: fecha,
          asistio: registro.asistio,
          observaciones: registro.observaciones
        };
        
        // Registrar asistencia
        const registrado = await this.capacitacionRepository.registrarAsistencia(capacitacionId, asistencia);
        
        if (registrado) {
          resultados.exitosos.push(registro.empleadoId);
        } else {
          resultados.fallidos.push({
            id: registro.empleadoId,
            razon: 'No se pudo registrar la asistencia'
          });
        }
      } catch (error) {
        resultados.fallidos.push({
          id: registro.empleadoId,
          razon: error instanceof Error ? error.message : 'Error desconocido'
        });
      }
    }
    
    // Determinar resultado global
    if (resultados.exitosos.length > 0) {
      if (resultados.fallidos.length === 0) {
        resultados.exito = true;
        resultados.mensaje = 'Todos los registros de asistencia fueron procesados correctamente';
      } else {
        resultados.exito = true;
        resultados.mensaje = `${resultados.exitosos.length} registros procesados correctamente, ${resultados.fallidos.length} fallaron`;
      }
    } else {
      resultados.exito = false;
      resultados.mensaje = 'No se pudo registrar ninguna asistencia';
    }
    
    return resultados;
  }

  /**
   * Valida que la fecha de asistencia esté dentro del periodo de la capacitación
   * @param fecha Fecha de asistencia a validar
   * @param fechaInicio Fecha de inicio de la capacitación
   * @param fechaFin Fecha de fin de la capacitación
   * @throws Error si la fecha no es válida
   */
  private validarFechaAsistencia(fecha: Date, fechaInicio: Date, fechaFin: Date): void {
    const fechaAsistencia = new Date(fecha);
    fechaAsistencia.setHours(0, 0, 0, 0);
    
    const inicio = new Date(fechaInicio);
    inicio.setHours(0, 0, 0, 0);
    
    const fin = new Date(fechaFin);
    fin.setHours(0, 0, 0, 0);
    
    // La fecha de asistencia debe estar dentro del período de la capacitación
    if (fechaAsistencia < inicio || fechaAsistencia > fin) {
      throw new Error('La fecha de asistencia debe estar dentro del período de la capacitación');
    }
    
    // La fecha de asistencia no puede ser en el futuro
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    
    if (fechaAsistencia > hoy) {
      throw new Error('No se puede registrar asistencia para fechas futuras');
    }
  }
}