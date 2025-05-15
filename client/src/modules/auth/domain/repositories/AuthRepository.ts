import { LoginData, RegisterData, Usuario, LoginResponse, ForgotPasswordData, ResetPasswordData, ValidateResetTokenResponse } from '../entities/Usuario';

// Interfaz para el repositorio de autenticación
export interface AuthRepository {
  /**
   * Inicia sesión con las credenciales proporcionadas
   * @param loginData Datos de inicio de sesión (identificador y contraseña)
   * @returns Respuesta de inicio de sesión (token y datos de usuario)
   */
  login(loginData: LoginData): Promise<LoginResponse>;
  
  /**
   * Registra un nuevo usuario en el sistema
   * @param registerData Datos para el registro del usuario
   * @returns Respuesta del registro (token y datos del usuario creado)
   */
  register(registerData: RegisterData): Promise<LoginResponse>;
  
  /**
   * Cierra la sesión del usuario actual
   * @returns Promesa que se resuelve cuando la sesión se cierra correctamente
   */
  logout(): Promise<boolean>;
  
  /**
   * Obtiene información del usuario autenticado actualmente
   * @returns Datos del usuario o null si no hay sesión activa
   */
  getCurrentUser(): Promise<Usuario | null>;
  
  /**
   * Valida un token de autenticación
   * @param token Token JWT a validar
   * @returns true si el token es válido, false en caso contrario
   */
  validateToken(token: string): Promise<boolean>;
  
  /**
   * Comprueba si hay un usuario autenticado
   * @returns true si hay un usuario autenticado, false en caso contrario
   */
  isAuthenticated(): boolean;
  
  /**
   * Solicita un correo para restablecer la contraseña
   * @param data Datos para solicitud (email)
   * @returns Mensaje de confirmación
   */
  forgotPassword(data: ForgotPasswordData): Promise<{message: string}>;
  
  /**
   * Valida un token de restablecimiento de contraseña
   * @param token Token de restablecimiento
   * @returns Respuesta indicando si el token es válido
   */
  validateResetToken(token: string): Promise<ValidateResetTokenResponse>;
  
  /**
   * Restablece la contraseña con un token válido
   * @param data Datos para restablecimiento (token y nueva contraseña)
   * @returns Mensaje de confirmación
   */
  resetPassword(data: ResetPasswordData): Promise<{message: string}>;
}