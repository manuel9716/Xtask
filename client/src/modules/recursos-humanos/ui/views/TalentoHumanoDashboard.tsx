/**
 * Vista TalentoHumanoDashboard
 * Pantalla principal del módulo de Talento Humano que integra todas las funcionalidades
 * de gestión de empleados, evaluaciones, capacitaciones y nóminas.
 */

import React from "react";
import { Link, useLocation } from "wouter";

// UI Components
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Iconos
import {
  Users,
  ClipboardCheck,
  GraduationCap,
  DollarSign,
  FileText,
  Wrench,
  InfoIcon,
  BarChart3,
  AlertTriangle,
  ArrowLeft,
  Home
} from "lucide-react";

// Componentes del módulo
import { KpiCard } from "../components/KpiCard";

// Importamos los componentes reales implementados anteriormente
import { ListaEmpleados } from "./ListaEmpleados";
import { ListaEvaluaciones } from "./ListaEvaluaciones";
import { ListaCapacitaciones } from "./ListaCapacitaciones";
import { ListaNominas } from "./ListaNominas";

// Componente para vistas bajo construcción (lo mantenemos para lo que aún no está implementado)
const ModuloEnConstruccion: React.FC<{
  title: string;
  description: string;
  icon: React.ReactNode;
}> = ({ title, description, icon }) => {
  const [location, navigate] = useLocation();
  
  return (
    <div className="flex flex-col items-center justify-center h-[60vh] max-w-md mx-auto text-center">
      <div className="bg-muted p-6 rounded-full mb-6">
        {icon}
      </div>
      <h2 className="text-2xl font-bold mb-2">{title}</h2>
      <p className="text-muted-foreground mb-8">{description}</p>
      <div className="space-y-3 w-full">
        <Button asChild className="w-full">
          <Link href="/recursos-humanos">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Volver al Dashboard
          </Link>
        </Button>
        <Button variant="outline" asChild className="w-full">
          <Link href="/">
            <Home className="mr-2 h-4 w-4" />
            Ir al Inicio
          </Link>
        </Button>
      </div>
    </div>
  );
};

// Reemplazamos los módulos de construcción por los componentes reales
export const ModuloEmpleados: React.FC = () => {
  return <ListaEmpleados />;
};

export const ModuloEvaluaciones: React.FC = () => {
  return <ListaEvaluaciones />;
};

export const ModuloCapacitaciones: React.FC = () => {
  return <ListaCapacitaciones />;
};

export const ModuloNomina: React.FC = () => {
  return <ListaNominas />;
};

// Estos componentes aún usan el mensaje de "en construcción"
export const ModuloMetricas: React.FC = () => {
  return (
    <ModuloEnConstruccion
      title="Métricas y KPIs"
      description="El dashboard de métricas y KPIs de recursos humanos está en desarrollo. Pronto tendrás acceso a todas las estadísticas clave."
      icon={<BarChart3 className="h-12 w-12 text-purple-500" />}
    />
  );
};

export const ModuloDocumentacion: React.FC = () => {
  return (
    <ModuloEnConstruccion
      title="Documentación"
      description="La documentación del módulo de Talento Humano está siendo preparada. Pronto tendrás acceso a todas las guías y manuales."
      icon={<FileText className="h-12 w-12 text-rose-500" />}
    />
  );
};

