import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertProjectSchema, insertTaskSchema, insertEmployeeSchema, insertSupplierSchema, insertBudgetSchema } from "@shared/schema";
import express from "express";
import empleadosRouter from "./routes/empleados.updated.routes";
import nominaRouter from "./routes/nomina.routes";
import proyectosRouter from "./routes/proyectos.routes";
import dashboardRouter from "./routes/dashboard.routes";

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
  
  // Obtener empleados para nómina - Usando directamente el repositorio de DB
  // IMPORTANTE: Esta ruta debe estar antes de la integración del router de empleados
  nominaRouter.get('/empleados/listar', async (req: Request, res: Response) => {
    try {
      // Obtenemos los empleados directamente desde la BD
      const empleados = await storage.getAllEmployees();
      
      // Preparamos la respuesta con el nombre
      const empleadosFormateados = empleados.map(emp => ({
        ...emp,
        nombre: `Empleado #${emp.id}`
      }));
      
      res.status(200).json(empleadosFormateados);
    } catch (error: any) {
      console.error('Error en la ruta de obtener empleados:', error);
      res.status(500).json({ error: 'Error al obtener empleados' });
    }
  });
  
  // Integrar las rutas de empleados al router de nómina
  nominaRouter.use('/empleados', empleadosRouter);
  
  // Obtener nóminas con filtros - Implementación temporal
  nominaRouter.get('/', async (req: Request, res: Response) => {
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
  nominaRouter.get('/:id', async (req: Request, res: Response) => {
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
  nominaRouter.post('/procesar', async (req: Request, res: Response) => {
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
  nominaRouter.post('/marcar-pagado/:id', async (req: Request, res: Response) => {
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
  nominaRouter.post('/cambiar-estado/:id', async (req: Request, res: Response) => {
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
  nominaRouter.get('/:id/desprendible', async (req: Request, res: Response) => {
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
  app.use('/api/nomina', nominaRouter);
  app.use('/api/proyectos', proyectosRouter);
  app.use('/api/dashboard', dashboardRouter);
  
  // Ruta para obtener todos los usuarios (necesaria para el formulario de empleados)
  app.get('/api/users', async (req, res) => {
    try {
      // Simulamos una respuesta con datos de ejemplo para los usuarios
      // En la implementación final, esto obtendría los usuarios reales de la base de datos
      res.json([
        {
          id: 1,
          username: 'admin',
          fullName: 'Administrador',
          email: 'admin@xtask.com',
          role: 'admin'
        },
        {
          id: 2,
          username: 'usuario1',
          fullName: 'Usuario Uno',
          email: 'usuario1@xtask.com',
          role: 'user'
        },
        {
          id: 3,
          username: 'usuario2',
          fullName: 'Usuario Dos',
          email: 'usuario2@xtask.com',
          role: 'user'
        }
      ]);
    } catch (error: any) {
      console.error('Error al obtener usuarios:', error);
      res.status(500).json({ error: 'Error al obtener los usuarios' });
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
  
  // Sobrescribir la ruta de proyectos para retornar datos de ejemplo
  app.get('/api/projects', async (req, res) => {
    try {
      res.json(proyectosEjemplo);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
