import { Router, Request, Response } from 'express';
import { db } from '../db';
import { and, count, eq, like, sql } from 'drizzle-orm';
import { users, employees } from '@shared/schema';
import { z } from 'zod';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

// Configuración de multer para subida de archivos
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = path.join(__dirname, '../../uploads/contratos');
    // Asegurarnos de que el directorio existe
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    // Generar un nombre único para el archivo
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, 'contrato-' + uniqueSuffix + ext);
  }
});

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB máximo
  fileFilter: function (req, file, cb) {
    // Validar tipos de archivo (PDF, DOCX)
    const filetypes = /pdf|docx|doc/;
    const mimetype = filetypes.test(file.mimetype);
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    
    if (mimetype && extname) {
      return cb(null, true);
    }
    cb(new Error("Solo se permiten archivos PDF o DOCX"));
  }
});

// Esquema para validar la creación de empleado
const crearEmpleadoSchema = z.object({
  userId: z.number().int().positive(),
  position: z.string().min(1),
  department: z.string().min(1),
  hireDate: z.coerce.date(),
  salary: z.string().min(1),
  phoneNumber: z.string().optional(),
  address: z.string().optional(),
  emergencyContact: z.string().optional(),
  contractStatus: z.string().default('active'),
  contractType: z.enum(['fulltime', 'parttime', 'contractor']),
  identification: z.string().min(1),
  baseBenefits: z.string().optional(),
  baseDeductions: z.string().optional(),
  taxRate: z.string().optional(),
  bankAccount: z.string().optional(),
  paymentMethod: z.string().optional(),
  healthInsurance: z.string().optional(),
  vacationDays: z.number().int().optional(),
  contratoUrl: z.string().optional(),
  tipoPago: z.string().optional(),
  fechaInicioNomina: z.coerce.date().optional(),
  projectIds: z.array(z.number()).optional()
});

// Esquema para validar la actualización de empleado
const actualizarEmpleadoSchema = crearEmpleadoSchema.partial();

// Esquema para validar el cambio de estado de un empleado
const cambiarEstadoSchema = z.object({
  estado: z.enum(['active', 'inactive', 'on_leave', 'terminated'])
});

const empleadosRouter = Router();

// Crear ruta explícita para listar
empleadosRouter.get('/listar', async (req: Request, res: Response) => {
  try {
    const { page = '1', pageSize = '10', contractStatus, department, search } = req.query;
    const pageNum = parseInt(page as string);
    const pageSizeNum = parseInt(pageSize as string);
    const offset = (pageNum - 1) * pageSizeNum;
    
    // Condiciones para filtros
    const conditions: any[] = [];
    
    if (contractStatus) {
      conditions.push(eq(employees.contractStatus, contractStatus as string));
    }
    
    if (department) {
      conditions.push(eq(employees.department, department as string));
    }
    
    // Consulta para contar el total de registros
    const totalQuery = db.select({ count: count() }).from(employees);
    
    if (conditions.length > 0) {
      totalQuery.where(and(...conditions));
    }
    
    const [totalResult] = await totalQuery;
    const totalItems = Number(totalResult?.count || 0);
    
    // Consulta para obtener los empleados con paginación
    const empleadosQuery = db
      .select({
        id: employees.id,
        userId: employees.userId,
        position: employees.position,
        department: employees.department,
        hireDate: employees.hireDate,
        salary: employees.salary,
        phoneNumber: employees.phoneNumber,
        address: employees.address, 
        emergencyContact: employees.emergencyContact,
        contractStatus: employees.contractStatus,
        contractType: employees.contractType,
        identification: employees.identification,
        baseBenefits: employees.baseBenefits,
        baseDeductions: employees.baseDeductions,
        taxRate: employees.taxRate,
        bankAccount: employees.bankAccount,
        paymentMethod: employees.paymentMethod,
        healthInsurance: employees.healthInsurance,
        vacationDays: employees.vacationDays,
        contratoUrl: employees.contratoUrl,
        tipoPago: employees.tipoPago,
        fechaInicioNomina: employees.fechaInicioNomina,
        fullName: users.fullName
      })
      .from(employees)
      .leftJoin(users, eq(employees.userId, users.id));
    
    if (conditions.length > 0) {
      empleadosQuery.where(and(...conditions));
    }
    
    // Si hay búsqueda, aplicarla sobre el nombre o identificación
    if (search) {
      empleadosQuery.where(
        sql`(${users.fullName} ILIKE ${`%${search}%`} OR ${employees.identification} ILIKE ${`%${search}%`})`
      );
    }
    
    const data = await empleadosQuery
      .limit(pageSizeNum)
      .offset(offset)
      .orderBy(employees.id);
    
    // Calcular el total de páginas
    const totalPages = Math.ceil(Number(totalItems) / pageSizeNum);
    
    return res.status(200).json({
      empleados: data,
      pagination: {
        page: pageNum,
        pageSize: pageSizeNum,
        totalItems: Number(totalItems),
        totalPages
      }
    });
  } catch (error) {
    console.error('Error al obtener empleados:', error);
    return res.status(500).json({ error: 'Error al obtener los empleados' });
  }
});

