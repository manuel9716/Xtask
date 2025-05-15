import { useEffect } from 'react';
import { Redirect, useLocation } from 'wouter';
import { ResetPasswordForm } from '../components/ResetPasswordForm';
import { useAuth } from '../context/AuthContext';

/**
 * Página para restablecer contraseña con token
 */
export function ResetPasswordPage() {
  const { isAuthenticated } = useAuth();
  const [location] = useLocation();
  
  // Título de la página
  useEffect(() => {
    document.title = 'XTask - Nueva Contraseña';
  }, []);

  // Si el usuario ya está autenticado, redirigir al dashboard
  if (isAuthenticated) {
    return <Redirect to="/dashboard" />;
  }
  
  // Extraer token de la URL
  const params = new URLSearchParams(location.split('?')[1]);
  const token = params.get('token');
  
  // Si no hay token, redirigir a la página de solicitud
  if (!token) {
    return <Redirect to="/auth/forgot-password" />;
  }

  return (
    <div className="flex min-h-screen">
      {/* Formulario de restablecimiento de contraseña */}
      <div className="flex flex-col justify-center items-center w-full md:w-1/2 p-8">
        <div className="w-full max-w-md">
          <h1 className="text-2xl font-bold text-center mb-6">
            <span className="text-[#02BDEA]">X</span>
            <span className="text-[#251948]">task</span>
          </h1>
          
          <ResetPasswordForm token={token} />
        </div>
      </div>
      
      {/* Banner lateral */}
      <div className="hidden md:flex md:w-1/2 bg-[#251948] flex-col justify-center items-center p-8">
        <div className="max-w-md text-white">
          <h2 className="text-3xl font-bold mb-4">Gestión empresarial simplificada</h2>
          <p className="mb-6">
            Plataforma completa para administrar proyectos, finanzas, recursos humanos y más.
            Establezca una nueva contraseña segura para acceder a todas las funcionalidades.
          </p>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white/10 p-4 rounded-lg">
              <h3 className="font-semibold mb-2">Proyectos</h3>
              <p className="text-sm">Gestione tareas, equipos y progreso de forma eficiente.</p>
            </div>
            <div className="bg-white/10 p-4 rounded-lg">
              <h3 className="font-semibold mb-2">Finanzas</h3>
              <p className="text-sm">Control total de presupuestos, gastos e ingresos.</p>
            </div>
            <div className="bg-white/10 p-4 rounded-lg">
              <h3 className="font-semibold mb-2">Empleados</h3>
              <p className="text-sm">Administre personal, nóminas y evaluaciones.</p>
            </div>
            <div className="bg-white/10 p-4 rounded-lg">
              <h3 className="font-semibold mb-2">Reportes</h3>
              <p className="text-sm">Analíticas detalladas para la toma de decisiones.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}