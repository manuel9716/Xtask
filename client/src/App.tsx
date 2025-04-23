import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Dashboard from "@/pages/dashboard";
import Projects from "@/pages/projects";
import Finances from "@/pages/finances";
import HumanResources from "@/pages/human-resources";
import Suppliers from "@/pages/suppliers";
import Tasks from "@/pages/tasks";
import UserManagement from "@/pages/user-management";
import Settings from "@/pages/settings";
import { MainLayout } from "@/layouts/main-layout";
import { FinanzasRoutes } from "@/modules/finanzas/ui/routes"; 

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
          <HumanResources />
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
      
      {/* Rutas de los módulos específicos */}
      <FinanzasRoutes />
      
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
