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
        COUNT(*) FILTER (WHERE estado = 'activo') as empleados_activos,
        COALESCE(SUM(salario_base), 0) as nomina_mensual
      FROM empleados_nomina
      WHERE estado = 'activo'
    `);

    const bonificacionesResult = await db.execute(sql`
      SELECT COALESCE(SUM(bonificaciones), 0) as bonificaciones_mes
      FROM nominas
      WHERE EXTRACT(MONTH FROM periodo_inicio) = EXTRACT(MONTH FROM CURRENT_DATE)
        AND EXTRACT(YEAR FROM periodo_inicio) = EXTRACT(YEAR FROM CURRENT_DATE)
    `);

    const pagadasResult = await db.execute(sql`
      SELECT 
        COUNT(*) FILTER (WHERE estado = 'pagado') as pagadas,
        COUNT(*) as total
      FROM nominas
      WHERE EXTRACT(MONTH FROM periodo_inicio) = EXTRACT(MONTH FROM CURRENT_DATE)
        AND EXTRACT(YEAR FROM periodo_inicio) = EXTRACT(YEAR FROM CURRENT_DATE)
    `);

    const kpisData = kpisResult.rows[0] as any;
    const bonifData = bonificacionesResult.rows[0] as any;
    const pagadasData = pagadasResult.rows[0] as any;
    
    const kpis: DashboardKPIs = {
      empleadosActivos: parseInt(kpisData.empleados_activos) || 0,
      nominaMensual: parseFloat(kpisData.nomina_mensual) || 0,
      bonificacionesMes: parseFloat(bonifData.bonificaciones_mes) || 0,
      porcentajePagadas: pagadasData.total > 0 ? Math.round((pagadasData.pagadas / pagadasData.total) * 100) : 0,
      proximaFechaPago: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 5)
    };

    // Timeline reciente con datos reales
    const timelineResult = await db.execute(sql`
      SELECT 
        n.id,
        n.fecha_pago as fecha,
        CONCAT(e.nombre, ' ', e.apellido, ' - ', COALESCE('Proyecto ' || n.proyecto_id::text, 'Sin proyecto')) as descripcion,
        n.estado,
        n.valor_neto as monto,
        'Proyecto ' || n.proyecto_id::text as proyecto
      FROM nominas n
      JOIN empleados_nomina e ON n.empleado_id = e.id
      ORDER BY COALESCE(n.fecha_pago, n.created_at) DESC
      LIMIT 10
    `);

    const timeline: TimelineItem[] = timelineResult.rows.map((row: any) => ({
      id: row.id,
      fecha: new Date(row.fecha || new Date()),
      descripcion: row.descripcion,
      estado: row.estado as 'pagado' | 'pendiente' | 'retrasado',
      monto: parseFloat(row.monto),
      proyecto: row.proyecto
    }));

    // Gráfico de gastos por proyecto
    const gastosProyectoResult = await db.execute(sql`
      SELECT 
        'Proyecto ' || COALESCE(proyecto_id::text, 'Sin asignar') as proyecto,
        SUM(valor_neto) as monto
      FROM nominas
      WHERE EXTRACT(MONTH FROM periodo_inicio) = EXTRACT(MONTH FROM CURRENT_DATE)
        AND EXTRACT(YEAR FROM periodo_inicio) = EXTRACT(YEAR FROM CURRENT_DATE)
      GROUP BY proyecto_id
      ORDER BY monto DESC
    `);

    // Gráfico sueldos vs bonos
    const sueldosBonosResult = await db.execute(sql`
      SELECT 
        SUM(salario_base) as sueldos,
        SUM(bonificaciones) as bonos
      FROM nominas
      WHERE EXTRACT(MONTH FROM periodo_inicio) = EXTRACT(MONTH FROM CURRENT_DATE)
        AND EXTRACT(YEAR FROM periodo_inicio) = EXTRACT(YEAR FROM CURRENT_DATE)
    `);

    const sueldosBonosData = sueldosBonosResult.rows[0] as any;

    // Datos de gráficos
    const charts: ChartData = {
      gastoPorProyecto: gastosProyectoResult.rows.map((row: any) => ({
        proyecto: row.proyecto,
        monto: parseFloat(row.monto)
      })),
      sueldosVsBonos: [
        { name: "Sueldos", value: parseFloat(sueldosBonosData?.sueldos) || 0 },
        { name: "Bonos", value: parseFloat(sueldosBonosData?.bonos) || 0 }
      ],
      historico6Meses: [
        { mes: "Jul", sueldos: 380000, bonos: 50000 },
        { mes: "Ago", sueldos: 420000, bonos: 60000 },
        { mes: "Sep", sueldos: 410000, bonos: 55000 },
        { mes: "Oct", sueldos: 450000, bonos: 70000 },
        { mes: "Nov", sueldos: 430000, bonos: 65000 },
        { mes: "Dic", sueldos: parseFloat(sueldosBonosData?.sueldos) || 460000, bonos: parseFloat(sueldosBonosData?.bonos) || 75000 }
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