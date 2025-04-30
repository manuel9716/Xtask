import React from 'react';
import { LoginForm } from '../components/LoginForm';
import { Logo } from '@/components/logo';

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row">
      {/* Hero Section - Solo visible en vista de escritorio */}
      <div className="hidden md:flex md:w-1/2 bg-[#251948] p-10 text-white flex-col justify-between">
        <div>
          <Logo size="lg" textClassName="text-white" />
        </div>
        
        <div className="space-y-6 max-w-md">
          <h1 className="text-4xl font-bold mb-6">Plataforma de Gestión Empresarial</h1>
          <p className="text-xl">
            Accede a todas las herramientas que necesitas para gestionar tu empresa en un solo lugar.
          </p>
          <ul className="space-y-2 mt-8">
            <li className="flex items-center">
              <svg className="h-5 w-5 mr-2 text-[#02BDEA]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Gestión completa de proyectos
            </li>
            <li className="flex items-center">
              <svg className="h-5 w-5 mr-2 text-[#02BDEA]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Administración financiera integrada
            </li>
            <li className="flex items-center">
              <svg className="h-5 w-5 mr-2 text-[#02BDEA]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Sistema de nómina avanzado
            </li>
            <li className="flex items-center">
              <svg className="h-5 w-5 mr-2 text-[#02BDEA]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Gestión de proveedores y compras
            </li>
          </ul>
        </div>
        
        <div className="text-sm text-gray-300">
          © {new Date().getFullYear()} XTask. Todos los derechos reservados.
        </div>
      </div>
      
      {/* Formulario de Login */}
      <div className="flex flex-col flex-1 px-4 py-12 justify-center items-center bg-white md:bg-gray-50">
        {/* Logo solo visible en mobile */}
        <div className="md:hidden mb-10">
          <Logo size="lg" />
        </div>
        
        <LoginForm />
        
        {/* Footer solo visible en mobile */}
        <div className="md:hidden mt-10 text-sm text-gray-500 text-center">
          © {new Date().getFullYear()} XTask. Todos los derechos reservados.
        </div>
      </div>
    </div>
  );
}