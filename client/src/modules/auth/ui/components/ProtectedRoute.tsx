import { ReactNode } from 'react';
import { Redirect } from 'wouter';
import { useAuth } from '../context/AuthContext';
import { Loader2 } from 'lucide-react';

// Props para el componente ProtectedRoute
interface ProtectedRouteProps {
  children: ReactNode;
}

/**
 * Componente que protege rutas que requieren autenticación
 * Si el usuario no está autenticado, redirige a la página de login
 */
export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { isAuthenticated, isLoading } = useAuth();

  // Mientras se verifica la autenticación, mostrar un spinner
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="w-10 h-10 text-primary animate-spin" />
      </div>
    );
  }

  // Si no está autenticado, redirigir a login
  if (!isAuthenticated) {
    return <Redirect to="/auth/login" />;
  }

  // Si está autenticado, renderizar los children
  return <>{children}</>;
}