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
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

// Iconos
import {
  Users,
  ClipboardCheck,
  GraduationCap,
  BarChart3,
  ChevronRight,
  AlertCircle,
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
      
      {/* Tarjeta de nuevo módulo de Talento Humano */}
      <Card className="mb-6 border-secondary/20 bg-slate-50 dark:bg-slate-900/40">
        <CardContent className="pt-6">
          <h2 className="text-2xl font-bold mb-2">Talento Humano - Nuevo Módulo</h2>
          <p className="text-muted-foreground mb-4">
            Accede al nuevo módulo de Talento Humano con todas las funcionalidades integradas en un solo lugar:
          </p>
          
          <div className="space-y-3 mb-6">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-green-500"></div>
              <p>Dashboard de métricas y KPIs</p>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-green-500"></div>
              <p>Evaluaciones de desempeño</p>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-green-500"></div>
              <p>Gestión de capacitaciones</p>
            </div>
          </div>
          
          <div className="flex justify-center">
            <Button className="w-full max-w-md bg-purple-800 hover:bg-purple-700" size="lg">
              <Users className="mr-2 h-5 w-5" />
              Acceder al Dashboard Principal
            </Button>
          </div>
        </CardContent>
      </Card>
      
      {/* Secciones principales con solo tres opciones */}
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
      
      {/* Botones de acciones alternativas */}
      <div className="flex flex-wrap gap-4 mt-8 justify-center">
        <Button variant="outline" className="flex items-center gap-2">
          <Users className="h-4 w-4" />
          Explorar Nueva Versión
        </Button>
        
        <Button variant="outline" className="flex items-center gap-2">
          <Users className="h-4 w-4" />
          Gestión Completa
        </Button>
      </div>
    </div>
  );
};

export default RecursosHumanosPage;