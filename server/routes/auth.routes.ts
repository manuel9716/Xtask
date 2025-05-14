import { Router, Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { db } from '../db';
import { users } from '@shared/schema';
import { eq, and } from 'drizzle-orm';

// Crear router para las rutas de autenticación
const authRouter = Router();

// Configuración de JWT
const JWT_SECRET = process.env.JWT_SECRET || 'xtask-secret-key';
const JWT_EXPIRES_IN = '24h';

// Función para generar un token JWT
const generateToken = (user: any): string => {
  return jwt.sign({
    userId: user.id,
    username: user.username,
    email: user.email,
    role: user.role
  }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
};

// Middleware para verificar el token JWT (en desuso - usar authRequired de los middlewares)
export const verifyToken = (req: Request, res: Response, next: Function) => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'No se proporcionó un token de autenticación' });
  }

  try {
    // Decodificar el token con todos los campos
    const decoded = jwt.verify(token, JWT_SECRET) as { 
      userId: number,
      username: string,
      email: string,
      role: string
    };
    
    // Asignar los datos del token directamente
    req.user = {
      id: decoded.userId,
      username: decoded.username,
      email: decoded.email,
      role: decoded.role
    };
    
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Token inválido o expirado' });
  }
};

// Ruta para iniciar sesión
authRouter.post('/login', async (req: Request, res: Response) => {
  try {
    const { identifier, password } = req.body;

    if (!identifier || !password) {
      return res.status(400).json({ message: 'Debe proporcionar un usuario/email y contraseña' });
    }

    // Buscar usuario por username o email
    const user = await db.query.users.findFirst({
      where: (users, { or }) => or(
        eq(users.username, identifier),
        eq(users.email, identifier)
      )
    });

    if (!user) {
      return res.status(401).json({ message: 'Credenciales inválidas' });
    }

    // Verificar que el usuario esté activo
    if (!user.isActive) {
      return res.status(401).json({ message: 'Su cuenta está desactivada. Contacte al administrador.' });
    }

    // Verificar contraseña
    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return res.status(401).json({ message: 'Credenciales inválidas' });
    }

    // Generar token JWT
    const token = generateToken(user);

    // Enviar respuesta
    return res.status(200).json({
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        fullName: user.fullName,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Error al iniciar sesión:', error);
    return res.status(500).json({ message: 'Error en el servidor al procesar la solicitud' });
  }
});

// Ruta para obtener el perfil del usuario actual
authRouter.get('/me', verifyToken, async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ message: 'Usuario no autenticado' });
    }

    // Buscar usuario por ID
    const user = await db.query.users.findFirst({
      where: eq(users.id, userId)
    });

    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    // Verificar que el usuario esté activo
    if (!user.isActive) {
      return res.status(401).json({ message: 'Su cuenta está desactivada. Contacte al administrador.' });
    }

    // Enviar respuesta sin la contraseña
    return res.status(200).json({
      id: user.id,
      username: user.username,
      email: user.email,
      fullName: user.fullName,
      role: user.role
    });
  } catch (error) {
    console.error('Error al obtener perfil de usuario:', error);
    return res.status(500).json({ message: 'Error en el servidor al procesar la solicitud' });
  }
});

// Ruta para validar un token JWT
authRouter.post('/validate-token', async (req: Request, res: Response) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({ message: 'No se proporcionó un token' });
    }

    try {
      const decoded = jwt.verify(token, JWT_SECRET) as { userId: number };
      
      // Verificar que el usuario exista y esté activo
      const user = await db.query.users.findFirst({
        where: eq(users.id, decoded.userId)
      });

      if (!user || !user.isActive) {
        return res.status(401).json({ 
          valid: false, 
          message: 'Token inválido o usuario desactivado' 
        });
      }

      return res.status(200).json({ 
        valid: true, 
        userId: decoded.userId 
      });
    } catch (jwtError) {
      return res.status(401).json({ 
        valid: false, 
        message: 'Token inválido o expirado' 
      });
    }
  } catch (error) {
    console.error('Error al validar token:', error);
    return res.status(500).json({ message: 'Error en el servidor al procesar la solicitud' });
  }
});

// Ruta para cerrar sesión (invalidación de token se maneja en el cliente)
authRouter.post('/logout', verifyToken, (req: Request, res: Response) => {
  return res.status(200).json({ message: 'Sesión cerrada exitosamente' });
});

// Ruta para registro de usuario (opcional, dependiendo de los requisitos)
authRouter.post('/register', async (req: Request, res: Response) => {
  try {
    const { username, email, password, fullName, role = 'user' } = req.body;

    // Validar datos requeridos
    if (!username || !email || !password || !fullName) {
      return res.status(400).json({ message: 'Todos los campos son obligatorios' });
    }

    // Verificar si el usuario o email ya existen
    const existingUser = await db.query.users.findFirst({
      where: (users, { or }) => or(
        eq(users.username, username),
        eq(users.email, email)
      )
    });

    if (existingUser) {
      return res.status(409).json({ message: 'El nombre de usuario o email ya están en uso' });
    }

    // Hash de la contraseña
    const hashedPassword = await bcrypt.hash(password, 10);

    // Crear el nuevo usuario
    const [newUser] = await db.insert(users)
      .values({
        username,
        email,
        password: hashedPassword,
        fullName,
        role,
        isActive: true
      })
      .returning();

    if (!newUser) {
      return res.status(500).json({ message: 'Error al crear el usuario' });
    }

    // Generar token JWT
    const token = generateToken(newUser);

    // Enviar respuesta
    return res.status(201).json({
      token,
      user: {
        id: newUser.id,
        username: newUser.username,
        email: newUser.email,
        fullName: newUser.fullName,
        role: newUser.role
      }
    });
  } catch (error) {
    console.error('Error al registrar usuario:', error);
    return res.status(500).json({ message: 'Error en el servidor al procesar la solicitud' });
  }
});

export default authRouter;