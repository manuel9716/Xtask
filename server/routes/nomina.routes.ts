import { Router, Request, Response } from 'express';
import { db } from '../db';
import { and, eq, like, or, ilike, sql } from 'drizzle-orm';
import { employees } from '@shared/schema';
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
    
    // Aquí deberíamos consultar la tabla de nóminas 
    // Esta es una implementación de muestra, se debería expandir
    const nominasMuestra = [
      {
        id: 1,
        empleadoId: parseInt(id),
        periodo: '2025-03-01 al 2025-03-31',
        fechaGeneracion: '2025-04-01',
        salarioBase: '2000000',
        totalIngresos: '2200000',
        totalDeducciones: '420000',
        salarioNeto: '1780000',
        estado: 'pagada',
        fechaPago: '2025-04-05',
        pdfUrl: '/uploads/nomina/desprendible-1-1715456789.pdf'
      },
      {
        id: 2,
        empleadoId: parseInt(id),
        periodo: '2025-02-01 al 2025-02-29',
        fechaGeneracion: '2025-03-01',
        salarioBase: '2000000',
        totalIngresos: '2150000',
        totalDeducciones: '410000',
        salarioNeto: '1740000',
        estado: 'pagada',
        fechaPago: '2025-03-05',
        pdfUrl: '/uploads/nomina/desprendible-1-1712778543.pdf'
      }
    ];
    
    return res.status(200).json(nominasMuestra);
  } catch (error) {
    console.error(`Error al obtener nóminas del empleado ${req.params.id}:`, error);
    return res.status(500).json({ error: 'Error al obtener las nóminas del empleado' });
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
  } catch (error) {
    console.error('Error al generar nómina:', error);
    return res.status(500).json({ error: 'Error al generar la nómina' });
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
      comentarios 
    } = req.body;
    
    // Validación básica de datos
    if (!periodoInicio || !periodoFin || !fechaPago || !metodoPago || !empleados || !Array.isArray(empleados)) {
      return res.status(400).json({ error: 'Datos incompletos o inválidos' });
    }
    
    // En una implementación real, aquí guardaríamos los datos en la base de datos
    // creando registros tanto para la nómina como para cada empleado incluido
    
    // Simulación de respuesta exitosa
    return res.status(201).json({
      id: Math.floor(Math.random() * 1000) + 100, // ID simulado
      periodoInicio,
      periodoFin,
      fechaPago,
      metodoPago,
      fechaCreacion: new Date().toISOString(),
      estado: 'PENDIENTE',
      montoTotal: empleados.reduce((total, emp) => total + emp.salarioNeto, 0),
      comentarios,
      empleados
    });
  } catch (error) {
    console.error('Error al crear nómina:', error);
    return res.status(500).json({ error: 'Error al crear la nómina' });
  }
});

// Marcar una nómina como pagada
nominaRouter.patch('/:id/marcar-pagada', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    // Aquí deberíamos actualizar el estado en la tabla de nóminas
    // Esta es una implementación de muestra, se debería expandir
    
    return res.status(200).json({
      id: parseInt(id),
      estado: 'pagada',
      fechaPago: new Date().toISOString()
    });
  } catch (error) {
    console.error(`Error al marcar nómina ${req.params.id} como pagada:`, error);
    return res.status(500).json({ error: 'Error al marcar la nómina como pagada' });
  }
});

// Cancelar una nómina
nominaRouter.patch('/:id/cancelar', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    // Aquí deberíamos actualizar el estado en la tabla de nóminas
    // Esta es una implementación de muestra, se debería expandir
    
    return res.status(200).json({
      id: parseInt(id),
      estado: 'cancelada'
    });
  } catch (error) {
    console.error(`Error al cancelar nómina ${req.params.id}:`, error);
    return res.status(500).json({ error: 'Error al cancelar la nómina' });
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
  } catch (error) {
    console.error(`Error al obtener URL del desprendible ${req.params.id}:`, error);
    return res.status(500).json({ error: 'Error al obtener la URL del desprendible' });
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