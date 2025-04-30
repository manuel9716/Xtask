import React from 'react';
import { Button } from "@/components/ui/button";
import { LanguageSwitcher } from "./language-switcher";
import { useLocation } from 'wouter';

export function HomeHeader() {
  const [, setLocation] = useLocation();
  
  return (
    <header className="bg-[#251948] w-full">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between py-4">
          {/* Logo */}
          <div className="flex items-center">
            <span className="text-2xl font-bold text-white cursor-pointer" onClick={() => setLocation('/')}>
              XTask
            </span>
          </div>
          
          {/* Enlaces y botones de acción */}
          <div className="flex items-center space-x-6">
            <nav className="hidden md:flex items-center space-x-6">
              <a href="#features" className="text-white hover:text-[#02BDEA] text-sm font-medium">
                Características
              </a>
              <a href="#pricing" className="text-white hover:text-[#02BDEA] text-sm font-medium">
                Precios
              </a>
              <a href="#resources" className="text-white hover:text-[#02BDEA] text-sm font-medium">
                Recursos
              </a>
              <a href="#about" className="text-white hover:text-[#02BDEA] text-sm font-medium">
                Acerca de
              </a>
            </nav>
            
            <div className="flex items-center space-x-3">
              <LanguageSwitcher />
              
              <Button 
                variant="ghost" 
                className="text-white hover:text-[#02BDEA]"
                onClick={() => setLocation('/login')}
              >
                Iniciar Sesión
              </Button>
              
              <Button 
                className="bg-[#02BDEA] hover:bg-[#01a0c8] text-white"
                onClick={() => setLocation('/register')}
              >
                Registrarse
              </Button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}