export const TalentoHumanoDashboard: React.FC = () => {
  // Obtener la ruta actual para manejar visualización condicional
  const [location] = useLocation();
  console.log("Current location:", location);
  
  // Extraer partes de la URL para routing
  const pathParts = location.split("/").filter(Boolean);
  console.log("Path parts:", pathParts);
  
  const basePath = pathParts[0]; // "recursos-humanos" o "human-resources"
  const subPath = pathParts[1];  // "capacitaciones", "empleados", etc.
  
  console.log("Base path:", basePath, "Sub path:", subPath);

  // Si tenemos un subpath válido
  if ((basePath === "recursos-humanos" || basePath === "human-resources") && subPath) {
    console.log("Rendering submodule:", subPath);
    switch (subPath) {
      case "empleados":
        return <ModuloEmpleados />;
      case "evaluaciones":
        return <ModuloEvaluaciones />;
      case "capacitaciones":
        console.log("Rendering ModuloCapacitaciones");
        return <ModuloCapacitaciones />;
      case "nomina":
        return <ModuloNomina />;
      case "metricas":
        return <ModuloMetricas />;
      case "documentacion":
        return <ModuloDocumentacion />;
      default:
        console.log("No matching module for subpath:", subPath);
    }
  }
  
  // Vista principal (dashboard)
  return (
    <div className="space-y-6 pb-8">
      {/* Header principal */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Talento Humano</h1>
        <p className="text-muted-foreground">
          Gestión de empleados, evaluaciones y formación
        </p>
      </div>
      
      <Alert variant="default" className="mb-4 border-yellow-600/50 bg-yellow-50 dark:bg-yellow-900/20">
        <AlertTriangle className="h-4 w-4 text-yellow-600" />
        <AlertTitle className="text-yellow-600">Módulo en construcción</AlertTitle>
        <AlertDescription className="text-yellow-600/90">
          El módulo de Talento Humano se encuentra actualmente en desarrollo. Algunas funcionalidades
          pueden no estar completamente disponibles.
        </AlertDescription>
      </Alert>
      
      {/* KPIs principales */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <KpiCard 
          title="Empleados Activos"
          value={32}
          description="2 nuevos este mes"
          icon="users"
          color="primary"
        />
        
        <KpiCard 
          title="Evaluaciones"
          value={18}
          description="Calificación: 4.2"
          icon="custom"
          customIcon={<ClipboardCheck className="h-5 w-5" />}
          color="success"
        />
        
        <KpiCard 
          title="Capacitaciones"
          value={3}
          description="5 programadas"
          icon="custom"
          customIcon={<GraduationCap className="h-5 w-5" />}
          color="warning"
        />
        
        <KpiCard 
          title="Nómina Mensual"
          value="$185,000"
          description="32 empleados pagados"
          icon="money"
          color="info"
        />
      </div>
      
      <Separator className="my-6" />
      
      {/* Navegación por cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center">
              <Users className="mr-2 h-5 w-5 text-primary" />
              Gestión de Empleados
            </CardTitle>
            <CardDescription>
              Administra la información de los empleados
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Registra, actualiza y consulta todos los datos de los empleados de la empresa, incluyendo información personal,
              laboral y documentos.
            </p>
            <Button asChild className="w-full">
              <Link href="/recursos-humanos/empleados">
                Ver Empleados
              </Link>
            </Button>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center">
              <ClipboardCheck className="mr-2 h-5 w-5 text-success" />
              Evaluaciones de Desempeño
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
            <Button asChild variant="outline" className="w-full">
              <Link href="/recursos-humanos/evaluaciones">
                Ver Evaluaciones
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
            <Button asChild variant="outline" className="w-full">
              <Link href="/recursos-humanos/capacitaciones">
                Ver Capacitaciones
              </Link>
            </Button>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center">
              <DollarSign className="mr-2 h-5 w-5 text-info" />
              Nómina
            </CardTitle>
            <CardDescription>
              Gestiona pagos y compensaciones
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Procesa nóminas, administra salarios, beneficios, deducciones y genera recibos
              de pago para los empleados.
            </p>
            <Button asChild variant="outline" className="w-full">
              <Link href="/recursos-humanos/nomina">
                Ver Nómina
              </Link>
            </Button>
          </CardContent>
        </Card>
        
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
            <Button asChild variant="outline" className="w-full">
              <Link href="/recursos-humanos/metricas">
                Ver Métricas
              </Link>
            </Button>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center">
              <FileText className="mr-2 h-5 w-5 text-rose-500" />
              Documentación
            </CardTitle>
            <CardDescription>
              Guías y manuales del módulo
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Accede a la documentación completa del módulo de Talento Humano, incluyendo manuales
              de usuario y guías de procedimiento.
            </p>
            <Button asChild variant="secondary" className="w-full">
              <Link href="/recursos-humanos/documentacion">
                Ver Documentación
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};