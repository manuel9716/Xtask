import { Router, Request, Response } from 'express';
import { db } from '../db';
import { users } from '@shared/schema';

// Crear un router para el endpoint temporal
export const tempUserListRouter = Router();

// Endpoint temporal para listar usuarios sin autenticación (SOLO PARA PRUEBAS)
tempUserListRouter.get('/', async (_req: Request, res: Response) => {
  try {
    console.log('Listando usuarios sin verificación de autenticación (temporal)');
    
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