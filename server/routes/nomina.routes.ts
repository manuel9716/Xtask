import { Router, Request, Response } from 'express';
import { db } from '../db';
import { and, eq, like, or, ilike, sql } from 'drizzle-orm';
import { employees, nominas, nominaDetalles, EstadoNomina } from '@shared/schema';
import { z } from 'zod';
import path from 'path';
import fs from 'fs';
import PDFDocument from 'pdfkit';

// Esquema para validar los datos de la nómina
const datosNominaSchema = z.object({
  empleadoId: z.number(),
  nombreEmpleado: z.string(),
  salarioBase: z.number(),
  periodo: z.object({
    fechaInicio: z.string(),
    fechaFin: z.string()
  }),
  ingresos: z.array(z.object({
    nombre: z.string(),
    valor: z.number(),
    esDeduccion: z.boolean()
  })),
  deducciones: z.array(z.object({
    nombre: z.string(),
    valor: z.number(),
    esDeduccion: z.boolean()
  })),
  totalIngresos: z.number(),
  totalDeducciones: z.number(),
  salarioNeto: z.number()
});

// Esquema para validar la creación de una nómina
const crearNominaSchema = z.object({
  empleadoId: z.number(),
  periodo: z.string(),
  salarioBase: z.string(),
  totalIngresos: z.string(),
  totalDeducciones: z.string(),
  salarioNeto: z.string(),
  estado: z.enum(['pendiente', 'pagada', 'cancelada']).default('pendiente'),
  detalleIngresos: z.string().optional(),
  detalleDeducciones: z.string().optional(),
});

const nominaRouter = Router();

// Listar empleados para nómina con filtros
nominaRouter.get('/empleados/listar', async (req: Request, res: Response) => {
  try {
    const page = Number(req.query.page) || 1;
    const pageSize = Number(req.query.pageSize) || 10;
    const search = req.query.search as string;
    const department = req.query.department as string;
    const contractStatus = req.query.contractStatus as string;
    
    const offset = (page - 1) * pageSize;
    
    // Construir las condiciones para el filtrado
    const conditions = [];
    
    // Si hay búsqueda de texto
    if (search) {
      conditions.push(
        or(
          ilike(employees.firstName, `%${search}%`),
          ilike(employees.lastName, `%${search}%`),
          ilike(employees.position, `%${search}%`)
        )
      );
    }
    
    // Si hay filtro por departamento
    if (department) {
      conditions.push(eq(employees.department, department));
    }
    
    // Si hay filtro por estado de contrato
    if (contractStatus) {
      conditions.push(eq(employees.contractStatus, contractStatus));
    }
    
    // Ejecutar la consulta con los filtros
    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;
    
    // Log para depuración
    console.log("Filtros aplicados:", {
      search,
      department,
      contractStatus,
      whereClause
    });

    // Obtener empleados filtrados
    const empleadosFiltrados = await db
      .select()
      .from(employees)
      .where(whereClause)
      .limit(pageSize)
      .offset(offset);
    
    // Log para depuración
    console.log(`Empleados encontrados: ${empleadosFiltrados.length}`);
    
    // Obtener conteo total para la paginación
    const [totalCount] = await db
      .select({ count: sql<number>`count(*)` })
      .from(employees)
      .where(whereClause);
    
    const total = totalCount?.count || 0;
    const totalPages = Math.ceil(total / pageSize);
    
    return res.status(200).json({
      data: empleadosFiltrados,
      total,
      currentPage: page,
      totalPages
    });
  } catch (error) {
    console.error('Error al listar empleados para nómina:', error);
    return res.status(500).json({ error: 'Error al listar empleados para nómina' });
  }
});

