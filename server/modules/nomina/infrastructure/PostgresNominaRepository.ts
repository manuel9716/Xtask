// Implementación concreta del repositorio de Nómina para PostgreSQL
import { INominaRepository } from '../domain/repositories/INominaRepository';
import { 
  EmpleadoNomina, 
  EmpleadoNominaData, 
  NominaPeriodo, 
  NominaItem,
  DashboardKPIs,
  TimelineItem,
  ChartData
} from '../domain/entities/EmpleadoNomina';
import { FiltrosNomina } from '@shared/schema';
import { db } from '../../../db';
import { 
  empleadosNomina, 
  empleadoNomina, 
  nominasNuevas, 
  nominaItems,
  contratos,
  projects,
  users
} from '@shared/schema';
import { eq, sql, and, desc, gte, lte } from 'drizzle-orm';

export class PostgresNominaRepository implements INominaRepository {
  async getEmpleados(query?: string): Promise<EmpleadoNomina[]> {
    let whereClause = sql`1=1`;
    
    if (query && query.trim()) {
      whereClause = sql`(
        LOWER(${empleadosNomina.nombre}) LIKE ${`%${query.toLowerCase()}%`} OR
        LOWER(${empleadosNomina.apellido}) LIKE ${`%${query.toLowerCase()}%`} OR
        LOWER(${empleadosNomina.identificacion}) LIKE ${`%${query.toLowerCase()}%`} OR
        LOWER(${empleadosNomina.cargo}) LIKE ${`%${query.toLowerCase()}%`}
      )`;
    }

    const result = await db.execute(sql`
      SELECT *
      FROM ${empleadosNomina}
      WHERE ${whereClause}
      ORDER BY ${empleadosNomina.nombre} ASC
    `);

    return result.rows as unknown as EmpleadoNomina[];
  }

  async getEmpleadoById(id: number): Promise<EmpleadoNomina | null> {
    const result = await db.execute(sql`
      SELECT *
      FROM ${empleadosNomina}
      WHERE ${empleadosNomina.id} = ${id}
    `);

    return (result.rows[0] as unknown as EmpleadoNomina) || null;
  }

  async createEmpleado(data: Omit<EmpleadoNomina, 'id' | 'createdAt'>): Promise<EmpleadoNomina> {
    const result = await db.execute(sql`
      INSERT INTO ${empleadosNomina}
      (user_id, nombre, apellido, identificacion, depto, cargo, fecha_ingreso, estado_contrato, tipo_contrato, telefono, direccion, contacto_emergencia)
      VALUES (${data.userId}, ${data.nombre}, ${data.apellido}, ${data.identificacion}, 
              ${data.depto}, ${data.cargo}, ${data.fechaIngreso}, ${data.estadoContrato}, 
              ${data.tipoContrato}, ${data.telefono}, ${data.direccion}, ${data.contactoEmergencia})
      RETURNING *
    `);

    return result.rows[0] as unknown as EmpleadoNomina;
  }

  async getEmpleadoNominaData(empleadoId: number): Promise<EmpleadoNominaData | null> {
    const result = await db.execute(sql`
      SELECT *
      FROM ${empleadoNomina}
      WHERE ${empleadoNomina.empleadoId} = ${empleadoId}
    `);

    return (result.rows[0] as unknown as EmpleadoNominaData) || null;
  }

  async createEmpleadoNominaData(data: Omit<EmpleadoNominaData, 'id' | 'createdAt' | 'updatedAt'>): Promise<EmpleadoNominaData> {
    const result = await db.execute(sql`
      INSERT INTO ${empleadoNomina}
      (empleado_id, sueldo_base, bonificacion, tasa_impuestos, base_deduccion, 
       beneficios_base, metodo_pago, cuenta_bancaria, seguro_salud, dias_vacaciones,
       frecuencia_pago, fecha_inicio_nomina)
      VALUES (${data.empleadoId}, ${data.sueldoBase}, ${data.bonificacion}, ${data.tasaImpuestos},
              ${data.baseDeduccion}, ${data.beneficiosBase}, ${data.metodoPago}, ${data.cuentaBancaria},
              ${data.seguroSalud}, ${data.diasVacaciones}, ${data.frecuenciaPago}, ${data.fechaInicioNomina})
      RETURNING *
    `);

    return result.rows[0] as unknown as EmpleadoNominaData;
  }

