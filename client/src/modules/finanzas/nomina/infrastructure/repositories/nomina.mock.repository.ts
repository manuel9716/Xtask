import { 
  Payroll, Employee,
} from '@shared/schema';

import { 
  CambiarEstadoNominaParams, 
  EstadoNomina, 
  MarcarComoPagadaParams, 
  ProcesarNominaParams 
} from '../../domain/entities/Nomina';
import { INominaRepository } from '../../domain/interfaces/INominaRepository';
import { CalculoPagoEmpleado, ResultadoCalculoPago } from '../../domain/services/CalculoPagoEmpleado';

/**
 * Implementación Mock (en memoria) del repositorio de nómina
 * Utilizada temporalmente para evitar problemas de importación con la base de datos
 */
export class NominaMockRepository implements INominaRepository {
  private nominas: Payroll[] = [];
  private empleados: Employee[] = [];
  private lastId = 0;
  private calculoService: CalculoPagoEmpleado;

  constructor() {
    this.calculoService = new CalculoPagoEmpleado();
    
    // Crear algunos empleados de prueba
    this.empleados = [
      {
        id: 1,
        userId: 1,
        position: 'Desarrollador',
        department: 'Tecnología',
        contractType: 'full-time',
        contractStatus: 'active',
        hireDate: new Date('2023-01-15'),
        salary: '75000',
        salaryType: 'annual',
        bankAccount: '1234567890',
        bankName: 'Banco Principal',
        taxId: 'ABC123456789',
        benefits: JSON.stringify(['health_insurance', 'retirement_plan']),
        deductions: JSON.stringify(['income_tax', 'social_security']),
        emergencyContact: JSON.stringify({
          name: 'Contacto Emergencia',
          phone: '555-1234',
          relationship: 'Familiar'
        }),
        createdAt: new Date('2023-01-10'),
        updatedAt: new Date('2023-01-10')
      },
      {
        id: 2,
        userId: 2,
        position: 'Diseñador',
        department: 'Diseño',
        contractType: 'full-time',
        contractStatus: 'active',
        hireDate: new Date('2023-02-20'),
        salary: '65000',
        salaryType: 'annual',
        bankAccount: '0987654321',
        bankName: 'Banco Secundario',
        taxId: 'XYZ987654321',
        benefits: JSON.stringify(['health_insurance']),
        deductions: JSON.stringify(['income_tax']),
        emergencyContact: JSON.stringify({
          name: 'Contacto Emergencia 2',
          phone: '555-5678',
          relationship: 'Amigo'
        }),
        createdAt: new Date('2023-02-15'),
        updatedAt: new Date('2023-02-15')
      }
    ];
    
    // Crear algunas nóminas de prueba
    this.nominas = [
      {
        id: 1,
        employeeId: 1,
        periodStart: new Date('2023-04-01'),
        periodEnd: new Date('2023-04-30'),
        grossSalary: '6250',
        netSalary: '4875',
        deductions: '1000',
        benefits: '500',
        taxes: '875',
        status: EstadoNomina.PAGADO,
        createdBy: 1,
        createdAt: new Date('2023-04-28'),
        updatedAt: new Date('2023-05-02'),
        paymentDate: new Date('2023-05-02'),
        paymentMethod: 'transfer',
        paymentReference: 'REF123456',
        calculationDetails: JSON.stringify({
          deduccionesFijas: 500,
          deduccionesAdicionales: 500,
          beneficiosFijos: 300,
          beneficiosAdicionales: 200,
          impuestos: 875
        })
      },
      {
        id: 2,
        employeeId: 2,
        periodStart: new Date('2023-04-01'),
        periodEnd: new Date('2023-04-30'),
        grossSalary: '5416.67',
        netSalary: '4225',
        deductions: '750',
        benefits: '300',
        taxes: '741.67',
        status: EstadoNomina.PAGADO,
        createdBy: 1,
        createdAt: new Date('2023-04-28'),
        updatedAt: new Date('2023-05-02'),
        paymentDate: new Date('2023-05-02'),
        paymentMethod: 'transfer',
        paymentReference: 'REF789012',
        calculationDetails: JSON.stringify({
          deduccionesFijas: 400,
          deduccionesAdicionales: 350,
          beneficiosFijos: 200,
          beneficiosAdicionales: 100,
          impuestos: 741.67
        })
      },
      {
        id: 3,
        employeeId: 1,
        periodStart: new Date('2023-05-01'),
        periodEnd: new Date('2023-05-31'),
        grossSalary: '6250',
        netSalary: '4875',
        deductions: '1000',
        benefits: '500',
        taxes: '875',
        status: EstadoNomina.PENDIENTE,
        createdBy: 1,
        createdAt: new Date('2023-05-28'),
        updatedAt: new Date('2023-05-28'),
        calculationDetails: JSON.stringify({
          deduccionesFijas: 500,
          deduccionesAdicionales: 500,
          beneficiosFijos: 300,
          beneficiosAdicionales: 200,
          impuestos: 875
        })
      }
    ];
    
    this.lastId = 3;
  }

