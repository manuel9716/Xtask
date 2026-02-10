/**
 * Entidad de dominio: Empleado
 * Contiene la lógica de negocio del empleado
 */
export class Empleado {
  constructor(
    public readonly id: number,
    public nombre: string,
    public apellido: string,
    public identificacion: string,
    public depto: string,
    public cargo: string,
    public fechaIngreso: Date,
    public estadoContrato: 'activo' | 'inactivo' | 'suspendido',
    public tipoContrato: 'indefinido' | 'fijo' | 'obra_labor' | 'prestacion_servicios' | 'por_horas',
    public telefono?: string,
    public direccion?: string,
    public contactoEmergencia?: string,
    public fechaFinContrato?: Date,
    public claseRiesgoArl?: string,
    public horasPorSemana?: number,
    public salarioPorHora?: number,
    public honorarios?: number,
    public salarioBase?: number,
    public bonificaciones?: number,
    public auxilioTransporte?: boolean,
    public requiereSeguridadSocial?: boolean,
    public activo: boolean = true,
    public userId?: number,
    public deletedAt?: Date,
    public createdAt?: Date
  ) {}

  /**
   * Obtiene el nombre completo del empleado
   */
  get nombreCompleto(): string {
    return `${this.nombre} ${this.apellido}`;
  }

  /**
   * Verifica si el empleado está activo
   */
  estaActivo(): boolean {
    return this.activo && !this.deletedAt && this.estadoContrato === 'activo';
  }

  /**
   * Verifica si el contrato ha expirado (para contratos fijos)
   */
  contratoExpirado(): boolean {
    if (this.tipoContrato !== 'fijo' || !this.fechaFinContrato) {
      return false;
    }
    return new Date() > this.fechaFinContrato;
  }

  /**
   * Calcula el salario mensual según el tipo de contrato
   */
  calcularSalarioMensual(): number {
    switch (this.tipoContrato) {
      case 'indefinido':
      case 'fijo':
      case 'obra_labor':
        return this.salarioBase || 0;
      
      case 'por_horas':
        if (!this.salarioPorHora || !this.horasPorSemana) return 0;
        // Asumiendo 4.33 semanas por mes
        return this.salarioPorHora * this.horasPorSemana * 4.33;
      
      case 'prestacion_servicios':
        return this.honorarios || 0;
      
      default:
        return 0;
    }
  }

  /**
   * Verifica si el empleado requiere seguridad social
   */
  requiereAportesSeguridad(): boolean {
    if (this.tipoContrato === 'prestacion_servicios') {
      return this.requiereSeguridadSocial || false;
    }
    return true; // Todos los demás tipos requieren seguridad social
  }

  /**
   * Valida que los datos del empleado sean correctos según el tipo de contrato
   */
  validar(): { valido: boolean; errores: string[] } {
    const errores: string[] = [];

    // Validaciones generales
    if (!this.nombre || this.nombre.trim().length === 0) {
      errores.push('El nombre es requerido');
    }
    if (!this.apellido || this.apellido.trim().length === 0) {
      errores.push('El apellido es requerido');
    }
    if (!this.identificacion || this.identificacion.trim().length === 0) {
      errores.push('La identificación es requerida');
    }

    // Validaciones específicas por tipo de contrato
    switch (this.tipoContrato) {
      case 'indefinido':
      case 'fijo':
      case 'obra_labor':
        if (!this.salarioBase || this.salarioBase <= 0) {
          errores.push('El salario base es requerido y debe ser mayor a 0');
        }
        break;

      case 'fijo':
        if (!this.fechaFinContrato) {
          errores.push('La fecha de fin de contrato es requerida para contratos fijos');
        }
        break;

      case 'por_horas':
        if (!this.salarioPorHora || this.salarioPorHora <= 0) {
          errores.push('El salario por hora es requerido y debe ser mayor a 0');
        }
        if (!this.horasPorSemana || this.horasPorSemana <= 0) {
          errores.push('Las horas por semana son requeridas y deben ser mayores a 0');
        }
        break;

      case 'prestacion_servicios':
        if (!this.honorarios || this.honorarios <= 0) {
          errores.push('Los honorarios son requeridos y deben ser mayores a 0');
        }
        break;
    }

    return {
      valido: errores.length === 0,
      errores
    };
  }

  /**
   * Desactiva el empleado (soft delete)
   */
  desactivar(): void {
    this.activo = false;
    this.estadoContrato = 'inactivo';
    this.deletedAt = new Date();
  }

  /**
   * Reactiva el empleado
   */
  reactivar(): void {
    this.activo = true;
    this.estadoContrato = 'activo';
    this.deletedAt = undefined;
  }

  /**
   * Suspende el contrato del empleado
   */
  suspender(): void {
    this.estadoContrato = 'suspendido';
  }

  /**
   * Actualiza el salario del empleado
   */
  actualizarSalario(nuevoSalario: number): void {
    if (nuevoSalario <= 0) {
      throw new Error('El salario debe ser mayor a 0');
    }

    switch (this.tipoContrato) {
      case 'indefinido':
      case 'fijo':
      case 'obra_labor':
        this.salarioBase = nuevoSalario;
        break;
      case 'por_horas':
        this.salarioPorHora = nuevoSalario;
        break;
      case 'prestacion_servicios':
        this.honorarios = nuevoSalario;
        break;
    }
  }
}
