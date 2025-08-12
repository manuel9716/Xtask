// Puerto de repositorio para el módulo de Nómina
import { 
  EmpleadoNomina, 
  EmpleadoNominaData, 
  NominaPeriodo, 
  NominaItem,
  DashboardKPIs,
  TimelineItem,
  ChartData
} from '../entities/EmpleadoNomina';
import { FiltrosNomina } from '@shared/schema';

export interface INominaRepository {
  // Empleados
  getEmpleados(query?: string): Promise<EmpleadoNomina[]>;
  getEmpleadoById(id: number): Promise<EmpleadoNomina | null>;
  createEmpleado(data: Omit<EmpleadoNomina, 'id' | 'createdAt'>): Promise<EmpleadoNomina>;
  
  // Datos de nómina de empleados
  getEmpleadoNominaData(empleadoId: number): Promise<EmpleadoNominaData | null>;
  createEmpleadoNominaData(data: Omit<EmpleadoNominaData, 'id' | 'createdAt' | 'updatedAt'>): Promise<EmpleadoNominaData>;
  
  // Dashboard
  getDashboardData(filtros: FiltrosNomina): Promise<{
    kpis: DashboardKPIs;
    timeline: TimelineItem[];
    charts: ChartData;
    calendar: { fecha: Date; tipo: string; descripcion: string }[];
    nominasRecientes: any[];
  }>;
  
  // Nóminas
  createNomina(data: Omit<NominaPeriodo, 'id' | 'createdAt' | 'updatedAt'>): Promise<NominaPeriodo>;
  getNominas(filtros: FiltrosNomina): Promise<NominaPeriodo[]>;
  
  // Contratos
  uploadContrato(empleadoId: number, filename: string, mime: string, size: number, url: string, uploadedBy: number): Promise<void>;
}