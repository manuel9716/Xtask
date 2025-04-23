import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertProjectSchema, insertTaskSchema, insertEmployeeSchema, insertSupplierSchema, insertBudgetSchema } from "@shared/schema";
import express from "express";
import empleadosRouter from "./routes/empleados.routes";

export async function registerRoutes(app: Express): Promise<Server> {
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
        // En esta versión simplificada, asumimos que gastado es 0 o se encuentra en metadata
        // En una implementación completa, se debería cargar desde la BD o calcular desde transacciones
        const gastado = presupuesto.gastado || 0;
        
        // Cálculo porcentaje de ejecución: gastado / amount * 100
        const amount = parseFloat(presupuesto.amount);
        const porcentajeEjecucion = gastado > 0 ? (gastado / amount) * 100 : 0;
        
        // Determinar estado basado en el porcentaje y el estado almacenado
        let estado = presupuesto.status === 'active' ? 'ACTIVO' : presupuesto.status.toUpperCase();
        if (porcentajeEjecucion >= 100) {
          estado = 'COMPLETADO';
        } else if (porcentajeEjecucion >= 75) {
          estado = 'ALERTA';
        }
        
        return {
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
        metadata: req.body.metadata || null
      };
      
      const parseResult = insertBudgetSchema.safeParse(budgetData);
      if (!parseResult.success) {
        return res.status(400).json({ 
          error: 'Datos de presupuesto inválidos', 
          errors: parseResult.error.errors 
        });
      }
      
      const presupuesto = await storage.createBudget(parseResult.data);
      
      res.status(201).json({
        ...presupuesto,
        porcentajeEjecucion: 0,
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

  // Rutas de Nómina (Payroll)
  const nominaRouter = express.Router();
  
  // Obtener nóminas con filtros
  nominaRouter.get('/', async (req: Request, res: Response) => {
    try {
      const NominaController = require('../client/src/modules/finanzas/nomina/infrastructure/controllers/nomina.controller').NominaController;
      const controller = new NominaController();
      await controller.obtenerNominas(req, res);
    } catch (error: any) {
      console.error('Error en la ruta de obtener nóminas:', error);
      res.status(500).json({ error: 'Error al obtener las nóminas' });
    }
  });
  
  // Obtener una nómina por ID
  nominaRouter.get('/:id', async (req: Request, res: Response) => {
    try {
      const NominaController = require('../client/src/modules/finanzas/nomina/infrastructure/controllers/nomina.controller').NominaController;
      const controller = new NominaController();
      await controller.obtenerNominaPorId(req, res);
    } catch (error: any) {
      console.error(`Error en la ruta de obtener nómina por ID:`, error);
      res.status(500).json({ error: 'Error al obtener la nómina' });
    }
  });
  
  // Procesar la nómina
  nominaRouter.post('/procesar', async (req: Request, res: Response) => {
    try {
      const NominaController = require('../client/src/modules/finanzas/nomina/infrastructure/controllers/nomina.controller').NominaController;
      const controller = new NominaController();
      await controller.procesarNomina(req, res);
    } catch (error: any) {
      console.error('Error en la ruta de procesar nómina:', error);
      res.status(500).json({ error: 'Error al procesar la nómina' });
    }
  });
  
  // Marcar una nómina como pagada
  nominaRouter.post('/marcar-pagado/:id', async (req: Request, res: Response) => {
    try {
      const NominaController = require('../client/src/modules/finanzas/nomina/infrastructure/controllers/nomina.controller').NominaController;
      const controller = new NominaController();
      await controller.marcarComoPagada(req, res);
    } catch (error: any) {
      console.error('Error en la ruta de marcar nómina como pagada:', error);
      res.status(500).json({ error: 'Error al marcar la nómina como pagada' });
    }
  });
  
  // Cambiar el estado de una nómina
  nominaRouter.post('/cambiar-estado/:id', async (req: Request, res: Response) => {
    try {
      const NominaController = require('../client/src/modules/finanzas/nomina/infrastructure/controllers/nomina.controller').NominaController;
      const controller = new NominaController();
      await controller.cambiarEstadoNomina(req, res);
    } catch (error: any) {
      console.error('Error en la ruta de cambiar estado de nómina:', error);
      res.status(500).json({ error: 'Error al cambiar el estado de la nómina' });
    }
  });
  
  // Generar un desprendible de nómina en PDF
  nominaRouter.get('/:id/desprendible', async (req: Request, res: Response) => {
    try {
      const NominaController = require('../client/src/modules/finanzas/nomina/infrastructure/controllers/nomina.controller').NominaController;
      const controller = new NominaController();
      await controller.generarDesprendible(req, res);
    } catch (error: any) {
      console.error('Error en la ruta de generar desprendible de nómina:', error);
      res.status(500).json({ error: 'Error al generar el desprendible de nómina' });
    }
  });
  
  // Obtener empleados para nómina
  nominaRouter.get('/empleados/listar', async (req: Request, res: Response) => {
    try {
      const NominaController = require('../client/src/modules/finanzas/nomina/infrastructure/controllers/nomina.controller').NominaController;
      const controller = new NominaController();
      await controller.obtenerEmpleados(req, res);
    } catch (error: any) {
      console.error('Error en la ruta de obtener empleados:', error);
      res.status(500).json({ error: 'Error al obtener empleados' });
    }
  });
  
  app.use('/api/finanzas/nomina', nominaRouter);

  const httpServer = createServer(app);

  return httpServer;
}