  async getDashboardData(filtros: FiltrosNomina): Promise<{
    kpis: DashboardKPIs;
    timeline: TimelineItem[];
    charts: ChartData;
    calendar: { fecha: Date; tipo: string; descripcion: string }[];
    nominasRecientes: any[];
  }> {
    // KPIs principales
    const kpisResult = await db.execute(sql`
      SELECT 
        COUNT(*) FILTER (WHERE estado_contrato = 'ACTIVO') as empleados_activos,
        COALESCE(SUM(sueldo_base), 0) as nomina_mensual,
        COALESCE(SUM(bonificacion), 0) as bonificaciones_mes
      FROM ${empleadosNomina} e
      LEFT JOIN ${empleadoNomina} en ON e.id = en.empleado_id
      WHERE e.estado_contrato = 'ACTIVO'
    `);

    const kpisData = kpisResult.rows[0] as any;
    
    const kpis: DashboardKPIs = {
      empleadosActivos: parseInt(kpisData.empleados_activos) || 0,
      nominaMensual: parseFloat(kpisData.nomina_mensual) || 0,
      bonificacionesMes: parseFloat(kpisData.bonificaciones_mes) || 0,
      porcentajePagadas: 85, // Ejemplo
      proximaFechaPago: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 1)
    };

    // Timeline reciente
    const timeline: TimelineItem[] = [
      {
        id: 1,
        fecha: new Date(),
        descripcion: "Nómina procesada - Proyecto Alpha",
        estado: 'pagado',
        monto: 125000,
        proyecto: "Alpha"
      }
    ];

    // Datos de gráficos
    const charts: ChartData = {
      gastoPorProyecto: [
        { proyecto: "Proyecto Alpha", monto: 125000 },
        { proyecto: "Proyecto Beta", monto: 85000 }
      ],
      sueldosVsBonos: [
        { name: "Sueldos", value: 450000 },
        { name: "Bonos", value: 75000 }
      ],
      historico6Meses: [
        { mes: "Nov", sueldos: 420000, bonos: 65000 },
        { mes: "Dic", sueldos: 450000, bonos: 75000 }
      ]
    };

    return {
      kpis,
      timeline,
      charts,
      calendar: [],
      nominasRecientes: []
    };
  }

  async createNomina(data: Omit<NominaPeriodo, 'id' | 'createdAt' | 'updatedAt'>): Promise<NominaPeriodo> {
    const result = await db.execute(sql`
      INSERT INTO ${nominasNuevas}
      (rango_inicio, rango_fin, proyecto_id, estado, total_sueldos, total_bonos, total_deducciones, creado_por)
      VALUES (${data.rangoInicio}, ${data.rangoFin}, ${data.proyectoId}, ${data.estado}, 
              ${data.totalSueldos}, ${data.totalBonos}, ${data.totalDeducciones}, ${data.creadoPor})
      RETURNING *
    `);

    return result.rows[0] as unknown as NominaPeriodo;
  }

  async getNominas(filtros: FiltrosNomina): Promise<NominaPeriodo[]> {
    let whereClause = sql`1=1`;
    
    if (filtros.proyectoId) {
      whereClause = sql`${whereClause} AND proyecto_id = ${filtros.proyectoId}`;
    }

    if (filtros.from) {
      whereClause = sql`${whereClause} AND rango_inicio >= ${filtros.from}`;
    }

    if (filtros.to) {
      whereClause = sql`${whereClause} AND rango_fin <= ${filtros.to}`;
    }

    const result = await db.execute(sql`
      SELECT *
      FROM ${nominasNuevas}
      WHERE ${whereClause}
      ORDER BY created_at DESC
    `);

    return result.rows as unknown as NominaPeriodo[];
  }

  async uploadContrato(empleadoId: number, filename: string, mime: string, size: number, url: string, uploadedBy: number): Promise<void> {
    await db.execute(sql`
      INSERT INTO ${contratos}
      (empleado_id, filename, mime, size, url, uploaded_by)
      VALUES (${empleadoId}, ${filename}, ${mime}, ${size}, ${url}, ${uploadedBy})
    `);
  }
}