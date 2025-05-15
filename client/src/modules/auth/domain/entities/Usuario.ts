// Roles de usuario en el sistema
export enum RolUsuario {
  ADMIN = 'admin',
  MANAGER = 'manager',
  USER = 'user'
}

// Entidad Usuario para manejar datos de autenticación
export interface Usuario {
  id: number;
  username: string;
  email: string;
  fullName: string;
  role: RolUsuario | string;
}

// Respuesta del servidor al iniciar sesión
export interface LoginResponse {
  token: string;
  user: Usuario;
}

// Datos para iniciar sesión
export interface LoginData {
  identifier: string; // Puede ser username o email
  password: string;
}

// Datos para registro
export interface RegisterData {
  username: string;
  email: string;
  password: string;
  fullName: string;
  role?: RolUsuario | string;
}

// Datos para solicitar recuperación de contraseña
export interface ForgotPasswordData {
  email: string;
}

// Datos para restablecer contraseña
export interface ResetPasswordData {
  token: string;
  newPassword: string;
}

// Respuesta de validación de token
export interface ValidateResetTokenResponse {
  valid: boolean;
  message: string;
  userId?: number;
}