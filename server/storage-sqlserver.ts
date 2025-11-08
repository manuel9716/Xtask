import { getSqlServerPool, isSqlServer } from "./db";
import session from "express-session";
import createMemoryStore from "memorystore";
import sql from 'mssql';

const MemoryStore = createMemoryStore(session);

// Tipos básicos
export interface User {
  id: number;
  username: string;
  password: string;
  email: string;
  fullName: string;
  role: string;
  isActive: boolean;
  createdAt: Date;
}

export interface InsertUser {
  username: string;
  password: string;
  email: string;
  fullName: string;
  role: string;
}

// Storage para SQL Server
export class SqlServerStorage {
  sessionStore: any;
  private initialized: boolean = false;
  private initPromise: Promise<void>;

  constructor() {
    // Usar MemoryStore para sesiones (SQL Server no tiene connect-pg-simple)
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000 // 24 horas
    });

    // Inicializar de forma asíncrona
    this.initPromise = this.initialize();
  }

  private async initialize() {
    try {
      // Esperar a que el pool esté listo
      await getSqlServerPool();
      this.initialized = true;
      console.log('✅ SQL Server Storage inicializado');
      
      // Seed initial admin user
      await this.seedAdminUser();
    } catch (error) {
      console.error('❌ Error inicializando SQL Server Storage:', error);
    }
  }

  private async ensureInitialized() {
    if (!this.initialized) {
      await this.initPromise;
    }
  }

  private async seedAdminUser() {
    try {
      const adminUser: InsertUser = {
        username: "admin",
        password: "$2b$10$dXK5L9R17f.jLVTsBJHxI.Sc/L0AD8a8NuNlWrjvavYLYeZ0q7m5m", // 'admin123'
        email: "admin@xtask.com",
        fullName: "Admin User",
        role: "admin"
      };

      const existingAdmin = await this.getUserByUsername(adminUser.username);
      if (!existingAdmin) {
        await this.createUser(adminUser);
        console.log('✅ Usuario admin creado');
      } else {
        console.log('✅ Usuario admin ya existe');
      }
    } catch (error) {
      console.error('❌ Error seeding admin user:', error);
    }
  }

  // ============================================
  // USERS
  // ============================================

  async getUser(id: number): Promise<User | undefined> {
    const pool = await getSqlServerPool();
    const result = await pool.request()
      .input('id', sql.Int, id)
      .query('SELECT * FROM users WHERE id = @id');
    
    return result.recordset[0] ? this.mapUser(result.recordset[0]) : undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    await this.ensureInitialized();
    const pool = await getSqlServerPool();
    const result = await pool.request()
      .input('username', sql.NVarChar, username)
      .query('SELECT * FROM users WHERE username = @username OR email = @username');
    
    return result.recordset[0] ? this.mapUser(result.recordset[0]) : undefined;
  }

  async createUser(user: InsertUser): Promise<User> {
    const pool = await getSqlServerPool();
    const result = await pool.request()
      .input('username', sql.NVarChar, user.username)
      .input('password', sql.NVarChar, user.password)
      .input('email', sql.NVarChar, user.email)
      .input('fullName', sql.NVarChar, user.fullName)
      .input('role', sql.NVarChar, user.role)
      .query(`
        INSERT INTO users (username, [password], email, full_name, [role], is_active)
        OUTPUT INSERTED.*
        VALUES (@username, @password, @email, @fullName, @role, 1)
      `);
    
    return this.mapUser(result.recordset[0]);
  }

  async updateUser(id: number, updates: Partial<InsertUser>): Promise<User | undefined> {
    const pool = await getSqlServerPool();
    
    const setClauses: string[] = [];
    const request = pool.request().input('id', sql.Int, id);
    
    if (updates.username) {
      setClauses.push('username = @username');
      request.input('username', sql.NVarChar, updates.username);
    }
    if (updates.password) {
      setClauses.push('[password] = @password');
      request.input('password', sql.NVarChar, updates.password);
    }
    if (updates.email) {
      setClauses.push('email = @email');
      request.input('email', sql.NVarChar, updates.email);
    }
    if (updates.fullName) {
      setClauses.push('full_name = @fullName');
      request.input('fullName', sql.NVarChar, updates.fullName);
    }
    if (updates.role) {
      setClauses.push('[role] = @role');
      request.input('role', sql.NVarChar, updates.role);
    }

    if (setClauses.length === 0) {
      return this.getUser(id);
    }

    const result = await request.query(`
      UPDATE users 
      SET ${setClauses.join(', ')}
      OUTPUT INSERTED.*
      WHERE id = @id
    `);
    
    return result.recordset[0] ? this.mapUser(result.recordset[0]) : undefined;
  }

  // ============================================
  // PROJECTS
  // ============================================

  private mapProject(project: any): any {
    if (!project) return undefined;
    
    return {
      ...project,
      budget: parseFloat(project.budget) || 0,
      remainingBudget: parseFloat(project.remaining_budget || project.remainingBudget) || 0,
      startDate: project.start_date || project.startDate,
      endDate: project.end_date || project.endDate,
      managerId: project.manager_id || project.managerId,
      createdAt: project.created_at || project.createdAt
    };
  }

  async getProjects(): Promise<any[]> {
    const pool = await getSqlServerPool();
    const result = await pool.request()
      .query('SELECT * FROM projects ORDER BY created_at DESC');
    
    return result.recordset.map(p => this.mapProject(p));
  }

  async getProject(id: number): Promise<any | undefined> {
    const pool = await getSqlServerPool();
    const result = await pool.request()
      .input('id', sql.Int, id)
      .query('SELECT * FROM projects WHERE id = @id');
    
    return result.recordset[0] ? this.mapProject(result.recordset[0]) : undefined;
  }

  async createProject(project: any): Promise<any> {
    const pool = await getSqlServerPool();
    const result = await pool.request()
      .input('name', sql.NVarChar, project.name)
      .input('description', sql.NVarChar, project.description || null)
      .input('startDate', sql.DateTime2, project.startDate)
      .input('endDate', sql.DateTime2, project.endDate || null)
      .input('budget', sql.Decimal(16, 2), project.budget)
      .input('remainingBudget', sql.Decimal(16, 2), project.remainingBudget || project.budget)
      .input('managerId', sql.Int, project.managerId || null)
      .input('status', sql.NVarChar, project.status || 'active')
      .input('category', sql.NVarChar, project.category || null)
      .query(`
        INSERT INTO projects ([name], [description], start_date, end_date, budget, remaining_budget, manager_id, [status], category)
        OUTPUT INSERTED.*
        VALUES (@name, @description, @startDate, @endDate, @budget, @remainingBudget, @managerId, @status, @category)
      `);
    
    return this.mapProject(result.recordset[0]);
  }

  // ============================================
  // EMPLEADOS
  // ============================================

  async getEmpleados(): Promise<any[]> {
    const pool = await getSqlServerPool();
    const result = await pool.request()
      .query('SELECT * FROM empleados WHERE activo = 1 ORDER BY created_at DESC');
    
    return result.recordset;
  }

  async getEmpleado(id: number): Promise<any | undefined> {
    const pool = await getSqlServerPool();
    const result = await pool.request()
      .input('id', sql.Int, id)
      .query('SELECT * FROM empleados WHERE id = @id');
    
    return result.recordset[0];
  }

  async createEmpleado(empleado: any): Promise<any> {
    const pool = await getSqlServerPool();
    const result = await pool.request()
      .input('userId', sql.Int, empleado.userId || null)
      .input('nombre', sql.NVarChar, empleado.nombre)
      .input('apellido', sql.NVarChar, empleado.apellido)
      .input('identificacion', sql.NVarChar, empleado.identificacion)
      .input('depto', sql.NVarChar, empleado.depto)
      .input('cargo', sql.NVarChar, empleado.cargo)
      .input('fechaIngreso', sql.Date, empleado.fechaIngreso)
      .input('tipoContrato', sql.NVarChar, empleado.tipoContrato)
      .input('salarioBase', sql.Decimal(12, 2), empleado.salarioBase || null)
      .input('telefono', sql.NVarChar, empleado.telefono || null)
      .query(`
        INSERT INTO empleados (user_id, nombre, apellido, identificacion, depto, cargo, fecha_ingreso, tipo_contrato, salario_base, telefono)
        OUTPUT INSERTED.*
        VALUES (@userId, @nombre, @apellido, @identificacion, @depto, @cargo, @fechaIngreso, @tipoContrato, @salarioBase, @telefono)
      `);
    
    return result.recordset[0];
  }

  // ============================================
  // NOMINAS
  // ============================================

  async getNominas(): Promise<any[]> {
    const pool = await getSqlServerPool();
    const result = await pool.request()
      .query('SELECT * FROM nominas_nuevas ORDER BY creado_at DESC');
    
    return result.recordset;
  }

  async getNomina(id: number): Promise<any | undefined> {
    const pool = await getSqlServerPool();
    const result = await pool.request()
      .input('id', sql.Int, id)
      .query('SELECT * FROM nominas_nuevas WHERE id = @id');
    
    return result.recordset[0];
  }

  async getNominaItems(nominaId: number): Promise<any[]> {
    const pool = await getSqlServerPool();
    const result = await pool.request()
      .input('nominaId', sql.Int, nominaId)
      .query(`
        SELECT ni.*, e.nombre, e.apellido 
        FROM nomina_items ni
        INNER JOIN empleados e ON ni.empleado_id = e.id
        WHERE ni.nomina_id = @nominaId
      `);
    
    return result.recordset;
  }

  // ============================================
  // BUDGETS
  // ============================================

  async getBudgets(): Promise<any[]> {
    const pool = await getSqlServerPool();
    const result = await pool.request()
      .query('SELECT * FROM budgets ORDER BY created_at DESC');
    
    return result.recordset;
  }

  async getBudget(id: number): Promise<any | undefined> {
    const pool = await getSqlServerPool();
    const result = await pool.request()
      .input('id', sql.Int, id)
      .query('SELECT * FROM budgets WHERE id = @id');
    
    return result.recordset[0];
  }

  // ============================================
  // HELPER METHODS
  // ============================================

  private mapUser(row: any): User {
    return {
      id: row.id,
      username: row.username,
      password: row.password,
      email: row.email,
      fullName: row.full_name,
      role: row.role,
      isActive: row.is_active,
      createdAt: row.created_at
    };
  }

  // ============================================
  // PROYECTOS - MÉTODOS COMPLETOS
  // ============================================

  async updateProject(id: number, updates: any): Promise<any | undefined> {
    const pool = await getSqlServerPool();
    
    const setClauses: string[] = [];
    const request = pool.request().input('id', sql.Int, id);
    
    if (updates.name) {
      setClauses.push('[name] = @name');
      request.input('name', sql.NVarChar, updates.name);
    }
    if (updates.description !== undefined) {
      setClauses.push('[description] = @description');
      request.input('description', sql.NVarChar, updates.description);
    }
    if (updates.startDate) {
      setClauses.push('start_date = @startDate');
      request.input('startDate', sql.DateTime2, updates.startDate);
    }
    if (updates.endDate !== undefined) {
      setClauses.push('end_date = @endDate');
      request.input('endDate', sql.DateTime2, updates.endDate);
    }
    if (updates.budget) {
      setClauses.push('budget = @budget');
      request.input('budget', sql.Decimal(16, 2), updates.budget);
    }
    if (updates.remainingBudget !== undefined) {
      setClauses.push('remaining_budget = @remainingBudget');
      request.input('remainingBudget', sql.Decimal(16, 2), updates.remainingBudget);
    }
    if (updates.status) {
      setClauses.push('[status] = @status');
      request.input('status', sql.NVarChar, updates.status);
    }
    if (updates.managerId !== undefined) {
      setClauses.push('manager_id = @managerId');
      request.input('managerId', sql.Int, updates.managerId);
    }

    if (setClauses.length === 0) {
      return this.getProject(id);
    }

    const result = await request.query(`
      UPDATE projects 
      SET ${setClauses.join(', ')}
      OUTPUT INSERTED.*
      WHERE id = @id
    `);
    
    return this.mapProject(result.recordset[0]);
  }

  async deleteProject(id: number): Promise<boolean> {
    const pool = await getSqlServerPool();
    const result = await pool.request()
      .input('id', sql.Int, id)
      .query('DELETE FROM projects WHERE id = @id');
    
    return result.rowsAffected[0] > 0;
  }

  // ============================================
  // EMPLEADOS - MÉTODOS COMPLETOS
  // ============================================

  async updateEmpleado(id: number, updates: any): Promise<any | undefined> {
    const pool = await getSqlServerPool();
    
    const setClauses: string[] = [];
    const request = pool.request().input('id', sql.Int, id);
    
    if (updates.nombre) {
      setClauses.push('nombre = @nombre');
      request.input('nombre', sql.NVarChar, updates.nombre);
    }
    if (updates.apellido) {
      setClauses.push('apellido = @apellido');
      request.input('apellido', sql.NVarChar, updates.apellido);
    }
    if (updates.identificacion) {
      setClauses.push('identificacion = @identificacion');
      request.input('identificacion', sql.NVarChar, updates.identificacion);
    }
    if (updates.depto) {
      setClauses.push('depto = @depto');
      request.input('depto', sql.NVarChar, updates.depto);
    }
    if (updates.cargo) {
      setClauses.push('cargo = @cargo');
      request.input('cargo', sql.NVarChar, updates.cargo);
    }
    if (updates.salarioBase !== undefined) {
      setClauses.push('salario_base = @salarioBase');
      request.input('salarioBase', sql.Decimal(12, 2), updates.salarioBase);
    }
    if (updates.telefono !== undefined) {
      setClauses.push('telefono = @telefono');
      request.input('telefono', sql.NVarChar, updates.telefono);
    }
    if (updates.activo !== undefined) {
      setClauses.push('activo = @activo');
      request.input('activo', sql.Bit, updates.activo);
    }

    if (setClauses.length === 0) {
      return this.getEmpleado(id);
    }

    const result = await request.query(`
      UPDATE empleados 
      SET ${setClauses.join(', ')}
      OUTPUT INSERTED.*
      WHERE id = @id
    `);
    
    return result.recordset[0];
  }

  async deleteEmpleado(id: number): Promise<boolean> {
    const pool = await getSqlServerPool();
    // Soft delete
    const result = await pool.request()
      .input('id', sql.Int, id)
      .query('UPDATE empleados SET activo = 0, deleted_at = SYSDATETIME() WHERE id = @id');
    
    return result.rowsAffected[0] > 0;
  }

  // ============================================
  // NOMINAS - MÉTODOS COMPLETOS
  // ============================================

  async createNomina(nomina: any): Promise<any> {
    const pool = await getSqlServerPool();
    const result = await pool.request()
      .input('proyectoId', sql.Int, nomina.proyectoId || null)
      .input('rangoInicio', sql.Date, nomina.rangoInicio)
      .input('rangoFin', sql.Date, nomina.rangoFin)
      .input('estado', sql.NVarChar, nomina.estado || 'pendiente')
      .input('totalBruto', sql.Decimal(15, 2), nomina.totalBruto || 0)
      .input('totalNeto', sql.Decimal(15, 2), nomina.totalNeto || 0)
      .input('creadoPor', sql.Int, nomina.creadoPor)
      .query(`
        INSERT INTO nominas_nuevas (proyecto_id, rango_inicio, rango_fin, estado, total_bruto, total_neto, creado_por)
        OUTPUT INSERTED.*
        VALUES (@proyectoId, @rangoInicio, @rangoFin, @estado, @totalBruto, @totalNeto, @creadoPor)
      `);
    
    return result.recordset[0];
  }

  async updateNomina(id: number, updates: any): Promise<any | undefined> {
    const pool = await getSqlServerPool();
    
    const setClauses: string[] = [];
    const request = pool.request().input('id', sql.Int, id);
    
    if (updates.estado) {
      setClauses.push('estado = @estado');
      request.input('estado', sql.NVarChar, updates.estado);
    }
    if (updates.totalBruto !== undefined) {
      setClauses.push('total_bruto = @totalBruto');
      request.input('totalBruto', sql.Decimal(15, 2), updates.totalBruto);
    }
    if (updates.totalNeto !== undefined) {
      setClauses.push('total_neto = @totalNeto');
      request.input('totalNeto', sql.Decimal(15, 2), updates.totalNeto);
    }
    if (updates.aprobadoPor !== undefined) {
      setClauses.push('aprobado_por = @aprobadoPor');
      request.input('aprobadoPor', sql.Int, updates.aprobadoPor);
    }
    if (updates.aprobadoAt !== undefined) {
      setClauses.push('aprobado_at = @aprobadoAt');
      request.input('aprobadoAt', sql.DateTime2, updates.aprobadoAt);
    }

    if (setClauses.length === 0) {
      return this.getNomina(id);
    }

    const result = await request.query(`
      UPDATE nominas_nuevas 
      SET ${setClauses.join(', ')}
      OUTPUT INSERTED.*
      WHERE id = @id
    `);
    
    return result.recordset[0];
  }

  async createNominaItem(item: any): Promise<any> {
    const pool = await getSqlServerPool();
    const result = await pool.request()
      .input('nominaId', sql.Int, item.nominaId)
      .input('empleadoId', sql.Int, item.empleadoId)
      .input('sueldo', sql.Decimal(12, 2), item.sueldo)
      .input('bono', sql.Decimal(12, 2), item.bono || 0)
      .input('deduccion', sql.Decimal(12, 2), item.deduccion || 0)
      .input('impuestos', sql.Decimal(12, 2), item.impuestos || 0)
      .input('neto', sql.Decimal(12, 2), item.neto)
      .input('diasTrabajados', sql.Int, item.diasTrabajados || 30)
      .input('horasTrabajadas', sql.Decimal(8, 2), item.horasTrabajadas || null)
      .query(`
        INSERT INTO nomina_items (nomina_id, empleado_id, sueldo, bono, deduccion, impuestos, neto, dias_trabajados, horas_trabajadas)
        OUTPUT INSERTED.*
        VALUES (@nominaId, @empleadoId, @sueldo, @bono, @deduccion, @impuestos, @neto, @diasTrabajados, @horasTrabajadas)
      `);
    
    return result.recordset[0];
  }

  // ============================================
  // TRANSACCIONES
  // ============================================

  async getTransactions(projectId?: number): Promise<any[]> {
    const pool = await getSqlServerPool();
    
    if (projectId) {
      const result = await pool.request()
        .input('projectId', sql.Int, projectId)
        .query('SELECT * FROM transactions WHERE project_id = @projectId ORDER BY [date] DESC');
      return result.recordset;
    }
    
    const result = await pool.request()
      .query('SELECT * FROM transactions ORDER BY [date] DESC');
    return result.recordset;
  }

  async createTransaction(transaction: any): Promise<any> {
    const pool = await getSqlServerPool();
    const result = await pool.request()
      .input('projectId', sql.Int, transaction.projectId || null)
      .input('amount', sql.Decimal(10, 2), transaction.amount)
      .input('type', sql.NVarChar, transaction.type)
      .input('category', sql.NVarChar, transaction.category)
      .input('description', sql.NVarChar, transaction.description || null)
      .input('status', sql.NVarChar, transaction.status || 'pending')
      .input('requesterId', sql.Int, transaction.requesterId || null)
      .input('approverId', sql.Int, transaction.approverId || null)
      .query(`
        INSERT INTO transactions (project_id, amount, [type], category, [description], [status], requester_id, approver_id)
        OUTPUT INSERTED.*
        VALUES (@projectId, @amount, @type, @category, @description, @status, @requesterId, @approverId)
      `);
    
    return result.recordset[0];
  }

  // ============================================
  // EMPLOYEES (Legacy - para compatibilidad)
  // ============================================

  async getEmployees(): Promise<any[]> {
    const pool = await getSqlServerPool();
    const result = await pool.request()
      .query('SELECT * FROM employees ORDER BY hire_date DESC');
    return result.recordset;
  }

  async createEmployee(employee: any): Promise<any> {
    const pool = await getSqlServerPool();
    const result = await pool.request()
      .input('userId', sql.Int, employee.userId)
      .input('firstName', sql.NVarChar, employee.firstName)
      .input('lastName', sql.NVarChar, employee.lastName)
      .input('position', sql.NVarChar, employee.position)
      .input('department', sql.NVarChar, employee.department)
      .input('hireDate', sql.DateTime2, employee.hireDate)
      .input('salary', sql.Decimal(10, 2), employee.salary)
      .input('identification', sql.NVarChar, employee.identification)
      .input('contractStatus', sql.NVarChar, employee.contractStatus)
      .input('contractType', sql.NVarChar, employee.contractType)
      .query(`
        INSERT INTO employees (user_id, first_name, last_name, [position], department, hire_date, salary, identification, contract_status, contract_type)
        OUTPUT INSERTED.*
        VALUES (@userId, @firstName, @lastName, @position, @department, @hireDate, @salary, @identification, @contractStatus, @contractType)
      `);
    
    return result.recordset[0];
  }

  // ============================================
  // BUDGET EXPENSES
  // ============================================

  async getBudgetExpenses(budgetId: number): Promise<any[]> {
    const pool = await getSqlServerPool();
    const result = await pool.request()
      .input('budgetId', sql.Int, budgetId)
      .query('SELECT * FROM budget_expenses WHERE budget_id = @budgetId ORDER BY [date] DESC');
    
    return result.recordset;
  }

  async createBudgetExpense(expense: any): Promise<any> {
    const pool = await getSqlServerPool();
    const result = await pool.request()
      .input('budgetId', sql.Int, expense.budgetId)
      .input('amount', sql.Decimal(10, 2), expense.amount)
      .input('description', sql.NVarChar, expense.description || null)
      .input('createdBy', sql.Int, expense.createdBy)
      .input('reference', sql.NVarChar, expense.reference || null)
      .query(`
        INSERT INTO budget_expenses (budget_id, amount, [description], created_by, reference)
        OUTPUT INSERTED.*
        VALUES (@budgetId, @amount, @description, @createdBy, @reference)
      `);
    
    return result.recordset[0];
  }

  // ============================================
  // FACTURAS PROYECTO
  // ============================================

  async getFacturasProyecto(projectId?: number): Promise<any[]> {
    const pool = await getSqlServerPool();
    
    if (projectId) {
      const result = await pool.request()
        .input('projectId', sql.Int, projectId)
        .query('SELECT * FROM facturas_proyecto WHERE proyecto_id = @projectId ORDER BY fecha_emision DESC');
      return result.recordset;
    }
    
    const result = await pool.request()
      .query('SELECT * FROM facturas_proyecto ORDER BY fecha_emision DESC');
    return result.recordset;
  }

  async createFacturaProyecto(factura: any): Promise<any> {
    const pool = await getSqlServerPool();
    const result = await pool.request()
      .input('proyectoId', sql.Int, factura.proyectoId)
      .input('numeroFactura', sql.NVarChar, factura.numeroFactura)
      .input('tipo', sql.NVarChar, factura.tipo)
      .input('monto', sql.Decimal(15, 2), factura.monto)
      .input('fechaEmision', sql.Date, factura.fechaEmision)
      .input('fechaVencimiento', sql.Date, factura.fechaVencimiento || null)
      .input('estado', sql.NVarChar, factura.estado || 'PENDIENTE')
      .input('descripcion', sql.NVarChar, factura.descripcion || null)
      .input('proveedor', sql.NVarChar, factura.proveedor || null)
      .input('cliente', sql.NVarChar, factura.cliente || null)
      .input('creadoPor', sql.Int, factura.creadoPor)
      .query(`
        INSERT INTO facturas_proyecto (proyecto_id, numero_factura, tipo, monto, fecha_emision, fecha_vencimiento, estado, descripcion, proveedor, cliente, creado_por)
        OUTPUT INSERTED.*
        VALUES (@proyectoId, @numeroFactura, @tipo, @monto, @fechaEmision, @fechaVencimiento, @estado, @descripcion, @proveedor, @cliente, @creadoPor)
      `);
    
    return result.recordset[0];
  }

  // ============================================
  // MÉTODOS STUB (para implementar después)
  // ============================================

  async getSuppliers(): Promise<any[]> { return []; }
  async createSupplier(supplier: any): Promise<any> { return {}; }
  async getProducts(): Promise<any[]> { return []; }
  async createProduct(product: any): Promise<any> { return {}; }
  async getPurchaseOrders(): Promise<any[]> { return []; }
  async createPurchaseOrder(order: any): Promise<any> { return {}; }
}

// Exportar instancia
export const sqlServerStorage = new SqlServerStorage();
