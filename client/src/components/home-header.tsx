import React from 'react';
import { Button } from "@/components/ui/button";
import { LanguageSwitcher } from "./language-switcher";
import { useLocation } from 'wouter';
import { useAuth } from "@/modules/auth/ui/context/AuthContext";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { LogOut, Settings, User } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function HomeHeader() {
  const [, setLocation] = useLocation();
  const { user, logout, isAuthenticated } = useAuth();
  
  return (
    <header className="bg-white w-full border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between py-4">
          {/* Logo */}
          <div className="flex items-center">
            <span className="text-2xl font-bold text-[#251948] cursor-pointer flex items-center" onClick={() => setLocation('/')}>
              <span className="text-[#02BDEA]">X</span>task
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
              
              {isAuthenticated ? (
                // Menú de usuario cuando está autenticado
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <div className="flex items-center space-x-2 cursor-pointer">
                      <div className="text-right">
                        <p className="text-sm font-medium text-gray-700">
                          {user?.fullName || "Usuario"}
                        </p>
                        <p className="text-xs text-gray-500">
                          {user?.role || "Rol"}
                        </p>
                      </div>
                      <Avatar className="h-9 w-9 bg-primary/10">
                        <AvatarFallback className="bg-[#623BA6] text-white">
                          {user?.fullName ? user.fullName.charAt(0).toUpperCase() : 'U'}
                        </AvatarFallback>
                      </Avatar>
                    </div>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-60">
                    <DropdownMenuLabel>Mi cuenta</DropdownMenuLabel>
                    
                    <div className="px-2 py-1.5">
                      <p className="text-sm font-medium">{user?.fullName}</p>
                      <p className="text-xs text-muted-foreground">{user?.email}</p>
                    </div>
                    
                    <DropdownMenuSeparator />
                    
                    <DropdownMenuItem onClick={() => setLocation('/dashboard')}>
                      <User className="mr-2 h-4 w-4" />
                      <span>Dashboard</span>
                    </DropdownMenuItem>
                    
                    <DropdownMenuItem onClick={() => setLocation('/settings')}>
                      <Settings className="mr-2 h-4 w-4" />
                      <span>Configuración</span>
                    </DropdownMenuItem>
                    
                    <DropdownMenuSeparator />
                    
                    <DropdownMenuItem onClick={() => {
                      logout();
                      setLocation('/');
                    }}>
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>Cerrar sesión</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                // Botones de login/registro cuando no está autenticado
                <>
                  <Button 
                    variant="ghost" 
                    className="text-gray-600 hover:text-[#02BDEA]"
                    onClick={() => setLocation('/auth/login')}
                  >
                    Identificarse
                  </Button>
                  
                  <Button 
                    className="bg-[#6d28d9] hover:bg-[#5b21b6] text-white"
                    onClick={() => setLocation('/auth/register')}
                  >
                    Pruébalo gratis
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}