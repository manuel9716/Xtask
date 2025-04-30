import React from "react";
import { MainLayout } from "@/layouts/main-layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { BarChart3, ChevronRight, ClipboardCheck, GraduationCap, Users, ArrowLeft, DollarSign } from "lucide-react";
import { Link } from "wouter";

export default function MetricasPage() {
  return (
    <MainLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Métricas y KPIs</h1>
          <p className="text-muted-foreground">
            Visualiza y analiza las métricas e indicadores clave de recursos humanos
          </p>
        </div>
        
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {/* KPI: Rotación de personal */}
          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">Rotación de Personal</CardTitle>
                <BarChart3 className="h-5 w-5 text-purple-500" />
              </div>
              <CardDescription>Últimos 12 meses</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Tasa actual</span>
                  <span className="text-2xl font-bold">12.5%</span>
                </div>
                <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                  <div className="bg-purple-500 h-full rounded-full" style={{ width: '68%' }}></div>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-green-600">-2.3% respecto al año anterior</span>
                  <span>Meta: 10%</span>
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* KPI: Capacitación */}
          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">Capacitación</CardTitle>
                <GraduationCap className="h-5 w-5 text-amber-500" />
              </div>
              <CardDescription>Horas por empleado</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Promedio anual</span>
                  <span className="text-2xl font-bold">18.2h</span>
                </div>
                <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                  <div className="bg-amber-500 h-full rounded-full" style={{ width: '75%' }}></div>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-green-600">+3.5h respecto al año anterior</span>
                  <span>Meta: 24h</span>
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* KPI: Evaluación de desempeño */}
          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">Evaluación Desempeño</CardTitle>
                <ClipboardCheck className="h-5 w-5 text-green-500" />
              </div>
              <CardDescription>Puntuación promedio</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Escala 1-5</span>
                  <span className="text-2xl font-bold">4.2</span>
                </div>
                <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                  <div className="bg-green-500 h-full rounded-full" style={{ width: '84%' }}></div>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-green-600">+0.3 respecto al año anterior</span>
                  <span>Meta: 4.5</span>
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* KPI: Clima laboral */}
          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">Clima Laboral</CardTitle>
                <Users className="h-5 w-5 text-blue-500" />
              </div>
              <CardDescription>Satisfacción empleados</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Encuesta trimestral</span>
                  <span className="text-2xl font-bold">78%</span>
                </div>
                <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                  <div className="bg-blue-500 h-full rounded-full" style={{ width: '78%' }}></div>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-amber-600">-2% respecto al trimestre anterior</span>
                  <span>Meta: 85%</span>
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* KPI: Tiempo para contratar */}
          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">Tiempo Contratación</CardTitle>
                <Users className="h-5 w-5 text-red-500" />
              </div>
              <CardDescription>Días para cubrir vacante</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Promedio</span>
                  <span className="text-2xl font-bold">32 días</span>
                </div>
                <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                  <div className="bg-red-500 h-full rounded-full" style={{ width: '65%' }}></div>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-red-600">+5 días respecto al año anterior</span>
                  <span>Meta: 25 días</span>
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* KPI: Costo por contratación */}
          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">Costo Contratación</CardTitle>
                <DollarSign className="h-5 w-5 text-emerald-500" />
              </div>
              <CardDescription>Promedio por posición</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Último trimestre</span>
                  <span className="text-2xl font-bold">$2,850</span>
                </div>
                <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                  <div className="bg-emerald-500 h-full rounded-full" style={{ width: '72%' }}></div>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-green-600">-$320 respecto al trimestre anterior</span>
                  <span>Meta: $2,500</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        
        <div className="flex justify-end space-x-2 mt-8">
          <Button variant="outline" asChild>
            <Link href="/recursos-humanos">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Volver
            </Link>
          </Button>
          <Button variant="default">
            Exportar Informe
          </Button>
        </div>
      </div>
    </MainLayout>
  );
}