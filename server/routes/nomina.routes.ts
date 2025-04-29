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
nominaRouter.post('/v1/procesarNomina', async (req: Request, res: Response) => {
  try {
    console.log('Recibiendo petición para crear nómina:', JSON.stringify(req.body));
    
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
    
    // Log para depuración
    console.log(`Procesando nómina con ${empleados.length} empleados`);
    console.log('Primer empleado:', empleados[0]);
    
    try {
      // Cálculo del monto total de la nómina (asegurarse de que el string se pueda parsear)
      const montoTotal = empleados.reduce((total, emp) => {
        const salarioNeto = typeof emp.salarioNeto === 'string' 
          ? parseFloat(emp.salarioNeto) 
          : emp.salarioNeto;
        
        // Si salarioNeto no es un número válido, devolvemos total sin cambios
        if (isNaN(salarioNeto)) {
          console.warn(`Salario neto no válido para empleado ${emp.id}:`, emp.salarioNeto);
          return total;
        }
        
        return total + salarioNeto;
      }, 0);
      
      console.log('Monto total calculado:', montoTotal);
      
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
      
      console.log('Cabecera de nómina creada:', nuevaNomina);
      
      // Crear los detalles por cada empleado
      const detallesPromises = empleados.map(async (empleado) => {
        // Convertir todos los valores a string para asegurar compatibilidad
        const salarioBase = typeof empleado.salarioBase === 'string' 
          ? empleado.salarioBase : empleado.salarioBase.toString();
        
        const totalIngresos = typeof empleado.totalIngresos === 'string' 
          ? empleado.totalIngresos : empleado.totalIngresos.toString();
          
        const totalDeducciones = typeof empleado.totalDeducciones === 'string' 
          ? empleado.totalDeducciones : empleado.totalDeducciones.toString();
          
        const salarioNeto = typeof empleado.salarioNeto === 'string' 
          ? empleado.salarioNeto : empleado.salarioNeto.toString();
        
        // Asegurarse de que los detalles de ingresos y deducciones sean strings JSON
        const detalleIngresos = typeof empleado.ingresos === 'string' 
          ? empleado.ingresos : JSON.stringify(empleado.ingresos || []);
          
        const detalleDeducciones = typeof empleado.deducciones === 'string' 
          ? empleado.deducciones : JSON.stringify(empleado.deducciones || []);
        
        console.log(`Creando detalle para empleado ID ${empleado.id}`);
        
        const [detalle] = await db.insert(nominaDetalles)
          .values({
            nominaId: nuevaNomina.id,
            empleadoId: empleado.id,
            salarioBase,
            totalIngresos,
            totalDeducciones,
            salarioNeto,
            detalleIngresos,
            detalleDeducciones,
            estado: EstadoNomina.PENDIENTE,
            fechaGeneracion: new Date()
          })
          .returning();
        return detalle;
      });
      
      // Esperar a que se creen todos los detalles
      const detallesNomina = await Promise.all(detallesPromises);
      
      console.log(`${detallesNomina.length} detalles de nómina creados`);
      
      // Retornar la nómina creada con sus detalles
      return res.status(201).json({
        ...nuevaNomina,
        empleados: detallesNomina
      });
    } catch (dbError: any) {
      console.error('Error en la operación de BD:', dbError);
      console.error('Stack trace:', dbError.stack);
      throw dbError; // Re-throw para el manejo global de errores
    }
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

// Obtener URL del desprendible de nómina
nominaRouter.get('/:id/desprendible-url', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const nominaId = parseInt(id);
    
    // Buscar en la tabla de detalles de nómina si hay un PDF guardado
    const [detalle] = await db.select({
      pdfUrl: nominaDetalles.pdfUrl,
      empleadoId: nominaDetalles.empleadoId,
      nominaId: nominaDetalles.nominaId
    })
    .from(nominaDetalles)
    .where(eq(nominaDetalles.nominaId, nominaId))
    .limit(1);
    
    if (!detalle) {
      return res.status(404).json({ error: 'Detalle de nómina no encontrado' });
    }
    
    // Si ya existe una URL guardada, devolverla
    if (detalle.pdfUrl) {
      return res.status(200).json({ pdfUrl: detalle.pdfUrl });
    }
    
    // Si no, generamos una URL basada en el ID de la nómina y el empleado
    const pdfUrl = `/api/nomina/${nominaId}/desprendible`;
    
    return res.status(200).json({
      pdfUrl,
      generado: false,
      mensaje: 'El desprendible se generará en tiempo real'
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
    const nominaId = parseInt(id);
    
    // Verificar si existe un PDF guardado para esta nómina
    const [detalle] = await db.select({
      pdfUrl: nominaDetalles.pdfUrl,
      empleadoId: nominaDetalles.empleadoId,
      nominaId: nominaDetalles.nominaId,
      salarioBase: nominaDetalles.salarioBase,
      totalIngresos: nominaDetalles.totalIngresos,
      totalDeducciones: nominaDetalles.totalDeducciones,
      salarioNeto: nominaDetalles.salarioNeto,
      detalleIngresos: nominaDetalles.detalleIngresos,
      detalleDeducciones: nominaDetalles.detalleDeducciones,
      fechaGeneracion: nominaDetalles.fechaGeneracion
    })
    .from(nominaDetalles)
    .where(eq(nominaDetalles.nominaId, nominaId))
    .limit(1);
    
    if (!detalle) {
      return res.status(404).json({ error: 'Detalle de nómina no encontrado' });
    }
    
    // Si hay una URL de PDF guardada, intentar enviar ese archivo
    if (detalle.pdfUrl && detalle.pdfUrl.startsWith('/uploads/')) {
      const pdfPath = path.resolve(`.${detalle.pdfUrl}`);
      
      if (fs.existsSync(pdfPath)) {
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename="desprendible-${nominaId}.pdf"`);
        
        const fileStream = fs.createReadStream(pdfPath);
        return fileStream.pipe(res);
      }
    }
    
    // Si no hay un PDF o no se encuentra, generamos uno nuevo
    // Obtener datos adicionales
    const [empleado] = await db.select()
      .from(employees)
      .where(eq(employees.id, detalle.empleadoId));
      
    const [cabeceraNomina] = await db.select()
      .from(nominas)
      .where(eq(nominas.id, detalle.nominaId));
    
    if (!empleado || !cabeceraNomina) {
      return res.status(404).json({ error: 'Datos incompletos para generar el desprendible' });
    }
    
    // Parsear los datos de ingresos y deducciones
    const ingresos = JSON.parse(detalle.detalleIngresos || '[]');
    const deducciones = JSON.parse(detalle.detalleDeducciones || '[]');
    
    // Preparar directorio para PDFs
    const pdfDir = path.resolve('./uploads/nomina');
    if (!fs.existsSync(pdfDir)) {
      fs.mkdirSync(pdfDir, { recursive: true });
    }
    
    // Generar nombre para el archivo
    const nombreArchivo = `desprendible-${detalle.nominaId}-${detalle.empleadoId}.pdf`;
    const rutaArchivo = path.join(pdfDir, nombreArchivo);
    
    // Crear PDF
    const doc = new PDFDocument({ margin: 50 });
    
    // Pipe el PDF a un archivo en el servidor y a la respuesta HTTP
    const writeStream = fs.createWriteStream(rutaArchivo);
    doc.pipe(writeStream);
    doc.pipe(res);
    
    // Configurar headers para descarga
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${nombreArchivo}"`);
    
    // Añadir contenido al PDF
    const nombreEmpleado = `${empleado.firstName || ''} ${empleado.lastName || ''}`.trim();
    const periodoStr = `${new Date(cabeceraNomina.periodoInicio).toLocaleDateString()} al ${new Date(cabeceraNomina.periodoFin).toLocaleDateString()}`;
    
    // Título y encabezado
    doc.fontSize(25).text('Desprendible de Nómina', { align: 'center' });
    doc.moveDown();
    
    doc.fontSize(12).text(`Empleado: ${nombreEmpleado}`);
    doc.fontSize(10).text(`Período: ${periodoStr}`);
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
    
    // Incluir el salario base como primer ingreso si no está en el detalle
    if (!ingresos.some((i: any) => i.nombre === 'Salario base')) {
      doc.fontSize(10).text('Salario base', { continued: true, width: 300 });
      doc.text(`$${parseFloat(detalle.salarioBase).toLocaleString('es-CO')}`, { align: 'right' });
    }
    
    ingresos.forEach((ingreso: any) => {
      doc.fontSize(10).text(ingreso.nombre, { continued: true, width: 300 });
      doc.text(`$${parseFloat(ingreso.valor).toLocaleString('es-CO')}`, { align: 'right' });
    });
    
    doc.moveDown();
    doc.fontSize(12).text('Total Ingresos:', { continued: true, width: 300 });
    doc.text(`$${parseFloat(detalle.totalIngresos).toLocaleString('es-CO')}`, { align: 'right' });
    doc.moveDown();
    
    // Línea divisoria
    doc.moveTo(50, doc.y)
       .lineTo(550, doc.y)
       .stroke();
    doc.moveDown();
    
    // Deducciones
    doc.fontSize(14).text('Deducciones', { underline: true });
    doc.moveDown(0.5);
    
    deducciones.forEach((deduccion: any) => {
      doc.fontSize(10).text(deduccion.nombre, { continued: true, width: 300 });
      doc.text(`$${parseFloat(deduccion.valor).toLocaleString('es-CO')}`, { align: 'right' });
    });
    
    doc.moveDown();
    doc.fontSize(12).text('Total Deducciones:', { continued: true, width: 300 });
    doc.text(`$${parseFloat(detalle.totalDeducciones).toLocaleString('es-CO')}`, { align: 'right' });
    doc.moveDown();
    
    // Línea divisoria
    doc.moveTo(50, doc.y)
       .lineTo(550, doc.y)
       .stroke();
    doc.moveDown();
    
    // Total a pagar
    doc.fontSize(14).text('Salario Neto a Pagar:', { continued: true, width: 300 });
    doc.text(`$${parseFloat(detalle.salarioNeto).toLocaleString('es-CO')}`, { align: 'right' });
    
    // Agregar método de pago y fecha
    doc.moveDown(2);
    doc.fontSize(10).text(`Método de pago: ${cabeceraNomina.metodoPago}`);
    doc.fontSize(10).text(`Fecha de pago: ${new Date(cabeceraNomina.fechaPago).toLocaleDateString()}`);
    
    // Finalizar PDF
    doc.end();
    
    // Guardar la ruta del PDF en la base de datos para futuras consultas
    const pdfUrl = `/uploads/nomina/${nombreArchivo}`;
    await db.update(nominaDetalles)
      .set({ pdfUrl })
      .where(and(
        eq(nominaDetalles.nominaId, detalle.nominaId),
        eq(nominaDetalles.empleadoId, detalle.empleadoId)
      ));
    
    // No necesitamos return ya que el stream se está enviando directamente
  } catch (error: any) {
    console.error(`Error al descargar desprendible ${req.params.id}:`, error);
    return res.status(500).json({ 
      error: 'Error al descargar el desprendible',
      details: error.message
    });
  }
});

export default nominaRouter;