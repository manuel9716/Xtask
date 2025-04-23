import { ReactNode, useState } from "react";
import { Sidebar } from "@/components/sidebar";
import { Header } from "@/components/header";
import { useMediaQuery } from "@/hooks/use-mobile";

interface MainLayoutProps {
  children: ReactNode;
}

export function MainLayout({ children }: MainLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const isMobile = useMediaQuery("(max-width: 768px)");

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar - always visible on desktop, conditionally visible on mobile */}
      {(isMobile && sidebarOpen) && (
        <div 
          className="fixed inset-0 z-40 bg-black bg-opacity-50" 
          onClick={() => setSidebarOpen(false)}
        />
      )}
      
      <Sidebar 
        className={isMobile ? (sidebarOpen ? "block" : "hidden") : "block"}
        isMobile={isMobile}
        onClose={() => setSidebarOpen(false)}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header onMenuClick={toggleSidebar} />
        <main className="flex-1 overflow-y-auto bg-gray-50 p-4 md:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
