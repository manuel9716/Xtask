import { useAuth } from "@/hooks/use-auth";
import { Loader2 } from "lucide-react";
import { Route, useLocation } from "wouter";
import { MainLayout } from "@/layouts/main-layout";

export function ProtectedRoute({
  path,
  component: Component,
}: {
  path: string;
  component: () => React.JSX.Element;
}) {
  const { user, isLoading } = useAuth();
  const [, setLocation] = useLocation();

  // Redirect to auth if not logged in
  if (!isLoading && !user) {
    setLocation("/auth");
    return null;
  }

  return (
    <Route path={path}>
      {isLoading ? (
        <div className="flex items-center justify-center min-h-screen">
          <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
        </div>
      ) : (
        <MainLayout>
          <Component />
        </MainLayout>
      )}
    </Route>
  );
}
