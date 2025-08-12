// Entidad de dominio para Empleado en el módulo de Nómina
export interface EmpleadoNomina {
  id: number;
  userId: number;
  nombre: string;
  apellido: string;
  identificacion: string;
  depto: string;
  cargo: string;
  fechaIngreso: Date;
  estadoContrato: 'ACTIVO' | 'SUSPENDIDO' | 'TERMINADO';
  tipoContrato: 'INDEFINIDO' | 'FIJO' | 'FREELANCE';
  telefono?: string;
  direccion?: string;
  contactoEmergencia?: string;
  createdAt: Date;
}

export interface EmpleadoNominaData {
  id: number;
  empleadoId: number;
  sueldoBase: number;
  bonificacion: number;
  tasaImpuestos: number;
  baseDeduccion: number;
  beneficiosBase: number;
  metodoPago: string;
  cuentaBancaria?: string;
  seguroSalud?: string;
  diasVacaciones: number;
  frecuenciaPago: 'MENSUAL' | 'QUINCENAL' | 'SEMANAL';
  fechaInicioNomina: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface NominaPeriodo {
  id: number;
  rangoInicio: Date;
  rangoFin: Date;
  proyectoId?: number;
  estado: 'PENDIENTE' | 'PROCESADA' | 'PAGADA' | 'CANCELADA';
  totalSueldos: number;
  totalBonos: number;
  totalDeducciones: number;
  creadoPor: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface NominaItem {
  id: number;
  nominaId: number;
  empleadoId: number;
  sueldo: number;
  bono: number;
  deduccion: number;
  impuestos: number;
  neto: number;
  calculadoAt: Date;
}

export interface DashboardKPIs {
  empleadosActivos: number;
  nominaMensual: number;
  bonificacionesMes: number;
  porcentajePagadas: number;
  proximaFechaPago: Date | null;
}

export interface TimelineItem {
  id: number;
  fecha: Date;
  descripcion: string;
  estado: 'pagado' | 'pendiente' | 'retrasado';
  monto: number;
  proyecto?: string;
}

export interface ChartData {
  gastoPorProyecto: { proyecto: string; monto: number }[];
  sueldosVsBonos: { name: string; value: number }[];
  historico6Meses: { mes: string; sueldos: number; bonos: number }[];
}