/**
 * Caso de uso: Crear Empleado
 * Permite crear un nuevo empleado en el sistema
 */

import { CrearEmpleadoDTO, Empleado } from "../../../domain/entities/Empleado";
import { EmpleadoRepository } from "../../../domain/repositories/EmpleadoRepository";

export class CrearEmpleadoUseCase {
  constructor(private empleadoRepository: EmpleadoRepository) {}

  /**
   * Ejecuta el caso de uso para crear un nuevo empleado
   * @param empleadoData Datos del empleado a crear
   * @returns El empleado creado
   */
  async execute(empleadoData: CrearEmpleadoDTO): Promise<Empleado> {
    // Validaciones específicas del dominio
    this.validarDatosEmpleado(empleadoData);
    
    // Lógica de aplicación
    return this.empleadoRepository.crearEmpleado(empleadoData);
  }

  /**
   * Valida los datos del empleado antes de crearlo
   * @param empleadoData Datos del empleado a validar
   * @throws Error si los datos no son válidos
   */
  private validarDatosEmpleado(empleadoData: CrearEmpleadoDTO): void {
    // Validar campos obligatorios
    if (!empleadoData.nombres || empleadoData.nombres.trim() === '') {
      throw new Error('El nombre del empleado es obligatorio');
    }

    if (!empleadoData.apellidos || empleadoData.apellidos.trim() === '') {
      throw new Error('Los apellidos del empleado son obligatorios');
    }

    if (!empleadoData.cargo || empleadoData.cargo.trim() === '') {
      throw new Error('El cargo del empleado es obligatorio');
    }

    if (!empleadoData.departamento || empleadoData.departamento.trim() === '') {
      throw new Error('El departamento del empleado es obligatorio');
    }

    if (!empleadoData.fechaContratacion) {
      throw new Error('La fecha de contratación es obligatoria');
    }

    if (empleadoData.salario <= 0) {
      throw new Error('El salario debe ser mayor que cero');
    }

    // Validar formato de correo si se proporciona
    if (empleadoData.correo && !this.validarFormatoCorreo(empleadoData.correo)) {
      throw new Error('El formato del correo electrónico no es válido');
    }

    // Validar que la fecha de contratación no sea en el futuro
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    
    const fechaContratacion = new Date(empleadoData.fechaContratacion);
    fechaContratacion.setHours(0, 0, 0, 0);
    
    if (fechaContratacion > hoy) {
      throw new Error('La fecha de contratación no puede ser en el futuro');
    }

    // Otras validaciones específicas del dominio
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