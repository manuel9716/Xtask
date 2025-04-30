// Entidad Usuario en el dominio
export interface Usuario {
  id: number;
  username: string;
  email: string;
  password?: string; // Opcional porque no siempre queremos exponer la contraseña
  role: string;
  fullName: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt?: Date;
}

// DTO para Login (lo que se envía en el formulario)
export interface LoginCredentials {
  identifier: string; // Puede ser username o email
  password: string;
}

// Respuesta de autenticación exitosa
export interface AuthResponse {
  user: Omit<Usuario, 'password'>; // Excluimos la contraseña
  token: string;
}