  /**
   * Obtiene todas las nóminas, con filtros opcionales
   */
  async obtenerNominas(filtros?: { 
    empleadoId?: number; 
    desde?: Date; 
    hasta?: Date; 
    estado?: string; 
    page?: number; 
    limit?: number; 
  }): Promise<{ nominas: Payroll[]; total: number }> {
    try {
      let nominasFiltradas = [...this.nominas];
      
      // Aplicar filtros si existen
      if (filtros) {
        if (filtros.empleadoId) {
          nominasFiltradas = nominasFiltradas.filter(n => n.employeeId === filtros.empleadoId);
        }
        
        if (filtros.desde) {
          nominasFiltradas = nominasFiltradas.filter(n => n.periodStart >= filtros.desde);
        }
        
        if (filtros.hasta) {
          nominasFiltradas = nominasFiltradas.filter(n => n.periodEnd <= filtros.hasta);
        }
        
        if (filtros.estado) {
          nominasFiltradas = nominasFiltradas.filter(n => n.status === filtros.estado);
        }
      }
      
      // Obtener el total antes de la paginación
      const total = nominasFiltradas.length;
      
      // Ordenar por fecha (más reciente primero)
      nominasFiltradas.sort((a, b) => {
        return new Date(b.periodStart).getTime() - new Date(a.periodStart).getTime();
      });
      
      // Aplicar paginación
      if (filtros?.page && filtros?.limit) {
        const startIndex = (filtros.page - 1) * filtros.limit;
        const endIndex = startIndex + filtros.limit;
        nominasFiltradas = nominasFiltradas.slice(startIndex, endIndex);
      }
      
      return {
        nominas: nominasFiltradas,
        total
      };
    } catch (error) {
      console.error('Error al obtener nóminas:', error);
      throw new Error('Error al obtener las nóminas');
    }
  }

  /**
   * Obtiene una nómina específica por su ID
   */
  async obtenerNominaPorId(id: number): Promise<Payroll | undefined> {
    try {
      return this.nominas.find(n => n.id === id);
    } catch (error) {
      console.error(`Error al obtener nómina con ID ${id}:`, error);
      throw new Error(`Error al obtener nómina con ID ${id}`);
    }
  }

  /**
   * Obtiene todos los empleados activos
   */
  async obtenerEmpleados(): Promise<Employee[]> {
    try {
      return this.empleados.filter(e => e.contractStatus === 'active');
    } catch (error) {
      console.error('Error al obtener empleados:', error);
      throw new Error('Error al obtener los empleados');
    }
  }

  /**
   * Obtiene un empleado específico por su ID
   */
  async obtenerEmpleadoPorId(id: number): Promise<Employee | undefined> {
    try {
      return this.empleados.find(e => e.id === id);
    } catch (error) {
      console.error(`Error al obtener empleado con ID ${id}:`, error);
      throw new Error(`Error al obtener empleado con ID ${id}`);
    }
  }

