import { Router, Request, Response } from 'express';
import { db } from '../db';
import { and, count, eq, like, sql } from 'drizzle-orm';
import { users, employees } from '@shared/schema';
import { z } from 'zod';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
// En entornos de ESM modernos, usamos path.resolve directamente en lugar de __dirname

// Configuración de multer para subida de archivos
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // Usar path.resolve para crear una ruta absoluta desde la raíz del proyecto
    const uploadDir = path.resolve('./uploads/contratos');
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
  storage,
  fileFilter: function (req, file, cb) {
    // Verificar extensiones permitidas
    const filetypes = /pdf|doc|docx/;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = filetypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Solo se permiten archivos PDF, DOC o DOCX'));
    }
  },
  limits: {
    fileSize: 5 * 1024 * 1024 // Límite de 5MB
  }
});

// Esquema para validar la creación de empleado
const crearEmpleadoSchema = z.object({
  userId: z.number().int(),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  skills: z.string().optional(),
  position: z.string(),
  department: z.string(),
  hireDate: z.coerce.date(),
  salary: z.string(),
  phoneNumber: z.string().optional(),
  address: z.string().optional(),
  emergencyContact: z.string().optional(),
  contractStatus: z.string().default('active'),
  contractType: z.string().default('fulltime'),
  identification: z.string().optional(),
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
    
    // Total de registros con los filtros aplicados
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
        firstName: employees.firstName,
        lastName: employees.lastName,
        skills: employees.skills,
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
    const query = db.select({
      id: employees.id,
      userId: employees.userId,
      firstName: employees.firstName,
      lastName: employees.lastName,
      skills: employees.skills,
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
      query.where(and(...conditions));
    }
    
    // Si hay búsqueda, aplicarla sobre el nombre o identificación
    if (search) {
      query.where(
        sql`(${users.fullName} ILIKE ${`%${search}%`} OR ${employees.identification} ILIKE ${`%${search}%`})`
      );
    }
    
    const data = await query
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

// Obtener un empleado por ID
empleadosRouter.get('/:id', async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    const [empleado] = await db
      .select({
        id: employees.id,
        userId: employees.userId,
        firstName: employees.firstName,
        lastName: employees.lastName,
        skills: employees.skills,
        fullName: users.fullName,
        email: users.email,
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
        fechaInicioNomina: employees.fechaInicioNomina
      })
      .from(employees)
      .leftJoin(users, eq(employees.userId, users.id))
      .where(eq(employees.id, id));
    
    if (!empleado) {
      return res.status(404).json({ error: 'Empleado no encontrado' });
    }
    
    // Obtener proyectos asignados al empleado
    // ... lógica para obtener proyectos ...
    
    return res.status(200).json(empleado);
  } catch (error) {
    console.error('Error al obtener empleado:', error);
    return res.status(500).json({ error: 'Error al obtener el empleado' });
  }
});

// Crear un nuevo empleado
empleadosRouter.post('/', async (req: Request, res: Response) => {
  try {
    const datosEmpleado = crearEmpleadoSchema.parse(req.body);
    
    // Verificar que el usuario existe
    const [usuario] = await db
      .select()
      .from(users)
      .where(eq(users.id, datosEmpleado.userId));
    
    if (!usuario) {
      return res.status(400).json({ error: 'El usuario asociado no existe' });
    }
    
    // Crear el empleado
    const [empleado] = await db
      .insert(employees)
      .values({
        userId: datosEmpleado.userId,
        firstName: datosEmpleado.firstName,
        lastName: datosEmpleado.lastName,
        skills: datosEmpleado.skills,
        position: datosEmpleado.position,
        department: datosEmpleado.department,
        hireDate: datosEmpleado.hireDate,
        salary: datosEmpleado.salary,
        phoneNumber: datosEmpleado.phoneNumber,
        address: datosEmpleado.address,
        emergencyContact: datosEmpleado.emergencyContact,
        contractStatus: datosEmpleado.contractStatus,
        contractType: datosEmpleado.contractType,
        identification: datosEmpleado.identification,
        baseBenefits: datosEmpleado.baseBenefits,
        baseDeductions: datosEmpleado.baseDeductions,
        taxRate: datosEmpleado.taxRate,
        bankAccount: datosEmpleado.bankAccount,
        paymentMethod: datosEmpleado.paymentMethod,
        healthInsurance: datosEmpleado.healthInsurance,
        vacationDays: datosEmpleado.vacationDays,
        contratoUrl: datosEmpleado.contratoUrl,
        tipoPago: datosEmpleado.tipoPago,
        fechaInicioNomina: datosEmpleado.fechaInicioNomina
      })
      .returning();
    
    // Asignar proyectos si se proporcionaron
    // ... lógica para asignar proyectos ...
    
    return res.status(201).json(empleado);
  } catch (error) {
    console.error('Error al crear empleado:', error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors });
    }
    return res.status(500).json({ error: 'Error al crear el empleado' });
  }
});

