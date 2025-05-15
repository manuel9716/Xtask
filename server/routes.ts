import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertProjectSchema, insertTaskSchema, insertEmployeeSchema, insertSupplierSchema, insertBudgetSchema } from "@shared/schema";
import express from "express";
import empleadosRouter from "./routes/empleados.updated.routes";
import nominaRouter from "./routes/nomina.routes";
import proyectosRouter from "./routes/proyectos.routes";
import dashboardRouter from "./routes/dashboard.routes";
import employeeProjectsRouter from "./routes/employee-projects.routes";
import evaluacionesRouter from "./routes/evaluaciones.routes";
import capacitacionesRouter from "./routes/capacitaciones.routes";
import microLearningRouter from "./routes/microlearning.routes";
import authRouter from "./routes/auth.routes";
import kpiRouter from "./routes/kpi.routes";
import tasksRouter from "./routes/tasks.routes";
import activityLogsRouter from "./routes/activity-logs.routes";
import { tempCreateUserRouter } from "./routes/temp-create-user.routes";
import { tempUserListRouter } from "./routes/temp-user-list.routes";

export async function registerRoutes(app: Express): Promise<Server> {
  // Rutas de autenticación
  app.use('/api/auth', authRouter);
  
  // Rutas temporales para pruebas
  app.use('/api/temp-create-user', tempCreateUserRouter);
  
  // Endpoint directo para listado de usuarios sin autenticación
  app.get('/api/temp-users', async (_req, res) => {
    try {
      console.log('Listando usuarios sin verificación de autenticación (directo)');
      
      // Importar dependencias
      const { db } = await import('./db');
      const { users } = await import('@shared/schema');
      
      // Obtener todos los usuarios
      const allUsers = await db.query.users.findMany({
        orderBy: (users, { desc }) => [desc(users.id)]
      });
      
      // Eliminar contraseñas
      const usersWithoutPasswords = allUsers.map(user => {
        const { password, ...userWithoutPassword } = user;
        return userWithoutPassword;
      });
      
      res.json(usersWithoutPasswords);
    } catch (error) {
      console.error('Error al listar usuarios temporalmente:', error);
      res.status(500).json({ error: 'Error al listar usuarios' });
    }
  });
  
  // Ruta para empleados
  app.use('/api/empleados', empleadosRouter);
  
  // Ruta para nómina
  app.use('/api/nomina', nominaRouter);
  
  // Ruta para proyectos
  app.use('/api/proyectos', proyectosRouter);
  
  // Ruta para el dashboard
  app.use('/api/dashboard', dashboardRouter);
  
  // Ruta para empleados-proyectos
  app.use('/api/employee-projects', employeeProjectsRouter);
  
  // Ruta para evaluaciones
  app.use('/api/evaluaciones', evaluacionesRouter);
  
  // Ruta para capacitaciones
  app.use('/api/capacitaciones', capacitacionesRouter);
  
  // Ruta para microlearning
  app.use('/api/microlearning', microLearningRouter);
  
  // Ruta para KPIs
  app.use('/api/kpi', kpiRouter);
  
  // Ruta para tareas
  app.use('/api/tasks', tasksRouter);
  
  // Ruta para registros de actividad
  app.use('/api/activity-logs', activityLogsRouter);
  
  // Importar el middleware de autenticación
  const { authRequired } = await import('./middlewares/auth');
  
  // Endpoint para crear un nuevo usuario (como administrador)
  app.post('/api/users', authRequired, async (req, res) => {
    try {
      // Verificar que el usuario es administrador
      if (req.user?.role !== 'admin') {
        return res.status(403).json({ 
          error: 'No tienes permisos para crear usuarios. Solo los administradores pueden realizar esta acción.' 
        });
      }
      
      // Importar dependencias
      const { db } = await import('./db');
      const { users, insertUserSchema } = await import('@shared/schema');
      
      // Validar datos de entrada
      try {
        insertUserSchema.parse(req.body);
      } catch (validationError) {
        console.error('Error de validación:', validationError);
        return res.status(400).json({ error: 'Datos de usuario inválidos' });
      }
      
      // Verificar si el usuario ya existe
      const userExists = await db.query.users.findFirst({
        where: (users, { eq, or }) => or(
          eq(users.username, req.body.username),
          eq(users.email, req.body.email)
        )
      });
      
      if (userExists) {
        return res.status(409).json({ error: 'El nombre de usuario o email ya está en uso' });
      }
      
      // Hashear la contraseña
      const bcrypt = await import('bcrypt');
      const hashedPassword = await bcrypt.hash(req.body.password, 10);
      
      // Crear el usuario
      const newUser = await db.insert(users).values({
        ...req.body,
        password: hashedPassword,
        isActive: true,
        createdAt: new Date()
      }).returning();
      
      // Devolver el usuario creado (sin la contraseña)
      const { password, ...userWithoutPassword } = newUser[0];
      res.status(201).json(userWithoutPassword);
    } catch (error) {
      console.error('Error al crear usuario:', error);
      res.status(500).json({ error: 'Error al crear usuario' });
    }
  });
  
  // Endpoint para listar usuarios
  app.get('/api/users', authRequired, async (req, res) => {
    try {
      // Verificar que el usuario tiene permisos adecuados
      if (req.user?.role !== 'admin' && req.user?.role !== 'manager') {
        return res.status(403).json({ 
          error: 'No tienes permisos para listar usuarios.' 
        });
      }
      
      // Importar dependencias
      const { db } = await import('./db');
      const { users } = await import('@shared/schema');
      
      // Obtener todos los usuarios
      const allUsers = await db.query.users.findMany({
        orderBy: (users, { desc }) => [desc(users.id)]
      });
      
      // Eliminar contraseñas
      const usersWithoutPasswords = allUsers.map(user => {
        const { password, ...userWithoutPassword } = user;
        return userWithoutPassword;
      });
      
      res.json(usersWithoutPasswords);
    } catch (error) {
      console.error('Error al listar usuarios:', error);
      res.status(500).json({ error: 'Error al listar usuarios' });
    }
  });
  
  const httpServer = createServer(app);
  return httpServer;
}
