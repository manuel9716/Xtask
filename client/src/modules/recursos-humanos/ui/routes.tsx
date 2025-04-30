/**
 * Configuración de rutas para el módulo de Recursos Humanos
 */

import React from "react";
import { Route } from "wouter";
import { MainLayout } from "@/layouts/main-layout";
import RecursosHumanosPage from "./views/RecursosHumanosPage";
import { TalentoHumanoDashboard } from "./views/TalentoHumanoDashboard";

export const RecursosHumanosRoutes: React.FC = () => {
  return (
    <>
      {/* Rutas principales para /recursos-humanos */}
      <Route path="/recursos-humanos">
        <MainLayout>
          <RecursosHumanosPage />
        </MainLayout>
      </Route>
      
      {/* Rutas específicas que usan TalentoHumanoDashboard para la navegación interna */}
      <Route path="/recursos-humanos/:submodulo">
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
      
      <Route path="/human-resources/:submodulo">
        <MainLayout>
          <RecursosHumanosPage />
        </MainLayout>
      </Route>
    </>
  );
};