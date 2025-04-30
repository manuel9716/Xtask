import React from "react";
import { Logo } from "@/components/logo";
import { useLocation, Link } from "wouter";
import { cn } from "@/lib/utils";
import { 
  LayoutDashboard, 
  Briefcase, 
  DollarSign, 
  Users, 
  Store, 
  CheckSquare, 
  UserCog, 
  Settings, 
  User,
  Receipt
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/modules/auth/ui/context/AuthContext";

interface NavItemProps {
  href: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  active?: boolean;
}

function NavItem({ href, icon, children, active }: NavItemProps) {
  return (
    <Link href={href}>
      <div
        className={cn(
          "flex items-center space-x-2 px-4 py-2.5 rounded-lg transition-colors",
          active
            ? "bg-secondary text-primary-foreground"
            : "text-gray-200 hover:bg-gray-700"
        )}
      >
        {icon}
        <span>{children}</span>
      </div>
    </Link>
  );
}

interface SidebarProps {
  className?: string;
  isMobile?: boolean;
  onClose?: () => void;
}

export function Sidebar({ className, isMobile, onClose }: SidebarProps) {
  const [location] = useLocation();
  const { t } = useTranslation();
  const { user } = useAuth();

  const NavItems = [
    { href: "/dashboard", label: t("navigation.dashboard"), icon: <LayoutDashboard className="h-5 w-5" /> },
    { href: "/projects", label: t("navigation.projects"), icon: <Briefcase className="h-5 w-5" /> },
    { href: "/finances", label: t("navigation.finances"), icon: <DollarSign className="h-5 w-5" /> },
    { href: "/nomina", label: "Nómina", icon: <Receipt className="h-5 w-5" /> },
    { href: "/suppliers", label: t("navigation.suppliers"), icon: <Store className="h-5 w-5" /> },
    { href: "/tasks", label: t("navigation.tasks"), icon: <CheckSquare className="h-5 w-5" /> },
  ];

  const SystemItems = [
    { href: "/user-management", label: t("navigation.userManagement"), icon: <UserCog className="h-5 w-5" /> },
    { href: "/settings", label: t("navigation.settings"), icon: <Settings className="h-5 w-5" /> },
  ];

  return (
    <aside
      className={cn(
        "flex flex-col bg-primary text-white",
        isMobile ? "fixed inset-0 z-50" : "w-64",
        className
      )}
    >
      {/* Header con logo a la izquierda y datos de usuario a la derecha */}
      <div className="p-4 border-b border-accent/20 flex justify-between items-center">
        <Logo />
        
        <div className="flex items-center">
          <div className="mr-2 flex flex-col items-end">
            <p className="text-sm font-medium text-white truncate max-w-[120px]">
              {user ? user.fullName : t("user.demoUser")}
            </p>
            <p className="text-xs text-secondary truncate capitalize">
              {user ? user.role : t("user.role")}
            </p>
          </div>
          <div className="w-9 h-9 rounded-full bg-secondary flex items-center justify-center text-primary font-medium">
            <User className="h-4 w-4" />
          </div>
        </div>
      </div>

      {/* Sección principal de navegación */}
      <nav className="flex-1 p-4 overflow-y-auto scrollbar-hide flex flex-col justify-between">
        {/* Sección MAIN */}
        <div className="space-y-1">
          <p className="text-secondary text-xs font-medium uppercase tracking-wider mb-2 font-heading">
            {t("navigation.mainSection")}
          </p>

          {NavItems.map((item) => (
            <NavItem
              key={item.href}
              href={item.href}
              icon={item.icon}
              active={location === item.href}
            >
              {item.label}
            </NavItem>
          ))}
        </div>
        
        {/* Sección SYSTEM en la parte inferior */}
        <div className="space-y-1 mt-auto pt-4">
          <p className="text-secondary text-xs font-medium uppercase tracking-wider mb-2 font-heading">
            {t("navigation.systemSection")}
          </p>

          {SystemItems.map((item) => (
            <NavItem
              key={item.href}
              href={item.href}
              icon={item.icon}
              active={location === item.href}
            >
              {item.label}
            </NavItem>
          ))}
        </div>
      </nav>
    </aside>
  );
}