// Actualizar un empleado existente
empleadosRouter.patch('/:id', async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    const actualizaciones = actualizarEmpleadoSchema.parse(req.body);
    
    // Verificar que el empleado existe
    const [empleadoExistente] = await db
      .select()
      .from(employees)
      .where(eq(employees.id, id));
    
    if (!empleadoExistente) {
      return res.status(404).json({ error: 'Empleado no encontrado' });
    }
    
    // Actualizar el empleado
    const [empleadoActualizado] = await db
      .update(employees)
      .set(actualizaciones)
      .where(eq(employees.id, id))
      .returning();
    
    return res.status(200).json(empleadoActualizado);
  } catch (error) {
    console.error('Error al actualizar empleado:', error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors });
    }
    return res.status(500).json({ error: 'Error al actualizar el empleado' });
  }
});

// Cambiar el estado de un empleado
empleadosRouter.patch('/:id/estado', async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    const { estado } = cambiarEstadoSchema.parse(req.body);
    
    // Verificar que el empleado existe
    const [empleadoExistente] = await db
      .select()
      .from(employees)
      .where(eq(employees.id, id));
    
    if (!empleadoExistente) {
      return res.status(404).json({ error: 'Empleado no encontrado' });
    }
    
    // Actualizar solo el estado del empleado
    const [empleadoActualizado] = await db
      .update(employees)
      .set({ contractStatus: estado })
      .where(eq(employees.id, id))
      .returning();
    
    return res.status(200).json(empleadoActualizado);
  } catch (error) {
    console.error('Error al cambiar estado del empleado:', error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors });
    }
    return res.status(500).json({ error: 'Error al cambiar el estado del empleado' });
  }
});

// Eliminar un empleado (soft delete cambiando estado a 'terminated')
empleadosRouter.delete('/:id', async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    
    // Verificar que el empleado existe
    const [empleadoExistente] = await db
      .select()
      .from(employees)
      .where(eq(employees.id, id));
    
    if (!empleadoExistente) {
      return res.status(404).json({ error: 'Empleado no encontrado' });
    }
    
    // Realizar soft delete cambiando el estado
    const [empleadoTerminado] = await db
      .update(employees)
      .set({ contractStatus: 'terminated' })
      .where(eq(employees.id, id))
      .returning();
    
    return res.status(200).json({ message: 'Empleado eliminado correctamente', empleado: empleadoTerminado });
  } catch (error) {
    console.error('Error al eliminar empleado:', error);
    return res.status(500).json({ error: 'Error al eliminar el empleado' });
  }
});

// Subir contrato
empleadosRouter.post('/:id/contrato', upload.single('contrato'), async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    const file = req.file;
    
    if (!file) {
      return res.status(400).json({ error: 'No se ha proporcionado ningún archivo' });
    }
    
    // Verificar que el empleado existe
    const [empleadoExistente] = await db
      .select()
      .from(employees)
      .where(eq(employees.id, id));
    
    if (!empleadoExistente) {
      // Eliminar el archivo si no se encuentra el empleado
      fs.unlinkSync(file.path);
      return res.status(404).json({ error: 'Empleado no encontrado' });
    }
    
    // Convertir la ruta del archivo a URL relativa
    const fileUrl = `/uploads/contratos/${file.filename}`;
    
    // Guardar la URL del contrato en la base de datos
    await db
      .update(employees)
      .set({ contratoUrl: fileUrl })
      .where(eq(employees.id, id));
    
    return res.status(200).json({ message: 'Contrato subido correctamente', url: fileUrl });
  } catch (error) {
    console.error('Error al subir contrato:', error);
    return res.status(500).json({ error: 'Error al subir el contrato' });
  }
});

export default empleadosRouter;