import { Request, Response, Router } from 'express';
import { db } from '../db';
import { empleados, empleado_nomina, empleado_proyecto, nominas_nuevas, nomina_items, projects, historial_contratos, users, insertEmpleadoSchema } from '@shared/schema';
import { eq, and, sql } from 'drizzle-orm';
import { z } from 'zod';

const router = Router();

// Schema para validación de empleados con tipos de contrato colombianos
const crearEmpleadoNuevoSchema = insertEmpleadoSchema;

// Schema para actualización (campos opcionales) sin .refine para permitir .partial
const updateEmpleadoSchema = z.object({
  user_id: z.number().optional(),
  nombre: z.string().min(2).optional(),
  apellido: z.string().min(2).optional(),
  identificacion: z.string().min(5).optional(),
  depto: z.string().min(2).optional(),
  cargo: z.string().min(2).optional(),
  fecha_ingreso: z.date().optional(),
  estado_contrato: z.enum(["activo", "inactivo", "suspendido"]).optional(),
  telefono: z.string().optional(),
  direccion: z.string().optional(),
  contacto_emergencia: z.string().optional(),
  tipo_contrato: z.enum(["indefinido", "fijo", "prestacion_servicios", "por_horas"]).optional(),
  fecha_fin_contrato: z.date().optional(),
  clase_riesgo_arl: z.enum(["I", "II", "III", "IV", "V"]).optional(),
  horas_por_semana: z.number().min(1).max(48).optional(),
  salario_por_hora: z.number().min(0).optional(),
  honorarios: z.number().min(0).optional(),
  retencion_fuente: z.number().min(0).max(1).optional(),
  requiere_seguridad_social: z.boolean().optional(),
});

// Schema legacy para compatibilidad
const updateEmpleadoLegacySchema = z.object({
  empleado: z.object({
    nombre: z.string().min(2),
    apellido: z.string().min(2),
    identificacion: z.string().min(5),
    depto: z.string().min(1),
    cargo: z.string().min(1),
    fecha_ingreso: z.string(),
    estado_contrato: z.enum(['activo', 'inactivo', 'suspendido']),
    tipo_contrato: z.enum(['indefinido', 'fijo', 'prestacion_servicios', 'por_horas']),
    telefono: z.string().optional(),
    direccion: z.string().optional(),
    contacto_emergencia: z.string().optional(),
    // Nuevos campos según tipo de contrato
    fecha_fin_contrato: z.string().optional(),
    clase_riesgo_arl: z.enum(['I', 'II', 'III', 'IV', 'V']).optional(),
    horas_por_semana: z.number().min(1).max(48).optional(),
    salario_por_hora: z.number().min(0).optional(),
    honorarios: z.number().min(0).optional(),
    retencion_fuente: z.number().min(0).max(1).optional(),
    requiere_seguridad_social: z.boolean().optional(),
  }),
  nomina: z.object({
    sueldo_base: z.number().min(0),
    bonificacion: z.number().min(0),
    tasa_impuestos: z.number().min(0).max(1),
    base_deduccion: z.number().min(0),
    beneficios_base: z.number().min(0),
    metodo_pago: z.enum(['transferencia', 'efectivo', 'cheque']),
    cuenta_bancaria: z.string().optional(),
    seguro_salud: z.string().optional(),
    dias_vacaciones: z.number().min(0),
    frecuencia_pago: z.enum(['quincenal', 'mensual']),
  }).optional(),
});

