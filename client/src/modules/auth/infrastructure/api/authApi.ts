import { AuthRepository } from '../../domain/repositories/AuthRepository';
import { LoginCredentials, AuthResponse, Usuario } from '../../domain/entities/Usuario';
import { apiRequest } from '@/lib/queryClient';

// Implementación del repositorio que usa la API para la autenticación
export class AuthApiRepository implements AuthRepository {
  private tokenKey = 'xtask_auth_token';

  async authenticate(credentials: LoginCredentials): Promise<AuthResponse> {
    try {
      const response = await apiRequest('POST', '/api/auth/login', credentials);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error en la autenticación');
      }
      
      const data = await response.json();
      
      // Guardar el token en localStorage para la persistencia
      localStorage.setItem(this.tokenKey, data.token);
      
      return data;
    } catch (error) {
      throw error instanceof Error 
        ? error 
        : new Error('Error inesperado durante la autenticación');
    }
  }

  async validateToken(token: string): Promise<boolean> {
    try {
      const response = await apiRequest('POST', '/api/auth/validate-token', { token });
      return response.ok;
    } catch (error) {
      return false;
    }
  }

  async getUserByToken(token: string): Promise<Omit<Usuario, 'password'> | null> {
    try {
      const response = await apiRequest('GET', '/api/auth/me', undefined, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        return null;
      }
      
      return await response.json();
    } catch (error) {
      return null;
    }
  }

  async logout(token: string): Promise<void> {
    try {
      await apiRequest('POST', '/api/auth/logout', undefined, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      // Eliminar el token almacenado
      localStorage.removeItem(this.tokenKey);
    } catch (error) {
      // En caso de error, aún eliminamos el token local
      localStorage.removeItem(this.tokenKey);
      throw error;
    }
  }

  // Método auxiliar para obtener el token actual
  getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }
}