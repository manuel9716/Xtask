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
import HabilidadesPage from "@/pages/habilidades";
import HomePage from "@/pages/home";
import AuthPage from "@/pages/auth-page";
import ApiDocumentation from "@/pages/api-documentation";
import RecursosPage from "@/pages/recursos-page";
import NominaPage from "@/pages/nomina-page";
import { MainLayout } from "@/layouts/main-layout";
import { FinanzasRoutes } from "@/modules/finanzas/ui/routes";
import { NominaRoutes } from "@/modules/nomina/ui/routes";
import { EmpleadosRoutes } from "@/modules/nomina/empleados/ui/routes";
import { default as EmpleadosPage } from "@/modules/nomina/empleados/ui/pages/EmpleadosPage";
import { ProyectosRoutes } from "@/modules/proyectos/ui/routes";
import { KpisRoutes } from "@/modules/kpis/ui/routes";
import { ThemeProvider } from "@/hooks/use-theme";
import EmployeeDetailPage from "@/modules/nomina/pages/EmployeeDetailPage";
import PayrollDetailPage from "@/modules/nomina/pages/PayrollDetailPage";
import { PSEPage } from "@/pages/PSEPage";

// Importaciones para el módulo de autenticación
import { AuthProvider } from "@/modules/auth/ui/context/AuthContext";
import { LoginPage } from "@/modules/auth/ui/views/LoginPage";
import { ProtectedRoute } from "@/lib/protected-route";

function Router() {
  return (
    <Switch>
      {/* Página de inicio (Home) */}
      <Route path="/" component={HomePage} />
      
      {/* Rutas de autenticación */}
      <Route path="/auth" component={LoginPage} />
      <Route path="/auth/login" component={LoginPage} />
      <Route path="/auth/register" component={LoginPage} />
      
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

      <Route path="/habilidades">
        <ProtectedRoute>
          <MainLayout>
            <HabilidadesPage />
          </MainLayout>
        </ProtectedRoute>
      </Route>
      
      {/* Rutas detalladas de empleados */}
      <Route path="/empleados/:id">
        <ProtectedRoute>
          <MainLayout>
            <EmployeeDetailPage />
          </MainLayout>
        </ProtectedRoute>
      </Route>
      
      {/* Rutas detalladas de nóminas */}
      <Route path="/nominas/:id">
        <ProtectedRoute>
          <MainLayout>
            <PayrollDetailPage />
          </MainLayout>
        </ProtectedRoute>
      </Route>

      {/* Submódulo de Recursos Financieros - Protegido */}
      <Route path="/finanzas/recursos">
        <ProtectedRoute>
          <MainLayout>
            <RecursosPage />
          </MainLayout>
        </ProtectedRoute>
      </Route>
      
      <Route path="/finanzas/nomina">
        <ProtectedRoute>
          <MainLayout>
            <NominaPage />
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
            <NominaPage />
          </MainLayout>
        </ProtectedRoute>
      </Route>
      
      {/* Ruta directa a KPIs - Protegida */}
      <Route path="/kpis">
        <ProtectedRoute>
          <MainLayout>
            <KpisDashboard />
          </MainLayout>
        </ProtectedRoute>
      </Route>
      
      {/* Ruta directa de prueba para empleados */}
      <Route path="/admin/nomina/empleados">
        <ProtectedRoute>
          <MainLayout>
            <EmpleadosPage />
          </MainLayout>
        </ProtectedRoute>
      </Route>
      
      {/* Rutas de los módulos específicos - Protegidas */}
      <Route path="/finanzas/*">
        <ProtectedRoute>
          <FinanzasRoutes />
        </ProtectedRoute>
      </Route>
      <Route path="/admin/nomina/empleados/*">
        <ProtectedRoute>
          <EmpleadosRoutes />
        </ProtectedRoute>
      </Route>
      <Route path="/nomina/*">
        <ProtectedRoute>
          <NominaRoutes />
        </ProtectedRoute>
      </Route>
      <Route path="/admin/proyectos">
        <ProtectedRoute>
          <MainLayout>
            <Projects />
          </MainLayout>
        </ProtectedRoute>
      </Route>
      
      <Route path="/admin/proyectos/:id">
        <ProtectedRoute>
          <MainLayout>
            <ProyectosRoutes />
          </MainLayout>
        </ProtectedRoute>
      </Route>
      
      <Route path="/admin/proyectos/:id/editar">
        <ProtectedRoute>
          <MainLayout>
            <ProyectosRoutes />
          </MainLayout>
        </ProtectedRoute>
      </Route>
      <Route path="/kpis/*">
        <ProtectedRoute>
          <KpisRoutes />
        </ProtectedRoute>
      </Route>
      
      {/* Página de PSE */}
      <Route path="/pse" component={PSEPage} />
      
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
