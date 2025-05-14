import { Router, Request, Response } from 'express';
import { db } from '../db';
import { users, insertUserSchema } from '@shared/schema';
import bcrypt from 'bcrypt';

// Crear un router para el endpoint temporal
export const tempCreateUserRouter = Router();

// Endpoint temporal para crear usuarios sin autenticación (SOLO PARA PRUEBAS)
tempCreateUserRouter.post('/', async (req: Request, res: Response) => {
  try {
    console.log('Usando endpoint temporal para crear usuario sin autenticación');
    
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
    res.status(201).json({ 
      success: true, 
      message: 'Usuario creado exitosamente', 
      user: userWithoutPassword 
    });
  } catch (error) {
    console.error('Error al crear usuario temporal:', error);
    res.status(500).json({ error: 'Error al crear usuario' });
  }
});