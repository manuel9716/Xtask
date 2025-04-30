import { Usuario, LoginCredentials, AuthResponse } from '../entities/Usuario';

// Puerto principal para el repositorio de autenticación
export interface AuthRepository {
  // Método para autenticar un usuario con credenciales
  authenticate(credentials: LoginCredentials): Promise<AuthResponse>;
  
  // Verificar si el token es válido
  validateToken(token: string): Promise<boolean>;
  
  // Obtener el usuario actual por su token
  getUserByToken(token: string): Promise<Omit<Usuario, 'password'> | null>;
  
  // Cerrar sesión (invalidar token)
  logout(token: string): Promise<void>;
}