// Obtener todos los empleados (con filtros opcionales) - ruta raíz
empleadosRouter.get('/', async (req: Request, res: Response) => {
  try {
    const { page = '1', pageSize = '10', contractStatus, department, search } = req.query;
    const pageNum = parseInt(page as string);
    const pageSizeNum = parseInt(pageSize as string);
    const offset = (pageNum - 1) * pageSizeNum;
    
    // Construir condiciones de filtro
    const conditions = [];
    
    if (contractStatus) {
      conditions.push(eq(employees.contractStatus, contractStatus as string));
    }
    
    if (department) {
      conditions.push(eq(employees.department, department as string));
    }
    
    // Consulta para contar el total de registros
    const totalQuery = db.select({ count: count() }).from(employees);
    
    if (conditions.length > 0) {
      totalQuery.where(and(...conditions));
    }
    
    const [totalResult] = await totalQuery;
    const totalItems = Number(totalResult?.count || 0);
    
    // Consulta para obtener los empleados con paginación
    const empleadosQuery = db
      .select({
        id: employees.id,
        userId: employees.userId,
        position: employees.position,
        department: employees.department,
        hireDate: employees.hireDate,
        salary: employees.salary,
        phoneNumber: employees.phoneNumber,
        address: employees.address, 
        emergencyContact: employees.emergencyContact,
        contractStatus: employees.contractStatus,
        contractType: employees.contractType,
        identification: employees.identification,
        baseBenefits: employees.baseBenefits,
        baseDeductions: employees.baseDeductions,
        taxRate: employees.taxRate,
        bankAccount: employees.bankAccount,
        paymentMethod: employees.paymentMethod,
        healthInsurance: employees.healthInsurance,
        vacationDays: employees.vacationDays,
        contratoUrl: employees.contratoUrl,
        tipoPago: employees.tipoPago,
        fechaInicioNomina: employees.fechaInicioNomina,
        fullName: users.fullName
      })
      .from(employees)
      .leftJoin(users, eq(employees.userId, users.id));
    
    if (conditions.length > 0) {
      empleadosQuery.where(and(...conditions));
    }
    
    // Si hay búsqueda, aplicarla sobre el nombre o identificación
    if (search) {
      empleadosQuery.where(
        sql`(${users.fullName} ILIKE ${`%${search}%`} OR ${employees.identification} ILIKE ${`%${search}%`})`
      );
    }
    
    const data = await empleadosQuery
      .limit(pageSizeNum)
      .offset(offset)
      .orderBy(employees.id);
    
    // Calcular el total de páginas
    const totalPages = Math.ceil(Number(totalItems) / pageSizeNum);
    
    return res.status(200).json({
      empleados: data,
      pagination: {
        page: pageNum,
        pageSize: pageSizeNum,
        totalItems: Number(totalItems),
        totalPages
      }
    });
  } catch (error) {
    console.error('Error al obtener empleados:', error);
    return res.status(500).json({ error: 'Error al obtener los empleados' });
  }
});

