import React from 'react';
import { Button } from "@/components/ui/button";
import { LanguageSwitcher } from "./language-switcher";
import { useLocation } from 'wouter';

export function HomeHeader() {
  const [, setLocation] = useLocation();
  
  return (
    <header className="bg-white w-full border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between py-4">
          {/* Logo */}
          <div className="flex items-center">
            <span className="text-2xl font-bold text-[#6d28d9] cursor-pointer flex items-center gap-1" onClick={() => setLocation('/')}>
              <div className="bg-white flex items-center justify-center p-1 rounded w-8 h-8 border border-[#6d28d9]/20">
                <span className="text-[#6d28d9] font-bold text-xl">X</span>
              </div>
              task
            </span>
          </div>
          
          {/* Enlaces y botones de acción */}
          <div className="flex items-center space-x-6">
            <nav className="hidden md:flex items-center space-x-6">
              <a href="#aplicaciones" className="text-gray-600 hover:text-[#02BDEA] text-sm font-medium">
                Aplicaciones
              </a>
              <a href="#sectores" className="text-gray-600 hover:text-[#02BDEA] text-sm font-medium">
                Sectores
              </a>
              <a href="#comunidad" className="text-gray-600 hover:text-[#02BDEA] text-sm font-medium">
                Comunidad
              </a>
              <a href="#precios" className="text-gray-600 hover:text-[#02BDEA] text-sm font-medium">
                Precios
              </a>
              <a href="#ayuda" className="text-gray-600 hover:text-[#02BDEA] text-sm font-medium">
                Ayuda
              </a>
            </nav>
            
            <div className="flex items-center space-x-3">
              <LanguageSwitcher />
              
              <Button 
                variant="ghost" 
                className="text-gray-600 hover:text-[#02BDEA]"
                onClick={() => setLocation('/dashboard')}
              >
                Identificarse
              </Button>
              
              <Button 
                className="bg-[#6d28d9] hover:bg-[#5b21b6] text-white"
                onClick={() => setLocation('/register')}
              >
                Pruébalo gratis
              </Button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}