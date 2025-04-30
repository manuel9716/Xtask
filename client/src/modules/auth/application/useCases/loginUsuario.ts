import { AuthRepository } from '../../domain/repositories/AuthRepository';
import { LoginCredentials, AuthResponse } from '../../domain/entities/Usuario';

// Clase que implementa el caso de uso de login
export class LoginUsuarioUseCase {
  constructor(private authRepository: AuthRepository) {}

  // Método principal del caso de uso
  async execute(credentials: LoginCredentials): Promise<AuthResponse> {
    // Validar entrada
    this.validateCredentials(credentials);
    
    try {
      // Delegar la autenticación al repositorio
      const response = await this.authRepository.authenticate(credentials);
      return response;
    } catch (error) {
      // Relanzar el error para que se maneje en la capa superior
      throw error;
    }
  }

  // Método privado para validación básica
  private validateCredentials(credentials: LoginCredentials): void {
    const { identifier, password } = credentials;
    
    if (!identifier || identifier.trim() === '') {
      throw new Error('El nombre de usuario o correo electrónico es requerido');
    }
    
    if (!password || password.trim() === '') {
      throw new Error('La contraseña es requerida');
    }
    
    // Si es email, validamos formato básico
    if (identifier.includes('@')) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(identifier)) {
        throw new Error('El formato del correo electrónico no es válido');
      }
    }
  }
}