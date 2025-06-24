import { 
  users, User, InsertUser, 
  projects, Project, InsertProject,
  transactions, Transaction, InsertTransaction,
  tasks, Task, InsertTask,
  employees, Employee, InsertEmployee,
  suppliers, Supplier, InsertSupplier,
  products, Product, InsertProduct,
  purchaseOrders, PurchaseOrder, InsertPurchaseOrder,
  budgets, Budget, InsertBudget,
  recursosFinancieros
} from "@shared/schema";
import session from "express-session";
import createMemoryStore from "memorystore";
import connectPg from "connect-pg-simple";
import { db, pool } from "./db";
import { eq, asc, desc, and, gte, lte, isNull } from "drizzle-orm";

const MemoryStore = createMemoryStore(session);
const PostgresSessionStore = connectPg(session);

// Interface for storage operations
export interface IStorage {
  // Auth/Users
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Projects
  getAllProjects(): Promise<Project[]>;
  getProject(id: number): Promise<Project | undefined>;
  createProject(project: InsertProject): Promise<Project>;
  updateProject(id: number, project: Partial<Project>): Promise<Project | undefined>;
  
  // Tasks
  getAllTasks(projectId?: number): Promise<Task[]>;
  getTask(id: number): Promise<Task | undefined>;
  createTask(task: InsertTask): Promise<Task>;
  updateTask(id: number, task: Partial<Task>): Promise<Task | undefined>;
  
  // Transactions
  getAllTransactions(projectId?: number): Promise<Transaction[]>;
  getTransaction(id: number): Promise<Transaction | undefined>;
  createTransaction(transaction: InsertTransaction): Promise<Transaction>;
  approveTransaction(id: number, approverId: number): Promise<Transaction | undefined>;
  rejectTransaction(id: number, approverId: number): Promise<Transaction | undefined>;
  
  // Employees (HR)
  getAllEmployees(): Promise<Employee[]>;
  getEmployee(id: number): Promise<Employee | undefined>;
  createEmployee(employee: InsertEmployee): Promise<Employee>;
  
  // Suppliers
  getAllSuppliers(): Promise<Supplier[]>;
  getSupplier(id: number): Promise<Supplier | undefined>;
  createSupplier(supplier: InsertSupplier): Promise<Supplier>;
  
  // Products
  getAllProducts(supplierId?: number): Promise<Product[]>;
  getProduct(id: number): Promise<Product | undefined>;
  createProduct(product: InsertProduct): Promise<Product>;
  
  // Purchase Orders
  getAllPurchaseOrders(supplierId?: number, projectId?: number): Promise<PurchaseOrder[]>;
  getPurchaseOrder(id: number): Promise<PurchaseOrder | undefined>;
  createPurchaseOrder(order: InsertPurchaseOrder): Promise<PurchaseOrder>;
  approvePurchaseOrder(id: number, approverId: number): Promise<PurchaseOrder | undefined>;
  
  // Budgets (Presupuestos)
  getAllBudgets(organizationId?: number): Promise<Budget[]>;
  getBudget(id: number): Promise<Budget | undefined>;
  createBudget(budget: InsertBudget): Promise<Budget>;
  updateBudget(id: number, budget: Partial<Budget>): Promise<Budget>;
  
  // Session store for authentication
  sessionStore: session.SessionStore;
}

// Memory storage implementation
export class MemStorage implements IStorage {
  private usersMap: Map<number, User>;
  private projectsMap: Map<number, Project>;
  private transactionsMap: Map<number, Transaction>;
  private tasksMap: Map<number, Task>;
  private employeesMap: Map<number, Employee>;
  private suppliersMap: Map<number, Supplier>;
  private productsMap: Map<number, Product>;
  private purchaseOrdersMap: Map<number, PurchaseOrder>;
  private budgetsMap: Map<number, Budget>;
  
