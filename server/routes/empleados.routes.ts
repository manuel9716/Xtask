import { Request, Response, Router } from 'express';
import { db } from '../db';
import { empleados, empleado_nomina, empleado_proyecto, nominas_nuevas, nomina_items, projects } from '@shared/schema';
import { eq, and, sql } from 'drizzle-orm';
import { z } from 'zod';

const router = Router();

// Schema para validación
const updateEmpleadoSchema = z.object({
  empleado: z.object({
    nombre: z.string().min(2),
    apellido: z.string().min(2),
    identificacion: z.string().min(5),
    depto: z.string().min(1),
    cargo: z.string().min(1),
    fecha_ingreso: z.string(),
    estado_contrato: z.enum(['activo', 'inactivo', 'suspendido']),
    tipo_contrato: z.enum(['indefinido', 'fijo', 'obra_labor', 'prestacion_servicios']),
    telefono: z.string().optional(),
    direccion: z.string().optional(),
    contacto_emergencia: z.string().optional(),
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
  }),
});

// GET /api/empleados/:id - Obtener empleado con proyectos y nóminas
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const empleadoId = parseInt(req.params.id);
    const includeParams = req.query.include as string;
    const includes = includeParams ? includeParams.split(',') : [];

    // Obtener empleado básico
    const [empleado] = await db
      .select()
      .from(empleados)
      .where(eq(empleados.id, empleadoId));

    if (!empleado) {
      return res.status(404).json({ message: 'Empleado no encontrado' });
    }

    // Obtener datos de nómina
    const [nominaData] = await db
      .select()
      .from(empleado_nomina)
      .where(eq(empleado_nomina.empleado_id, empleadoId));

    let proyectos: any[] = [];
    let nominas: any[] = [];

    // Incluir proyectos si se solicita
    if (includes.includes('proyectos')) {
      proyectos = await db
        .select({
          id: projects.id,
          nombre: projects.name,
          descripcion: projects.description,
        })
        .from(empleado_proyecto)
        .innerJoin(projects, eq(empleado_proyecto.proyecto_id, projects.id))
        .where(eq(empleado_proyecto.empleado_id, empleadoId));
    }

    // Incluir nóminas si se solicita
    if (includes.includes('nominas')) {
      nominas = await db
        .select({
          id: nominas_nuevas.id,
          rango_inicio: nominas_nuevas.rango_inicio,
          rango_fin: nominas_nuevas.rango_fin,
          estado: nominas_nuevas.estado,
          proyecto_nombre: projects.name,
          sueldo: nomina_items.sueldo,
          bono: nomina_items.bono,
          deduccion: nomina_items.deduccion,
          impuestos: nomina_items.impuestos,
          neto: nomina_items.neto,
        })
        .from(nomina_items)
        .innerJoin(nominas_nuevas, eq(nomina_items.nomina_id, nominas_nuevas.id))
        .leftJoin(projects, eq(nominas_nuevas.proyecto_id, projects.id))
        .where(eq(nomina_items.empleado_id, empleadoId))
        .orderBy(sql`${nominas_nuevas.rango_inicio} DESC`);
    }

    const result = {
      ...empleado,
      nomina: nominaData,
      proyectos,
      nominas,
      contratos: [] // TODO: implementar contratos
    };

    res.json(result);
  } catch (error) {
    console.error('Error al obtener empleado:', error);
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

    const { empleado: empleadoData, nomina: nominaData } = validation.data;

    // Actualizar empleado
    const [updatedEmpleado] = await db
      .update(empleados)
      .set(empleadoData)
      .where(eq(empleados.id, empleadoId))
      .returning();

    if (!updatedEmpleado) {
      return res.status(404).json({ message: 'Empleado no encontrado' });
    }

    // Actualizar datos de nómina (convirtiendo números a strings donde sea necesario)
    const nominaUpdate = {
      sueldo_base: nominaData.sueldo_base.toString(),
      bonificacion: nominaData.bonificacion.toString(),
      tasa_impuestos: nominaData.tasa_impuestos.toString(),
      base_deduccion: nominaData.base_deduccion.toString(),
      beneficios_base: nominaData.beneficios_base.toString(),
      metodo_pago: nominaData.metodo_pago,
      cuenta_bancaria: nominaData.cuenta_bancaria,
      seguro_salud: nominaData.seguro_salud,
      dias_vacaciones: nominaData.dias_vacaciones,
      frecuencia_pago: nominaData.frecuencia_pago,
    };

    await db
      .update(empleado_nomina)
      .set(nominaUpdate)
      .where(eq(empleado_nomina.empleado_id, empleadoId));

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

    // Marcar como inactivo en lugar de eliminar físicamente
    await db
      .update(empleados)
      .set({ 
        estado_contrato: 'inactivo'
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
        fecha_pago: nominas_nuevas.fecha_pago,
        metodo_pago: empleado_nomina.metodo_pago,
      })
      .from(nomina_items)
      .innerJoin(nominas_nuevas, eq(nomina_items.nomina_id, nominas_nuevas.id))
      .innerJoin(empleado_nomina, eq(nomina_items.empleado_id, empleado_nomina.empleado_id))
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
    
    // Si se marca como pagado, establecer fecha de pago
    if (estado === 'pagado') {
      updateData.fecha_pago = new Date();
    }

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

export default router;