// Procesar y generar el PDF de nómina
nominaRouter.post('/desprendible/generar', async (req: Request, res: Response) => {
  try {
    // Validar los datos recibidos
    const validacionResultado = datosNominaSchema.safeParse(req.body);
    
    if (!validacionResultado.success) {
      return res.status(400).json({ 
        error: 'Datos de nómina inválidos',
        details: validacionResultado.error.format() 
      });
    }
    
    const datosNomina = validacionResultado.data;
    
    // Verificar que el empleado existe
    const [empleado] = await db.select()
      .from(employees)
      .where(eq(employees.id, datosNomina.empleadoId));
    
    if (!empleado) {
      return res.status(404).json({ error: 'Empleado no encontrado' });
    }
    
    // Preparar directorio para PDFs
    const pdfDir = path.resolve('./uploads/nomina');
    if (!fs.existsSync(pdfDir)) {
      fs.mkdirSync(pdfDir, { recursive: true });
    }
    
    // Generar nombre único para el archivo
    const timestamp = Date.now();
    const nombreArchivo = `desprendible-${datosNomina.empleadoId}-${timestamp}.pdf`;
    const rutaArchivo = path.join(pdfDir, nombreArchivo);
    
    // Crear PDF
    const doc = new PDFDocument({ margin: 50 });
    
    // Pipe el PDF a un archivo en el servidor
    doc.pipe(fs.createWriteStream(rutaArchivo));
    
    // Agregar contenido al PDF
    // Título y encabezado
    doc.fontSize(25).text('Desprendible de Nómina', { align: 'center' });
    doc.moveDown();
    
    doc.fontSize(12).text(`Empleado: ${datosNomina.nombreEmpleado}`);
    doc.fontSize(10).text(`Período: ${datosNomina.periodo.fechaInicio} al ${datosNomina.periodo.fechaFin}`);
    doc.fontSize(10).text(`Fecha de generación: ${new Date().toLocaleDateString()}`);
    doc.moveDown();
    
    // Línea divisoria
    doc.moveTo(50, doc.y)
       .lineTo(550, doc.y)
       .stroke();
    doc.moveDown();
    
    // Ingresos
    doc.fontSize(14).text('Ingresos', { underline: true });
    doc.moveDown(0.5);
    
    datosNomina.ingresos.forEach(ingreso => {
      doc.fontSize(10).text(ingreso.nombre, { continued: true, width: 300 });
      doc.text(`$${ingreso.valor.toLocaleString('es-CO')}`, { align: 'right' });
    });
    
    doc.moveDown();
    doc.fontSize(12).text('Total Ingresos:', { continued: true, width: 300 });
    doc.text(`$${datosNomina.totalIngresos.toLocaleString('es-CO')}`, { align: 'right' });
    doc.moveDown();
    
    // Línea divisoria
    doc.moveTo(50, doc.y)
       .lineTo(550, doc.y)
       .stroke();
    doc.moveDown();
    
    // Deducciones
    doc.fontSize(14).text('Deducciones', { underline: true });
    doc.moveDown(0.5);
    
    datosNomina.deducciones.forEach(deduccion => {
      doc.fontSize(10).text(deduccion.nombre, { continued: true, width: 300 });
      doc.text(`$${deduccion.valor.toLocaleString('es-CO')}`, { align: 'right' });
    });
    
    doc.moveDown();
    doc.fontSize(12).text('Total Deducciones:', { continued: true, width: 300 });
    doc.text(`$${datosNomina.totalDeducciones.toLocaleString('es-CO')}`, { align: 'right' });
    doc.moveDown();
    
    // Línea divisoria
    doc.moveTo(50, doc.y)
       .lineTo(550, doc.y)
       .stroke();
    doc.moveDown();
    
    // Total a pagar
    doc.fontSize(14).text('Salario Neto a Pagar:', { continued: true, width: 300 });
    doc.text(`$${datosNomina.salarioNeto.toLocaleString('es-CO')}`, { align: 'right' });
    
    // Finalizar PDF
    doc.end();
    
    // Guardar registro en base de datos (simplificado)
    // Esto debería expandirse para realmente guardar y vincular la nómina
    
    return res.status(200).json({ 
      message: 'Desprendible generado correctamente',
      pdfUrl: `/uploads/nomina/${nombreArchivo}`
    });
  } catch (error) {
    console.error('Error al generar el desprendible de nómina:', error);
    return res.status(500).json({ error: 'Error al generar el desprendible de nómina' });
  }
});

