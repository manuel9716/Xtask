import React, { useState } from "react";
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
  Receipt,
  FileJson,
  LineChart,
  TrendingUp,
  Award,
  PanelLeftClose,
  PanelLeftOpen
} from "lucide-react";
import { useTranslation } from "react-i18next";

interface NavItemProps {
  href: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  active?: boolean;
  collapsed?: boolean;
}

function NavItem({ href, icon, children, active, collapsed }: NavItemProps) {
  return (
    <Link href={href}>
      <div
        className={cn(
          "flex items-center rounded-lg transition-all duration-200",
          collapsed ? "justify-center px-3 py-2.5" : "space-x-2 px-4 py-2.5",
          active
            ? "bg-secondary text-primary-foreground"
            : "text-gray-200 hover:bg-gray-700"
        )}
        title={collapsed ? children as string : undefined}
      >
        {icon}
        {!collapsed && <span>{children}</span>}
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
  const [collapsed, setCollapsed] = useState(false);

  const NavItems = [
    { href: "/dashboard", label: t("navigation.dashboard"), icon: <LayoutDashboard className="h-5 w-5" /> },
    { href: "/projects", label: t("navigation.projects"), icon: <Briefcase className="h-5 w-5" /> },
    { href: "/finances", label: t("navigation.finances"), icon: <DollarSign className="h-5 w-5" /> },
    { href: "/nomina", label: "Nómina", icon: <Receipt className="h-5 w-5" /> },
    { href: "/kpis", label: "KPIs", icon: <TrendingUp className="h-5 w-5" /> },
    { href: "/habilidades", label: "Habilidades", icon: <Award className="h-5 w-5" /> },
    { href: "/suppliers", label: t("navigation.suppliers"), icon: <Store className="h-5 w-5" /> },
    { href: "/tasks", label: t("navigation.tasks"), icon: <CheckSquare className="h-5 w-5" /> },
  ];

  const SystemItems = [
    { href: "/user-management", label: t("navigation.userManagement"), icon: <UserCog className="h-5 w-5" /> },
    { href: "/api-docs", label: "Documentación API", icon: <FileJson className="h-5 w-5" /> },
    { href: "/settings", label: t("navigation.settings"), icon: <Settings className="h-5 w-5" /> },
  ];

  return (
    <aside
      className={cn(
        "flex flex-col bg-primary text-white transition-all duration-300 relative",
        isMobile ? "fixed inset-0 z-50" : collapsed ? "w-20" : "w-64",
        className
      )}
    >
      {/* Header solo con logo a la izquierda */}
      <div className={cn(
        "p-4 border-b border-accent/20 transition-all duration-300",
        collapsed && "px-2"
      )}>
        {!collapsed ? <Logo /> : <div className="flex justify-center"><span className="text-2xl font-bold">X</span></div>}
      </div>

      {/* Sección principal de navegación */}
      <nav className={cn(
        "flex-1 overflow-y-auto scrollbar-hide flex flex-col justify-between transition-all duration-300",
        collapsed ? "p-2" : "p-4"
      )}>
        {/* Sección MAIN */}
        <div className="space-y-1">
          {!collapsed && (
            <p className="text-secondary text-xs font-medium uppercase tracking-wider mb-2 font-heading">
              {t("navigation.mainSection")}
            </p>
          )}

          {NavItems.map((item) => (
            <NavItem
              key={item.href}
              href={item.href}
              icon={item.icon}
              active={location === item.href}
              collapsed={collapsed}
            >
              {item.label}
            </NavItem>
          ))}
        </div>
        
        {/* Sección SYSTEM en la parte inferior */}
        <div className="space-y-1 mt-auto pt-4">
          {!collapsed && (
            <p className="text-secondary text-xs font-medium uppercase tracking-wider mb-2 font-heading">
              {t("navigation.systemSection")}
            </p>
          )}

          {SystemItems.map((item) => (
            <NavItem
              key={item.href}
              href={item.href}
              icon={item.icon}
              active={location === item.href}
              collapsed={collapsed}
            >
              {item.label}
            </NavItem>
          ))}
        </div>
      </nav>

      {/* Botón flotante para colapsar/expandir */}
      {!isMobile && (
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="absolute -right-4 bottom-8 bg-primary hover:bg-primary/90 text-white rounded-full p-3 shadow-lg transition-all duration-200 hover:scale-110 border-2 border-white/20"
          aria-label={collapsed ? "Expandir sidebar" : "Colapsar sidebar"}
        >
          {collapsed ? (
            <PanelLeftOpen className="h-5 w-5" />
          ) : (
            <PanelLeftClose className="h-5 w-5" />
          )}
        </button>
      )}
    </aside>
  );
}
