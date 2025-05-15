import { User } from '@shared/schema';

// Extender los tipos de Express para incluir un campo de usuario en Request
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: number;
        username: string;
        email: string;
        role: string;
      };
    }
  }
}