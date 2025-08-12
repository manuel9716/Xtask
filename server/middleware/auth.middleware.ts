import { Request, Response, NextFunction } from 'express';

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ error: "No autenticado" });
  }
  next();
}

export function optionalAuth(req: Request, res: Response, next: NextFunction) {
  // Este middleware permite tanto usuarios autenticados como no autenticados
  next();
}