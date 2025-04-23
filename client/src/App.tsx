import { Switch, Route, Redirect } from "wouter";
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
import { ProtectedRoute } from "@/lib/protected-route";

function Router() {
  return (
    <Switch>
      {/* Redirect /auth to home page */}
      <Route path="/auth">
        <Redirect to="/" />
      </Route>
      <ProtectedRoute path="/" component={Dashboard} />
      <ProtectedRoute path="/projects" component={Projects} />
      <ProtectedRoute path="/finances" component={Finances} />
      <ProtectedRoute path="/human-resources" component={HumanResources} />
      <ProtectedRoute path="/suppliers" component={Suppliers} />
      <ProtectedRoute path="/tasks" component={Tasks} />
      <ProtectedRoute path="/user-management" component={UserManagement} />
      <ProtectedRoute path="/settings" component={Settings} />
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
