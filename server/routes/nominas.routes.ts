import { Request, Response, Router } from 'express';
import { db } from '../db';
import { nominas_nuevas, nomina_items, empleados, projects, payments_log, users } from '@shared/schema';
import { eq, sql } from 'drizzle-orm';
import { z } from 'zod';
import { verifyToken } from './auth.routes';

const router = Router();

// GET /api/nominas/:id - Obtener detalle de nómina
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const nominaId = parseInt(req.params.id);

    // Obtener nómina principal
    const [nomina] = await db
      .select({
        id: nominas_nuevas.id,
        rango_inicio: nominas_nuevas.rango_inicio,
        rango_fin: nominas_nuevas.rango_fin,
        proyecto_id: nominas_nuevas.proyecto_id,
        proyecto_nombre: projects.name,
        estado: nominas_nuevas.estado,
        total_sueldos: nominas_nuevas.total_sueldos,
        total_bonos: nominas_nuevas.total_bonos,
        total_deducciones: nominas_nuevas.total_deducciones,
        total_impuestos: nominas_nuevas.total_impuestos,
        total_neto: nominas_nuevas.total_neto,
        creado_por: nominas_nuevas.creado_por,
        creado_por_nombre: users.fullName,
        creado_at: nominas_nuevas.creado_at,
      })
      .from(nominas_nuevas)
      .leftJoin(projects, eq(nominas_nuevas.proyecto_id, projects.id))
      .leftJoin(users, eq(nominas_nuevas.creado_por, users.id))
      .where(eq(nominas_nuevas.id, nominaId));

    if (!nomina) {
      return res.status(404).json({ message: 'Nómina no encontrada' });
    }

    // Obtener items de la nómina
    const items = await db
      .select({
        empleado_id: nomina_items.empleado_id,
        empleado_nombre: sql<string>`CONCAT(${empleados.nombre}, ' ', ${empleados.apellido})`,
        empleado_identificacion: empleados.identificacion,
        empleado_cargo: empleados.cargo,
        sueldo: nomina_items.sueldo,
        bono: nomina_items.bono,
        deduccion: nomina_items.deduccion,
        impuestos: nomina_items.impuestos,
        neto: nomina_items.neto,
      })
      .from(nomina_items)
      .innerJoin(empleados, eq(nomina_items.empleado_id, empleados.id))
      .where(eq(nomina_items.nomina_id, nominaId));

    const result = {
      ...nomina,
      items,
    };

    res.json(result);
  } catch (error) {
    console.error('Error al obtener nómina:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
});

