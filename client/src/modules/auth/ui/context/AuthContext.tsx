import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { 
  Usuario, 
  LoginData, 
  RegisterData, 
  ForgotPasswordData, 
  ResetPasswordData, 
  ValidateResetTokenResponse 
} from '../../domain/entities/Usuario';
import { AuthApiRepository } from '../../infrastructure/api/authApi';
import { LoginUsuarioUseCase } from '../../application/useCases/loginUsuario';
import { useToast } from '@/hooks/use-toast';

// Interface para el contexto de autenticación
interface AuthContextType {
  user: Usuario | null;
  isLoading: boolean;
  error: string | null;
  login: (credentials: LoginData) => Promise<boolean>;
  register: (userData: RegisterData) => Promise<boolean>;
  logout: () => Promise<void>;
  forgotPassword: (data: ForgotPasswordData) => Promise<string>;
  validateResetToken: (token: string) => Promise<ValidateResetTokenResponse>;
  resetPassword: (data: ResetPasswordData) => Promise<string>;
  isAuthenticated: boolean;
}

// Creación del contexto
const AuthContext = createContext<AuthContextType | null>(null);

// Instancia del repositorio de autenticación
const authRepository = new AuthApiRepository();

// Props para el proveedor de autenticación
interface AuthProviderProps {
  children: ReactNode;
}

// Proveedor de autenticación
export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<Usuario | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const { toast } = useToast();

  // Crear instancia del caso de uso
  const loginUseCase = new LoginUsuarioUseCase(authRepository);

  // Verificar autenticación al cargar el componente
  useEffect(() => {
    const checkAuth = async () => {
      setIsLoading(true);
      try {
        // Verificar si hay token en localStorage
        if (authRepository.isAuthenticated()) {
          // Obtener datos del usuario actual
          const userData = await authRepository.getCurrentUser();
          if (userData) {
            setUser(userData);
            setIsAuthenticated(true);
          } else {
            // Si no se pudo obtener el usuario, limpiar estado
            setUser(null);
            setIsAuthenticated(false);
          }
        } else {
          setUser(null);
          setIsAuthenticated(false);
        }
      } catch (err: any) {
        setError(err.message || 'Error al verificar autenticación');
        setUser(null);
        setIsAuthenticated(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  // Función para iniciar sesión
  const login = async (credentials: LoginData): Promise<boolean> => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Utilizar el caso de uso para autenticar
      const response = await loginUseCase.execute(credentials);
      
      setUser(response.user);
      setIsAuthenticated(true);
      
      toast({
        title: "Inicio de sesión exitoso",
        description: `Bienvenido, ${response.user.fullName}`,
      });
      
      return true;
    } catch (err: any) {
      setError(err.message || 'Error al iniciar sesión');
      setIsAuthenticated(false);
      
      toast({
        title: "Error de autenticación",
        description: err.message || 'Credenciales inválidas',
        variant: "destructive",
      });
      
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Función para registrar nuevo usuario
  const register = async (userData: RegisterData): Promise<boolean> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await authRepository.register(userData);
      
      setUser(response.user);
      setIsAuthenticated(true);
      
      toast({
        title: "Registro exitoso",
        description: `Bienvenido, ${response.user.fullName}`,
      });
      
      return true;
    } catch (err: any) {
      setError(err.message || 'Error al registrar usuario');
      setIsAuthenticated(false);
      
      toast({
        title: "Error de registro",
        description: err.message || 'No se pudo completar el registro',
        variant: "destructive",
      });
      
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Función para cerrar sesión
  const logout = async (): Promise<void> => {
    setIsLoading(true);
    
    try {
      await authRepository.logout();
      
      setUser(null);
      setIsAuthenticated(false);
      
      toast({
        title: "Sesión cerrada",
        description: "Has cerrado sesión correctamente",
      });
    } catch (err: any) {
      setError(err.message || 'Error al cerrar sesión');
      
      toast({
        title: "Error",
        description: "No se pudo cerrar la sesión correctamente",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Función para solicitar recuperación de contraseña
  const forgotPassword = async (data: ForgotPasswordData): Promise<string> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await authRepository.forgotPassword(data);
      
      toast({
        title: "Solicitud enviada",
        description: response.message,
      });
      
      return response.message;
    } catch (err: any) {
      setError(err.message || 'Error al solicitar recuperación de contraseña');
      
      toast({
        title: "Error",
        description: err.message || 'No se pudo procesar la solicitud',
        variant: "destructive",
      });
      
      throw err;
    } finally {
      setIsLoading(false);
    }
  };
  
  // Función para validar token de restablecimiento
  const validateResetToken = async (token: string): Promise<ValidateResetTokenResponse> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await authRepository.validateResetToken(token);
      return response;
    } catch (err: any) {
      setError(err.message || 'Error al validar token');
      
      toast({
        title: "Error",
        description: err.message || 'Token inválido o expirado',
        variant: "destructive",
      });
      
      return {
        valid: false,
        message: err.message || 'Token inválido o expirado'
      };
    } finally {
      setIsLoading(false);
    }
  };
  
  // Función para restablecer contraseña
  const resetPassword = async (data: ResetPasswordData): Promise<string> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await authRepository.resetPassword(data);
      
      toast({
        title: "Contraseña actualizada",
        description: response.message,
      });
      
      return response.message;
    } catch (err: any) {
      setError(err.message || 'Error al restablecer contraseña');
      
      toast({
        title: "Error",
        description: err.message || 'No se pudo restablecer la contraseña',
        variant: "destructive",
      });
      
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // Valor del contexto
  const contextValue: AuthContextType = {
    user,
    isLoading,
    error,
    login,
    register,
    logout,
    forgotPassword,
    validateResetToken,
    resetPassword,
    isAuthenticated
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
}

// Hook personalizado para usar el contexto de autenticación
export function useAuth() {
  const context = useContext(AuthContext);
  
  if (!context) {
    throw new Error('useAuth debe ser utilizado dentro de un AuthProvider');
  }
  
  return context;
}