// Obtener un empleado por su ID - Se coloca DESPUÉS de la ruta específica de "listar"
empleadosRouter.get('/:id([0-9]+)', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    const [empleado] = await db
      .select({
        id: employees.id,
        userId: employees.userId,
        position: employees.position,
        department: employees.department,
        hireDate: employees.hireDate,
        salary: employees.salary,
        phoneNumber: employees.phoneNumber,
        address: employees.address, 
        emergencyContact: employees.emergencyContact,
        contractStatus: employees.contractStatus,
        contractType: employees.contractType,
        identification: employees.identification,
        baseBenefits: employees.baseBenefits,
        baseDeductions: employees.baseDeductions,
        taxRate: employees.taxRate,
        bankAccount: employees.bankAccount,
        paymentMethod: employees.paymentMethod,
        healthInsurance: employees.healthInsurance,
        vacationDays: employees.vacationDays,
        contratoUrl: employees.contratoUrl,
        tipoPago: employees.tipoPago,
        fechaInicioNomina: employees.fechaInicioNomina,
        fullName: users.fullName,
        email: users.email
      })
      .from(employees)
      .leftJoin(users, eq(employees.userId, users.id))
      .where(eq(employees.id, parseInt(id)));
    
    if (!empleado) {
      return res.status(404).json({ error: 'Empleado no encontrado' });
    }
    
    return res.status(200).json(empleado);
  } catch (error) {
    console.error(`Error al obtener empleado con ID ${req.params.id}:`, error);
    return res.status(500).json({ error: 'Error al obtener los datos del empleado' });
  }
});

// Crear un nuevo empleado
empleadosRouter.post('/', async (req: Request, res: Response) => {
  try {
    // Validar los datos recibidos
    const validacionResultado = crearEmpleadoSchema.safeParse(req.body);
    
    if (!validacionResultado.success) {
      return res.status(400).json({ 
        error: 'Datos de empleado inválidos',
        details: validacionResultado.error.format() 
      });
    }
    
    const datosEmpleado = validacionResultado.data;
    
    // Verificar que el usuario existe
    const [usuario] = await db.select()
      .from(users)
      .where(eq(users.id, datosEmpleado.userId));
    
    if (!usuario) {
      return res.status(400).json({ error: `No se encontró el usuario con ID ${datosEmpleado.userId}` });
    }
    
    // Verificar que no exista otro empleado con la misma identificación
    const [empleadoExistente] = await db.select()
      .from(employees)
      .where(eq(employees.identification, datosEmpleado.identification));
    
    if (empleadoExistente) {
      return res.status(400).json({ error: `Ya existe un empleado con la identificación ${datosEmpleado.identification}` });
    }
    
    // Insertar el nuevo empleado
    const [nuevoEmpleado] = await db.insert(employees)
      .values(datosEmpleado)
      .returning();
    
    return res.status(201).json(nuevoEmpleado);
  } catch (error) {
    console.error('Error al crear empleado:', error);
    return res.status(500).json({ error: 'Error al crear el empleado' });
  }
});

// Subir contrato para empleado
empleadosRouter.post('/contrato', upload.single('contrato'), async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No se ha subido ningún archivo' });
    }
    
    // Generar la URL del archivo (relativa al servidor)
    const fileUrl = `/uploads/contratos/${req.file.filename}`;
    
    // Si se proporciona un ID de empleado, actualizar su registro
    const empleadoId = req.body.empleadoId;
    
    if (empleadoId) {
      const [empleado] = await db.select()
        .from(employees)
        .where(eq(employees.id, parseInt(empleadoId)));
      
      if (!empleado) {
        return res.status(404).json({ error: 'Empleado no encontrado' });
      }
      
      // Si el empleado ya tenía un contrato, eliminar el archivo anterior
      if (empleado.contratoUrl) {
        const rutaAnterior = path.join(__dirname, '../../', empleado.contratoUrl);
        if (fs.existsSync(rutaAnterior)) {
          fs.unlinkSync(rutaAnterior);
        }
      }
      
      // Actualizar el empleado con la nueva URL del contrato
      await db.update(employees)
        .set({ contratoUrl: fileUrl })
        .where(eq(employees.id, parseInt(empleadoId)));
    }
    
    return res.status(200).json({ 
      url: fileUrl,
      message: 'Archivo subido correctamente' 
    });
  } catch (error) {
    console.error('Error al subir contrato:', error);
    return res.status(500).json({ error: 'Error al subir el contrato' });
  }
});

