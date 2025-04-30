import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Bell, HelpCircle, Menu, Search, User, LogOut, Settings } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useTranslation } from "react-i18next";
import { LanguageSwitcher } from "./language-switcher";
import { useAuth } from "@/modules/auth/ui/context/AuthContext";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

interface HeaderProps {
  onMenuClick: () => void;
}

export function Header({ onMenuClick }: HeaderProps) {
  const { t } = useTranslation();
  const { user, logout } = useAuth();
  const [hasNotifications] = useState(true);

  const handleLogout = () => {
    logout();
  };

  return (
    <header className="bg-white border-b border-gray-200 shadow-sm">
      <div className="flex items-center justify-between p-4">
        <div className="flex items-center md:hidden">
          <Button
            variant="ghost"
            size="icon"
            className="text-gray-500 hover:text-gray-700"
            onClick={onMenuClick}
          >
            <Menu className="h-6 w-6" />
          </Button>
        </div>

        <div className="relative w-full max-w-md hidden md:block">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            type="text"
            placeholder={t("common.search") + "..."}
            className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
        </div>

        <div className="flex items-center space-x-4">
          <LanguageSwitcher variant="ghost" />
          
          <div className="relative">
            <Button
              variant="ghost"
              size="icon"
              className="flex items-center justify-center w-9 h-9 rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors"
            >
              <Bell className="h-5 w-5" />
            </Button>
            {hasNotifications && (
              <div className="absolute top-0 right-0">
                <span className="flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-orange-500"></span>
                </span>
              </div>
            )}
          </div>

          <div className="relative">
            <Button
              variant="ghost"
              size="icon"
              className="flex items-center justify-center w-9 h-9 rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors"
            >
              <HelpCircle className="h-5 w-5" />
            </Button>
          </div>

          {/* Menú de perfil de usuario - visible en todos los dispositivos */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <div className="flex items-center space-x-2 cursor-pointer">
                <div className="hidden md:block text-right">
                  <p className="text-sm font-medium text-gray-700">
                    {user ? user.fullName : t("user.demoUser")}
                  </p>
                  <p className="text-xs text-gray-500">
                    {user ? user.role : t("user.role")}
                  </p>
                </div>
                <Avatar className="h-9 w-9 bg-primary/10">
                  <AvatarFallback className="bg-secondary text-white">
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
              
              <DropdownMenuItem onClick={() => window.location.href = "/settings/profile"}>
                <User className="mr-2 h-4 w-4" />
                <span>Perfil</span>
              </DropdownMenuItem>
              
              <DropdownMenuItem onClick={() => window.location.href = "/settings"}>
                <Settings className="mr-2 h-4 w-4" />
                <span>Configuración</span>
              </DropdownMenuItem>
              
              <DropdownMenuSeparator />
              
              <DropdownMenuItem onClick={handleLogout}>
                <LogOut className="mr-2 h-4 w-4" />
                <span>Cerrar sesión</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
