import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertProjectSchema, insertTaskSchema, insertEmployeeSchema, insertSupplierSchema, insertBudgetSchema, facturasProyecto, insertEmpleadoNuevoSchema, nominas_nuevas, nomina_items, empleados, empleado_nomina, empleado_proyecto, projects, payments_log, users } from "@shared/schema";
import { eq, and, sql } from "drizzle-orm";
import { db } from "./db";
import express from "express";
import multer from "multer";
import path from "path";
import empleadosRouter from "./routes/empleados.updated.routes";
import nominaFinancieraRouter from "./routes/nomina.routes";
import proyectosRouter from "./routes/proyectos.routes";
import dashboardRouter from "./routes/dashboard.routes";
import employeeProjectsRouter from "./routes/employee-projects.routes";
import evaluacionesRouter from "./routes/evaluaciones.routes";
import capacitacionesRouter from "./routes/capacitaciones.routes";
import microLearningRouter from "./routes/microlearning.routes";
import authRouter from "./routes/auth.routes";
import { setupAuth } from "./auth";
import kpiRouter from "./routes/kpi.routes";
import habilidadesRouter from "./routes/habilidades.routes";
import recursosRouter from "./routes/recursos.routes";
import projectsSqlServerRouter from "./routes/projects.sqlserver.routes";
import nominaRouter from "./modules/nomina/routes";
import { empleadosRoutes } from "./modules/empleados/empleados.routes";
import { nominaRoutes } from "./modules/nomina/nomina.routes";
import empleadosAdvancedRouter, { exportRouter } from "./routes/empleados.routes";
import nominasAdvancedRouter from "./routes/nominas.routes";
import { verifyToken } from "./routes/auth.routes";
// import { requireAuth } from "./middleware/auth.middleware"; // Temporalmente deshabilitado
import { MailService } from '@sendgrid/mail';
import PDFDocument from 'pdfkit';
import fs from 'fs';

// Nueva arquitectura hexagonal
import { createEmpleadoRoutes } from "./interfaces/http/routes/empleados.routes";

// Initialize SendGrid
const mailService = new MailService();
if (process.env.SENDGRID_API_KEY) {
  mailService.setApiKey(process.env.SENDGRID_API_KEY);
}

// Configuración de multer para archivos de soporte
const storage_multer = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/facturas/')
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname))
  }
});

const upload = multer({ 
  storage: storage_multer,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB
  },
  fileFilter: function (req, file, cb) {
    const allowedTypes = /pdf|doc|docx|jpg|jpeg|png/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Solo se permiten archivos PDF, DOC, DOCX, JPG, JPEG, PNG'));
    }
  }
});

