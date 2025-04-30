/**
 * Configuración de rutas para el módulo de Recursos Humanos
 */

import React from "react";
import { Route } from "wouter";
import { MainLayout } from "@/layouts/main-layout";
import RecursosHumanosPage from "./views/RecursosHumanosPage";

export const RecursosHumanosRoutes: React.FC = () => {
  return (
    <>
      {/* Rutas principales para /recursos-humanos */}
      <Route path="/recursos-humanos">
        <MainLayout>
          <RecursosHumanosPage />
        </MainLayout>
      </Route>
      
      <Route path="/recursos-humanos/evaluaciones">
        <MainLayout>
          <RecursosHumanosPage />
        </MainLayout>
      </Route>
      
      <Route path="/recursos-humanos/capacitaciones">
        <MainLayout>
          <RecursosHumanosPage />
        </MainLayout>
      </Route>
      
      <Route path="/recursos-humanos/metricas">
        <MainLayout>
          <RecursosHumanosPage />
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
          <RecursosHumanosPage />
        </MainLayout>
      </Route>
      
      <Route path="/human-resources/capacitaciones">
        <MainLayout>
          <RecursosHumanosPage />
        </MainLayout>
      </Route>
      
      <Route path="/human-resources/metricas">
        <MainLayout>
          <RecursosHumanosPage />
        </MainLayout>
      </Route>
    </>
  );
};