  private userIdCounter: number;
  private projectIdCounter: number;
  private transactionIdCounter: number;
  private taskIdCounter: number;
  private employeeIdCounter: number;
  private supplierIdCounter: number;
  private productIdCounter: number;
  private purchaseOrderIdCounter: number;
  private budgetIdCounter: number;
  
  sessionStore: session.SessionStore;

  constructor() {
    this.usersMap = new Map();
    this.projectsMap = new Map();
    this.transactionsMap = new Map();
    this.tasksMap = new Map();
    this.employeesMap = new Map();
    this.suppliersMap = new Map();
    this.productsMap = new Map();
    this.purchaseOrdersMap = new Map();
    this.budgetsMap = new Map();
    
    this.userIdCounter = 1;
    this.projectIdCounter = 1;
    this.transactionIdCounter = 1;
    this.taskIdCounter = 1;
    this.employeeIdCounter = 1;
    this.supplierIdCounter = 1;
    this.productIdCounter = 1;
    this.purchaseOrderIdCounter = 1;
    this.budgetIdCounter = 1;
    
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000 // 24h
    });
    
    // Seed initial admin user
    this.seedAdminUser();
  }
  
  private async seedAdminUser() {
    // This is just for demo purposes, in production you'd want to set a secure password via env vars
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
    }
  }

  // Users implementation
  async getUser(id: number): Promise<User | undefined> {
    return this.usersMap.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    for (const user of this.usersMap.values()) {
      if (user.username === username) {
        return user;
      }
    }
    return undefined;
  }

  async createUser(userData: InsertUser): Promise<User> {
    const id = this.userIdCounter++;
    const now = new Date();
    const user: User = { ...userData, id, createdAt: now };
    this.usersMap.set(id, user);
    return user;
  }
  
  // Projects implementation
  async getAllProjects(): Promise<Project[]> {
    return Array.from(this.projectsMap.values());
  }
  
  async getProject(id: number): Promise<Project | undefined> {
    return this.projectsMap.get(id);
  }
  
  async createProject(projectData: InsertProject): Promise<Project> {
    const id = this.projectIdCounter++;
    const now = new Date();
    const project: Project = { ...projectData, id, createdAt: now };
    this.projectsMap.set(id, project);
    return project;
  }
  
  async updateProject(id: number, projectData: Partial<Project>): Promise<Project | undefined> {
    const project = this.projectsMap.get(id);
    if (!project) return undefined;
    
    const updatedProject = { ...project, ...projectData };
    this.projectsMap.set(id, updatedProject);
    return updatedProject;
  }
  
  // Tasks implementation
  async getAllTasks(projectId?: number): Promise<Task[]> {
    const tasks = Array.from(this.tasksMap.values());
    if (projectId) {
      return tasks.filter(task => task.projectId === projectId);
    }
    return tasks;
  }
  
  async getTask(id: number): Promise<Task | undefined> {
    return this.tasksMap.get(id);
  }
  
  async createTask(taskData: InsertTask): Promise<Task> {
    const id = this.taskIdCounter++;
    const now = new Date();
    const task: Task = { ...taskData, id, createdAt: now };
    this.tasksMap.set(id, task);
    return task;
  }
  
  async updateTask(id: number, taskData: Partial<Task>): Promise<Task | undefined> {
    const task = this.tasksMap.get(id);
    if (!task) return undefined;
    
    const updatedTask = { ...task, ...taskData };
    this.tasksMap.set(id, updatedTask);
    return updatedTask;
  }
  
  // Transactions implementation
  async getAllTransactions(projectId?: number): Promise<Transaction[]> {
    const transactions = Array.from(this.transactionsMap.values());
    if (projectId) {
      return transactions.filter(tx => tx.projectId === projectId);
    }
    return transactions;
  }
  
  async getTransaction(id: number): Promise<Transaction | undefined> {
    return this.transactionsMap.get(id);
  }
  
  async createTransaction(transactionData: InsertTransaction): Promise<Transaction> {
    const id = this.transactionIdCounter++;
    const transaction: Transaction = { ...transactionData, id };
    this.transactionsMap.set(id, transaction);
    
    // If it's an expense and has a project, update the project's remaining budget
    if (transactionData.type === 'expense' && transactionData.projectId) {
      const project = this.projectsMap.get(transactionData.projectId);
      if (project) {
        const newRemainingBudget = Number(project.remainingBudget) - Number(transactionData.amount);
        this.updateProject(project.id, {
          remainingBudget: newRemainingBudget as any // Type conversion for decimal
        });
      }
    }
    
    return transaction;
  }
  
  async approveTransaction(id: number, approverId: number): Promise<Transaction | undefined> {
    const transaction = this.transactionsMap.get(id);
    if (!transaction) return undefined;
    
    const updatedTransaction = {
      ...transaction,
      status: 'approved',
      approverId
    };
    
    this.transactionsMap.set(id, updatedTransaction);
    return updatedTransaction;
  }
  
  async rejectTransaction(id: number, approverId: number): Promise<Transaction | undefined> {
    const transaction = this.transactionsMap.get(id);
    if (!transaction) return undefined;
    
    const updatedTransaction = {
      ...transaction,
      status: 'rejected',
      approverId
    };
    
    this.transactionsMap.set(id, updatedTransaction);
    return updatedTransaction;
  }
  
  // Employees implementation
  async getAllEmployees(): Promise<Employee[]> {
    return Array.from(this.employeesMap.values());
  }
  
  async getEmployee(id: number): Promise<Employee | undefined> {
    return this.employeesMap.get(id);
  }
  
  async createEmployee(employeeData: InsertEmployee): Promise<Employee> {
    const id = this.employeeIdCounter++;
    const employee: Employee = { ...employeeData, id };
    this.employeesMap.set(id, employee);
    return employee;
  }
  
  // Suppliers implementation
  async getAllSuppliers(): Promise<Supplier[]> {
    return Array.from(this.suppliersMap.values());
  }
  
  async getSupplier(id: number): Promise<Supplier | undefined> {
    return this.suppliersMap.get(id);
  }
  
  async createSupplier(supplierData: InsertSupplier): Promise<Supplier> {
    const id = this.supplierIdCounter++;
    const now = new Date();
    const supplier: Supplier = { ...supplierData, id, createdAt: now };
    this.suppliersMap.set(id, supplier);
    return supplier;
  }
  
  // Products implementation
  async getAllProducts(supplierId?: number): Promise<Product[]> {
    const products = Array.from(this.productsMap.values());
    if (supplierId) {
      return products.filter(product => product.supplierId === supplierId);
    }
    return products;
  }
  
  async getProduct(id: number): Promise<Product | undefined> {
    return this.productsMap.get(id);
  }
  
  async createProduct(productData: InsertProduct): Promise<Product> {
    const id = this.productIdCounter++;
    const product: Product = { ...productData, id };
    this.productsMap.set(id, product);
    return product;
  }
  
  // Purchase Orders implementation
  async getAllPurchaseOrders(supplierId?: number, projectId?: number): Promise<PurchaseOrder[]> {
    let orders = Array.from(this.purchaseOrdersMap.values());
    
    if (supplierId) {
      orders = orders.filter(order => order.supplierId === supplierId);
    }
    
    if (projectId) {
      orders = orders.filter(order => order.projectId === projectId);
    }
    
    return orders;
  }
  
  async getPurchaseOrder(id: number): Promise<PurchaseOrder | undefined> {
    return this.purchaseOrdersMap.get(id);
  }
  
  async createPurchaseOrder(orderData: InsertPurchaseOrder): Promise<PurchaseOrder> {
    const id = this.purchaseOrderIdCounter++;
    const now = new Date();
    const order: PurchaseOrder = { 
      ...orderData, 
      id, 
      createdAt: now,
      approvedAt: null,
      completedAt: null
    };
    
    this.purchaseOrdersMap.set(id, order);
    return order;
  }
  
  async approvePurchaseOrder(id: number, approverId: number): Promise<PurchaseOrder | undefined> {
    const order = this.purchaseOrdersMap.get(id);
    if (!order) return undefined;
    
    const now = new Date();
    const updatedOrder = {
      ...order,
      status: 'approved',
      approverId,
      approvedAt: now
    };
    
    this.purchaseOrdersMap.set(id, updatedOrder);
    
    // If the order is linked to a project, create a financial transaction
    if (order.projectId) {
      this.createTransaction({
        projectId: order.projectId,
        amount: order.totalAmount,
        type: 'expense',
        category: 'purchase_order',
        description: `Purchase order #${order.id}`,
        date: now,
        status: 'approved',
        requesterId: order.requesterId,
        approverId
      });
    }
    
    return updatedOrder;
  }
  
  // Presupuestos (Budgets) implementation
  async getAllBudgets(organizationId?: number): Promise<Budget[]> {
    const budgets = Array.from(this.budgetsMap.values());
    if (organizationId) {
      return budgets.filter(budget => budget.organizationId === organizationId);
    }
    return budgets;
  }
  
  async getBudget(id: number): Promise<Budget | undefined> {
    return this.budgetsMap.get(id);
  }
  
  async createBudget(budgetData: InsertBudget): Promise<Budget> {
    const id = this.budgetIdCounter++;
    const now = new Date();
    const budget: Budget = { 
      ...budgetData, 
      id, 
      createdAt: now,
      updatedAt: now,
      gastado: 0 // Inicializar el campo gastado en cero
    };
    
    this.budgetsMap.set(id, budget);
    return budget;
  }
  
  async updateBudget(id: number, budgetData: Partial<Budget>): Promise<Budget> {
    const budget = this.budgetsMap.get(id);
    if (!budget) {
      throw new Error(`Presupuesto con ID ${id} no encontrado`);
    }
    
    const now = new Date();
    const updatedBudget = { 
      ...budget, 
      ...budgetData,
      updatedAt: now
    };
    
    this.budgetsMap.set(id, updatedBudget);
    return updatedBudget;
  }
}

