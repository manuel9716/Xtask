import React, { createContext, useContext, useEffect, useState } from 'react';
import { Usuario, LoginCredentials, AuthResponse } from '../../domain/entities/Usuario';
import { AuthApiRepository } from '../../infrastructure/api/authApi';
import { LoginUsuarioUseCase } from '../../application/useCases/loginUsuario';

interface AuthContextType {
  user: Omit<Usuario, 'password'> | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (credentials: LoginCredentials) => Promise<AuthResponse>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe usarse dentro de un AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<Omit<Usuario, 'password'> | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  
  // Inicializamos el repositorio y caso de uso
  const authRepository = new AuthApiRepository();
  const loginUseCase = new LoginUsuarioUseCase(authRepository);

  // Comprobación inicial de autenticación
  useEffect(() => {
    const checkAuth = async () => {
      setIsLoading(true);
      
      try {
        const token = authRepository.getToken();
        
        if (token) {
          // Validar el token actual
          const isValid = await authRepository.validateToken(token);
          
          if (isValid) {
            // Obtener información del usuario actual
            const userData = await authRepository.getUserByToken(token);
            if (userData) {
              setUser(userData);
            } else {
              // Token válido pero no pudimos obtener los datos del usuario
              await logout();
            }
          } else {
            // Token inválido, cerrar sesión
            await logout();
          }
        }
      } catch (error) {
        console.error('Error al verificar autenticación:', error);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };
    
    checkAuth();
  }, []);
  
  // Función de login
  const login = async (credentials: LoginCredentials): Promise<AuthResponse> => {
    setIsLoading(true);
    
    try {
      // Ejecutamos el caso de uso de login
      const response = await loginUseCase.execute(credentials);
      
      // Actualizamos el estado con los datos del usuario
      setUser(response.user);
      
      return response;
    } catch (error) {
      setUser(null);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };
  
  // Función de logout
  const logout = async (): Promise<void> => {
    setIsLoading(true);
    
    try {
      const token = authRepository.getToken();
      if (token) {
        await authRepository.logout(token);
      }
      setUser(null);
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  // El valor que expondremos en el contexto
  const value: AuthContextType = {
    user,
    isLoading,
    isAuthenticated: !!user,
    login,
    logout,
  };
  
  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};