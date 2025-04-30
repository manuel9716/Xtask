import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Users, GraduationCap, ClipboardCheck, BarChart3, ChevronRight } from "lucide-react";
import { Link } from "wouter";
import { Separator } from "@/components/ui/separator";

export default function SimpleHumanResources() {
  return (
    <div className="space-y-6 pb-8">
      {/* Header principal */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Recursos Humanos</h1>
        <p className="text-muted-foreground">
          Gestiona las evaluaciones, capacitaciones y métricas de tu empresa
        </p>
      </div>
      
      <Separator className="my-6" />
      
      {/* Las tres secciones principales */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Métricas y KPIs */}
        <Card className="shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center text-xl">
              <BarChart3 className="mr-2 h-6 w-6 text-purple-500" />
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
            <Button asChild className="w-full bg-[#251948] hover:bg-[#36275a]">
              <Link href="/recursos-humanos/metricas">
                Ver Métricas
                <ChevronRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>
        
        {/* Capacitaciones */}
        <Card className="shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center text-xl">
              <GraduationCap className="mr-2 h-6 w-6 text-amber-500" />
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
            <Button asChild className="w-full bg-[#251948] hover:bg-[#36275a]">
              <Link href="/recursos-humanos/capacitaciones">
                Ver Capacitaciones
                <ChevronRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>
        
        {/* Evaluaciones */}
        <Card className="shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center text-xl">
              <ClipboardCheck className="mr-2 h-6 w-6 text-green-500" />
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
            <Button asChild className="w-full bg-[#251948] hover:bg-[#36275a]">
              <Link href="/recursos-humanos/evaluaciones">
                Ver Evaluaciones
                <ChevronRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
      
      {/* Dashboard de resumen */}
      <div className="mt-8">
        <h2 className="text-2xl font-bold tracking-tight mb-4">Resumen de Actividad</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Próximas capacitaciones */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Próximas Capacitaciones</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b pb-3">
                  <div>
                    <h3 className="font-medium">Liderazgo Efectivo</h3>
                    <p className="text-sm text-muted-foreground">5 Mayo, 2025 • 15:00 hrs</p>
                  </div>
                  <div className="text-sm text-purple-600 font-medium">12 participantes</div>
                </div>
                
                <div className="flex items-center justify-between border-b pb-3">
                  <div>
                    <h3 className="font-medium">Excel Avanzado</h3>
                    <p className="text-sm text-muted-foreground">12 Mayo, 2025 • 10:00 hrs</p>
                  </div>
                  <div className="text-sm text-purple-600 font-medium">8 participantes</div>
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium">Gestión del Tiempo</h3>
                    <p className="text-sm text-muted-foreground">20 Mayo, 2025 • 14:30 hrs</p>
                  </div>
                  <div className="text-sm text-purple-600 font-medium">15 participantes</div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* Evaluaciones recientes */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Evaluaciones Recientes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b pb-3">
                  <div>
                    <h3 className="font-medium">Evaluación Trimestral Q1</h3>
                    <p className="text-sm text-muted-foreground">Periodo: Ene-Mar 2025</p>
                  </div>
                  <div className="text-sm text-green-600 font-medium">28 completadas</div>
                </div>
                
                <div className="flex items-center justify-between border-b pb-3">
                  <div>
                    <h3 className="font-medium">Evaluación de Desempeño</h3>
                    <p className="text-sm text-muted-foreground">Depto. Operaciones</p>
                  </div>
                  <div className="text-sm text-green-600 font-medium">12 completadas</div>
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium">Evaluación de Competencias</h3>
                    <p className="text-sm text-muted-foreground">Liderazgo y Trabajo en Equipo</p>
                  </div>
                  <div className="text-sm text-green-600 font-medium">8 completadas</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}