// Actualizar un empleado existente
empleadosRouter.patch('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    // Validar los datos recibidos
    const validacionResultado = actualizarEmpleadoSchema.safeParse(req.body);
    
    if (!validacionResultado.success) {
      return res.status(400).json({ 
        error: 'Datos de empleado inválidos',
        details: validacionResultado.error.format() 
      });
    }
    
    const datosActualizacion = validacionResultado.data;
    
    // Verificar que el empleado existe
    const [empleadoExistente] = await db.select()
      .from(employees)
      .where(eq(employees.id, parseInt(id)));
    
    if (!empleadoExistente) {
      return res.status(404).json({ error: 'Empleado no encontrado' });
    }
    
    // Si se actualiza el userId, verificar que el usuario existe
    if (datosActualizacion.userId) {
      const [usuario] = await db.select()
        .from(users)
        .where(eq(users.id, datosActualizacion.userId));
      
      if (!usuario) {
        return res.status(400).json({ error: `No se encontró el usuario con ID ${datosActualizacion.userId}` });
      }
    }
    
    // Si se actualiza la identificación, verificar que no exista otro empleado con esa identificación
    if (datosActualizacion.identification && 
        datosActualizacion.identification !== empleadoExistente.identification) {
      const [empleadoConIdentificacion] = await db.select()
        .from(employees)
        .where(
          and(
            eq(employees.identification, datosActualizacion.identification),
            sql`${employees.id} != ${parseInt(id)}`
          )
        );
      
      if (empleadoConIdentificacion) {
        return res.status(400).json({ 
          error: `Ya existe otro empleado con la identificación ${datosActualizacion.identification}` 
        });
      }
    }
    
    // Actualizar el empleado
    const [empleadoActualizado] = await db.update(employees)
      .set({
        ...datosActualizacion,
        // Siempre actualizar la fecha de modificación si existiera
      })
      .where(eq(employees.id, parseInt(id)))
      .returning();
    
    return res.status(200).json(empleadoActualizado);
  } catch (error) {
    console.error(`Error al actualizar empleado con ID ${req.params.id}:`, error);
    return res.status(500).json({ error: 'Error al actualizar los datos del empleado' });
  }
});

// Cambiar el estado de un empleado
empleadosRouter.patch('/:id/estado', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    // Validar los datos recibidos
    const validacionResultado = cambiarEstadoSchema.safeParse(req.body);
    
    if (!validacionResultado.success) {
      return res.status(400).json({ 
        error: 'Datos de estado inválidos',
        details: validacionResultado.error.format() 
      });
    }
    
    const { estado } = validacionResultado.data;
    
    // Verificar que el empleado existe
    const [empleadoExistente] = await db.select()
      .from(employees)
      .where(eq(employees.id, parseInt(id)));
    
    if (!empleadoExistente) {
      return res.status(404).json({ error: 'Empleado no encontrado' });
    }
    
    // Actualizar el estado del empleado
    const [empleadoActualizado] = await db.update(employees)
      .set({ contractStatus: estado })
      .where(eq(employees.id, parseInt(id)))
      .returning();
    
    return res.status(200).json(empleadoActualizado);
  } catch (error) {
    console.error(`Error al cambiar estado del empleado con ID ${req.params.id}:`, error);
    return res.status(500).json({ error: 'Error al cambiar el estado del empleado' });
  }
});

// Eliminar un empleado (desactivar)
empleadosRouter.delete('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    // Verificar que el empleado existe
    const [empleadoExistente] = await db.select()
      .from(employees)
      .where(eq(employees.id, parseInt(id)));
    
    if (!empleadoExistente) {
      return res.status(404).json({ error: 'Empleado no encontrado' });
    }
    
    // En lugar de eliminar, cambiamos el estado a inactivo
    const [empleadoDesactivado] = await db.update(employees)
      .set({ contractStatus: 'terminated' })
      .where(eq(employees.id, parseInt(id)))
      .returning();
    
    return res.status(200).json({
      message: 'Empleado eliminado correctamente',
      empleado: empleadoDesactivado
    });
  } catch (error) {
    console.error(`Error al eliminar empleado con ID ${req.params.id}:`, error);
    return res.status(500).json({ error: 'Error al eliminar el empleado' });
  }
});

export default empleadosRouter;