export async function registerRoutes(app: Express): Promise<Server> {
  // Servir archivos estáticos desde uploads
  app.use('/uploads', express.static('uploads'));

  // Configurar autenticación (IMPORTANTE: debe ir antes de las rutas)
  setupAuth(app);

  // Health check endpoint para Kubernetes
  app.get('/api/health', (req, res) => {
    res.status(200).json({ 
      status: 'healthy', 
      timestamp: new Date().toISOString(),
      service: 'xtask-platform' 
    });
  });

  // Rutas de autenticación adicionales
  app.use('/api/auth', authRouter);
  
  // ========== RUTAS SQL SERVER ==========
  // Rutas de proyectos (SQL Server compatible)
  app.use('/api/projects', projectsSqlServerRouter);
  // ======================================
  
  // ========== NUEVA ARQUITECTURA HEXAGONAL ==========
  // Rutas de empleados con arquitectura hexagonal
  app.use('/api/v2/empleados', createEmpleadoRoutes());
  // ==================================================
  
  // Rutas para módulo de KPIs
  app.use('/api/kpis', kpiRouter);
  
  // Rutas para módulo de habilidades
  app.use('/api/habilidades', habilidadesRouter);
  
  // Rutas para submódulo de recursos financieros
  app.use('/api/finanzas/recursos', recursosRouter);

  // Rutas de nómina financiera
  app.use('/api/nomina', nominaFinancieraRouter);
  
  // Rutas del nuevo módulo de Nómina
  app.use('/api/nomina-modulo', nominaRouter);
  
  // Rutas para empleados del módulo de Nómina (requieren autenticación)
  app.use('/api/empleados-nomina', verifyToken, empleadosRoutes);
  
  // Rutas para gestión de nóminas (requieren autenticación)
  app.use('/api/nominas', verifyToken, nominaRoutes);
  
  // Endpoint temporal para preview sin autenticación (desarrollo)
  app.use('/api/nominas-preview', nominaRoutes);
  
  // Rutas avanzadas para empleados individuales (temporalmente sin autenticación)
  app.use('/api/empleados', empleadosAdvancedRouter);
  
  // Rutas de exportación
  app.use('/api', exportRouter);
  
  // Rutas avanzadas para nóminas detalladas
  app.use('/api/nominas-detail', verifyToken, nominasAdvancedRouter);
  // Projects routes
  app.get("/api/projects", async (req, res) => {
    try {
      const projects = await storage.getAllProjects();
      res.json(projects);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });
  
  app.post("/api/projects", async (req, res) => {
    try {
      const parseResult = insertProjectSchema.safeParse(req.body);
      if (!parseResult.success) {
        return res.status(400).json({ message: "Invalid project data", errors: parseResult.error.errors });
      }
      
      const project = await storage.createProject(parseResult.data);
      res.status(201).json(project);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });
  
  app.get("/api/projects/:id", async (req, res) => {
    try {
      const project = await storage.getProject(parseInt(req.params.id));
      if (!project) {
        return res.status(404).json({ message: "Project not found" });
      }
      res.json(project);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Tasks routes
  app.get("/api/tasks", async (req, res) => {
    try {
      const projectId = req.query.projectId ? parseInt(req.query.projectId as string) : undefined;
      const tasks = await storage.getAllTasks(projectId);
      res.json(tasks);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });
  
  app.post("/api/tasks", async (req, res) => {
    try {
      const parseResult = insertTaskSchema.safeParse(req.body);
      if (!parseResult.success) {
        return res.status(400).json({ message: "Invalid task data", errors: parseResult.error.errors });
      }
      
      const task = await storage.createTask(parseResult.data);
      res.status(201).json(task);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });
  
  app.patch("/api/tasks/:id", async (req, res) => {
    try {
      const task = await storage.updateTask(parseInt(req.params.id), req.body);
      if (!task) {
        return res.status(404).json({ message: "Task not found" });
      }
      res.json(task);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Employees (HR) routes
  app.get("/api/employees", async (req, res) => {
    try {
      const employees = await storage.getAllEmployees();
      res.json(employees);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });
  
  app.post("/api/employees", async (req, res) => {
    try {
      const parseResult = insertEmployeeSchema.safeParse(req.body);
      if (!parseResult.success) {
        return res.status(400).json({ message: "Invalid employee data", errors: parseResult.error.errors });
      }
      
      const employee = await storage.createEmployee(parseResult.data);
      res.status(201).json(employee);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Suppliers routes
  app.get("/api/suppliers", async (req, res) => {
    try {
      const suppliers = await storage.getAllSuppliers();
      res.json(suppliers);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });
  
  app.post("/api/suppliers", async (req, res) => {
    try {
      const parseResult = insertSupplierSchema.safeParse(req.body);
      if (!parseResult.success) {
        return res.status(400).json({ message: "Invalid supplier data", errors: parseResult.error.errors });
      }
      
      const supplier = await storage.createSupplier(parseResult.data);
      res.status(201).json(supplier);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Financial transactions routes
  app.get("/api/transactions", async (req, res) => {
    try {
      const projectId = req.query.projectId ? parseInt(req.query.projectId as string) : undefined;
      const transactions = await storage.getAllTransactions(projectId);
      res.json(transactions);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });
  
  app.post("/api/transactions", async (req, res) => {
    try {
      // Usar el ID 1 como el usuario demo por defecto
      const transaction = await storage.createTransaction({
        ...req.body,
        requesterId: 1
      });
      res.status(201).json(transaction);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });
  
  app.patch("/api/transactions/:id/approve", async (req, res) => {
    try {
      // Usar el ID 1 como el usuario demo por defecto
      const transaction = await storage.approveTransaction(parseInt(req.params.id), 1);
      res.json(transaction);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });
  
  app.patch("/api/transactions/:id/reject", async (req, res) => {
    try {
      // Usar el ID 1 como el usuario demo por defecto
      const transaction = await storage.rejectTransaction(parseInt(req.params.id), 1);
      res.json(transaction);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Rutas para presupuestos - Implementación directa
  const presupuestosRouter = express.Router();
  
  // Obtener todos los presupuestos
  presupuestosRouter.get('/', async (req: Request, res: Response) => {
    try {
      const organizationId = Number(req.query.organizationId) || 1;
      const presupuestos = await storage.getAllBudgets(organizationId);
      
      // Transformar y añadir datos calculados (lógica simplificada)
      const result = presupuestos.map((presupuesto: any) => {
        // Parsear metadata para obtener campos financieros adicionales
        let metadata: any = {};
        if (presupuesto.metadata) {
          try {
            metadata = JSON.parse(presupuesto.metadata);
          } catch (e) {
            metadata = {};
          }
        }

        // En esta versión simplificada, asumimos que gastado es 0 o se encuentra en metadata
        // En una implementación completa, se debería cargar desde la BD o calcular desde transacciones
        const gastado = presupuesto.gastado || 0;
        
        // Usar porcentaje de ejecución de metadata o calcular: gastado / amount * 100
        const amount = parseFloat(presupuesto.amount);
        const porcentajeEjecucion = metadata.porcentajeEjecucion !== undefined 
          ? metadata.porcentajeEjecucion 
          : (gastado > 0 ? (gastado / amount) * 100 : 0);
        
        // Determinar estado basado en el porcentaje y el estado almacenado
        let estado = presupuesto.status === 'active' ? 'ACTIVO' : presupuesto.status.toUpperCase();
        if (porcentajeEjecucion >= 100) {
          estado = 'COMPLETADO';
        } else if (porcentajeEjecucion >= 75) {
          estado = 'ALERTA';
        }
        
        // Calcular valores monetarios basados en porcentajes
        const montoEjecucion = metadata.porcentajeEjecucion ? (amount * metadata.porcentajeEjecucion / 100) : null;
        const montoGarantia = metadata.porcentajeGarantia ? (amount * metadata.porcentajeGarantia / 100) : null;

        return {
          id: presupuesto.id,
          nombre: presupuesto.name,
          monto: amount,
          gastado: gastado,
          porcentajeEjecucion,
          porcentajeEjecucionMeta: metadata.porcentajeEjecucion || null,
          porcentajeGarantia: metadata.porcentajeGarantia || null,
          montoEjecucion,
          montoGarantia,
          reservasFinancieras: metadata.reservasFinancieras || null,
          estado,
          area: metadata.area || (presupuesto.departmentId ? `Departamento ${presupuesto.departmentId}` : 'General'),
          fechaInicio: presupuesto.startDate,
          fechaFin: presupuesto.endDate,
          createdAt: presupuesto.createdAt,
          updatedAt: presupuesto.updatedAt,
          createdBy: presupuesto.createdBy
        };
      });
      
      res.json(result);
    } catch (error: any) {
      console.error('Error al obtener presupuestos:', error);
      res.status(500).json({ error: 'Error al obtener presupuestos' });
    }
  });
  
  // Obtener un presupuesto por ID
  presupuestosRouter.get('/:id', async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const presupuesto = await storage.getBudget(id);
      
      if (!presupuesto) {
        return res.status(404).json({ error: 'Presupuesto no encontrado' });
      }
      
      // En esta versión simplificada, asumimos que gastado es 0 o se encuentra en metadata
      const gastado = presupuesto.gastado || 0;
      
      // Cálculo porcentaje de ejecución: gastado / amount * 100
      const amount = parseFloat(presupuesto.amount);
      const porcentajeEjecucion = gastado > 0 ? (gastado / amount) * 100 : 0;
      
      // Determinar estado basado en el porcentaje
      let estado = presupuesto.status === 'active' ? 'ACTIVO' : presupuesto.status.toUpperCase();
      if (porcentajeEjecucion >= 100) {
        estado = 'COMPLETADO';
      } else if (porcentajeEjecucion >= 75) {
        estado = 'ALERTA';
      }
      
      res.json({
        id: presupuesto.id,
        nombre: presupuesto.name,
        monto: amount,
        gastado: gastado,
        porcentajeEjecucion,
        estado,
        area: presupuesto.departmentId ? `Departamento ${presupuesto.departmentId}` : 'General',
        fechaInicio: presupuesto.startDate,
        fechaFin: presupuesto.endDate,
        createdAt: presupuesto.createdAt,
        updatedAt: presupuesto.updatedAt,
        createdBy: presupuesto.createdBy,
        description: presupuesto.description
      });
    } catch (error: any) {
      console.error('Error al obtener el presupuesto:', error);
      res.status(500).json({ error: 'Error al obtener el presupuesto' });
    }
  });
  
  // Crear un nuevo presupuesto
  presupuestosRouter.post('/', async (req: Request, res: Response) => {
    try {
      // Preparar metadata con los nuevos campos financieros
      const financialMetadata: any = {};
      if (req.body.porcentajeEjecucion !== undefined) {
        financialMetadata.porcentajeEjecucion = Number(req.body.porcentajeEjecucion);
      }
      if (req.body.porcentajeGarantia !== undefined) {
        financialMetadata.porcentajeGarantia = Number(req.body.porcentajeGarantia);
      }
      if (req.body.reservasFinancieras !== undefined) {
        financialMetadata.reservasFinancieras = Number(req.body.reservasFinancieras);
      }
      if (req.body.area) {
        financialMetadata.area = req.body.area;
      }

      // Transformar los datos para que coincidan con el schema
      const budgetData = {
        name: req.body.name,
        amount: String(req.body.amount), // Convertir a string para el campo decimal
        startDate: new Date(req.body.startDate), // Convertir a Date
        endDate: new Date(req.body.endDate), // Convertir a Date
        createdBy: Number(req.body.createdBy),
        organizationId: Number(req.body.organizationId) || 1,
        description: req.body.description || null,
        departmentId: req.body.departmentId || null,
        projectId: req.body.projectId || null,
        status: 'active',
        metadata: Object.keys(financialMetadata).length > 0 ? JSON.stringify(financialMetadata) : null
      };
      
      const parseResult = insertBudgetSchema.safeParse(budgetData);
      if (!parseResult.success) {
        return res.status(400).json({ 
          error: 'Datos de presupuesto inválidos', 
          errors: parseResult.error.errors 
        });
      }
      
      const presupuesto = await storage.createBudget(parseResult.data);
      
      // Parsear metadata para incluir los campos financieros en la respuesta
      let metadata: any = {};
      if (presupuesto.metadata) {
        try {
          metadata = JSON.parse(presupuesto.metadata);
        } catch (e) {
          metadata = {};
        }
      }
      
      // Calcular valores monetarios basados en porcentajes
      const amount = parseFloat(presupuesto.amount);
      const montoEjecucion = metadata.porcentajeEjecucion ? (amount * metadata.porcentajeEjecucion / 100) : null;
      const montoGarantia = metadata.porcentajeGarantia ? (amount * metadata.porcentajeGarantia / 100) : null;

      res.status(201).json({
        ...presupuesto,
        ...metadata,
        porcentajeEjecucion: metadata.porcentajeEjecucion || 0,
        montoEjecucion,
        montoGarantia,
        estado: 'ACTIVO'
      });
    } catch (error: any) {
      console.error('Error al crear presupuesto:', error);
      res.status(500).json({ error: `Error al crear el presupuesto: ${error.message}` });
    }
  });
  
  // Actualizar un presupuesto
  presupuestosRouter.patch('/:id', async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const presupuesto = await storage.getBudget(id);
      
      if (!presupuesto) {
        return res.status(404).json({ error: 'Presupuesto no encontrado' });
      }
      
      // En esta versión simplificada, asumimos que gastado es 0 o se encuentra en metadata
      const gastado = presupuesto.gastado || 0;
      
      // Cálculo porcentaje de ejecución: gastado / amount * 100
      const amount = parseFloat(presupuesto.amount);
      const porcentajeEjecucion = gastado > 0 ? (gastado / amount) * 100 : 0;
      
      // Verificar si se puede editar
      if (porcentajeEjecucion >= 100 || presupuesto.status === 'completed') {
        return res.status(400).json({ error: 'No se puede editar un presupuesto COMPLETADO' });
      }
      
      // Transformar los datos antes de actualizar
      const updateData: Record<string, any> = {};
      
      if (req.body.nombre) updateData.name = req.body.nombre;
      if (req.body.monto) updateData.amount = String(req.body.monto);
      if (req.body.area) updateData.departmentId = req.body.area.startsWith('Departamento ') ? 
        parseInt(req.body.area.replace('Departamento ', '')) : null;
      if (req.body.fechaInicio) updateData.startDate = new Date(req.body.fechaInicio);
      if (req.body.fechaFin) updateData.endDate = new Date(req.body.fechaFin);
      if (req.body.description) updateData.description = req.body.description;
      
      // Actualizar el presupuesto
      const updatedPresupuesto = await storage.updateBudget(id, updateData);
      
      // Recalcular con los nuevos valores
      const newGastado = updatedPresupuesto.gastado || gastado;
      const newAmount = parseFloat(updatedPresupuesto.amount);
      const newPorcentajeEjecucion = newGastado > 0 ? (newGastado / newAmount) * 100 : 0;
      
      let newEstado = updatedPresupuesto.status === 'active' ? 'ACTIVO' : updatedPresupuesto.status.toUpperCase();
      if (newPorcentajeEjecucion >= 100) {
        newEstado = 'COMPLETADO';
      } else if (newPorcentajeEjecucion >= 75) {
        newEstado = 'ALERTA';
      }
      
      res.json({
        id: updatedPresupuesto.id,
        nombre: updatedPresupuesto.name,
        monto: newAmount,
        gastado: newGastado,
        porcentajeEjecucion: newPorcentajeEjecucion,
        estado: newEstado,
        area: updatedPresupuesto.departmentId ? `Departamento ${updatedPresupuesto.departmentId}` : 'General',
        fechaInicio: updatedPresupuesto.startDate,
        fechaFin: updatedPresupuesto.endDate,
        createdAt: updatedPresupuesto.createdAt,
        updatedAt: updatedPresupuesto.updatedAt,
        createdBy: updatedPresupuesto.createdBy,
        description: updatedPresupuesto.description
      });
    } catch (error: any) {
      console.error('Error al actualizar el presupuesto:', error);
      res.status(500).json({ error: 'Error al actualizar el presupuesto' });
    }
  });
  
  // Registrar un gasto en un presupuesto
  presupuestosRouter.post('/:id/gastos', async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const { monto } = req.body;
      
      if (typeof monto !== 'number' || monto <= 0) {
        return res.status(400).json({ error: 'El monto debe ser un número positivo' });
      }
      
      const presupuesto = await storage.getBudget(id);
      
      if (!presupuesto) {
        return res.status(404).json({ error: 'Presupuesto no encontrado' });
      }
      
      // En esta versión simplificada, asumimos que gastado es 0 o se encuentra en metadata
      // En una implementación completa, consultaríamos los gastos de la tabla de transacciones
      const gastadoActual = presupuesto.gastado || 0;
      const montoTotal = parseFloat(presupuesto.amount);
      
      // Validar que no exceda el presupuesto
      const nuevoGastado = gastadoActual + monto;
      if (nuevoGastado > montoTotal) {
        return res.status(400).json({ 
          error: 'El gasto excede el presupuesto disponible' 
        });
      }
      
      // Crear metadatos actualizados para incluir el campo gastado
      let metadata = {};
      try {
        if (presupuesto.metadata) {
          metadata = JSON.parse(presupuesto.metadata);
        }
      } catch (e) {
        // Si no se puede parsear, iniciar con un objeto vacío
      }
      
      // Actualizar el presupuesto con el gasto en metadata
      const updateData = {
        gastado: nuevoGastado,
        // Si el porcentaje es 100% o más, actualizar el estado a "completed"
        status: nuevoGastado >= montoTotal ? 'completed' : presupuesto.status
      };
      
      const updatedPresupuesto = await storage.updateBudget(id, updateData);
      
      // Calcular nuevo estado y porcentaje
      const porcentajeEjecucion = (nuevoGastado / montoTotal) * 100;
      let estado = updatedPresupuesto.status === 'active' ? 'ACTIVO' : updatedPresupuesto.status.toUpperCase();
      if (porcentajeEjecucion >= 100) {
        estado = 'COMPLETADO';
      } else if (porcentajeEjecucion >= 75) {
        estado = 'ALERTA';
      }
      
      res.json({
        id: updatedPresupuesto.id,
        nombre: updatedPresupuesto.name,
        monto: montoTotal,
        gastado: nuevoGastado,
        porcentajeEjecucion,
        estado,
        area: updatedPresupuesto.departmentId ? `Departamento ${updatedPresupuesto.departmentId}` : 'General',
        fechaInicio: updatedPresupuesto.startDate,
        fechaFin: updatedPresupuesto.endDate,
        createdAt: updatedPresupuesto.createdAt,
        updatedAt: updatedPresupuesto.updatedAt
      });
    } catch (error: any) {
      console.error('Error al registrar el gasto:', error);
      res.status(500).json({ error: 'Error al registrar el gasto' });
    }
  });

  app.use('/api/presupuestos', presupuestosRouter);

  // Rutas de Nómina (Payroll) - API original, será reemplazado por router más completo
  const nominaLegacyRouter = express.Router();
  
  // Obtener empleados para nómina - Usando directamente el repositorio de DB
  // IMPORTANTE: Esta ruta debe estar antes de la integración del router de empleados
  nominaLegacyRouter.get('/empleados/listar', async (req: Request, res: Response) => {
    try {
      const { 
        page = '1', 
        pageSize = '10',
        search = '',
        contractStatus = '',
        department = ''
      } = req.query;
      
      const pageNum = parseInt(page as string);
      const pageSizeNum = parseInt(pageSize as string);
      const offset = (pageNum - 1) * pageSizeNum;
      
      // Log de los filtros recibidos para depuración
      console.log('Filtros recibidos:', { 
        page, 
        pageSize, 
        search, 
        contractStatus, 
        department 
      });
      
      // Obtenemos los empleados directamente desde la BD
      let empleados = await storage.getAllEmployees();
      
      // Aplicamos filtros
      if (search) {
        const searchLower = (search as string).toLowerCase();
        empleados = empleados.filter(emp => 
          emp.firstName?.toLowerCase().includes(searchLower) || 
          emp.lastName?.toLowerCase().includes(searchLower) ||
          emp.id?.toString().includes(searchLower) ||
          `${emp.firstName || ''} ${emp.lastName || ''}`.toLowerCase().includes(searchLower)
        );
      }
      
      if (contractStatus) {
        empleados = empleados.filter(emp => emp.contractStatus === contractStatus);
      }
      
      if (department) {
        empleados = empleados.filter(emp => emp.department === department);
      }
      
      // Calculamos el total de elementos y páginas
      const totalItems = empleados.length;
      const totalPages = Math.ceil(totalItems / pageSizeNum) || 1; // Aseguramos al menos 1 página
      
      // Paginamos los resultados
      const empleadosPaginados = empleados.slice(offset, offset + pageSizeNum);
      
      // Preparamos la respuesta con el nombre
      const empleadosFormateados = empleadosPaginados.map(emp => ({
        ...emp,
        nombre: `${emp.firstName || ''} ${emp.lastName || ''}`.trim() || `Empleado #${emp.id}`
      }));
      
      // Devolvemos la respuesta paginada
      res.status(200).json({
        empleados: empleadosFormateados,
        pagination: {
          page: pageNum,
          pageSize: pageSizeNum,
          totalItems,
          totalPages
        }
      });
      
      // Imprimimos logs para depuración
      console.log('Enviando respuesta paginada:', {
        filtrosAplicados: { search, contractStatus, department },
        totalSinFiltrar: (await storage.getAllEmployees()).length,
        totalFiltrado: empleados.length,
        paginados: empleadosPaginados.length,
        página: pageNum, 
        totalPáginas: totalPages
      });
    } catch (error: any) {
      console.error('Error en la ruta de obtener empleados:', error);
      res.status(500).json({ error: 'Error al obtener empleados' });
    }
  });
  
  // Integrar las rutas de empleados al router de nómina
  nominaLegacyRouter.use('/empleados', empleadosRouter);
  
  // Obtener nóminas con filtros - Implementación temporal
  nominaLegacyRouter.get('/', async (req: Request, res: Response) => {
    try {
      // Datos de muestra para responder sin error mientras se implementa la funcionalidad completa
      const nominas = [
        {
          id: 1,
          employeeId: 1,
          periodStart: new Date('2025-04-01'),
          periodEnd: new Date('2025-04-30'),
          grossSalary: '3500.00',
          netSalary: '2800.00',
          deductions: '500.00',
          benefits: '0.00',
          taxes: '200.00',
          status: 'PENDING',
          createdBy: 1,
          createdAt: new Date('2025-04-15'),
          updatedAt: new Date('2025-04-15'),
          calculationDetails: JSON.stringify({
            desglose: 'Detalles del cálculo...'
          }),
          nombreEmpleado: 'María Rodríguez'
        },
        {
          id: 2,
          employeeId: 2,
          periodStart: new Date('2025-04-01'),
          periodEnd: new Date('2025-04-30'),
          grossSalary: '4200.00',
          netSalary: '3300.00',
          deductions: '600.00',
          benefits: '0.00',
          taxes: '300.00',
          status: 'PENDING',
          createdBy: 1,
          createdAt: new Date('2025-04-15'),
          updatedAt: new Date('2025-04-15'),
          calculationDetails: JSON.stringify({
            desglose: 'Detalles del cálculo...'
          }),
          nombreEmpleado: 'Juan Pérez'
        }
      ];
      
      res.status(200).json({
        nominas: nominas,
        pagination: {
          page: 1,
          limit: 10,
          total: 2,
          totalPages: 1
        }
      });
    } catch (error: any) {
      console.error('Error en la ruta de obtener nóminas:', error);
      res.status(500).json({ error: 'Error al obtener las nóminas' });
    }
  });
  
  // Obtener una nómina por ID
  nominaLegacyRouter.get('/:id', async (req: Request, res: Response) => {
    try {
      // Implementación temporal mientras se crea el controlador
      const id = parseInt(req.params.id);
      
      // Datos de ejemplo para la respuesta
      const nomina = {
        id: id,
        employeeId: id,
        periodStart: new Date('2025-04-01'),
        periodEnd: new Date('2025-04-30'),
        grossSalary: '3500.00',
        netSalary: '2800.00',
        deductions: '500.00',
        benefits: '0.00',
        taxes: '200.00',
        status: 'PENDING',
        createdBy: 1,
        createdAt: new Date('2025-04-15'),
        updatedAt: new Date('2025-04-15'),
        calculationDetails: {
          desglose: 'Detalles del cálculo...'
        },
        nombreEmpleado: 'Empleado #' + id
      };
      
      res.status(200).json(nomina);
    } catch (error: any) {
      console.error(`Error en la ruta de obtener nómina por ID:`, error);
      res.status(500).json({ error: 'Error al obtener la nómina' });
    }
  });
  
  // Procesar la nómina
  nominaLegacyRouter.post('/procesar', async (req: Request, res: Response) => {
    try {
      // Implementación temporal mientras se crea el controlador
      const { empleadoId, fechaInicio, fechaFin } = req.body;
      
      if (!empleadoId || !fechaInicio || !fechaFin) {
        return res.status(400).json({ error: 'Datos incompletos para procesar la nómina' });
      }
      
      // Simular procesamiento exitoso
      const nomina = {
        id: Date.now(),
        employeeId: empleadoId,
        periodStart: new Date(fechaInicio),
        periodEnd: new Date(fechaFin),
        grossSalary: '3500.00',
        netSalary: '2800.00',
        deductions: '500.00',
        benefits: '0.00',
        taxes: '200.00',
        status: 'PENDING',
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      res.status(201).json({ success: true, nomina });
    } catch (error: any) {
      console.error('Error en la ruta de procesar nómina:', error);
      res.status(500).json({ error: 'Error al procesar la nómina' });
    }
  });
  
  // Marcar una nómina como pagada
  nominaLegacyRouter.post('/marcar-pagado/:id', async (req: Request, res: Response) => {
    try {
      // Implementación temporal mientras se crea el controlador
      const id = parseInt(req.params.id);
      
      if (isNaN(id)) {
        return res.status(400).json({ error: 'ID de nómina inválido' });
      }
      
      // Simular respuesta exitosa
      res.status(200).json({ 
        success: true, 
        message: `Nómina #${id} marcada como pagada`,
        nomina: {
          id: id,
          status: 'PAID',
          updatedAt: new Date()
        }
      });
    } catch (error: any) {
      console.error('Error en la ruta de marcar nómina como pagada:', error);
      res.status(500).json({ error: 'Error al marcar la nómina como pagada' });
    }
  });
  
  // Cambiar el estado de una nómina
  nominaLegacyRouter.post('/cambiar-estado/:id', async (req: Request, res: Response) => {
    try {
      // Implementación temporal mientras se crea el controlador
      const id = parseInt(req.params.id);
      const { nuevoEstado } = req.body;
      
      if (isNaN(id)) {
        return res.status(400).json({ error: 'ID de nómina inválido' });
      }
      
      if (!nuevoEstado) {
        return res.status(400).json({ error: 'Nuevo estado no especificado' });
      }
      
      // Validar que el estado sea válido
      const estadosValidos = ['PENDING', 'APPROVED', 'REJECTED', 'PAID', 'CANCELLED'];
      if (!estadosValidos.includes(nuevoEstado)) {
        return res.status(400).json({ 
          error: 'Estado inválido', 
          estadosValidos 
        });
      }
      
      // Simular respuesta exitosa
      res.status(200).json({ 
        success: true, 
        message: `Estado de nómina #${id} cambiado a ${nuevoEstado}`,
        nomina: {
          id: id,
          status: nuevoEstado,
          updatedAt: new Date()
        }
      });
    } catch (error: any) {
      console.error('Error en la ruta de cambiar estado de nómina:', error);
      res.status(500).json({ error: 'Error al cambiar el estado de la nómina' });
    }
  });
  
  // Generar un desprendible de nómina en PDF
  nominaLegacyRouter.get('/:id/desprendible', async (req: Request, res: Response) => {
    try {
      // Implementación temporal mientras se crea el controlador
      const id = parseInt(req.params.id);
      
      if (isNaN(id)) {
        return res.status(400).json({ error: 'ID de nómina inválido' });
      }
      
      // En lugar de generar un PDF real, enviamos un objeto JSON con los datos que se incluirían en el PDF
      // Cuando se implemente la funcionalidad completa, esto debería generar un PDF y enviarlo como respuesta
      res.status(200).json({
        success: true,
        message: 'Estos datos se usarán para generar el PDF',
        desprendible: {
          id: id,
          titulo: 'Comprobante de Pago',
          fecha: new Date().toLocaleDateString(),
          empleado: {
            nombre: 'Nombre del Empleado',
            identificacion: '12345678-9',
            cargo: 'Desarrollador',
            departamento: 'Tecnología'
          },
          periodo: {
            inicio: '01/04/2025',
            fin: '30/04/2025'
          },
          ingresos: {
            salarioBase: 3500.00,
            bonos: 0.00,
            beneficios: 0.00,
            totalIngresos: 3500.00
          },
          deducciones: {
            impuestos: 200.00,
            seguridadSocial: 250.00,
            otrasRetenciones: 50.00,
            totalDeducciones: 500.00
          },
          resumen: {
            totalIngresos: 3500.00,
            totalDeducciones: 500.00,
            salarioNeto: 3000.00
          }
        }
      });
    } catch (error: any) {
      console.error('Error en la ruta de generar desprendible de nómina:', error);
      res.status(500).json({ error: 'Error al generar el desprendible de nómina' });
    }
  });
  

  
  app.use('/api/nomina/empleados', empleadosRouter);

  // Legacy router para compatibilidad
  app.use('/api/nomina/legacy', nominaLegacyRouter);
  app.use('/api/proyectos', proyectosRouter);
  app.use('/api/dashboard', dashboardRouter);
  
  // Ruta para obtener todos los usuarios (necesaria para el formulario de empleados)
  app.get('/api/users', async (req, res) => {
    try {
      // Importar db y users
      const { db } = await import('./db');
      const { users } = await import('@shared/schema');
      
      // Obtener los usuarios reales de la base de datos
      const result = await db.select().from(users);
      
      // Transformar para mantener la estructura esperada por el frontend
      const formattedUsers = result.map(user => ({
        id: user.id,
        username: user.username,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
        isActive: user.isActive,
        createdAt: user.createdAt
      }));
      
      res.json(formattedUsers);
    } catch (error: any) {
      console.error('Error al obtener usuarios:', error);
      res.status(500).json({ error: 'Error al obtener los usuarios' });
    }
  });

  // Endpoint para crear un nuevo usuario
  app.post('/api/users', async (req, res) => {
    try {
      const { db } = await import('./db');
      const { users, insertUserSchema } = await import('@shared/schema');
      const bcrypt = await import('bcrypt');
      
      // Validar los datos de entrada
      const validation = insertUserSchema.safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({ 
          error: 'Datos inválidos', 
          details: validation.error.errors 
        });
      }
      
      const userData = validation.data;
      
      // Verificar si el usuario ya existe
      const existingUser = await db.select()
        .from(users)
        .where(eq(users.username, userData.username))
        .limit(1);
        
      if (existingUser.length > 0) {
        return res.status(400).json({ error: 'El nombre de usuario ya existe' });
      }
      
      // Verificar si el email ya existe
      const existingEmail = await db.select()
        .from(users)
        .where(eq(users.email, userData.email))
        .limit(1);
        
      if (existingEmail.length > 0) {
        return res.status(400).json({ error: 'El email ya está registrado' });
      }
      
      // Encriptar la contraseña
      const hashedPassword = await bcrypt.hash(userData.password, 10);
      
      // Crear el usuario
      const [newUser] = await db.insert(users).values({
        ...userData,
        password: hashedPassword,
        isActive: true,
        createdAt: new Date()
      }).returning();
      
      // Remover la contraseña de la respuesta
      const { password, ...userResponse } = newUser;
      
      res.status(201).json(userResponse);
    } catch (error: any) {
      console.error('Error al crear usuario:', error);
      res.status(500).json({ error: 'Error al crear el usuario' });
    }
  });
  
  // Datos de ejemplo para proyectos
  const proyectosEjemplo = [
    {
      id: 1,
      name: 'Desarrollo ERP',
      description: 'Desarrollo de sistema ERP para empresa manufacturera',
      startDate: '2025-01-01',
      endDate: '2025-12-31',
      budget: 50000,
      status: 'active'
    },
    {
      id: 2,
      name: 'Implementación CRM',
      description: 'Implementación de CRM para departamento de ventas',
      startDate: '2025-03-15',
      endDate: '2025-09-30',
      budget: 35000,
      status: 'active'
    },
    {
      id: 3,
      name: 'Rediseño Sitio Web',
      description: 'Rediseño completo del sitio web corporativo',
      startDate: '2025-02-01',
      endDate: '2025-05-31',
      budget: 15000,
      status: 'active'
    }
  ];
  
  // Usar datos reales de la base de datos para la ruta de proyectos
  app.get('/api/projects', async (req, res) => {
    try {
      // Importar db y projects
      const { db } = await import('./db');
      const { projects } = await import('@shared/schema');
      
      // Obtener todos los proyectos de la base de datos real
      const proyectosDB = await db
        .select()
        .from(projects)
        .orderBy(projects.id);
      
      res.json(proyectosDB);
    } catch (error: any) {
      console.error('Error al obtener proyectos:', error);
      res.status(500).json({ message: error.message });
    }
  });
  
  // Rutas para la relación entre empleados y proyectos
  app.use('/api/employee-projects', employeeProjectsRouter);
  
  // Rutas para el módulo de Recursos Humanos
  app.use('/api/evaluaciones', evaluacionesRouter);
  app.use('/api/capacitaciones', capacitacionesRouter);
  app.use('/api/microlearning', microLearningRouter);

  // API v1 para nómina
  const nominaV1Router = express.Router();
  
  // Endpoint para obtener datos del dashboard
  nominaV1Router.get('/dashboard', async (req: Request, res: Response) => {
    try {
      // Consultar datos reales de la base de datos
      const { db } = await import("./db");
      const { nominas, employees } = await import("@shared/schema");
      const { eq, desc, sql } = await import("drizzle-orm");
      
      // Obtener total de empleados activos
      const empleadosActivos = await db
        .select()
        .from(employees)
        .where(eq(employees.contractStatus, 'active'));
      
      const totalEmpleadosActivos = empleadosActivos.length;
      
      // Obtener nóminas pendientes
      const nominasPendientesDB = await db
        .select()
        .from(nominas)
        .where(eq(nominas.estado, 'PENDIENTE'));
      
      // Obtener nóminas recientes (últimas creadas)
      const nominasRecientesDB = await db
        .select()
        .from(nominas)
        .orderBy(desc(nominas.fechaCreacion))
        .limit(5);
      
      // Calcular último mes (para calcular nuevos empleados)
      const hoy = new Date();
      const mesAnterior = new Date(hoy);
      mesAnterior.setMonth(hoy.getMonth() - 1);
      
      // Obtener empleados contratados el último mes
      const empleadosNuevos = await db
        .select()
        .from(employees)
        .where(sql`${employees.hireDate} >= ${mesAnterior}`);
      
      // Calcular nómina mensual total (último mes)
      let nominaMensualTotal = 0;
      try {
        const ultimaNomina = await db
          .select()
          .from(nominas)
          .orderBy(desc(nominas.fechaCreacion))
          .limit(1);
        
        if (ultimaNomina.length > 0) {
          nominaMensualTotal = Number(ultimaNomina[0].montoTotal);
        }
      } catch (error) {
        console.error('Error al calcular nómina mensual:', error);
      }
      
      // Calcular próximo pago
      let proximoPago = {
        fecha: 'No hay pagos programados',
        diasRestantes: 0
      };
      
      try {
        const proximasNominas = await db
          .select()
          .from(nominas)
          .where(eq(nominas.estado, 'PENDIENTE'))
          .orderBy(nominas.fechaPago);
        
        if (proximasNominas.length > 0) {
          const fechaPago = new Date(proximasNominas[0].fechaPago);
          const diasRestantes = Math.max(0, Math.floor((fechaPago.getTime() - hoy.getTime()) / (1000 * 3600 * 24)));
          
          const options = { year: 'numeric', month: 'long', day: 'numeric' };
          proximoPago = {
            fecha: fechaPago.toLocaleDateString('es-ES', options as any),
            diasRestantes
          };
        }
      } catch (error) {
        console.error('Error al calcular próximo pago:', error);
      }
      
      // Formatear datos recientes para respuesta
      const nominasRecientes = nominasRecientesDB.map(nomina => ({
        id: nomina.id,
        titulo: nomina.titulo,
        estado: nomina.estado,
        fechaProcesamiento: new Date(nomina.fechaCreacion).toLocaleDateString('es-ES', {
          year: 'numeric', month: 'long', day: 'numeric'
        } as any)
      }));
      
      // Construcción de respuesta
      const dashboardData = {
        totalEmpleadosActivos,
        nuevosEmpleadosMes: empleadosNuevos.length,
        nominaMensualTotal,
        cambioNomina: {
          esIncremento: true,
          porcentaje: 0 // Temporalmente deshabilitado (requiere comparación con histórico)
        },
        proximoPago,
        nominasPendientes: nominasPendientesDB.length,
        nominasRecientes
      };
      
      res.status(200).json(dashboardData);
    } catch (error: any) {
      console.error('Error en dashboard de nómina:', error);
      res.status(500).json({ error: 'Error al obtener datos del dashboard' });
    }
  });
  
  // Endpoint para obtener detalle de una nómina específica
  nominaV1Router.get('/detalle/:id', async (req: Request, res: Response) => {
    try {
      const nominaId = Number(req.params.id);
      
      // Importar módulos necesarios
      const { db } = await import("./db");
      const { nominas, nominaDetalles, employees } = await import("@shared/schema");
      const { eq, and, sql } = await import("drizzle-orm");
      
      // Obtener la cabecera de la nómina
      const cabeceraNomina = await db
        .select()
        .from(nominas)
        .where(eq(nominas.id, nominaId))
        .limit(1);
      
      if (cabeceraNomina.length === 0) {
        return res.status(404).json({ error: 'Nómina no encontrada' });
      }
      
      // Obtener todos los detalles de esta nómina
      const detallesDB = await db
        .select()
        .from(nominaDetalles)
        .where(eq(nominaDetalles.nominaId, nominaId));
      
      // Obtener información de los empleados asociados a esta nómina
      const empleadosIds = detallesDB.map(detalle => detalle.empleadoId);
      
      // Obtener información de los empleados asociados a esta nómina
      const empleadosInfo = empleadosIds.length > 0 ? await db
        .select()
        .from(employees)
        .where(sql`${employees.id} IN (${empleadosIds.join(',')})`)
        : [];
      
      // Agregar información de empleados a los detalles
      const detallesCompletos = detallesDB.map(detalle => {
        const empleado = empleadosInfo.find(e => e.id === detalle.empleadoId);
        return {
          ...detalle,
          // Convertir de string a objeto para ingresos y deducciones
          detalleIngresos: detalle.detalleIngresos ? JSON.parse(detalle.detalleIngresos) : [],
          detalleDeducciones: detalle.detalleDeducciones ? JSON.parse(detalle.detalleDeducciones) : [],
          // Agregar información del empleado
          empleado: empleado ? {
            id: empleado.id,
            nombre: `${empleado.firstName} ${empleado.lastName}`,
            puesto: empleado.position || 'No especificado',
            departamento: empleado.department || 'No especificado',
          } : null
        };
      });
      
      // Construir la respuesta
      const respuesta = {
        cabecera: cabeceraNomina[0],
        detalles: detallesCompletos,
        resumen: {
          totalEmpleados: detallesCompletos.length,
          montoTotal: cabeceraNomina[0].montoTotal,
        }
      };
      
      res.status(200).json(respuesta);
    } catch (error: any) {
      console.error('Error al obtener detalle de nómina:', error);
      res.status(500).json({ error: 'Error al obtener el detalle de la nómina' });
    }
  });

  // Endpoint para listar nóminas
  nominaV1Router.get('/listar', async (req: Request, res: Response) => {
    try {
      // Obtener y procesar filtros de la petición
      const filtros = {
        page: parseInt(req.query.page as string) || 1,
        pageSize: parseInt(req.query.pageSize as string) || 10,
        empleadoId: req.query.empleadoId ? parseInt(req.query.empleadoId as string) : undefined,
        mes: req.query.mes ? parseInt(req.query.mes as string) : undefined,
        anio: req.query.anio ? parseInt(req.query.anio as string) : undefined,
        estado: req.query.estado as string
      };
      
      // Consultar datos reales de la base de datos
      const { db } = await import("./db");
      const { nominas, nominaDetalles } = await import("@shared/schema");
      const { eq, and, sql, desc } = await import("drizzle-orm");
      
      // Usar consulta simple de Drizzle ORM sin filtros complejos
      const nominasDB = await db.select().from(nominas).orderBy(desc(nominas.id));
      
      console.log('Nóminas obtenidas de la BD:', nominasDB);
      
      // Si hay filtro por empleado, necesitamos filtrar después de obtener los datos
      let nominasFiltradas = [...nominasDB];
      
      if (filtros.empleadoId) {
        // Obtener IDs de nóminas donde el empleado está incluido
        const nominasDetalleEmpleado = await db
          .select({ nominaId: nominaDetalles.nominaId })
          .from(nominaDetalles)
          .where(eq(nominaDetalles.empleadoId, filtros.empleadoId));
        
        const nominasIdsConEmpleado = nominasDetalleEmpleado.map(det => det.nominaId);
        
        // Filtrar nóminas por IDs
        nominasFiltradas = nominasFiltradas.filter(nomina => 
          nominasIdsConEmpleado.includes(nomina.id)
        );
      }
      
      // Obtener el total de empleados por nómina
      const nominasConTotalEmpleados = await Promise.all(
        nominasFiltradas.map(async (nomina) => {
          const detalles = await db
            .select()
            .from(nominaDetalles)
            .where(eq(nominaDetalles.nominaId, nomina.id));
          
          return {
            ...nomina,
            totalEmpleados: detalles.length
          };
        })
      );
      
      // Paginación simple
      const totalItems = nominasConTotalEmpleados.length;
      const totalPages = Math.ceil(totalItems / filtros.pageSize);
      const startIndex = (filtros.page - 1) * filtros.pageSize;
      const paginatedNominas = nominasConTotalEmpleados.slice(startIndex, startIndex + filtros.pageSize);
      
      // Construir respuesta
      const response = {
        nominas: paginatedNominas,
        pagination: {
          page: filtros.page,
          pageSize: filtros.pageSize,
          totalItems,
          totalPages
        }
      };
      
      res.status(200).json(response);
    } catch (error: any) {
      console.error('Error al listar nóminas:', error);
      res.status(500).json({ error: 'Error al obtener nóminas' });
    }
  });
  
  app.use('/api/nomina/v1', nominaV1Router);

  // Rutas de facturación por proyecto
  app.get("/api/facturacion/:proyectoId", async (req, res) => {
    try {
      const proyectoId = parseInt(req.params.proyectoId);
      const { estado, cliente, fechaDesde, fechaHasta, busqueda } = req.query;

      if (!proyectoId || isNaN(proyectoId)) {
        return res.status(400).json({ message: "ID de proyecto inválido" });
      }

      const allFacturas = await db.select().from(facturasProyecto).where(eq(facturasProyecto.proyectoId, proyectoId));

      // Apply filters
      let facturas = allFacturas;
      
      if (estado && estado !== 'todos') {
        facturas = facturas.filter((f: any) => f.estado === estado);
      }

      if (cliente) {
        facturas = facturas.filter((f: any) => f.cliente.toLowerCase().includes(cliente.toString().toLowerCase()));
      }

      if (fechaDesde) {
        facturas = facturas.filter((f: any) => new Date(f.fechaEmision) >= new Date(fechaDesde.toString()));
      }

      if (fechaHasta) {
        facturas = facturas.filter((f: any) => new Date(f.fechaEmision) <= new Date(fechaHasta.toString()));
      }

      if (busqueda) {
        const searchTerm = busqueda.toString().toLowerCase();
        facturas = facturas.filter((f: any) => 
          f.numeroFactura.toLowerCase().includes(searchTerm) ||
          f.cliente.toLowerCase().includes(searchTerm) ||
          f.concepto.toLowerCase().includes(searchTerm)
        );
      }

      res.json(facturas);
    } catch (error: any) {
      console.error('Error al obtener facturas:', error);
      res.status(500).json({ message: "Error al obtener facturas" });
    }
  });

  app.get("/api/facturacion/:proyectoId/indicadores", async (req, res) => {
    try {
      const proyectoId = parseInt(req.params.proyectoId);

      if (!proyectoId || isNaN(proyectoId)) {
        return res.status(400).json({ message: "ID de proyecto inválido" });
      }

      const facturas = await db.select().from(facturasProyecto).where(eq(facturasProyecto.proyectoId, proyectoId));

      const totalFacturado = facturas.reduce((sum, f) => sum + parseFloat(f.valorTotal), 0);
      const facturasPagadas = facturas.filter(f => f.estado === 'PAGADA');
      const facturasVencidas = facturas.filter(f => {
        const vencimiento = new Date(f.fechaVencimiento);
        return vencimiento < new Date() && f.estado === 'PENDIENTE';
      });

      const totalPagado = facturasPagadas.reduce((sum, f) => sum + parseFloat(f.valorTotal), 0);
      const totalPendiente = facturas.filter(f => f.estado === 'PENDIENTE').reduce((sum, f) => sum + parseFloat(f.valorTotal), 0);
      const porcentajePagadas = facturas.length > 0 ? (facturasPagadas.length / facturas.length) * 100 : 0;

      // Calcular días promedio de pago (simplificado)
      const diasPromedioPago = 15; // Placeholder - implementar cálculo real

      // Proyección de ingresos próximos 30 días
      const fechaLimite = new Date();
      fechaLimite.setDate(fechaLimite.getDate() + 30);
      const proyeccionIngresos30Dias = facturas.filter(f => {
        const vencimiento = new Date(f.fechaVencimiento);
        return vencimiento <= fechaLimite && f.estado === 'PENDIENTE';
      }).reduce((sum, f) => sum + parseFloat(f.valorTotal), 0);

      // Distribución por estado
      const distribucionPorEstado = {
        PENDIENTE: facturas.filter(f => f.estado === 'PENDIENTE').length,
        PAGADA: facturas.filter(f => f.estado === 'PAGADA').length,
        RECHAZADA: facturas.filter(f => f.estado === 'RECHAZADA').length,
        VENCIDA: facturasVencidas.length
      };

      const indicadores = {
        totalFacturado,
        totalPendiente,
        totalPagado,
        porcentajePagadas,
        diasPromedioPago,
        facturasVencidas: facturasVencidas.length,
        proyeccionIngresos30Dias,
        distribucionPorEstado
      };

      res.json(indicadores);
    } catch (error: any) {
      console.error('Error al calcular indicadores:', error);
      res.status(500).json({ message: "Error al calcular indicadores" });
    }
  });

  app.post("/api/facturacion", upload.single('soporte'), async (req, res) => {
    try {
      const facturaData = req.body;

      // Validar datos requeridos
      if (!facturaData.proyectoId || !facturaData.numeroFactura || !facturaData.cliente) {
        return res.status(400).json({ message: "Datos de factura incompletos" });
      }

      // Verificar que el número de factura sea único
      const facturaExistente = await db.select().from(facturasProyecto)
        .where(eq(facturasProyecto.numeroFactura, facturaData.numeroFactura));

      if (facturaExistente.length > 0) {
        return res.status(400).json({ message: "El número de factura ya existe" });
      }

      // Agregar URL del archivo si se subió
      if (req.file) {
        facturaData.soporteUrl = `/uploads/facturas/${req.file.filename}`;
      }

      const [nuevaFactura] = await db.insert(facturasProyecto)
        .values(facturaData)
        .returning();

      res.status(201).json(nuevaFactura);
    } catch (error: any) {
      console.error('Error al crear factura:', error);
      res.status(500).json({ message: "Error al crear factura" });
    }
  });

  app.patch("/api/facturacion/:id/estado", async (req, res) => {
    try {
      const facturaId = parseInt(req.params.id);
      const { estado } = req.body;

      if (!facturaId || isNaN(facturaId)) {
        return res.status(400).json({ message: "ID de factura inválido" });
      }

      if (!estado) {
        return res.status(400).json({ message: "Estado requerido" });
      }

      const [facturaActualizada] = await db.update(facturasProyecto)
        .set({ estado, updatedAt: new Date() })
        .where(eq(facturasProyecto.id, facturaId))
        .returning();

      if (!facturaActualizada) {
        return res.status(404).json({ message: "Factura no encontrada" });
      }

      res.json(facturaActualizada);
    } catch (error: any) {
      console.error('Error al actualizar estado de factura:', error);
      res.status(500).json({ message: "Error al actualizar estado de factura" });
    }
  });

  app.get("/api/facturacion/detalle/:id", async (req, res) => {
    try {
      const facturaId = parseInt(req.params.id);

      if (!facturaId || isNaN(facturaId)) {
        return res.status(400).json({ message: "ID de factura inválido" });
      }

      const [factura] = await storage.db.select().from(storage.facturasProyecto)
        .where(eq(storage.facturasProyecto.id, facturaId));

      if (!factura) {
        return res.status(404).json({ message: "Factura no encontrada" });
      }

      res.json(factura);
    } catch (error: any) {
      console.error('Error al obtener detalle de factura:', error);
      res.status(500).json({ message: "Error al obtener detalle de factura" });
    }
  });

  app.delete("/api/facturacion/:id", async (req, res) => {
    try {
      const facturaId = parseInt(req.params.id);

      if (!facturaId || isNaN(facturaId)) {
        return res.status(400).json({ message: "ID de factura inválido" });
      }

      const [facturaEliminada] = await storage.db.delete(storage.facturasProyecto)
        .where(eq(storage.facturasProyecto.id, facturaId))
        .returning();

      if (!facturaEliminada) {
        return res.status(404).json({ message: "Factura no encontrada" });
      }

      res.json({ message: "Factura eliminada exitosamente" });
    } catch (error: any) {
      console.error('Error al eliminar factura:', error);
      res.status(500).json({ message: "Error al eliminar factura" });
    }
  });

  // Endpoint para descargar factura como PDF
  app.get("/api/facturacion/:id/pdf", async (req, res) => {
    try {
      const facturaId = parseInt(req.params.id);

      if (!facturaId || isNaN(facturaId)) {
        return res.status(400).json({ message: "ID de factura inválido" });
      }

      // Obtener datos de la factura
      const [factura] = await db.select()
        .from(facturasProyecto)
        .where(eq(facturasProyecto.id, facturaId))
        .limit(1);

      if (!factura) {
        return res.status(404).json({ message: "Factura no encontrada" });
      }

      // Generar PDF
      const pdfBuffer = await generateInvoicePDF(factura);

      // Configurar headers para descarga
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="Factura-${factura.numeroFactura}.pdf"`);
      res.setHeader('Content-Length', pdfBuffer.length);

      res.send(pdfBuffer);

    } catch (error: any) {
      console.error('Error al generar PDF de factura:', error);
      res.status(500).json({ message: "Error al generar PDF de factura" });
    }
  });

  // Función para generar PDF de factura
  async function generateInvoicePDF(factura: any): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      const doc = new PDFDocument({ margin: 50 });
      const buffers: Buffer[] = [];

      doc.on('data', buffers.push.bind(buffers));
      doc.on('end', () => {
        const pdfBuffer = Buffer.concat(buffers);
        resolve(pdfBuffer);
      });
      doc.on('error', reject);

      // Header
      doc.fontSize(20).text('FACTURA ELECTRÓNICA', 50, 50);
      doc.fontSize(12).text(`Número: ${factura.numeroFactura}`, 50, 80);
      doc.text(`Fecha: ${new Date(factura.fechaEmision).toLocaleDateString('es-CO')}`, 50, 95);

      // Cliente
      doc.fontSize(14).text('FACTURADO A:', 50, 130);
      doc.fontSize(12).text(factura.cliente, 50, 150);

      // Concepto
      doc.fontSize(14).text('CONCEPTO:', 50, 190);
      doc.fontSize(12).text(factura.concepto, 50, 210);

      // Valores
      doc.fontSize(14).text('DETALLES DE PAGO:', 50, 250);
      doc.fontSize(12);
      doc.text(`Subtotal: ${new Intl.NumberFormat('es-CO', {
        style: 'currency',
        currency: 'COP',
        minimumFractionDigits: 0
      }).format(factura.valorSubtotal)}`, 50, 270);
      
      doc.text(`Total: ${new Intl.NumberFormat('es-CO', {
        style: 'currency',
        currency: 'COP',
        minimumFractionDigits: 0
      }).format(factura.valorTotal)}`, 50, 290);

      // Fechas
      doc.text(`Fecha de Vencimiento: ${new Date(factura.fechaVencimiento).toLocaleDateString('es-CO')}`, 50, 320);
      
      if (factura.medioPago) {
        doc.text(`Medio de Pago: ${factura.medioPago}`, 50, 340);
      }

      // Footer
      doc.fontSize(10).text('Gracias por su confianza - XTask Platform', 50, 400);

      doc.end();
    });
  }

  // Endpoint para enviar factura por email con PDF adjunto
  app.post("/api/facturacion/:id/enviar-email", async (req, res) => {
    try {
      const facturaId = parseInt(req.params.id);
      const { destinatario, asunto, mensaje } = req.body;

      if (!destinatario || !asunto) {
        return res.status(400).json({ 
          message: "Destinatario y asunto son requeridos" 
        });
      }

      if (!process.env.SENDGRID_API_KEY) {
        return res.status(500).json({ 
          message: "Servicio de email no configurado" 
        });
      }

      // Obtener datos de la factura
      const [factura] = await db.select()
        .from(facturasProyecto)
        .where(eq(facturasProyecto.id, facturaId))
        .limit(1);

      if (!factura) {
        return res.status(404).json({ message: "Factura no encontrada" });
      }

      // Generar PDF de la factura
      const pdfBuffer = await generateInvoicePDF(factura);

      // Configurar email
      const emailData = {
        to: destinatario,
        from: 'noreply@xtask.com', // Cambiar por tu email verificado en SendGrid
        subject: asunto,
        text: mensaje || `Adjunto encontrará la factura ${factura.numeroFactura}.`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #2563eb;">XTask - Factura Electrónica</h2>
            <p>Estimado cliente,</p>
            <p>${mensaje || `Adjunto encontrará la factura ${factura.numeroFactura} correspondiente a los servicios prestados.`}</p>
            
            <div style="background-color: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="margin-top: 0; color: #1e40af;">Detalles de la Factura</h3>
              <p><strong>Número:</strong> ${factura.numeroFactura}</p>
              <p><strong>Cliente:</strong> ${factura.cliente}</p>
              <p><strong>Concepto:</strong> ${factura.concepto}</p>
              <p><strong>Valor Total:</strong> ${new Intl.NumberFormat('es-CO', {
                style: 'currency',
                currency: 'COP',
                minimumFractionDigits: 0
              }).format(parseFloat(factura.valorTotal))}</p>
              <p><strong>Fecha Vencimiento:</strong> ${new Date(factura.fechaVencimiento).toLocaleDateString('es-CO')}</p>
            </div>
            
            <p>Gracias por su confianza.</p>
            <p style="color: #6b7280; font-size: 12px;">
              Este es un mensaje automático, por favor no responda a este correo.
            </p>
          </div>
        `,
        attachments: [
          {
            content: pdfBuffer.toString('base64'),
            filename: `Factura-${factura.numeroFactura}.pdf`,
            type: 'application/pdf',
            disposition: 'attachment'
          }
        ]
      };

      // Enviar email
      await mailService.send(emailData);

      res.json({ 
        success: true,
        message: "Factura enviada por email exitosamente",
        destinatario: destinatario
      });

    } catch (error: any) {
      console.error('Error al enviar factura por email:', error);
      
      let errorMessage = "Error al enviar la factura por email";
      
      if (error.code === 401) {
        errorMessage = "La clave API de SendGrid no es válida. Por favor, configura una clave válida en las variables de entorno.";
      } else if (error.message?.includes('API key')) {
        errorMessage = "Error de configuración del servicio de email. Verifica la clave API de SendGrid.";
      }
      
      res.status(500).json({ 
        message: errorMessage,
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  });

  // Rutas para empleados nuevos (Ley Colombiana)
  app.get("/api/empleados-nuevos", async (req: Request, res: Response) => {
    try {
      const empleados = await storage.getAllEmpleadosNuevos();
      res.json(empleados);
    } catch (error) {
      console.error("Error al obtener empleados nuevos:", error);
      res.status(500).json({ error: "Error interno del servidor" });
    }
  });

  app.get("/api/empleados-nuevos/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const empleado = await storage.getEmpleadoNuevo(id);
      if (!empleado) {
        return res.status(404).json({ error: "Empleado no encontrado" });
      }

      // Obtener información adicional para el resumen
      // 1. Historial de nóminas para el cronograma de pagos
      const historialNominas = await db
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
          fecha_pago: nominas_nuevas.creado_at,
        })
        .from(nomina_items)
        .innerJoin(nominas_nuevas, eq(nomina_items.nomina_id, nominas_nuevas.id))
        .leftJoin(projects, eq(nominas_nuevas.proyecto_id, projects.id))
        .where(eq(nomina_items.empleado_id, id))
        .orderBy(sql`${nominas_nuevas.creado_at} DESC`)
        .limit(10);

      // 2. Proyectos asignados
      const proyectosAsignados = await db
        .select({
          id: projects.id,
          nombre: projects.name,
          descripcion: projects.description,
        })
        .from(empleado_proyecto)
        .innerJoin(projects, eq(empleado_proyecto.proyecto_id, projects.id))
        .where(eq(empleado_proyecto.empleado_id, id));

      // 3. Datos de nómina (sueldo base y bonificaciones)
      const datosNomina = await db
        .select()
        .from(empleado_nomina)
        .where(eq(empleado_nomina.empleado_id, id))
        .limit(1);

      // 4. Calcular gasto por proyecto basado en historial
      const gastoPorProyecto = historialNominas.reduce((acc: any[], nomina: any) => {
        const proyectoExistente = acc.find(p => p.proyecto_nombre === nomina.proyecto_nombre);
        const valorNeto = Number(nomina.valor_neto || 0);
        
        if (proyectoExistente) {
          proyectoExistente.total_gastado += valorNeto;
        } else if (nomina.proyecto_nombre) {
          acc.push({
            proyecto_nombre: nomina.proyecto_nombre,
            total_gastado: valorNeto
          });
        }
        return acc;
      }, []);

      // 5. Último pago (el más reciente que esté pagado)
      const ultimoPago = (() => {
        const nominaPagada = historialNominas.find(nomina => nomina.estado === 'pagado');
        return nominaPagada ? {
          monto: nominaPagada.valor_neto,
          fecha: nominaPagada.fecha_pago,
          estado: nominaPagada.estado
        } : null;
      })();

      // Combinar toda la información
      const empleadoCompleto = {
        ...empleado,
        proyectos: proyectosAsignados,
        pagos: historialNominas,
        gastoPorProyecto,
        ultimoPago,
        nomina: datosNomina.length > 0 ? datosNomina[0] : null
      };

      res.json(empleadoCompleto);
    } catch (error) {
      console.error("Error al obtener empleado:", error);
      res.status(500).json({ error: "Error interno del servidor" });
    }
  });

  app.post("/api/empleados-nuevos", async (req: Request, res: Response) => {
    try {
      const validatedData = insertEmpleadoNuevoSchema.parse(req.body);
      const empleado = await storage.createEmpleadoNuevo(validatedData);
      res.status(201).json(empleado);
    } catch (error) {
      console.error("Error al crear empleado:", error);
      if (error instanceof Error && error.name === 'ZodError') {
        res.status(400).json({ error: "Datos de empleado inválidos", details: error.message });
      } else {
        res.status(500).json({ error: "Error interno del servidor" });
      }
    }
  });

  app.put("/api/empleados-nuevos/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      
      // Extraer solo los datos del empleado (no incluir datos de nómina)
      const empleadoData = req.body.empleado || req.body;
      
      // Limpiar fechas inválidas antes de la validación
      const cleanedBody = { ...empleadoData };
      
      // Convertir fechas de Date objects a strings si es necesario
      if (cleanedBody.fecha_ingreso && typeof cleanedBody.fecha_ingreso === 'object') {
        cleanedBody.fecha_ingreso = cleanedBody.fecha_ingreso.toISOString().split('T')[0];
      }
      if (cleanedBody.fecha_fin_contrato && typeof cleanedBody.fecha_fin_contrato === 'object') {
        cleanedBody.fecha_fin_contrato = cleanedBody.fecha_fin_contrato.toISOString().split('T')[0];
      }
      
      if (cleanedBody.fecha_ingreso && cleanedBody.fecha_ingreso.trim() === '') {
        delete cleanedBody.fecha_ingreso;
      }
      if (cleanedBody.fecha_fin_contrato && cleanedBody.fecha_fin_contrato.trim() === '') {
        delete cleanedBody.fecha_fin_contrato;
      }
      
      // Validar fechas
      if (cleanedBody.fecha_ingreso && isNaN(Date.parse(cleanedBody.fecha_ingreso))) {
        return res.status(400).json({ error: "Formato de fecha de ingreso inválido" });
      }
      if (cleanedBody.fecha_fin_contrato && isNaN(Date.parse(cleanedBody.fecha_fin_contrato))) {
        return res.status(400).json({ error: "Formato de fecha de fin de contrato inválido" });
      }
      
      const validatedData = insertEmpleadoNuevoSchema.partial().parse(cleanedBody);
      
      // Verificar que hay datos para actualizar
      if (Object.keys(validatedData).length === 0) {
        return res.status(400).json({ error: "No se proporcionaron datos para actualizar" });
      }
      
      const empleado = await storage.updateEmpleadoNuevo(id, validatedData);
      if (!empleado) {
        return res.status(404).json({ error: "Empleado no encontrado" });
      }
      res.json(empleado);
    } catch (error) {
      console.error("Error al actualizar empleado:", error);
      if (error instanceof Error && error.name === 'ZodError') {
        res.status(400).json({ error: "Datos de empleado inválidos", details: error.message });
      } else {
        res.status(500).json({ error: "Error interno del servidor" });
      }
    }
  });

  // Endpoint para actualizar proyectos asignados a un empleado
  app.put("/api/empleados-nuevos/:id/proyectos", async (req: Request, res: Response) => {
    try {
      const empleadoId = parseInt(req.params.id);
      const { proyectosIds } = req.body;

      console.log(`Actualizando proyectos para empleado ${empleadoId}:`, proyectosIds);

      // Validar que el empleado existe
      const empleado = await storage.getEmpleadoNuevo(empleadoId);
      if (!empleado) {
        return res.status(404).json({ error: "Empleado no encontrado" });
      }

      // Validar que proyectosIds es un array
      if (!Array.isArray(proyectosIds)) {
        return res.status(400).json({ error: "proyectosIds debe ser un array" });
      }

      // Eliminar todas las asignaciones actuales del empleado
      await db
        .delete(empleado_proyecto)
        .where(eq(empleado_proyecto.empleado_id, empleadoId));

      // Crear nuevas asignaciones
      if (proyectosIds.length > 0) {
        const nuevasAsignaciones = proyectosIds.map((proyectoId: number) => ({
          empleado_id: empleadoId,
          proyecto_id: proyectoId,
          activo: true
        }));

        await db
          .insert(empleado_proyecto)
          .values(nuevasAsignaciones);
      }

      res.json({ 
        success: true, 
        message: "Proyectos actualizados correctamente",
        proyectosAsignados: proyectosIds.length
      });

    } catch (error) {
      console.error("Error al actualizar proyectos del empleado:", error);
      res.status(500).json({ error: "Error interno del servidor" });
    }
  });

  app.delete("/api/empleados-nuevos/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const success = await storage.deleteEmpleadoNuevo(id);
      if (!success) {
        return res.status(404).json({ error: "Empleado no encontrado" });
      }
      res.status(204).send();
    } catch (error) {
      console.error("Error al eliminar empleado:", error);
      res.status(500).json({ error: "Error interno del servidor" });
    }
  });

  // GET /api/empleados-nuevos/:id/historial-nomina - Obtener historial de nóminas del empleado
  app.get("/api/empleados-nuevos/:id/historial-nomina", async (req: Request, res: Response) => {
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
          fecha_pago: nominas_nuevas.creado_at,
          metodo_pago: empleado_nomina.metodo_pago,
        })
        .from(nomina_items)
        .innerJoin(nominas_nuevas, eq(nomina_items.nomina_id, nominas_nuevas.id))
        .innerJoin(empleados, eq(nomina_items.empleado_id, empleados.id))
        .leftJoin(empleado_nomina, eq(empleados.id, empleado_nomina.empleado_id))
        .leftJoin(projects, eq(nominas_nuevas.proyecto_id, projects.id))
        .where(eq(nomina_items.empleado_id, empleadoId))
        .orderBy(sql`${nominas_nuevas.rango_inicio} DESC`);

      // Procesar el historial para manejar fechas de pago según el estado
      const historialProcesado = historial.map(nomina => ({
        ...nomina,
        // Solo mostrar fecha de pago si la nómina está pagada
        fecha_pago: nomina.estado === 'pagado' ? nomina.fecha_pago : null
      }));

      res.json(historialProcesado);
    } catch (error) {
      console.error('Error al obtener historial de nómina:', error);
      res.status(500).json({ message: 'Error interno del servidor' });
    }
  });

  // PATCH /api/empleados-nuevos/:id/historial-nomina/:nominaId/estado - Cambiar estado de nómina específica
  app.patch("/api/empleados-nuevos/:id/historial-nomina/:nominaId/estado", async (req: Request, res: Response) => {
    try {
      const nominaId = parseInt(req.params.nominaId);
      const { estado } = req.body as { estado: string };

      if (!['pendiente', 'pagado', 'aprobado', 'rechazado'].includes(estado)) {
        return res.status(400).json({ message: 'Estado inválido' });
      }

      await db
        .update(nominas_nuevas)
        .set({ estado })
        .where(eq(nominas_nuevas.id, nominaId));

      res.json({ message: `Nómina marcada como ${estado}` });
    } catch (error) {
      console.error('Error al actualizar estado de nómina:', error);
      res.status(500).json({ message: 'Error interno del servidor' });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
