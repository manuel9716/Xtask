import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Menu, X, User } from "lucide-react";
import { useLocation } from "wouter";

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [, setLocation] = useLocation();

  const handleLogin = () => {
    setLocation('/auth');
  };

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
    setIsMenuOpen(false);
  };

  return (
    <header className="fixed top-0 left-0 right-0 bg-white/95 backdrop-blur-sm border-b border-gray-200 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center">
            <div className="text-2xl font-bold text-[#251948]">XTask</div>
          </div>

          {/* Navigation Desktop */}
          <nav className="hidden md:flex items-center space-x-8">
            <button
              onClick={() => scrollToSection('funcionalidades')}
              className="text-gray-700 hover:text-[#251948] transition-colors"
            >
              Funcionalidades
            </button>
            <button
              onClick={() => scrollToSection('demo')}
              className="text-gray-700 hover:text-[#251948] transition-colors"
            >
              Demo
            </button>
            <button
              onClick={() => scrollToSection('testimonios')}
              className="text-gray-700 hover:text-[#251948] transition-colors"
            >
              Testimonios
            </button>
            <button
              onClick={() => scrollToSection('precios')}
              className="text-gray-700 hover:text-[#251948] transition-colors"
            >
              Precios
            </button>
          </nav>

          {/* Auth Buttons Desktop */}
          <div className="hidden md:flex items-center space-x-4">
            <Button
              variant="ghost"
              onClick={handleLogin}
              className="text-gray-700 hover:text-[#251948] hover:bg-gray-50"
            >
              <User className="h-4 w-4 mr-2" />
              Iniciar sesión
            </Button>
            <Button
              onClick={() => scrollToSection('registro')}
              className="bg-[#02BDEA] hover:bg-[#0ea5e9] text-white"
            >
              Registrarse gratis
            </Button>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-gray-700 hover:text-[#251948] p-2"
              aria-label="Abrir menú"
            >
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 bg-white border-t border-gray-200">
              <button
                onClick={() => scrollToSection('funcionalidades')}
                className="block w-full text-left px-3 py-2 text-gray-700 hover:text-[#251948] hover:bg-gray-50 rounded-md"
              >
                Funcionalidades
              </button>
              <button
                onClick={() => scrollToSection('demo')}
                className="block w-full text-left px-3 py-2 text-gray-700 hover:text-[#251948] hover:bg-gray-50 rounded-md"
              >
                Demo
              </button>
              <button
                onClick={() => scrollToSection('testimonios')}
                className="block w-full text-left px-3 py-2 text-gray-700 hover:text-[#251948] hover:bg-gray-50 rounded-md"
              >
                Testimonios
              </button>
              <button
                onClick={() => scrollToSection('precios')}
                className="block w-full text-left px-3 py-2 text-gray-700 hover:text-[#251948] hover:bg-gray-50 rounded-md"
              >
                Precios
              </button>
              
              {/* Mobile Auth Buttons */}
              <div className="pt-4 space-y-2">
                <Button
                  variant="ghost"
                  onClick={handleLogin}
                  className="w-full justify-start text-gray-700 hover:text-[#251948] hover:bg-gray-50"
                >
                  <User className="h-4 w-4 mr-2" />
                  Iniciar sesión
                </Button>
                <Button
                  onClick={() => scrollToSection('registro')}
                  className="w-full bg-[#02BDEA] hover:bg-[#0ea5e9] text-white"
                >
                  Registrarse gratis
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}