// PATCH /api/nominas/:id/estado - Cambiar estado de nómina
router.patch('/:id/estado', async (req: Request, res: Response) => {
  try {
    const nominaId = parseInt(req.params.id);
    const { estado } = req.body as { estado: string };

    if (!['pendiente', 'pagada', 'procesando', 'cancelada'].includes(estado)) {
      return res.status(400).json({ message: 'Estado inválido' });
    }

    // Actualizar estado de la nómina
    const [updatedNomina] = await db
      .update(nominas_nuevas)
      .set({ estado })
      .where(eq(nominas_nuevas.id, nominaId))
      .returning();

    if (!updatedNomina) {
      return res.status(404).json({ message: 'Nómina no encontrada' });
    }

    // Si se marca como pagada, registrar en log de pagos
    if (estado === 'pagada') {
      await db.insert(payments_log).values({
        nomina_id: nominaId,
        fecha_pago: sql`NOW()`,
        monto: updatedNomina.total_neto,
        estado: 'pagada',
        nota: 'Marcada como pagada desde el sistema',
      });
    }

    res.json({ message: 'Estado actualizado correctamente' });
  } catch (error) {
    console.error('Error al actualizar estado:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
});

// GET /api/nominas/:id/export - Exportar nómina  
router.get('/:id/export', async (req: Request, res: Response) => {
  try {
    const nominaId = parseInt(req.params.id);
    const format = req.query.format as string;

    if (!format || !['pdf', 'xlsx'].includes(format)) {
      return res.status(400).json({ message: 'Formato inválido. Use pdf o xlsx' });
    }

    // Obtener datos de la nómina
    const [nomina] = await db
      .select({
        id: nominas_nuevas.id,
        rango_inicio: nominas_nuevas.rango_inicio,
        rango_fin: nominas_nuevas.rango_fin,
        proyecto_nombre: projects.name,
        estado: nominas_nuevas.estado,
        total_sueldos: nominas_nuevas.total_sueldos,
        total_bonos: nominas_nuevas.total_bonos,
        total_deducciones: nominas_nuevas.total_deducciones,
        total_neto: nominas_nuevas.total_neto,
      })
      .from(nominas_nuevas)
      .leftJoin(projects, eq(nominas_nuevas.proyecto_id, projects.id))
      .where(eq(nominas_nuevas.id, nominaId));

    if (!nomina) {
      return res.status(404).json({ message: 'Nómina no encontrada' });
    }

    const items = await db
      .select({
        empleado_nombre: sql<string>`CONCAT(${empleados.nombre}, ' ', ${empleados.apellido})`,
        empleado_identificacion: empleados.identificacion,
        empleado_cargo: empleados.cargo,
        sueldo: nomina_items.sueldo,
        bono: nomina_items.bono,
        deduccion: nomina_items.deduccion,
        impuestos: nomina_items.impuestos,
        neto: nomina_items.neto,
      })
      .from(nomina_items)
      .innerJoin(empleados, eq(nomina_items.empleado_id, empleados.id))
      .where(eq(nomina_items.nomina_id, nominaId));

    if (format === 'pdf') {
      // Generar PDF usando PDFKit
      const PDFDocument = require('pdfkit');
      const doc = new PDFDocument();
      
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename=nomina_${nominaId}.pdf`);
      
      doc.pipe(res);
      
      // Encabezado
      doc.fontSize(20).text('Reporte de Nómina', 50, 50);
      doc.fontSize(12).text(`Período: ${nomina.rango_inicio} - ${nomina.rango_fin}`, 50, 80);
      doc.text(`Proyecto: ${nomina.proyecto_nombre || 'Sin proyecto'}`, 50, 100);
      doc.text(`Estado: ${nomina.estado.toUpperCase()}`, 50, 120);
      
      // Tabla
      let y = 160;
      doc.text('Empleado', 50, y);
      doc.text('Cargo', 150, y);
      doc.text('Sueldo', 250, y);
      doc.text('Bonos', 300, y);
      doc.text('Deducciones', 350, y);
      doc.text('Neto', 450, y);
      
      y += 20;
      doc.moveTo(50, y).lineTo(500, y).stroke();
      y += 10;
      
      items.forEach(item => {
        doc.text(item.empleado_nombre, 50, y);
        doc.text(item.empleado_cargo, 150, y);
        doc.text(`$${Number(item.sueldo).toLocaleString()}`, 250, y);
        doc.text(`$${Number(item.bono).toLocaleString()}`, 300, y);
        doc.text(`$${Number(item.deduccion).toLocaleString()}`, 350, y);
        doc.text(`$${Number(item.neto).toLocaleString()}`, 450, y);
        y += 20;
      });
      
      // Totales
      y += 10;
      doc.moveTo(50, y).lineTo(500, y).stroke();
      y += 20;
      doc.fontSize(14).text('TOTALES', 50, y);
      doc.text(`$${Number(nomina.total_sueldos).toLocaleString()}`, 250, y);
      doc.text(`$${Number(nomina.total_bonos).toLocaleString()}`, 300, y);
      doc.text(`$${Number(nomina.total_deducciones).toLocaleString()}`, 350, y);
      doc.text(`$${Number(nomina.total_neto).toLocaleString()}`, 450, y);
      
      doc.end();
      
    } else if (format === 'xlsx') {
      // Para XLSX se devolvería una implementación con exceljs
      // Por ahora, devolvemos JSON
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Content-Disposition', `attachment; filename=nomina_${nominaId}.json`);
      
      const exportData = {
        nomina,
        items,
        exportedAt: new Date().toISOString(),
      };
      
      res.json(exportData);
    }
    
  } catch (error) {
    console.error('Error al exportar nómina:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
});

export default router;