import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Dashboard from "@/pages/dashboard";
import Projects from "@/pages/projects";
import Finances from "@/pages/finances";
import Suppliers from "@/pages/suppliers";
import Tasks from "@/pages/tasks";
import UserManagement from "@/pages/user-management";
import Settings from "@/pages/settings";
import NominaDashboard from "@/pages/nomina-dashboard";
import KpisDashboard from "@/pages/kpis-dashboard";
import HomePage from "@/pages/home";
import ApiDocumentation from "@/pages/api-documentation";
import { MainLayout } from "@/layouts/main-layout";
import { FinanzasRoutes } from "@/modules/finanzas/ui/routes";
import { NominaRoutes } from "@/modules/nomina/ui/routes";
import { EmpleadosRoutes } from "@/modules/nomina/empleados/ui/routes";
import { ProyectosRoutes } from "@/modules/proyectos/ui/routes";
import { KpisRoutes } from "@/modules/kpis/ui/routes";
import { ThemeProvider } from "@/hooks/use-theme";

// Importaciones para el módulo de autenticación
import { LoginPage } from "@/modules/auth/ui/views/LoginPage";
import { AuthProvider } from "@/modules/auth/ui/context/AuthContext";
import { ProtectedRoute } from "@/modules/auth/ui/components/ProtectedRoute";

function Router() {
  return (
    <Switch>
      {/* Página de inicio (Home) */}
      <Route path="/" component={HomePage} />
      
      {/* Rutas de autenticación */}
      <Route path="/auth/login">
        <LoginPage />
      </Route>
      <Route path="/auth/register">
        <LoginPage />
      </Route>
      
      {/* Dashboard (ahora como ruta secundaria) - Protegida */}
      <Route path="/dashboard">
        <ProtectedRoute>
          <MainLayout>
            <Dashboard />
          </MainLayout>
        </ProtectedRoute>
      </Route>
      
      <Route path="/projects">
        <ProtectedRoute>
          <MainLayout>
            <Projects />
          </MainLayout>
        </ProtectedRoute>
      </Route>
      <Route path="/finances">
        <ProtectedRoute>
          <MainLayout>
            <Finances />
          </MainLayout>
        </ProtectedRoute>
      </Route>
      <Route path="/suppliers">
        <ProtectedRoute>
          <MainLayout>
            <Suppliers />
          </MainLayout>
        </ProtectedRoute>
      </Route>
      <Route path="/tasks">
        <ProtectedRoute>
          <MainLayout>
            <Tasks />
          </MainLayout>
        </ProtectedRoute>
      </Route>
      <Route path="/user-management">
        <ProtectedRoute>
          <MainLayout>
            <UserManagement />
          </MainLayout>
        </ProtectedRoute>
      </Route>
      <Route path="/settings">
        <ProtectedRoute>
          <MainLayout>
            <Settings />
          </MainLayout>
        </ProtectedRoute>
      </Route>

      {/* Documentación de API - Accesible para todos */}
      <Route path="/api-docs">
        <ApiDocumentation />
      </Route>
      
      {/* Ruta directa a Nómina - Protegida */}
      <Route path="/nomina">
        <ProtectedRoute>
          <MainLayout>
            <NominaDashboard />
          </MainLayout>
        </ProtectedRoute>
      </Route>
      
      {/* Rutas de los módulos específicos - Protegidas */}
      <ProtectedRoute>
        <FinanzasRoutes />
        <NominaRoutes />
        <EmpleadosRoutes />
        <ProyectosRoutes />
        <KpisRoutes />
      </ProtectedRoute>
      
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="light" storageKey="xtask-ui-theme">
        <TooltipProvider>
          <AuthProvider>
            <Toaster />
            <Router />
          </AuthProvider>
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