  /**
   * Procesa la nómina para un grupo de empleados y un periodo específico
   */
  async procesarNomina(params: ProcesarNominaParams): Promise<Payroll[]> {
    try {
      // Obtener los empleados para procesar
      let empleadosAProcesar: Employee[];
      
      if (params.empleadoIds && params.empleadoIds.length > 0) {
        // Procesar solo los empleados especificados
        empleadosAProcesar = this.empleados.filter(e => 
          params.empleadoIds!.includes(e.id) && e.contractStatus === 'active'
        );
      } else {
        // Procesar todos los empleados activos
        empleadosAProcesar = this.empleados.filter(e => e.contractStatus === 'active');
      }
      
      // Calcular la nómina para cada empleado
      const nominasCreadas: Payroll[] = [];
      
      for (const empleado of empleadosAProcesar) {
        // Verificar que el empleado tenga salario definido
        if (!empleado.salary) {
          console.warn(`Empleado ${empleado.id} no tiene salario definido, omitiendo cálculo`);
          continue;
        }
        
        // Calcular el pago para el empleado
        const resultado = this.calculoService.calcularPago(empleado);
        
        // Crear registro de nómina
        this.lastId++;
        const nuevaNomina: Payroll = {
          id: this.lastId,
          employeeId: empleado.id,
          periodStart: params.periodoInicio,
          periodEnd: params.periodoFin,
          grossSalary: resultado.sueldoBruto.toString(),
          netSalary: resultado.sueldoNeto.toString(),
          deductions: (resultado.deduccionesFijas + resultado.deduccionesAdicionales).toString(),
          benefits: (resultado.beneficiosFijos + resultado.beneficiosAdicionales).toString(),
          taxes: resultado.impuestos.toString(),
          status: EstadoNomina.PENDIENTE,
          createdBy: params.usuarioId,
          createdAt: new Date(),
          updatedAt: new Date(),
          calculationDetails: JSON.stringify(resultado.detalles)
        };
        
        this.nominas.push(nuevaNomina);
        nominasCreadas.push(nuevaNomina);
      }
      
      return nominasCreadas;
    } catch (error) {
      console.error('Error al procesar nómina:', error);
      throw new Error('Error al procesar la nómina');
    }
  }

  /**
   * Crea un registro de nómina individual
   */
  async crearNomina(nomina: any): Promise<Payroll> {
    try {
      this.lastId++;
      const nuevaNomina: Payroll = {
        ...nomina,
        id: this.lastId,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      this.nominas.push(nuevaNomina);
      return nuevaNomina;
    } catch (error) {
      console.error('Error al crear nómina:', error);
      throw new Error('Error al crear el registro de nómina');
    }
  }

  /**
   * Marca una nómina como pagada
   */
  async marcarComoPagada(params: MarcarComoPagadaParams): Promise<Payroll> {
    try {
      const index = this.nominas.findIndex(n => n.id === params.nominaId);
      
      if (index === -1) {
        throw new Error(`No se encontró la nómina con ID ${params.nominaId}`);
      }
      
      // Actualizar el estado a pagado
      const nominaActualizada: Payroll = {
        ...this.nominas[index],
        status: EstadoNomina.PAGADO,
        paymentDate: params.fechaPago,
        paymentMethod: params.metodoPago,
        paymentReference: params.referenciaPago,
        updatedAt: new Date()
      };
      
      this.nominas[index] = nominaActualizada;
      
      return nominaActualizada;
    } catch (error) {
      console.error(`Error al marcar nómina ${params.nominaId} como pagada:`, error);
      throw new Error(`Error al marcar la nómina como pagada`);
    }
  }

  /**
   * Cambia el estado de una nómina
   */
  async cambiarEstadoNomina(params: CambiarEstadoNominaParams): Promise<Payroll> {
    try {
      const index = this.nominas.findIndex(n => n.id === params.nominaId);
      
      if (index === -1) {
        throw new Error(`No se encontró la nómina con ID ${params.nominaId}`);
      }
      
      // Actualizar el estado
      const nominaActualizada: Payroll = {
        ...this.nominas[index],
        status: params.nuevoEstado,
        updatedAt: new Date()
      };
      
      this.nominas[index] = nominaActualizada;
      
      return nominaActualizada;
    } catch (error) {
      console.error(`Error al cambiar estado de nómina ${params.nominaId}:`, error);
      throw new Error(`Error al cambiar el estado de la nómina`);
    }
  }

  /**
   * Obtiene el historial de nóminas de un empleado
   */
  async obtenerHistorialPorEmpleado(
    empleadoId: number, 
    filtros?: { desde?: Date; hasta?: Date; estado?: string }
  ): Promise<Payroll[]> {
    try {
      let historial = this.nominas.filter(n => n.employeeId === empleadoId);
      
      // Aplicar filtros si existen
      if (filtros) {
        if (filtros.desde) {
          historial = historial.filter(n => n.periodStart >= filtros.desde!);
        }
        
        if (filtros.hasta) {
          historial = historial.filter(n => n.periodEnd <= filtros.hasta!);
        }
        
        if (filtros.estado) {
          historial = historial.filter(n => n.status === filtros.estado);
        }
      }
      
      // Ordenar por fecha (más reciente primero)
      historial.sort((a, b) => {
        return new Date(b.periodStart).getTime() - new Date(a.periodStart).getTime();
      });
      
      return historial;
    } catch (error) {
      console.error(`Error al obtener historial del empleado ${empleadoId}:`, error);
      throw new Error(`Error al obtener el historial de nóminas del empleado`);
    }
  }
}