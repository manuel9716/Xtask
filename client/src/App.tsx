import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Dashboard from "@/pages/dashboard";
import Projects from "@/pages/projects";
import Finances from "@/pages/finances";
// Entrada para el módulo de Recursos Humanos
import SimpleHumanResources from "@/pages/simple-hr";
import Suppliers from "@/pages/suppliers";
import Tasks from "@/pages/tasks";
import UserManagement from "@/pages/user-management";
import Settings from "@/pages/settings";
import NominaDashboard from "@/pages/nomina-dashboard";
import CapacitacionesPage from "@/pages/capacitaciones";
import MetricasPage from "@/pages/metricas";
import { MainLayout } from "@/layouts/main-layout";
import { FinanzasRoutes } from "@/modules/finanzas/ui/routes";
import { NominaRoutes } from "@/modules/nomina/ui/routes";
import { EmpleadosRoutes } from "@/modules/nomina/empleados/ui/routes";
import { ProyectosRoutes } from "@/modules/proyectos/ui/routes";
import { RecursosHumanosRoutes } from "@/modules/recursos-humanos/ui/routes";

function Router() {
  return (
    <Switch>
      <Route path="/">
        <MainLayout>
          <Dashboard />
        </MainLayout>
      </Route>
      <Route path="/projects">
        <MainLayout>
          <Projects />
        </MainLayout>
      </Route>
      <Route path="/finances">
        <MainLayout>
          <Finances />
        </MainLayout>
      </Route>
      <Route path="/human-resources">
        <MainLayout>
          <SimpleHumanResources />
        </MainLayout>
      </Route>
      <Route path="/suppliers">
        <MainLayout>
          <Suppliers />
        </MainLayout>
      </Route>
      <Route path="/tasks">
        <MainLayout>
          <Tasks />
        </MainLayout>
      </Route>
      <Route path="/user-management">
        <MainLayout>
          <UserManagement />
        </MainLayout>
      </Route>
      <Route path="/settings">
        <MainLayout>
          <Settings />
        </MainLayout>
      </Route>
      
      {/* Ruta directa a Nómina */}
      <Route path="/nomina">
        <MainLayout>
          <NominaDashboard />
        </MainLayout>
      </Route>
      
      {/* Rutas de los módulos específicos */}
      <FinanzasRoutes />
      <NominaRoutes />
      <EmpleadosRoutes />
      <ProyectosRoutes />
      <RecursosHumanosRoutes />
      
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