// Obtener todas las nóminas de un empleado
nominaRouter.get('/empleado/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const empleadoId = parseInt(id);
    
    // Buscar todas las nóminas donde el empleado tiene un detalle
    const detallesNomina = await db.select({
      nominaId: nominaDetalles.nominaId,
      salarioBase: nominaDetalles.salarioBase,
      totalIngresos: nominaDetalles.totalIngresos,
      totalDeducciones: nominaDetalles.totalDeducciones,
      salarioNeto: nominaDetalles.salarioNeto,
      estado: nominaDetalles.estado,
      pdfUrl: nominaDetalles.pdfUrl,
      fechaGeneracion: nominaDetalles.fechaGeneracion
    })
    .from(nominaDetalles)
    .where(eq(nominaDetalles.empleadoId, empleadoId))
    .orderBy(sql`${nominaDetalles.fechaGeneracion} DESC`);
    
    // Si no hay resultados, devolver un array vacío
    if (!detallesNomina.length) {
      return res.status(200).json([]);
    }
    
    // Obtener las cabeceras de nómina para cada detalle
    const nominaIds = detallesNomina.map(detalle => detalle.nominaId);
    
    const cabecerasNomina = await db.select()
      .from(nominas)
      .where(sql`${nominas.id} IN (${nominaIds.join(',')})`);
      
    // Combinar la información
    const nominasCompletas = detallesNomina.map(detalle => {
      const cabecera = cabecerasNomina.find(c => c.id === detalle.nominaId);
      return {
        id: detalle.nominaId,
        empleadoId,
        periodo: `${new Date(cabecera?.periodoInicio || '').toLocaleDateString()} al ${new Date(cabecera?.periodoFin || '').toLocaleDateString()}`,
        fechaGeneracion: new Date(detalle.fechaGeneracion).toISOString(),
        salarioBase: detalle.salarioBase,
        totalIngresos: detalle.totalIngresos,
        totalDeducciones: detalle.totalDeducciones,
        salarioNeto: detalle.salarioNeto,
        estado: detalle.estado,
        fechaPago: cabecera?.fechaPago ? new Date(cabecera.fechaPago).toISOString() : null,
        pdfUrl: detalle.pdfUrl || `/api/nomina/${detalle.nominaId}/desprendible`
      };
    });
    
    return res.status(200).json(nominasCompletas);
  } catch (error: any) {
    console.error(`Error al obtener nóminas del empleado ${req.params.id}:`, error);
    return res.status(500).json({ 
      error: 'Error al obtener las nóminas del empleado',
      details: error.message
    });
  }
});

// Generar una nueva nómina
nominaRouter.post('/generar', async (req: Request, res: Response) => {
  try {
    // Validar los datos recibidos
    const validacionResultado = crearNominaSchema.safeParse(req.body);
    
    if (!validacionResultado.success) {
      return res.status(400).json({ 
        error: 'Datos de nómina inválidos',
        details: validacionResultado.error.format() 
      });
    }
    
    // Aquí deberíamos crear un registro en la tabla de nóminas
    // Esta es una implementación de muestra, se debería expandir
    
    return res.status(201).json({
      id: 3,
      ...req.body,
      fechaGeneracion: new Date().toISOString(),
      pdfUrl: '/uploads/nomina/desprendible-nuevo.pdf'
    });
  } catch (error: any) {
    console.error('Error al generar nómina:', error);
    return res.status(500).json({ 
      error: 'Error al generar la nómina',
      details: error.message
    });
  }
});

// Crear una nueva nómina con múltiples empleados
nominaRouter.post('/crear', async (req: Request, res: Response) => {
  try {
    const { 
      periodoInicio, 
      periodoFin, 
      fechaPago, 
      metodoPago, 
      empleados, 
      comentarios,
      titulo = `Nómina ${new Date(periodoInicio).toLocaleDateString()} a ${new Date(periodoFin).toLocaleDateString()}`
    } = req.body;
    
    // Validación básica de datos
    if (!periodoInicio || !periodoFin || !fechaPago || !metodoPago || !empleados || !Array.isArray(empleados)) {
      return res.status(400).json({ error: 'Datos incompletos o inválidos' });
    }
    
    // Cálculo del monto total de la nómina
    const montoTotal = empleados.reduce((total, emp) => total + parseFloat(emp.salarioNeto), 0);
    
    // Crear la cabecera de nómina
    const [nuevaNomina] = await db.insert(nominas)
      .values({
        titulo,
        periodoInicio: new Date(periodoInicio),
        periodoFin: new Date(periodoFin),
        fechaPago: new Date(fechaPago),
        metodoPago,
        estado: EstadoNomina.PENDIENTE,
        comentarios,
        fechaCreacion: new Date(),
        fechaActualizacion: new Date(),
        creadoPor: req.user?.id || 1, // Usamos el ID del usuario autenticado o un valor por defecto
        montoTotal: montoTotal.toString()
      })
      .returning();
    
    // Crear los detalles por cada empleado
    const detallesPromises = empleados.map(async (empleado) => {
      const [detalle] = await db.insert(nominaDetalles)
        .values({
          nominaId: nuevaNomina.id,
          empleadoId: empleado.id,
          salarioBase: empleado.salarioBase.toString(),
          totalIngresos: empleado.totalIngresos.toString(),
          totalDeducciones: empleado.totalDeducciones.toString(),
          salarioNeto: empleado.salarioNeto.toString(),
          detalleIngresos: JSON.stringify(empleado.ingresos || []),
          detalleDeducciones: JSON.stringify(empleado.deducciones || []),
          estado: EstadoNomina.PENDIENTE,
          fechaGeneracion: new Date()
        })
        .returning();
      return detalle;
    });
    
    // Esperar a que se creen todos los detalles
    const detallesNomina = await Promise.all(detallesPromises);
    
    // Retornar la nómina creada con sus detalles
    return res.status(201).json({
      ...nuevaNomina,
      empleados: detallesNomina
    });
  } catch (error: any) {
    console.error('Error al crear nómina:', error);
    return res.status(500).json({ error: 'Error al crear la nómina', details: error.message });
  }
});