// Database storage implementation with Drizzle ORM
export class DatabaseStorage implements IStorage {
  sessionStore: session.SessionStore;

  constructor() {
    this.sessionStore = new PostgresSessionStore({ 
      pool, 
      createTableIfMissing: true 
    });
    
    // Seed initial admin user
    this.seedAdminUser();
  }
  
  private async seedAdminUser() {
    // This is just for demo purposes, in production you'd want to set a secure password via env vars
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
    }
  }

  // Users implementation
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async createUser(userData: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(userData).returning();
    return user;
  }
  
  // Projects implementation
  async getAllProjects(): Promise<Project[]> {
    return await db.select().from(projects).orderBy(desc(projects.createdAt));
  }
  
  async getProject(id: number): Promise<Project | undefined> {
    const [project] = await db.select().from(projects).where(eq(projects.id, id));
    return project;
  }
  
  async createProject(projectData: InsertProject): Promise<Project> {
    const [project] = await db.insert(projects).values(projectData).returning();
    return project;
  }
  
  async updateProject(id: number, projectData: Partial<Project>): Promise<Project | undefined> {
    const [updatedProject] = await db
      .update(projects)
      .set(projectData)
      .where(eq(projects.id, id))
      .returning();
    return updatedProject;
  }
  
  // Tasks implementation
  async getAllTasks(projectId?: number): Promise<Task[]> {
    if (projectId) {
      return db
        .select()
        .from(tasks)
        .where(eq(tasks.projectId, projectId))
        .orderBy(desc(tasks.createdAt));
    }
    return db.select().from(tasks).orderBy(desc(tasks.createdAt));
  }
  
  async getTask(id: number): Promise<Task | undefined> {
    const [task] = await db.select().from(tasks).where(eq(tasks.id, id));
    return task;
  }
  
  async createTask(taskData: InsertTask): Promise<Task> {
    const [task] = await db.insert(tasks).values(taskData).returning();
    return task;
  }
  
  async updateTask(id: number, taskData: Partial<Task>): Promise<Task | undefined> {
    const [updatedTask] = await db
      .update(tasks)
      .set(taskData)
      .where(eq(tasks.id, id))
      .returning();
    return updatedTask;
  }
  
  // Transactions implementation
  async getAllTransactions(projectId?: number): Promise<Transaction[]> {
    if (projectId) {
      return db
        .select()
        .from(transactions)
        .where(eq(transactions.projectId, projectId))
        .orderBy(desc(transactions.date));
    }
    return db.select().from(transactions).orderBy(desc(transactions.date));
  }
  
  async getTransaction(id: number): Promise<Transaction | undefined> {
    const [transaction] = await db.select().from(transactions).where(eq(transactions.id, id));
    return transaction;
  }
  
  async createTransaction(transactionData: InsertTransaction): Promise<Transaction> {
    const [transaction] = await db.insert(transactions).values(transactionData).returning();
    
    // Si es un gasto y está relacionado con un proyecto, actualizar el presupuesto remanente
    if (transaction.type === 'expense' && transaction.projectId) {
      const [project] = await db.select().from(projects).where(eq(projects.id, transaction.projectId));
      if (project) {
        const newRemainingBudget = parseFloat(project.remainingBudget.toString()) - parseFloat(transaction.amount.toString());
        await db
          .update(projects)
          .set({ remainingBudget: newRemainingBudget.toString() })
          .where(eq(projects.id, project.id));
      }
    }
    
    return transaction;
  }
  
  async approveTransaction(id: number, approverId: number): Promise<Transaction | undefined> {
    const [updatedTransaction] = await db
      .update(transactions)
      .set({ 
        status: 'approved',
        approverId
      })
      .where(eq(transactions.id, id))
      .returning();
    return updatedTransaction;
  }
  
  async rejectTransaction(id: number, approverId: number): Promise<Transaction | undefined> {
    const [updatedTransaction] = await db
      .update(transactions)
      .set({ 
        status: 'rejected',
        approverId
      })
      .where(eq(transactions.id, id))
      .returning();
    return updatedTransaction;
  }
  
  // Employees implementation
  async getAllEmployees(): Promise<Employee[]> {
    // Seleccionamos explícitamente todos los campos para incluir los nuevos (firstName, lastName, skills)
    return db.select({
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
      fechaInicioNomina: employees.fechaInicioNomina
    }).from(employees);
  }
  
  async getEmployee(id: number): Promise<Employee | undefined> {
    const [employee] = await db.select({
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
      fechaInicioNomina: employees.fechaInicioNomina
    }).from(employees).where(eq(employees.id, id));
    return employee;
  }
  
  async createEmployee(employeeData: InsertEmployee): Promise<Employee> {
    const [employee] = await db.insert(employees).values(employeeData).returning({
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
      fechaInicioNomina: employees.fechaInicioNomina
    });
    return employee;
  }
  
  // Suppliers implementation
  async getAllSuppliers(): Promise<Supplier[]> {
    return db.select().from(suppliers).orderBy(desc(suppliers.createdAt));
  }
  
  async getSupplier(id: number): Promise<Supplier | undefined> {
    const [supplier] = await db.select().from(suppliers).where(eq(suppliers.id, id));
    return supplier;
  }
  
  async createSupplier(supplierData: InsertSupplier): Promise<Supplier> {
    const [supplier] = await db.insert(suppliers).values(supplierData).returning();
    return supplier;
  }
  
  // Products implementation
  async getAllProducts(supplierId?: number): Promise<Product[]> {
    if (supplierId) {
      return db
        .select()
        .from(products)
        .where(eq(products.supplierId, supplierId));
    }
    return db.select().from(products);
  }
  
  async getProduct(id: number): Promise<Product | undefined> {
    const [product] = await db.select().from(products).where(eq(products.id, id));
    return product;
  }
  
  async createProduct(productData: InsertProduct): Promise<Product> {
    const [product] = await db.insert(products).values(productData).returning();
    return product;
  }
  
  // Purchase Orders implementation
  async getAllPurchaseOrders(supplierId?: number, projectId?: number): Promise<PurchaseOrder[]> {
    let query = db.select().from(purchaseOrders);
    
    if (supplierId && projectId) {
      query = query.where(and(
        eq(purchaseOrders.supplierId, supplierId),
        eq(purchaseOrders.projectId, projectId)
      ));
    } else if (supplierId) {
      query = query.where(eq(purchaseOrders.supplierId, supplierId));
    } else if (projectId) {
      query = query.where(eq(purchaseOrders.projectId, projectId));
    }
    
    return query.orderBy(desc(purchaseOrders.createdAt));
  }
  
  async getPurchaseOrder(id: number): Promise<PurchaseOrder | undefined> {
    const [order] = await db.select().from(purchaseOrders).where(eq(purchaseOrders.id, id));
    return order;
  }
  
  async createPurchaseOrder(orderData: InsertPurchaseOrder): Promise<PurchaseOrder> {
    const [order] = await db.insert(purchaseOrders).values(orderData).returning();
    return order;
  }
  
  async approvePurchaseOrder(id: number, approverId: number): Promise<PurchaseOrder | undefined> {
    const now = new Date();
    const [updatedOrder] = await db
      .update(purchaseOrders)
      .set({ 
        status: 'approved',
        approverId,
        approvedAt: now
      })
      .where(eq(purchaseOrders.id, id))
      .returning();
      
    if (updatedOrder && updatedOrder.projectId) {
      // Si la orden está ligada a un proyecto, crear una transacción financiera
      await db.insert(transactions).values({
        projectId: updatedOrder.projectId,
        amount: updatedOrder.totalAmount,
        type: 'expense',
        category: 'purchase_order',
        description: `Purchase order #${updatedOrder.id}`,
        date: now,
        status: 'approved',
        requesterId: updatedOrder.requesterId,
        approverId
      });
    }
      
    return updatedOrder;
  }
  
  // Presupuestos (Budgets) implementation
  async getAllBudgets(organizationId?: number): Promise<Budget[]> {
    if (organizationId) {
      return db
        .select()
        .from(budgets)
        .where(eq(budgets.organizationId, organizationId))
        .orderBy(desc(budgets.createdAt));
    }
    return db.select().from(budgets).orderBy(desc(budgets.createdAt));
  }
  
  async getBudget(id: number): Promise<Budget | undefined> {
    const [budget] = await db.select().from(budgets).where(eq(budgets.id, id));
    return budget;
  }
  
  async createBudget(budgetData: InsertBudget): Promise<Budget> {
    const [budget] = await db
      .insert(budgets)
      .values({
        ...budgetData,
        spent: "0" // Inicializar el gasto en cero
      })
      .returning();
    return budget;
  }
  
  async updateBudget(id: number, budgetData: Partial<Budget>): Promise<Budget> {
    const [budget] = await db
      .select()
      .from(budgets)
      .where(eq(budgets.id, id));
      
    if (!budget) {
      throw new Error(`Presupuesto con ID ${id} no encontrado`);
    }
    
    // Si el presupuesto está en estado "completed", no permitir actualización
    if (budget.status === 'completed') {
      throw new Error(`No se puede actualizar un presupuesto que ya está completado`);
    }
    
    const now = new Date();
    const [updatedBudget] = await db
      .update(budgets)
      .set({
        ...budgetData,
        updatedAt: now
      })
      .where(eq(budgets.id, id))
      .returning();
      
    if (!updatedBudget) {
      throw new Error(`Error al actualizar el presupuesto con ID ${id}`);
    }
    
    return updatedBudget;
  }
}

// Export a singleton instance
// En producción, usamos la implementación con base de datos
export const storage = new DatabaseStorage();
