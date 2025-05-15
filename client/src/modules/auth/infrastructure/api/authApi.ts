import { AuthRepository } from '../../domain/repositories/AuthRepository';
import { 
  LoginData, 
  RegisterData, 
  Usuario, 
  LoginResponse, 
  ForgotPasswordData, 
  ResetPasswordData, 
  ValidateResetTokenResponse 
} from '../../domain/entities/Usuario';
import axios from 'axios';

// Constantes para tokens de autenticación
const AUTH_TOKEN_KEY = 'auth_token';
const API_BASE_URL = '/api/auth';

/**
 * Implementación del repositorio de autenticación utilizando llamadas a la API REST
 */
export class AuthApiRepository implements AuthRepository {
  /**
   * Inicia sesión con las credenciales proporcionadas
   * @param loginData Datos de inicio de sesión
   * @returns Respuesta con token y datos de usuario
   */
  async login(loginData: LoginData): Promise<LoginResponse> {
    try {
      const response = await axios.post<LoginResponse>(`${API_BASE_URL}/login`, loginData);
      
      // Almacenar el token en localStorage para persistencia
      if (response.data.token) {
        localStorage.setItem(AUTH_TOKEN_KEY, response.data.token);
      }
      
      return response.data;
    } catch (error: any) {
      if (error.response && error.response.data && error.response.data.message) {
        throw new Error(error.response.data.message);
      }
      throw new Error('Error al iniciar sesión');
    }
  }
  
  /**
   * Registra un nuevo usuario
   * @param registerData Datos del nuevo usuario
   * @returns Respuesta con token y datos del usuario creado
   */
  async register(registerData: RegisterData): Promise<LoginResponse> {
    try {
      const response = await axios.post<LoginResponse>(`${API_BASE_URL}/register`, registerData);
      
      // Almacenar el token en localStorage para persistencia
      if (response.data.token) {
        localStorage.setItem(AUTH_TOKEN_KEY, response.data.token);
      }
      
      return response.data;
    } catch (error: any) {
      if (error.response && error.response.data && error.response.data.message) {
        throw new Error(error.response.data.message);
      }
      throw new Error('Error al registrar usuario');
    }
  }
  
  /**
   * Cierra la sesión del usuario actual
   * @returns Promise<boolean> indicando si la operación fue exitosa
   */
  async logout(): Promise<boolean> {
    try {
      const token = localStorage.getItem(AUTH_TOKEN_KEY);
      
      if (token) {
        await axios.post(`${API_BASE_URL}/logout`, {}, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
      }
      
      // Eliminar el token de localStorage
      localStorage.removeItem(AUTH_TOKEN_KEY);
      
      return true;
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
      // Aún así, eliminar el token localmente
      localStorage.removeItem(AUTH_TOKEN_KEY);
      return false;
    }
  }
  
  /**
   * Obtiene la información del usuario actual
   * @returns Datos del usuario o null si no hay sesión
   */
  async getCurrentUser(): Promise<Usuario | null> {
    try {
      const token = localStorage.getItem(AUTH_TOKEN_KEY);
      
      if (!token) {
        return null;
      }
      
      const response = await axios.get<Usuario>(`${API_BASE_URL}/me`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      return response.data;
    } catch (error) {
      // Si hay error, probablemente el token expiró o es inválido
      localStorage.removeItem(AUTH_TOKEN_KEY);
      return null;
    }
  }
  
  /**
   * Valida un token de autenticación
   * @param token Token JWT a validar
   * @returns true si el token es válido, false en caso contrario
   */
  async validateToken(token: string): Promise<boolean> {
    try {
      const response = await axios.post<{ valid: boolean }>(`${API_BASE_URL}/validate-token`, { token });
      return response.data.valid;
    } catch (error) {
      return false;
    }
  }
  
  /**
   * Comprueba si hay un usuario autenticado
   * @returns true si hay un token almacenado, false en caso contrario
   */
  isAuthenticated(): boolean {
    const token = localStorage.getItem(AUTH_TOKEN_KEY);
    return !!token;
  }
  
  /**
   * Obtiene el token de autenticación almacenado
   * @returns El token JWT o null si no hay sesión
   */
  getToken(): string | null {
    return localStorage.getItem(AUTH_TOKEN_KEY);
  }
}