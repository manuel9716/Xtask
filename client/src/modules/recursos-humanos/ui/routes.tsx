/**
 * Configuración de rutas para el módulo de Recursos Humanos
 */

import React from "react";
import { Route } from "wouter";
import { MainLayout } from "@/layouts/main-layout";
import { TalentoHumanoDashboard } from "./views/TalentoHumanoDashboard";

export const RecursosHumanosRoutes: React.FC = () => {
  return (
    <>
      {/* Ruta principal del dashboard de Recursos Humanos */}
      <Route path="/recursos-humanos">
        <MainLayout>
          <TalentoHumanoDashboard />
        </MainLayout>
      </Route>
      
      {/* Otras rutas específicas se irán agregando a medida que los componentes estén listos */}
      <Route path="/recursos-humanos/empleados">
        <MainLayout>
          <TalentoHumanoDashboard />
        </MainLayout>
      </Route>
      
      <Route path="/recursos-humanos/evaluaciones">
        <MainLayout>
          <TalentoHumanoDashboard />
        </MainLayout>
      </Route>
      
      <Route path="/recursos-humanos/capacitaciones">
        <MainLayout>
          <TalentoHumanoDashboard />
        </MainLayout>
      </Route>
      
      <Route path="/recursos-humanos/nomina">
        <MainLayout>
          <TalentoHumanoDashboard />
        </MainLayout>
      </Route>
      
      <Route path="/recursos-humanos/metricas">
        <MainLayout>
          <TalentoHumanoDashboard />
        </MainLayout>
      </Route>
      
      <Route path="/recursos-humanos/documentacion">
        <MainLayout>
          <TalentoHumanoDashboard />
        </MainLayout>
      </Route>
    </>
  );
};