// GET /api/empleados/:id - Obtener empleado con proyectos y nóminas
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const empleadoId = parseInt(req.params.id);
    const includeParams = req.query.include as string;
    const includes = includeParams ? includeParams.split(',') : ['nomina', 'proyectos', 'historial'];

    // Obtener empleado básico
    const empleadoResult = await db.execute(sql`
      SELECT 
        e.id,
        e.nombre,
        e.apellido,
        e.identificacion,
        e.depto,
        e.cargo,
        e.fecha_ingreso,
        e.estado_contrato,
        e.tipo_contrato,
        e.telefono,
        e.direccion,
        e.contacto_emergencia,
        e.user_id,
        e.created_at
      FROM empleados e
      WHERE e.id = ${empleadoId}
    `);
    
    const empleado = empleadoResult.rows[0] as any;

    if (!empleado) {
      return res.status(404).json({ message: 'Empleado no encontrado' });
    }

    // Obtener datos de nómina
    const nominaResult = await db.execute(sql`
      SELECT 
        sueldo_base,
        bonificacion,
        tasa_impuestos,
        base_deduccion,
        beneficios_base,
        metodo_pago,
        cuenta_bancaria,
        seguro_salud,
        dias_vacaciones,
        frecuencia_pago
      FROM empleado_nomina WHERE empleado_id = ${empleadoId}
    `);
    const nominaData = nominaResult.rows[0] as any;

    let proyectos: any[] = [];
    let nominas: any[] = [];

    // Incluir proyectos si se solicita
    if (includes.includes('proyectos')) {
      const proyectosResult = await db.execute(sql`
        SELECT 
          p.id,
          p.name as nombre,
          p.description as descripcion
        FROM empleado_proyecto ep
        INNER JOIN projects p ON ep.proyecto_id = p.id
        WHERE ep.empleado_id = ${empleadoId} AND ep.activo = true
      `);
      proyectos = proyectosResult.rows as any[];
    }

    // Incluir nóminas si se solicita
    if (includes.includes('nominas')) {
      const nominasResult = await db.execute(sql`
        SELECT 
          nn.id,
          nn.rango_inicio,
          nn.rango_fin,
          nn.estado,
          p.name as proyecto_nombre,
          ni.sueldo,
          ni.bono,
          ni.deduccion,
          ni.impuestos,
          ni.neto
        FROM nomina_items ni
        INNER JOIN nominas_nuevas nn ON ni.nomina_id = nn.id
        LEFT JOIN projects p ON nn.proyecto_id = p.id
        WHERE ni.empleado_id = ${empleadoId}
        ORDER BY nn.rango_inicio DESC
      `);
      nominas = nominasResult.rows as any[];
    }

    // Siempre incluir proyectos para la vista básica
    if (proyectos.length === 0) {
      const proyectosBasicResult = await db.execute(sql`
        SELECT 
          p.id,
          p.name as nombre,
          p.description as descripcion
        FROM empleado_proyecto ep
        INNER JOIN projects p ON ep.proyecto_id = p.id
        WHERE ep.empleado_id = ${empleadoId} AND ep.activo = true
      `);
      proyectos = proyectosBasicResult.rows as any[];
    }

    // Calcular último pago
    let ultimoPago: any = null;
    const pagosPagados = nominas.filter(n => n.estado === 'pagada');
    if (pagosPagados.length > 0) {
      ultimoPago = {
        fecha: pagosPagados[0].fecha_pago,
        monto: pagosPagados[0].neto
      };
    }
    
    // Crear historial de eventos
    let historial = [
      {
        tipo: 'alta',
        fecha: empleado.created_at || empleado.fecha_ingreso,
        descripcion: 'Empleado registrado en el sistema',
        detalle: `Fecha de ingreso: ${empleado.fecha_ingreso}`
      }
    ];
    
    // Agregar eventos de nóminas al historial
    nominas.forEach(nomina => {
      historial.push({
        tipo: nomina.estado === 'pagada' ? 'pago' : 'nomina_creada',
        fecha: nomina.rango_fin || new Date().toISOString(),
        descripcion: nomina.estado === 'pagada' ? 
          `Nómina pagada - $${Number(nomina.neto).toLocaleString()}` : 
          `Nómina creada - $${Number(nomina.neto).toLocaleString()}`,
        detalle: `Proyecto: ${nomina.proyecto_nombre || 'Sin proyecto'}`
      });
    });
    
    historial.sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime());

    // Calcular gasto por proyecto
    const gastoResult = await db.execute(sql`
      SELECT 
        p.name as proyecto_nombre,
        SUM(ni.neto) as total_gastado
      FROM nomina_items ni
      INNER JOIN nominas_nuevas nn ON ni.nomina_id = nn.id
      LEFT JOIN projects p ON nn.proyecto_id = p.id
      WHERE ni.empleado_id = ${empleadoId} AND nn.estado = 'pagada'
      GROUP BY p.id, p.name
    `);
    const gastoPorProyecto = gastoResult.rows as any[];

    // Obtener datos de pagos detallados para gráficos si se incluye 'pagos'
    let pagos: any[] = [];
    if (includes.includes('pagos')) {
      const pagosResult = await db.execute(sql`
        SELECT 
          nn.id as nomina_id,
          nn.rango_inicio as fecha_inicio,
          nn.rango_fin as fecha_fin,
          nn.rango_fin as fecha_pago,
          ni.sueldo,
          ni.bono as bonificaciones,
          ni.deduccion as descuentos,
          ni.neto,
          nn.estado,
          p.name as proyecto_nombre,
          p.id as proyecto_id
        FROM nomina_items ni
        INNER JOIN nominas_nuevas nn ON ni.nomina_id = nn.id
        LEFT JOIN projects p ON nn.proyecto_id = p.id
        WHERE ni.empleado_id = ${empleadoId}
        ORDER BY nn.rango_inicio DESC
        LIMIT 12
      `);
      pagos = pagosResult.rows as any[];
    }

    const empleadoResponse = {
      ...empleado,
      nomina: nominaData ? {
        sueldo_base: nominaData.sueldo_base,
        bonificacion: nominaData.bonificacion,
        frecuencia_pago: nominaData.frecuencia_pago,
        metodo_pago: nominaData.metodo_pago,
        tasa_impuestos: nominaData.tasa_impuestos,
        base_deduccion: nominaData.base_deduccion,
        beneficios_base: nominaData.beneficios_base
      } : null,
      proyectos,
      nominas,
      pagos, // Nueva propiedad para cronología de pagos
      historial,
      gastoPorProyecto,
      ultimoPago,
      contratos: [] // TODO: implementar contratos
    };

    res.json(empleadoResponse);
  } catch (error) {
    console.error('Error al obtener empleado:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
});

