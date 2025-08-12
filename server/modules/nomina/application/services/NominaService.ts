// Servicio de aplicación para el módulo de Nómina
import { INominaRepository } from '../domain/repositories/INominaRepository';
import { 
  EmpleadoNomina, 
  EmpleadoNominaData,
  DashboardKPIs,
  TimelineItem,
  ChartData
} from '../domain/entities/EmpleadoNomina';
import { FiltrosNomina } from '@shared/schema';

export class NominaService {
  constructor(private nominaRepository: INominaRepository) {}

  async getEmpleados(query?: string): Promise<EmpleadoNomina[]> {
    return this.nominaRepository.getEmpleados(query);
  }

  async createEmpleado(empleadoData: Omit<EmpleadoNomina, 'id' | 'createdAt'>): Promise<EmpleadoNomina> {
    // Validaciones de negocio
    if (!empleadoData.nombre || empleadoData.nombre.length < 2) {
      throw new Error('El nombre debe tener al menos 2 caracteres');
    }

    if (!empleadoData.identificacion || empleadoData.identificacion.length < 5) {
      throw new Error('La identificación debe tener al menos 5 caracteres');
    }

    if (empleadoData.fechaIngreso > new Date()) {
      throw new Error('La fecha de ingreso no puede ser futura');
    }

    return this.nominaRepository.createEmpleado(empleadoData);
  }

  async createEmpleadoNominaData(data: Omit<EmpleadoNominaData, 'id' | 'createdAt' | 'updatedAt'>): Promise<EmpleadoNominaData> {
    // Validaciones de negocio
    if (data.sueldoBase < 0) {
      throw new Error('El sueldo base debe ser mayor o igual a 0');
    }

    if (data.tasaImpuestos < 0 || data.tasaImpuestos > 100) {
      throw new Error('La tasa de impuestos debe estar entre 0 y 100');
    }

    return this.nominaRepository.createEmpleadoNominaData(data);
  }

  async getDashboardData(filtros: FiltrosNomina) {
    return this.nominaRepository.getDashboardData(filtros);
  }

  async uploadContrato(empleadoId: number, file: Express.Multer.File, uploadedBy: number): Promise<void> {
    // Validaciones de archivo
    const allowedMimes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    const maxSize = 5 * 1024 * 1024; // 5MB

    if (!allowedMimes.includes(file.mimetype)) {
      throw new Error('Solo se permiten archivos PDF, DOC y DOCX');
    }

    if (file.size > maxSize) {
      throw new Error('El archivo no puede ser mayor a 5MB');
    }

    const url = `/uploads/contratos/${file.filename}`;
    
    return this.nominaRepository.uploadContrato(
      empleadoId,
      file.originalname,
      file.mimetype,
      file.size,
      url,
      uploadedBy
    );
  }

  async calculateKPIs(filtros: FiltrosNomina): Promise<DashboardKPIs> {
    const data = await this.nominaRepository.getDashboardData(filtros);
    return data.kpis;
  }

  async getTimeline(filtros: FiltrosNomina): Promise<TimelineItem[]> {
    const data = await this.nominaRepository.getDashboardData(filtros);
    return data.timeline;
  }

  async getChartsData(filtros: FiltrosNomina): Promise<ChartData> {
    const data = await this.nominaRepository.getDashboardData(filtros);
    return data.charts;
  }
}