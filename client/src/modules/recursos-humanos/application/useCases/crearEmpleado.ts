import { CrearEmpleadoRRHH, EmpleadoRRHH, EstadoEmpleado } from '../../domain/entities/Empleado';
import { EmpleadoRepository } from '../../domain/repositories/EmpleadoRepository';

/**
 * Caso de uso: Crear Empleado
 * Contiene la lógica de aplicación para crear un nuevo empleado
 */
export class CrearEmpleadoUseCase {
  constructor(private empleadoRepository: EmpleadoRepository) {}

  /**
   * Ejecuta el caso de uso para crear un nuevo empleado
   * @param empleadoData Datos del empleado a crear
   * @returns Empleado creado con su identificador asignado
   * @throws Error si faltan datos obligatorios o hay problemas en la validación
   */
  async execute(empleadoData: CrearEmpleadoRRHH): Promise<EmpleadoRRHH> {
    // Validaciones de dominio
    this.validarDatosEmpleado(empleadoData);

    // Si no se especifica el estado, se establece como ACTIVO por defecto
    if (!empleadoData.estado) {
      empleadoData.estado = EstadoEmpleado.ACTIVO;
    }

    // Crear el empleado a través del repositorio
    return await this.empleadoRepository.crearEmpleado(empleadoData);
  }

  /**
   * Valida los datos del empleado según reglas de dominio
   * @param empleadoData Datos a validar
   * @throws Error si hay problemas en la validación
   */
  private validarDatosEmpleado(empleadoData: CrearEmpleadoRRHH): void {
    // Validar campos obligatorios
    if (!empleadoData.nombre || empleadoData.nombre.trim() === '') {
      throw new Error('El nombre del empleado es obligatorio');
    }

    if (!empleadoData.apellido || empleadoData.apellido.trim() === '') {
      throw new Error('El apellido del empleado es obligatorio');
    }

    if (!empleadoData.correo || !this.validarFormatoCorreo(empleadoData.correo)) {
      throw new Error('El correo electrónico es obligatorio y debe tener un formato válido');
    }

    if (!empleadoData.departamento) {
      throw new Error('El departamento es obligatorio');
    }

    if (!empleadoData.posicion) {
      throw new Error('La posición o cargo es obligatorio');
    }

    if (!empleadoData.fechaContratacion) {
      throw new Error('La fecha de contratación es obligatoria');
    }

    if (empleadoData.salario === undefined || empleadoData.salario <= 0) {
      throw new Error('El salario debe ser un valor positivo');
    }

    // Validar fechas
    const fechaActual = new Date();
    const fechaContratacion = new Date(empleadoData.fechaContratacion);

    if (fechaContratacion > fechaActual) {
      throw new Error('La fecha de contratación no puede ser una fecha futura');
    }

    if (empleadoData.fechaNacimiento) {
      const fechaNacimiento = new Date(empleadoData.fechaNacimiento);
      const edadMinima = 18;
      const añosMilisegundos = edadMinima * 365 * 24 * 60 * 60 * 1000;
      
      if (fechaActual.getTime() - fechaNacimiento.getTime() < añosMilisegundos) {
        throw new Error(`El empleado debe tener al menos ${edadMinima} años de edad`);
      }
    }

    // Validar habilidades si existen
    if (empleadoData.habilidades && empleadoData.habilidades.length > 0) {
      for (const habilidad of empleadoData.habilidades) {
        if (!habilidad.nombre || !habilidad.nivel) {
          throw new Error('Todas las habilidades deben tener nombre y nivel');
        }

        if (!['básico', 'intermedio', 'avanzado', 'experto'].includes(habilidad.nivel)) {
          throw new Error('El nivel de habilidad debe ser básico, intermedio, avanzado o experto');
        }
      }
    }
  }

  /**
   * Valida que el formato del correo electrónico sea correcto
   * @param correo Correo a validar
   * @returns true si el formato es válido, false en caso contrario
   */
  private validarFormatoCorreo(correo: string): boolean {
    const regexCorreo = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regexCorreo.test(correo);
  }
}