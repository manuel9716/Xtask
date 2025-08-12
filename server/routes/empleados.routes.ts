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
      .where(and(eq(empleados.id, empleadoId), eq(empleados.activo, true)));

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
        .where(and(
          eq(empleado_proyecto.empleado_id, empleadoId),
          eq(empleado_proyecto.activo, true)
        ));
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

    // Marcar todas las asignaciones actuales como inactivas
    await db
      .update(empleado_proyecto)
      .set({ activo: false })
      .where(eq(empleado_proyecto.empleado_id, empleadoId));

    // Crear nuevas asignaciones
    if (proyectosIds.length > 0) {
      const assignments = proyectosIds.map(proyectoId => ({
        empleado_id: empleadoId,
        proyecto_id: proyectoId,
        activo: true,
      }));

      await db.insert(empleado_proyecto).values(assignments);
    }

    res.json({ message: 'Proyectos actualizados correctamente' });
  } catch (error) {
    console.error('Error al actualizar proyectos:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
});

// DELETE /api/empleados/:id - Soft delete del empleado
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const empleadoId = parseInt(req.params.id);

    // Marcar empleado como inactivo
    const [updatedEmpleado] = await db
      .update(empleados)
      .set({ 
        activo: false,
        deleted_at: sql`NOW()`,
        estado_contrato: 'inactivo'
      })
      .where(eq(empleados.id, empleadoId))
      .returning();

    if (!updatedEmpleado) {
      return res.status(404).json({ message: 'Empleado no encontrado' });
    }

    // Marcar asignaciones de proyectos como inactivas
    await db
      .update(empleado_proyecto)
      .set({ activo: false })
      .where(eq(empleado_proyecto.empleado_id, empleadoId));

    res.json({ message: 'Empleado eliminado correctamente' });
  } catch (error) {
    console.error('Error al eliminar empleado:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
});

export default router;