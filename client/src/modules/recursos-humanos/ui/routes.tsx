/**
 * Configuración de rutas para el módulo de Recursos Humanos
 */

import React from "react";
import { Route } from "wouter";
import { MainLayout } from "@/layouts/main-layout";
import RecursosHumanosPage from "./views/RecursosHumanosPage";
import { TalentoHumanoDashboard, ModuloMetricas, ModuloEvaluaciones, ModuloCapacitaciones } from "./views/TalentoHumanoDashboard";

export const RecursosHumanosRoutes: React.FC = () => {
  return (
    <>
      {/* Rutas principales para /recursos-humanos */}
      <Route path="/recursos-humanos">
        <MainLayout>
          <RecursosHumanosPage />
        </MainLayout>
      </Route>
      
      {/* Rutas específicas para los submódulos con sus componentes correspondientes */}
      <Route path="/recursos-humanos/evaluaciones">
        <MainLayout>
          <ModuloEvaluaciones />
        </MainLayout>
      </Route>
      
      <Route path="/recursos-humanos/capacitaciones">
        <MainLayout>
          <ModuloCapacitaciones />
        </MainLayout>
      </Route>
      
      <Route path="/recursos-humanos/metricas">
        <MainLayout>
          <ModuloMetricas />
        </MainLayout>
      </Route>
      
      {/* Rutas duplicadas para /human-resources para mantener compatibilidad con el sidebar */}
      <Route path="/human-resources">
        <MainLayout>
          <RecursosHumanosPage />
        </MainLayout>
      </Route>
      
      <Route path="/human-resources/evaluaciones">
        <MainLayout>
          <ModuloEvaluaciones />
        </MainLayout>
      </Route>
      
      <Route path="/human-resources/capacitaciones">
        <MainLayout>
          <ModuloCapacitaciones />
        </MainLayout>
      </Route>
      
      <Route path="/human-resources/metricas">
        <MainLayout>
          <ModuloMetricas />
        </MainLayout>
      </Route>
    </>
  );
};