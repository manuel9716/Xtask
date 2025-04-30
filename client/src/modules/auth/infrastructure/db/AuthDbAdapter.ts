import { AuthRepository } from '../../domain/repositories/AuthRepository';
import { LoginCredentials, AuthResponse, Usuario } from '../../domain/entities/Usuario';

// NOTA: Esta clase es un esqueleto para el backend y no debe usarse en el frontend
// Se mantiene aquí solo como referencia para la implementación en el servidor
export class AuthDbAdapter implements AuthRepository {
  private readonly JWT_SECRET = 'xtask-secret-key';
  private readonly TOKEN_EXPIRY = '8h';

  async authenticate(credentials: LoginCredentials): Promise<AuthResponse> {
    // IMPLEMENTACIÓN DEL SERVIDOR
    // Este código debe adaptarse para usar el ORM del servidor y el esquema real
    // Esta implementación no funcionará en el cliente y se proporciona solo como guía
    
    throw new Error('AuthDbAdapter no debe ser usado en el cliente. Use AuthApiRepository en su lugar.');
  }

  async validateToken(token: string): Promise<boolean> {
    // IMPLEMENTACIÓN DEL SERVIDOR
    throw new Error('AuthDbAdapter no debe ser usado en el cliente. Use AuthApiRepository en su lugar.');
  }

  async getUserByToken(token: string): Promise<Omit<Usuario, 'password'> | null> {
    // IMPLEMENTACIÓN DEL SERVIDOR
    throw new Error('AuthDbAdapter no debe ser usado en el cliente. Use AuthApiRepository en su lugar.');
  }

  async logout(token: string): Promise<void> {
    // IMPLEMENTACIÓN DEL SERVIDOR
    throw new Error('AuthDbAdapter no debe ser usado en el cliente. Use AuthApiRepository en su lugar.');
  }
}