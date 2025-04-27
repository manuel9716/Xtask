/**
 * Caso de uso: Editar Empleado
 * Permite actualizar los datos de un empleado existente
 */

import { ActualizarEmpleadoDTO, Empleado } from "../../../domain/entities/Empleado";
import { EmpleadoRepository } from "../../../domain/repositories/EmpleadoRepository";

export class EditarEmpleadoUseCase {
  constructor(private empleadoRepository: EmpleadoRepository) {}

  /**
   * Ejecuta el caso de uso para editar un empleado existente
   * @param empleadoData Datos del empleado a actualizar
   * @returns El empleado actualizado
   * @throws Error si el empleado no existe
   */
  async execute(empleadoData: ActualizarEmpleadoDTO): Promise<Empleado> {
    // Verificar que el empleado exista
    const empleadoExistente = await this.empleadoRepository.obtenerEmpleadoPorId(empleadoData.id);
    if (!empleadoExistente) {
      throw new Error(`No se encontró el empleado con ID: ${empleadoData.id}`);
    }
    
    // Validar datos actualizados
    this.validarDatosEmpleado(empleadoData);
    
    // Lógica de aplicación
    return this.empleadoRepository.actualizarEmpleado(empleadoData);
  }

  /**
   * Valida los datos de actualización del empleado
   * @param empleadoData Datos del empleado a validar
   * @throws Error si los datos no son válidos
   */
  private validarDatosEmpleado(empleadoData: ActualizarEmpleadoDTO): void {
    // Validar campos que estén presentes
    if (empleadoData.nombres && empleadoData.nombres.trim() === '') {
      throw new Error('El nombre del empleado no puede estar vacío');
    }

    if (empleadoData.apellidos && empleadoData.apellidos.trim() === '') {
      throw new Error('Los apellidos del empleado no pueden estar vacíos');
    }

    if (empleadoData.cargo && empleadoData.cargo.trim() === '') {
      throw new Error('El cargo del empleado no puede estar vacío');
    }

    if (empleadoData.departamento && empleadoData.departamento.trim() === '') {
      throw new Error('El departamento del empleado no puede estar vacío');
    }

    if (empleadoData.salario !== undefined && empleadoData.salario <= 0) {
      throw new Error('El salario debe ser mayor que cero');
    }

    // Validar formato de correo si se proporciona
    if (empleadoData.correo && !this.validarFormatoCorreo(empleadoData.correo)) {
      throw new Error('El formato del correo electrónico no es válido');
    }

    // Validar que la fecha de contratación no sea en el futuro
    if (empleadoData.fechaContratacion) {
      const hoy = new Date();
      hoy.setHours(0, 0, 0, 0);
      
      const fechaContratacion = new Date(empleadoData.fechaContratacion);
      fechaContratacion.setHours(0, 0, 0, 0);
      
      if (fechaContratacion > hoy) {
        throw new Error('La fecha de contratación no puede ser en el futuro');
      }
    }

    // Validar edad si se actualiza la fecha de nacimiento
    if (empleadoData.fechaNacimiento) {
      const edad = this.calcularEdad(empleadoData.fechaNacimiento);
      if (edad < 18) {
        throw new Error('El empleado debe ser mayor de edad');
      }
    }
  }

  /**
   * Valida el formato del correo electrónico
   * @param correo Correo a validar
   * @returns true si el formato es válido, false en caso contrario
   */
  private validarFormatoCorreo(correo: string): boolean {
    const regexCorreo = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regexCorreo.test(correo);
  }

  /**
   * Calcula la edad basada en la fecha de nacimiento
   * @param fechaNacimiento Fecha de nacimiento
   * @returns Edad en años
   */
  private calcularEdad(fechaNacimiento: Date): number {
    const hoy = new Date();
    const nacimiento = new Date(fechaNacimiento);
    let edad = hoy.getFullYear() - nacimiento.getFullYear();
    const mes = hoy.getMonth() - nacimiento.getMonth();
    
    if (mes < 0 || (mes === 0 && hoy.getDate() < nacimiento.getDate())) {
      edad--;
    }
    
    return edad;
  }
}