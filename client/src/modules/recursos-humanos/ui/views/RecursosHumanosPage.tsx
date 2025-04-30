/**
 * RecursosHumanosPage
 * Página principal del módulo de Recursos Humanos con sólo Métricas/KPIs, Capacitaciones y Evaluaciones
 */

import React from "react";
import { Link, useLocation } from "wouter";

// UI Components
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Iconos
import {
  Users,
  ClipboardCheck,
  GraduationCap,
  BarChart3,
  ChevronRight,
} from "lucide-react";

// Componentes del módulo
import { KpiCard } from "../components/KpiCard";

// Importamos los componentes reales
import { ListaEvaluaciones } from "./ListaEvaluaciones";
import { ListaCapacitaciones } from "./ListaCapacitaciones";
import { ModuloMetricas } from "./TalentoHumanoDashboard";

export const RecursosHumanosPage: React.FC = () => {
  // Obtener la ruta actual para manejar visualización condicional
  const [location] = useLocation();
  
  // Extraer partes de la URL para routing
  const pathParts = location.split("/").filter(Boolean);
  
  const basePath = pathParts[0]; // "recursos-humanos" o "human-resources"
  const subPath = pathParts[1];  // "capacitaciones", "evaluaciones", etc.
  
  // Si tenemos un subpath válido
  if ((basePath === "recursos-humanos" || basePath === "human-resources") && subPath) {
    switch (subPath) {
      case "evaluaciones":
        return <ListaEvaluaciones />;
      case "capacitaciones":
        return <ListaCapacitaciones />;
      case "metricas":
        return <ModuloMetricas />;
      default:
        // En caso de una ruta no reconocida, mostrar la página principal
        break;
    }
  }
  
  // Vista principal (dashboard)
  return (
    <div className="space-y-6 pb-8">
      {/* Header principal */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Recursos Humanos</h1>
        <p className="text-muted-foreground">
          Gestiona las evaluaciones, capacitaciones y métricas de tu empresa
        </p>
      </div>
      
      {/* KPIs principales */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <KpiCard 
          title="Capacitaciones Activas"
          value={3}
          description="5 programadas"
          icon="custom"
          customIcon={<GraduationCap className="h-5 w-5" />}
          color="warning"
        />
        
        <KpiCard 
          title="Evaluaciones"
          value={18}
          description="Calificación promedio: 4.2"
          icon="custom"
          customIcon={<ClipboardCheck className="h-5 w-5" />}
          color="success"
        />
        
        <KpiCard 
          title="Empleados Capacitados"
          value="65%"
          description="21 de 32 empleados"
          icon="users"
          color="primary"
        />
      </div>
      
      <Separator className="my-6" />
      
      {/* Secciones principales */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center">
              <BarChart3 className="mr-2 h-5 w-5 text-purple-500" />
              Métricas y KPIs
            </CardTitle>
            <CardDescription>
              Analiza indicadores clave
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Visualiza y analiza métricas e indicadores clave de rendimiento del departamento
              de recursos humanos.
            </p>
            <Button asChild className="w-full">
              <Link href="/recursos-humanos/metricas">
                Ver Métricas
                <ChevronRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center">
              <GraduationCap className="mr-2 h-5 w-5 text-warning" />
              Capacitaciones
            </CardTitle>
            <CardDescription>
              Administra programas de formación
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Planifica, ejecuta y evalúa programas de capacitación para el desarrollo profesional
              de los empleados.
            </p>
            <Button asChild className="w-full">
              <Link href="/recursos-humanos/capacitaciones">
                Ver Capacitaciones
                <ChevronRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center">
              <ClipboardCheck className="mr-2 h-5 w-5 text-success" />
              Evaluaciones
            </CardTitle>
            <CardDescription>
              Gestiona evaluaciones de rendimiento
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Crea y administra evaluaciones de desempeño, establece objetivos, realiza seguimiento
              y genera informes de rendimiento.
            </p>
            <Button asChild className="w-full">
              <Link href="/recursos-humanos/evaluaciones">
                Ver Evaluaciones
                <ChevronRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
      
      {/* Próximas capacitaciones */}
      <div className="mt-6">
        <h2 className="text-xl font-semibold mb-4">Próximas Capacitaciones</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Liderazgo Efectivo</CardTitle>
              <CardDescription>5 Mayo, 2025 • 15:00 hrs</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">12 participantes registrados</p>
              <div className="mt-2 flex justify-end">
                <Button variant="outline" size="sm">Ver Detalles</Button>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Excel Avanzado</CardTitle>
              <CardDescription>12 Mayo, 2025 • 10:00 hrs</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">8 participantes registrados</p>
              <div className="mt-2 flex justify-end">
                <Button variant="outline" size="sm">Ver Detalles</Button>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Gestión del Tiempo</CardTitle>
              <CardDescription>20 Mayo, 2025 • 14:30 hrs</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">15 participantes registrados</p>
              <div className="mt-2 flex justify-end">
                <Button variant="outline" size="sm">Ver Detalles</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      
      {/* Evaluaciones recientes */}
      <div className="mt-6">
        <h2 className="text-xl font-semibold mb-4">Evaluaciones Recientes</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Evaluación Trimestral Q1</CardTitle>
              <CardDescription>Periodo: Ene-Mar 2025</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">28 evaluaciones completadas</p>
              <div className="mt-2 flex justify-end">
                <Button variant="outline" size="sm">Ver Resultados</Button>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Evaluación de Desempeño</CardTitle>
              <CardDescription>Depto. Operaciones</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">12 evaluaciones completadas</p>
              <div className="mt-2 flex justify-end">
                <Button variant="outline" size="sm">Ver Resultados</Button>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Evaluación de Competencias</CardTitle>
              <CardDescription>Liderazgo y Trabajo en Equipo</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">8 evaluaciones completadas</p>
              <div className="mt-2 flex justify-end">
                <Button variant="outline" size="sm">Ver Resultados</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default RecursosHumanosPage;