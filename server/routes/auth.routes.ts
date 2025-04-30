import { Router, Request, Response } from 'express';
import { db } from '../db';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import { eq, or } from 'drizzle-orm';
import { users } from '@shared/schema';
import { z } from 'zod';

const authRouter = Router();

// Secreto para JWT - idealmente debería estar en variables de entorno
const JWT_SECRET = process.env.JWT_SECRET || 'xtask-secret-key';
const TOKEN_EXPIRY = '8h';

// Esquema de validación para login
const loginSchema = z.object({
  identifier: z.string().min(1, 'El usuario o correo es requerido'),
  password: z.string().min(1, 'La contraseña es requerida'),
});

// Ruta para login
authRouter.post('/login', async (req: Request, res: Response) => {
  try {
    const parseResult = loginSchema.safeParse(req.body);
    if (!parseResult.success) {
      return res.status(400).json({ 
        message: 'Datos de autenticación inválidos', 
        errors: parseResult.error.errors 
      });
    }

    const { identifier, password } = parseResult.data;

    // Buscar usuario por email o username
    const [user] = await db
      .select()
      .from(users)
      .where(
        or(
          eq(users.email, identifier),
          eq(users.username, identifier)
        )
      )
      .limit(1);

    if (!user) {
      return res.status(401).json({ message: 'Credenciales incorrectas' });
    }

    // Verificar si la cuenta está activa (si el campo existe)
    if (user.isActive === false) {
      return res.status(403).json({ message: 'Esta cuenta ha sido desactivada' });
    }

    // Verificar la contraseña - asumiendo que está hasheada con bcrypt
    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return res.status(401).json({ message: 'Credenciales incorrectas' });
    }

    // Generar token JWT
    const token = jwt.sign(
      { 
        userId: user.id,
        username: user.username, 
        role: user.role 
      },
      JWT_SECRET,
      { expiresIn: TOKEN_EXPIRY }
    );

    // Crear respuesta sin incluir la contraseña
    const { password: _, ...userWithoutPassword } = user;
    
    // Enviar respuesta
    res.status(200).json({
      user: userWithoutPassword,
      token
    });
  } catch (error: any) {
    console.error('Error en autenticación:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
});

// Ruta para validar token
authRouter.post('/validate-token', async (req: Request, res: Response) => {
  try {
    const { token } = req.body;
    
    if (!token) {
      return res.status(400).json({ message: 'Token no proporcionado' });
    }
    
    jwt.verify(token, JWT_SECRET);
    res.status(200).json({ valid: true });
  } catch (error) {
    res.status(401).json({ valid: false, message: 'Token inválido' });
  }
});

// Ruta para obtener datos del usuario actual
authRouter.get('/me', async (req: Request, res: Response) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Token no proporcionado' });
    }
    
    const token = authHeader.substring(7); // Eliminar 'Bearer ' del encabezado
    
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as { userId: number };
      
      // Buscar el usuario por ID
      const [user] = await db
        .select()
        .from(users)
        .where(eq(users.id, decoded.userId))
        .limit(1);
      
      if (!user) {
        return res.status(404).json({ message: 'Usuario no encontrado' });
      }
      
      // Excluir la contraseña
      const { password: _, ...userWithoutPassword } = user;
      res.status(200).json(userWithoutPassword);
    } catch (error) {
      return res.status(401).json({ message: 'Token inválido' });
    }
  } catch (error: any) {
    console.error('Error al obtener usuario:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
});

// Ruta para cerrar sesión
// En realidad, con JWT, el logout es principalmente del lado del cliente
// Aquí podríamos implementar una lista negra de tokens si se requiere
authRouter.post('/logout', (req: Request, res: Response) => {
  try {
    // En un sistema simple con JWT, el cliente simplemente elimina el token
    // Si se requiere logout del servidor, aquí se añadiría el token a una lista negra
    
    res.status(200).json({ message: 'Sesión cerrada correctamente' });
  } catch (error: any) {
    console.error('Error al cerrar sesión:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
});

export default authRouter;