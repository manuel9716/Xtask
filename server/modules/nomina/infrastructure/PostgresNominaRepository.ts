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
        COUNT(e.id) as empleados_activos,
        COALESCE(SUM(en.sueldo_base), 0) as nomina_mensual
      FROM empleados e
      INNER JOIN empleado_nomina en ON e.id = en.empleado_id
      WHERE e.estado_contrato = 'activo'
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

    // Timeline reciente con datos reales - combinando empleados creados y nóminas
    const timelineResult = await db.execute(sql`
      (
        -- Eventos de empleados creados
        SELECT 
          e.id,
          e.created_at as fecha,
          CONCAT('Nuevo empleado: ', e.nombre, ' ', e.apellido, ' - ', e.cargo, ' (', COALESCE(p.name, 'Sin proyecto'), ')') as descripcion,
          'pendiente'::text as estado,
          en.sueldo_base as monto,
          COALESCE(p.name, 'Sin proyecto') as proyecto,
          'empleado_creado' as tipo_evento
        FROM empleados e
        INNER JOIN empleado_nomina en ON e.id = en.empleado_id
        LEFT JOIN empleado_proyecto ep ON e.id = ep.empleado_id
        LEFT JOIN projects p ON ep.proyecto_id = p.id
        WHERE e.created_at >= NOW() - INTERVAL '30 days'
      )
      UNION ALL
      (
        -- Eventos de nóminas procesadas
        SELECT 
          n.id,
          COALESCE(n.fecha_pago, n.created_at) as fecha,
          CONCAT(e.nombre, ' ', e.apellido, ' - Pago nómina - ', COALESCE(p.name, 'Sin proyecto')) as descripcion,
          n.estado,
          n.valor_neto as monto,
          COALESCE(p.name, 'Sin proyecto') as proyecto,
          'nomina_pago' as tipo_evento
        FROM nominas n
        JOIN empleados e ON n.empleado_id = e.id
        LEFT JOIN projects p ON n.proyecto_id = p.id
        WHERE n.created_at >= NOW() - INTERVAL '30 days'
      )
      ORDER BY fecha DESC
      LIMIT 15
    `);

    const timeline: TimelineItem[] = timelineResult.rows.map((row: any) => ({
      id: row.id,
      fecha: row.fecha ? new Date(row.fecha) : new Date(),
      descripcion: row.descripcion,
      estado: row.estado as 'pagado' | 'pendiente' | 'retrasado',
      monto: parseFloat(row.monto) || 0,
      proyecto: row.proyecto || 'Sin proyecto',
      tipo_evento: row.tipo_evento as 'empleado_creado' | 'nomina_pago'
    }));

    // Gráfico de gastos por proyecto
    const gastosProyectoResult = await db.execute(sql`
      SELECT 
        COALESCE(p.name, 'Sin asignar') as proyecto,
        SUM(n.valor_neto) as monto
      FROM nominas n
      LEFT JOIN projects p ON n.proyecto_id = p.id
      WHERE EXTRACT(MONTH FROM n.periodo_inicio) = EXTRACT(MONTH FROM CURRENT_DATE)
        AND EXTRACT(YEAR FROM n.periodo_inicio) = EXTRACT(YEAR FROM CURRENT_DATE)
      GROUP BY p.name, n.proyecto_id
      ORDER BY monto DESC
    `);

    // Gráfico sueldos vs bonos del mes actual
    const sueldosBonosResult = await db.execute(sql`
      SELECT 
        SUM(salario_base) as sueldos,
        SUM(bonificaciones) as bonos
      FROM nominas
      WHERE EXTRACT(MONTH FROM periodo_inicio) = EXTRACT(MONTH FROM CURRENT_DATE)
        AND EXTRACT(YEAR FROM periodo_inicio) = EXTRACT(YEAR FROM CURRENT_DATE)
    `);

    const sueldosBonosData = sueldosBonosResult.rows[0] as any;

    // Histórico de los últimos 6 meses con datos reales
    const historicoResult = await db.execute(sql`
      SELECT 
        TO_CHAR(DATE_TRUNC('month', periodo_inicio), 'Mon') as mes,
        SUM(salario_base) as sueldos,
        SUM(bonificaciones) as bonos
      FROM nominas
      WHERE periodo_inicio >= DATE_TRUNC('month', CURRENT_DATE) - INTERVAL '5 months'
      GROUP BY DATE_TRUNC('month', periodo_inicio)
      ORDER BY DATE_TRUNC('month', periodo_inicio) ASC
    `);

    // Datos de gráficos usando solo información real de la base de datos
    const charts: ChartData = {
      gastoPorProyecto: gastosProyectoResult.rows.map((row: any) => ({
        proyecto: row.proyecto,
        monto: parseFloat(row.monto)
      })),
      sueldosVsBonos: [
        { name: "Sueldos", value: parseFloat(sueldosBonosData?.sueldos) || 0 },
        { name: "Bonos", value: parseFloat(sueldosBonosData?.bonos) || 0 }
      ],
      historico6Meses: historicoResult.rows.map((row: any) => ({
        mes: row.mes,
        sueldos: parseFloat(row.sueldos) || 0,
        bonos: parseFloat(row.bonos) || 0
      }))
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