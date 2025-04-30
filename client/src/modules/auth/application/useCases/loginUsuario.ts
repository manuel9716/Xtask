import { AuthRepository } from '../../domain/repositories/AuthRepository';
import { LoginData, LoginResponse } from '../../domain/entities/Usuario';

/**
 * Caso de uso para inicio de sesión
 */
export class LoginUsuarioUseCase {
  constructor(private authRepository: AuthRepository) {}

  /**
   * Ejecuta el caso de uso de inicio de sesión
   * @param loginData Datos de inicio de sesión
   * @returns Respuesta del servidor con token y datos de usuario
   * @throws Error si las credenciales son inválidas
   */
  async execute(loginData: LoginData): Promise<LoginResponse> {
    try {
      // Validar los datos de entrada
      if (!loginData.identifier || !loginData.password) {
        throw new Error('El usuario/email y la contraseña son obligatorios');
      }

      // Llamar al repositorio para realizar la autenticación
      const response = await this.authRepository.login(loginData);
      
      return response;
    } catch (error: any) {
      // Propagar el error para que se maneje en la capa superior
      throw new Error(error.message || 'Error al iniciar sesión');
    }
  }
}