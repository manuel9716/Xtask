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
  User
} from "lucide-react";

interface NavItemProps {
  href: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  active?: boolean;
}

function NavItem({ href, icon, children, active }: NavItemProps) {
  return (
    <Link href={href}>
      <a
        className={cn(
          "flex items-center space-x-2 px-4 py-2.5 rounded-lg transition-colors",
          active
            ? "bg-primary-700 text-white"
            : "text-gray-200 hover:bg-gray-700"
        )}
      >
        {icon}
        <span>{children}</span>
      </a>
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

  const NavItems = [
    { href: "/", label: "Dashboard", icon: <LayoutDashboard className="h-5 w-5" /> },
    { href: "/projects", label: "Projects", icon: <Briefcase className="h-5 w-5" /> },
    { href: "/finances", label: "Finances", icon: <DollarSign className="h-5 w-5" /> },
    { href: "/human-resources", label: "Human Resources", icon: <Users className="h-5 w-5" /> },
    { href: "/suppliers", label: "Suppliers", icon: <Store className="h-5 w-5" /> },
    { href: "/tasks", label: "Tasks", icon: <CheckSquare className="h-5 w-5" /> },
  ];

  const SystemItems = [
    { href: "/user-management", label: "User Management", icon: <UserCog className="h-5 w-5" /> },
    { href: "/settings", label: "Settings", icon: <Settings className="h-5 w-5" /> },
  ];

  return (
    <aside
      className={cn(
        "flex flex-col bg-gray-800 text-white",
        isMobile ? "fixed inset-0 z-50" : "w-64",
        className
      )}
    >
      <div className="p-4 border-b border-gray-700">
        <Logo />
      </div>

      <nav className="flex-1 p-4 space-y-1 overflow-y-auto scrollbar-hide">
        <p className="text-gray-400 text-xs font-medium uppercase tracking-wider mt-6 mb-2">
          Main
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

        <p className="text-gray-400 text-xs font-medium uppercase tracking-wider mt-6 mb-2">
          System
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
      </nav>

      <div className="p-4 border-t border-gray-700">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-full bg-primary-200 flex items-center justify-center text-primary-700 font-medium">
            <User className="h-5 w-5" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-white truncate">
              Demo User
            </p>
            <p className="text-xs text-gray-400 truncate capitalize">
              Administrator
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
}