// Marcar una nómina como pagada
nominaRouter.patch('/:id/marcar-pagada', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const nominaId = parseInt(id);
    
    // Verificar que la nómina existe
    const [nominaExistente] = await db.select()
      .from(nominas)
      .where(eq(nominas.id, nominaId));
      
    if (!nominaExistente) {
      return res.status(404).json({ error: 'Nómina no encontrada' });
    }
    
    // Actualizar estado de la nómina
    const [nominaActualizada] = await db.update(nominas)
      .set({ 
        estado: EstadoNomina.PAGADO,
        fechaActualizacion: new Date(),
        actualizadoPor: req.user?.id || 1 
      })
      .where(eq(nominas.id, nominaId))
      .returning();
      
    // Actualizar estado de todos los detalles de nómina asociados
    await db.update(nominaDetalles)
      .set({ estado: EstadoNomina.PAGADO })
      .where(eq(nominaDetalles.nominaId, nominaId));
    
    return res.status(200).json(nominaActualizada);
  } catch (error: any) {
    console.error(`Error al marcar nómina ${req.params.id} como pagada:`, error);
    return res.status(500).json({ 
      error: 'Error al marcar la nómina como pagada',
      details: error.message
    });
  }
});

// Cancelar una nómina
nominaRouter.patch('/:id/cancelar', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const nominaId = parseInt(id);
    
    // Verificar que la nómina existe
    const [nominaExistente] = await db.select()
      .from(nominas)
      .where(eq(nominas.id, nominaId));
      
    if (!nominaExistente) {
      return res.status(404).json({ error: 'Nómina no encontrada' });
    }
    
    // Actualizar estado de la nómina
    const [nominaActualizada] = await db.update(nominas)
      .set({ 
        estado: EstadoNomina.CANCELADO,
        fechaActualizacion: new Date(),
        actualizadoPor: req.user?.id || 1 
      })
      .where(eq(nominas.id, nominaId))
      .returning();
      
    // Actualizar estado de todos los detalles de nómina asociados
    await db.update(nominaDetalles)
      .set({ estado: EstadoNomina.CANCELADO })
      .where(eq(nominaDetalles.nominaId, nominaId));
    
    return res.status(200).json(nominaActualizada);
  } catch (error: any) {
    console.error(`Error al cancelar nómina ${req.params.id}:`, error);
    return res.status(500).json({ 
      error: 'Error al cancelar la nómina',
      details: error.message
    });
  }
});

// Descargar desprendible de nómina
nominaRouter.get('/:id/desprendible-url', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    // Aquí deberíamos buscar la URL del desprendible en la tabla de nóminas
    // Esta es una implementación de muestra, se debería expandir
    
    return res.status(200).json({
      pdfUrl: `/uploads/nomina/desprendible-${id}.pdf`
    });
  } catch (error: any) {
    console.error(`Error al obtener URL del desprendible ${req.params.id}:`, error);
    return res.status(500).json({ 
      error: 'Error al obtener la URL del desprendible',
      details: error.message 
    });
  }
});

// Descargar desprendible de nómina
nominaRouter.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    // Buscar en la base de datos (simulado)
    const pdfPath = path.resolve(`./uploads/nomina/desprendible-${id}.pdf`);
    
    // Verificar si existe
    if (!fs.existsSync(pdfPath)) {
      return res.status(404).json({ error: 'Desprendible no encontrado' });
    }
    
    // Enviar el archivo
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="desprendible-${id}.pdf"`);
    
    const fileStream = fs.createReadStream(pdfPath);
    fileStream.pipe(res);
  } catch (error) {
    console.error(`Error al descargar desprendible ${req.params.id}:`, error);
    return res.status(500).json({ error: 'Error al descargar el desprendible' });
  }
});

export default nominaRouter;