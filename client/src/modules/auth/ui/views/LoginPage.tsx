import { useEffect } from 'react';
import { useLocation } from 'wouter';
import { LoginForm } from '../components/LoginForm';
import { useAuth } from '../context/AuthContext';

export function LoginPage() {
  const { isAuthenticated, isLoading } = useAuth();
  const [, navigate] = useLocation();
  
  // Redirigir al dashboard si ya está autenticado
  useEffect(() => {
    if (isAuthenticated && !isLoading) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, isLoading, navigate]);

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-gray-50">
      {/* Columna izquierda - Hero */}
      <div className="w-full md:w-1/2 bg-[#251948] text-white p-6 md:p-12 flex flex-col justify-center order-2 md:order-1">
        <div className="max-w-lg ml-auto">
          <h1 className="text-3xl md:text-4xl font-bold mb-6">
            <span className="text-[#02BDEA]">X</span>Task: Plataforma de gestión empresarial
          </h1>
          
          <p className="text-lg mb-8">
            Accede a nuestra completa plataforma de gestión empresarial. Administra proyectos, finanzas, recursos humanos y más en un solo lugar.
          </p>
          
          <div className="space-y-4">
            <div className="flex items-start">
              <div className="bg-[#02BDEA] rounded-full p-1 mr-4 mt-1">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-[#02BDEA]">Gestión integral</h3>
                <p className="text-gray-300">Administra todas las áreas de tu empresa desde una única plataforma integrada.</p>
              </div>
            </div>
            
            <div className="flex items-start">
              <div className="bg-[#02BDEA] rounded-full p-1 mr-4 mt-1">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-[#02BDEA]">Análisis avanzado</h3>
                <p className="text-gray-300">Obtén informes detallados y visualizaciones para tomar mejores decisiones de negocio.</p>
              </div>
            </div>
            
            <div className="flex items-start">
              <div className="bg-[#02BDEA] rounded-full p-1 mr-4 mt-1">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-[#02BDEA]">Seguridad de datos</h3>
                <p className="text-gray-300">Protección de nivel empresarial para mantener tus datos seguros y cumplir con las normativas.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Columna derecha - Formulario */}
      <div className="w-full md:w-1/2 flex items-center justify-center p-6 md:p-12 order-1 md:order-2">
        <LoginForm />
      </div>
    </div>
  );
}