// POST /api/empleados - Crear nuevo empleado
router.post('/', async (req: Request, res: Response) => {
  try {
    // Validar los datos usando el nuevo esquema
    const validation = crearEmpleadoNuevoSchema.safeParse(req.body);

    if (!validation.success) {
      return res.status(400).json({ 
        message: 'Datos inválidos',
        errors: validation.error.issues 
      });
    }

    const empleadoData = validation.data;

    // Verificar que el usuario existe si se proporciona user_id
    if (empleadoData.user_id) {
      const [usuario] = await db
        .select()
        .from(users)
        .where(eq(users.id, empleadoData.user_id));
      
      if (!usuario) {
        return res.status(400).json({ message: 'Usuario no encontrado' });
      }
    }

    // Verificar que no exista otro empleado con la misma identificación
    const [empleadoExistente] = await db
      .select()
      .from(empleados)
      .where(eq(empleados.identificacion, empleadoData.identificacion));
    
    if (empleadoExistente) {
      return res.status(400).json({ 
        message: `Ya existe un empleado con la identificación ${empleadoData.identificacion}` 
      });
    }

    // Transformar fecha_ingreso a string si es necesario
    const empleadoDataTransformed = {
      ...empleadoData,
      fecha_ingreso: empleadoData.fecha_ingreso instanceof Date 
        ? empleadoData.fecha_ingreso.toISOString().split('T')[0] 
        : empleadoData.fecha_ingreso,
      fecha_fin_contrato: empleadoData.fecha_fin_contrato 
        ? (empleadoData.fecha_fin_contrato instanceof Date 
          ? empleadoData.fecha_fin_contrato.toISOString().split('T')[0] 
          : empleadoData.fecha_fin_contrato)
        : undefined
    };

    // Crear el nuevo empleado
    const [nuevoEmpleado] = await db
      .insert(empleados)
      .values(empleadoDataTransformed)
      .returning();

    // Crear entrada en historial de cambios
    await db.insert(historial_contratos).values({
      empleado_id: nuevoEmpleado.id,
      tipo_cambio: 'alta',
      campo_modificado: 'empleado',
      valor_anterior: null,
      valor_nuevo: `Empleado creado: ${nuevoEmpleado.nombre} ${nuevoEmpleado.apellido}`,
      motivo: 'Alta de empleado en el sistema',
      modificado_por: 1 // TODO: obtener ID del usuario actual
    });

    res.status(201).json({
      message: 'Empleado creado exitosamente',
      empleado: nuevoEmpleado
    });
  } catch (error) {
    console.error('Error al crear empleado:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
});

// PATCH /api/empleados/:id - Actualizar empleado
router.patch('/:id', async (req: Request, res: Response) => {
  try {
    const empleadoId = parseInt(req.params.id);
    const validation = updateEmpleadoSchema.safeParse(req.body);

    if (!validation.success) {
      return res.status(400).json({ 
        message: 'Datos inválidos',
        errors: validation.error.issues 
      });
    }

    const empleadoData = validation.data;

    // Verificar que el empleado existe
    const [empleadoExistente] = await db
      .select()
      .from(empleados)
      .where(eq(empleados.id, empleadoId));

    if (!empleadoExistente) {
      return res.status(404).json({ message: 'Empleado no encontrado' });
    }

    // Crear entrada en historial de cambios si hay modificaciones
    const cambios = [];
    if (empleadoData.tipo_contrato && empleadoData.tipo_contrato !== empleadoExistente.tipo_contrato) {
      cambios.push({
        empleado_id: empleadoId,
        tipo_cambio: 'tipo_contrato',
        campo_modificado: 'tipo_contrato',
        valor_anterior: empleadoExistente.tipo_contrato,
        valor_nuevo: empleadoData.tipo_contrato,
        motivo: 'Actualización de tipo de contrato',
        modificado_por: 1 // TODO: obtener ID del usuario actual
      });
    }

    // Transformar fechas a strings si es necesario
    const empleadoDataTransformed = {
      ...empleadoData,
      fecha_ingreso: empleadoData.fecha_ingreso instanceof Date 
        ? empleadoData.fecha_ingreso.toISOString().split('T')[0] 
        : empleadoData.fecha_ingreso,
      fecha_fin_contrato: empleadoData.fecha_fin_contrato 
        ? (empleadoData.fecha_fin_contrato instanceof Date 
          ? empleadoData.fecha_fin_contrato.toISOString().split('T')[0] 
          : empleadoData.fecha_fin_contrato)
        : undefined
    };

    // Actualizar empleado
    const [updatedEmpleado] = await db
      .update(empleados)
      .set(empleadoDataTransformed)
      .where(eq(empleados.id, empleadoId))
      .returning();

    // Insertar cambios en el historial si los hay
    if (cambios.length > 0) {
      await db.insert(historial_contratos).values(cambios);
    }

    res.json({ message: 'Empleado actualizado correctamente' });
  } catch (error) {
    console.error('Error al actualizar empleado:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
});

// PUT /api/empleados/:id/proyectos - Actualizar proyectos del empleado
router.put('/:id/proyectos', async (req: Request, res: Response) => {
  try {
    const empleadoId = parseInt(req.params.id);
    const { proyectosIds } = req.body as { proyectosIds: number[] };

    if (!Array.isArray(proyectosIds)) {
      return res.status(400).json({ message: 'proyectosIds debe ser un array' });
    }

    // Eliminar todas las asignaciones actuales
    await db
      .delete(empleado_proyecto)
      .where(eq(empleado_proyecto.empleado_id, empleadoId));

    // Crear nuevas asignaciones
    if (proyectosIds.length > 0) {
      const assignments = proyectosIds.map(proyectoId => ({
        empleado_id: empleadoId,
        proyecto_id: proyectoId,
      }));

      await db.insert(empleado_proyecto).values(assignments);
    }

    res.json({ message: 'Proyectos actualizados correctamente' });
  } catch (error) {
    console.error('Error al actualizar proyectos:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
});

// DELETE /api/empleados/:id - Eliminar empleado (dar de baja)
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const empleadoId = parseInt(req.params.id);

    // Verificar que el empleado existe
    const [empleado] = await db
      .select()
      .from(empleados)
      .where(eq(empleados.id, empleadoId));

    if (!empleado) {
      return res.status(404).json({ message: 'Empleado no encontrado' });
    }

    // Marcar como eliminado usando soft delete
    await db
      .update(empleados)
      .set({ 
        estado_contrato: 'inactivo',
        deleted_at: new Date(),
        // Modificar identificación para evitar restricción única
        identificacion: `${empleado.identificacion}_deleted_${Date.now()}`
      })
      .where(eq(empleados.id, empleadoId));

    // Eliminar relaciones de proyectos
    await db
      .delete(empleado_proyecto)
      .where(eq(empleado_proyecto.empleado_id, empleadoId));

    res.json({ message: 'Empleado dado de baja correctamente' });
  } catch (error) {
    console.error('Error al eliminar empleado:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
});

// GET /api/empleados/:id/historial-nomina - Obtener historial de nóminas del empleado
router.get('/:id/historial-nomina', async (req: Request, res: Response) => {
  try {
    const empleadoId = parseInt(req.params.id);

    // Obtener historial de nóminas del empleado
    const historial = await db
      .select({
        id: nominas_nuevas.id,
        fecha: nominas_nuevas.rango_inicio,
        periodo_inicio: nominas_nuevas.rango_inicio,
        periodo_fin: nominas_nuevas.rango_fin,
        estado: nominas_nuevas.estado,
        valor_bruto: nomina_items.sueldo,
        valor_neto: nomina_items.neto,
        bonificaciones: nomina_items.bono,
        deducciones: nomina_items.deduccion,
        impuestos: nomina_items.impuestos,
        proyecto_nombre: projects.name,
        fecha_pago: nominas_nuevas.creado_at, // Usar creado_at como fecha_pago temporal
        metodo_pago: empleado_nomina.metodo_pago,
      })
      .from(nomina_items)
      .innerJoin(nominas_nuevas, eq(nomina_items.nomina_id, nominas_nuevas.id))
      .innerJoin(empleados, eq(nomina_items.empleado_id, empleados.id))
      .leftJoin(empleado_nomina, eq(empleados.id, empleado_nomina.empleado_id))
      .leftJoin(projects, eq(nominas_nuevas.proyecto_id, projects.id))
      .where(eq(nomina_items.empleado_id, empleadoId))
      .orderBy(sql`${nominas_nuevas.rango_inicio} DESC`);

    res.json(historial);
  } catch (error) {
    console.error('Error al obtener historial de nómina:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
});

// PATCH /api/empleados/:id/historial-nomina/:nominaId/estado - Cambiar estado de nómina específica
router.patch('/:id/historial-nomina/:nominaId/estado', async (req: Request, res: Response) => {
  try {
    const nominaId = parseInt(req.params.nominaId);
    const { estado } = req.body as { estado: string };

    if (!['pendiente', 'pagado', 'aprobado', 'rechazado'].includes(estado)) {
      return res.status(400).json({ message: 'Estado inválido' });
    }

    const updateData: any = { estado };
    
    // Actualizar estado - fecha_pago no existe en la tabla actual

    await db
      .update(nominas_nuevas)
      .set(updateData)
      .where(eq(nominas_nuevas.id, nominaId));

    res.json({ message: `Nómina marcada como ${estado}` });
  } catch (error) {
    console.error('Error al actualizar estado de nómina:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
});

// Endpoint para exportar nómina (endpoint global, no por empleado)
export const exportRouter = Router();

exportRouter.get('/nominas/:nominaId/export', async (req: Request, res: Response) => {
  try {
    const nominaId = parseInt(req.params.nominaId);
    
    // Obtener datos de la nómina
    const nominaResult = await db.execute(sql`
      SELECT 
        nn.*,
        ni.sueldo,
        ni.bono,
        ni.deduccion,
        ni.impuestos,
        ni.neto,
        e.nombre,
        e.apellido,
        e.identificacion,
        e.cargo,
        p.name as proyecto_nombre
      FROM nominas_nuevas nn
      LEFT JOIN nomina_items ni ON nn.id = ni.nomina_id
      LEFT JOIN empleados e ON ni.empleado_id = e.id
      LEFT JOIN projects p ON nn.proyecto_id = p.id
      WHERE nn.id = ${nominaId}
    `);
    
    const nomina = nominaResult.rows[0] as any;
    
    if (!nomina) {
      return res.status(404).json({ message: 'Nómina no encontrada' });
    }
    
    // Por ahora, devolvemos un JSON con los datos
    // TODO: Implementar generación de PDF con PDFKit
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', `attachment; filename=nomina-${nominaId}.json`);
    res.json({
      nomina: nomina,
      generado: new Date(),
      mensaje: 'Exportación de nómina - PDF pendiente de implementar'
    });
    
  } catch (error) {
    console.error('Error al exportar nómina:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
});

export default router;