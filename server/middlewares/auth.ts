import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

// Decodificar el JWT
export interface DecodedToken {
  userId: number;
  username: string;
  email: string;
  role: string;
  iat?: number;
  exp?: number;
}

// Extender la interfaz Request para incluir el usuario
declare global {
  namespace Express {
    interface Request {
      user?: DecodedToken;
    }
  }
}

// Middleware para verificar el token JWT
export async function authRequired(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  
  if (!authHeader) {
    return res.status(401).json({ 
      success: false, 
      message: 'Token de autenticación no proporcionado' 
    });
  }
  
  const parts = authHeader.split(' ');
  
  if (parts.length !== 2 || parts[0] !== 'Bearer') {
    return res.status(401).json({ 
      success: false, 
      message: 'Formato de token inválido' 
    });
  }
  
  const token = parts[1];
  
  try {
    // Decodificar el token con todos los campos
    console.log('Verificando token con secreto:', process.env.JWT_SECRET || 'xtask-secret-key');
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'xtask-secret-key') as DecodedToken;
    
    // Asignar directamente los datos del token al request
    req.user = decoded;
    
    next();
  } catch (error) {
    return res.status(401).json({ 
      success: false, 
      message: 'Token inválido o expirado',
      error: error instanceof Error ? error.message : 'Error desconocido'
    });
  }
}

// Middleware para verificar roles específicos
export function verifyRoles(roles: string[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ 
        success: false, 
        message: 'No autenticado' 
      });
    }
    
    // Si el usuario tiene un rol de superadmin, permitir todo
    if (req.user.role === 'superadmin') {
      return next();
    }
    
    // Verificar que el rol del usuario esté en la lista de roles permitidos
    if (roles.includes(req.user.role)) {
      return next();
    }
    
    return res.status(403).json({ 
      success: false, 
      message: 'No tienes permisos para realizar esta acción' 
    });
  };
}