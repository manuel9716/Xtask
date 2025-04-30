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
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Recursos Humanos</h1>
          <p className="text-muted-foreground">
            Gestiona los empleados, evaluaciones, capacitaciones y nóminas de tu empresa
          </p>
        </div>
        <Button className="bg-[#251948] hover:bg-[#36275a]">
          <Users className="mr-2 h-4 w-4" />
          Gestión Completa
        </Button>
      </div>
      
      {/* Contenedor principal de dos columnas */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Columna izquierda: Talento Humano - Nuevo Módulo */}
        <Card className="border bg-white">
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
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-green-500"></div>
                <p>Gestión de nómina integrada</p>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-green-500"></div>
                <p>Gestión completa de empleados</p>
              </div>
            </div>
            
            <Button className="w-full bg-[#251948] hover:bg-[#36275a]">
              <Users className="mr-2 h-5 w-5" />
              Acceder al Dashboard Principal
            </Button>
          </CardContent>
        </Card>
        
        {/* Columna derecha: Acceso directo a módulos */}
        <Card className="border bg-white">
          <CardContent className="pt-6">
            <h2 className="text-2xl font-bold mb-2">Acceso Directo a Módulos</h2>
            <p className="text-muted-foreground mb-4">
              También puedes acceder directamente a cada uno de los módulos específicos de Talento Humano:
            </p>
            
            <div className="grid grid-cols-2 gap-4 mb-4">
              <Button variant="outline" className="justify-start">
                <Users className="mr-2 h-5 w-5" />
                Empleados
              </Button>
              
              <Button variant="outline" className="justify-start">
                <ClipboardCheck className="mr-2 h-5 w-5" />
                Evaluaciones
              </Button>
              
              <Button variant="outline" className="justify-start">
                <GraduationCap className="mr-2 h-5 w-5" />
                Capacitaciones
              </Button>
              
              <Button variant="outline" className="justify-start">
                <DollarSign className="mr-2 h-5 w-5" />
                Nómina
              </Button>
            </div>
            
            <Button variant="secondary" className="w-full bg-cyan-500 hover:bg-cyan-600 text-white">
              <BarChart3 className="mr-2 h-5 w-5" />
              Ver Métricas y KPIs
            </Button>
          </CardContent>
        </Card>
      </div>
      
      {/* Botón de Explorar Nueva Versión */}
      <div className="flex justify-center">
        <Button className="bg-[#251948] hover:bg-[#36275a]">
          <Users className="mr-2 h-5 w-5" />
          Explorar Nueva Versión
        </Button>
      </div>
    </div>
  );
};

export default RecursosHumanosPage;