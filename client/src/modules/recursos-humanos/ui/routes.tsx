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
      {/* Rutas principales para /recursos-humanos */}
      <Route path="/recursos-humanos">
        <MainLayout>
          <TalentoHumanoDashboard />
        </MainLayout>
      </Route>
      
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
      
      {/* Rutas duplicadas para /human-resources para mantener compatibilidad con el sidebar */}
      <Route path="/human-resources">
        <MainLayout>
          <TalentoHumanoDashboard />
        </MainLayout>
      </Route>
      
      <Route path="/human-resources/empleados">
        <MainLayout>
          <TalentoHumanoDashboard />
        </MainLayout>
      </Route>
      
      <Route path="/human-resources/evaluaciones">
        <MainLayout>
          <TalentoHumanoDashboard />
        </MainLayout>
      </Route>
      
      <Route path="/human-resources/capacitaciones">
        <MainLayout>
          <TalentoHumanoDashboard />
        </MainLayout>
      </Route>
      
      <Route path="/human-resources/nomina">
        <MainLayout>
          <TalentoHumanoDashboard />
        </MainLayout>
      </Route>
      
      <Route path="/human-resources/metricas">
        <MainLayout>
          <TalentoHumanoDashboard />
        </MainLayout>
      </Route>
      
      <Route path="/human-resources/documentacion">
        <MainLayout>
          <TalentoHumanoDashboard />
        </MainLayout>
      </Route>
    </>
  );
};