import { Request, Response, NextFunction } from 'express';

// Middleware para verificar que el usuario está autenticado
export function authRequired(req: Request, res: Response, next: NextFunction) {
  // En un entorno real, verificarían el JWT o la sesión
  // Para el propósito de este prototipo, permitimos acceso
  next();
}