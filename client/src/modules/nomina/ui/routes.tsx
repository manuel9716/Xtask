import { Route } from "wouter";
import { MainLayout } from "@/layouts/main-layout";
import EmpleadosPage from "../empleados/ui/pages/EmpleadosPage";
import EmpleadoDetallePage from "../empleados/ui/pages/EmpleadoDetallePage";
import ReportesRRHHPage from "../empleados/ui/pages/ReportesRRHHPage";
import ListadoNominaPage from "./pages/ListadoNominaPage";
import DetalleNominaPage from "./pages/DetalleNominaPage";

export function NominaRoutes() {
  return (
    <>
      {/* Rutas del módulo de Nómina */}
      <Route path="/nomina/empleados">
        <MainLayout>
          <EmpleadosPage />
        </MainLayout>
      </Route>
      
      <Route path="/nomina/empleados/:id">
        <MainLayout>
          <EmpleadoDetallePage />
        </MainLayout>
      </Route>
      
      <Route path="/nomina/reportes">
        <MainLayout>
          <ReportesRRHHPage />
        </MainLayout>
      </Route>
      
      <Route path="/nomina/listado">
        <MainLayout>
          <ListadoNominaPage />
        </MainLayout>
      </Route>
      
      <Route path="/nomina/detalle/:id">
        {(params) => (
          <MainLayout>
            <DetalleNominaPage nominaId={params.id} />
          </MainLayout>
        )}
      </Route>
    </>
  );
}