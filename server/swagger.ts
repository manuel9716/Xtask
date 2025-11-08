import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import { Express } from 'express';

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'XtaskFlow API',
      version: '1.0.0',
      description: 'API completa del sistema de gestión empresarial XtaskFlow',
      contact: {
        name: 'XtaskFlow Team',
        email: 'admin@xtask.com',
      },
      license: {
        name: 'MIT',
        url: 'https://opensource.org/licenses/MIT',
      },
    },
    servers: [
      {
        url: 'http://localhost:5001',
        description: 'Servidor de Desarrollo',
      },
      {
        url: 'http://localhost:5000',
        description: 'Servidor de Producción',
      },
    ],
    components: {
      securitySchemes: {
        cookieAuth: {
          type: 'apiKey',
          in: 'cookie',
          name: 'connect.sid',
          description: 'Autenticación basada en sesión con cookies',
        },
      },
      schemas: {
        User: {
          type: 'object',
          properties: {
            id: { type: 'integer', example: 1 },
            username: { type: 'string', example: 'admin' },
            email: { type: 'string', example: 'admin@xtask.com' },
            fullName: { type: 'string', example: 'Admin User' },
            role: { type: 'string', enum: ['admin', 'manager', 'user'], example: 'admin' },
            isActive: { type: 'boolean', example: true },
            createdAt: { type: 'string', format: 'date-time' },
          },
        },
        Project: {
          type: 'object',
          properties: {
            id: { type: 'integer', example: 1 },
            name: { type: 'string', example: 'Proyecto XTask' },
            description: { type: 'string', example: 'Sistema de gestión empresarial' },
            startDate: { type: 'string', format: 'date-time' },
            endDate: { type: 'string', format: 'date-time', nullable: true },
            budget: { type: 'number', format: 'decimal', example: 500000000 },
            remainingBudget: { type: 'number', format: 'decimal', example: 450000000 },
            managerId: { type: 'integer', example: 2, nullable: true },
            status: { type: 'string', enum: ['active', 'paused', 'completed', 'cancelled'], example: 'active' },
            category: { type: 'string', example: 'Desarrollo', nullable: true },
            createdAt: { type: 'string', format: 'date-time' },
          },
        },
        Empleado: {
          type: 'object',
          properties: {
            id: { type: 'integer', example: 1 },
            userId: { type: 'integer', example: 4, nullable: true },
            nombre: { type: 'string', example: 'Manuel' },
            apellido: { type: 'string', example: 'Rodríguez' },
            identificacion: { type: 'string', example: '1115193230' },
            depto: { type: 'string', example: 'Tecnología' },
            cargo: { type: 'string', example: 'Arquitecto de Software' },
            fechaIngreso: { type: 'string', format: 'date' },
            estadoContrato: { type: 'string', example: 'activo' },
            tipoContrato: { type: 'string', example: 'indefinido' },
            salarioBase: { type: 'number', format: 'decimal', example: 4500000, nullable: true },
            telefono: { type: 'string', example: '3166684650', nullable: true },
            activo: { type: 'boolean', example: true },
            createdAt: { type: 'string', format: 'date-time' },
          },
        },
        Nomina: {
          type: 'object',
          properties: {
            id: { type: 'integer', example: 1 },
            proyectoId: { type: 'integer', example: 4, nullable: true },
            rangoInicio: { type: 'string', format: 'date' },
            rangoFin: { type: 'string', format: 'date' },
            estado: { type: 'string', enum: ['pendiente', 'procesando', 'pagado', 'cancelado'], example: 'pendiente' },
            totalBruto: { type: 'number', format: 'decimal', example: 9000000 },
            totalNeto: { type: 'number', format: 'decimal', example: 7200000 },
            creadoPor: { type: 'integer', example: 2 },
            creadoAt: { type: 'string', format: 'date-time' },
            aprobadoPor: { type: 'integer', nullable: true },
            aprobadoAt: { type: 'string', format: 'date-time', nullable: true },
          },
        },
        Budget: {
          type: 'object',
          properties: {
            id: { type: 'integer', example: 1 },
            name: { type: 'string', example: 'Presupuesto XTASK 2025' },
            description: { type: 'string', example: 'Presupuesto anual para desarrollo XTASK' },
            amount: { type: 'number', format: 'decimal', example: 500000000 },
            spent: { type: 'number', format: 'decimal', example: 50000000 },
            startDate: { type: 'string', format: 'date-time' },
            endDate: { type: 'string', format: 'date-time' },
            projectId: { type: 'integer', example: 1, nullable: true },
            createdBy: { type: 'integer', example: 2 },
            status: { type: 'string', example: 'ACTIVO' },
            createdAt: { type: 'string', format: 'date-time' },
          },
        },
        Transaction: {
          type: 'object',
          properties: {
            id: { type: 'integer', example: 1 },
            projectId: { type: 'integer', example: 1, nullable: true },
            amount: { type: 'number', format: 'decimal', example: 1000000 },
            type: { type: 'string', example: 'expense' },
            category: { type: 'string', example: 'development' },
            description: { type: 'string', example: 'Pago de servicios' },
            status: { type: 'string', enum: ['pending', 'approved', 'rejected'], example: 'pending' },
            date: { type: 'string', format: 'date-time' },
            requesterId: { type: 'integer', nullable: true },
            approverId: { type: 'integer', nullable: true },
          },
        },
        Error: {
          type: 'object',
          properties: {
            message: { type: 'string', example: 'Error message' },
            error: { type: 'string', example: 'Detailed error description' },
          },
        },
      },
    },
    tags: [
      { name: 'Authentication', description: 'Endpoints de autenticación' },
      { name: 'Users', description: 'Gestión de usuarios' },
      { name: 'Projects', description: 'Gestión de proyectos' },
      { name: 'Empleados', description: 'Gestión de empleados' },
      { name: 'Nominas', description: 'Gestión de nóminas' },
      { name: 'Budgets', description: 'Gestión de presupuestos' },
      { name: 'Transactions', description: 'Transacciones financieras' },
      { name: 'Health', description: 'Endpoints de salud del sistema' },
    ],
  },
  apis: ['./server/**/*.ts', './server/**/*.routes.ts'], // Archivos a escanear para documentación
};

const swaggerSpec = swaggerJsdoc(options);

export function setupSwagger(app: Express) {
  // Swagger UI
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
    customCss: '.swagger-ui .topbar { display: none }',
    customSiteTitle: 'XtaskFlow API Documentation',
  }));

  // JSON spec
  app.get('/api-docs.json', (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.send(swaggerSpec);
  });

  console.log('📚 Swagger UI disponible en: http://localhost:5001/api-docs');
}

export default swaggerSpec;
