import React from 'react';
import { useLocation, Redirect } from 'wouter';
import { useAuth } from '../context/AuthContext';
import { Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  redirectTo?: string;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  redirectTo = '/login',
}) => {
  const { isAuthenticated, isLoading } = useAuth();
  const [location] = useLocation();

  // Mientras verificamos el estado de autenticación, mostramos un spinner
  if (isLoading) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-white/80 z-50">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Si no está autenticado, redirigimos al login
  if (!isAuthenticated) {
    return <Redirect to={`${redirectTo}?redirect=${encodeURIComponent(location)}`} />;
  }

  // Si está autenticado, renderizamos los children
  return <>{children}</>;
};