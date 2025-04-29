import React, { useState } from "react";
import { MainLayout } from "@/layouts/main-layout";
import { ListaCapacitaciones } from "@/modules/recursos-humanos/ui/views/ListaCapacitaciones";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { GraduationCap, Calendar, ListChecks, BarChart3, Users, Clock, CheckCircle2 } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import * as capacitacionesApi from "@/modules/recursos-humanos/infrastructure/api/capacitacionesApi";

export default function CapacitacionesPage() {
  const [activeTab, setActiveTab] = useState("lista");

  // Dashboard stats
  const { data: estadisticas, isLoading: isLoadingStats } = useQuery({
    queryKey: ['/api/capacitaciones/estadisticas/resumen'],
    queryFn: capacitacionesApi.obtenerEstadisticasCapacitaciones
  });

  const { data: programadas, isLoading: isLoadingProgramadas } = useQuery({
    queryKey: ['/api/capacitaciones/estado/programadas'],
    queryFn: capacitacionesApi.obtenerCapacitacionesProgramadas
  });

  const { data: enCurso, isLoading: isLoadingEnCurso } = useQuery({
    queryKey: ['/api/capacitaciones/estado/en-curso'],
    queryFn: capacitacionesApi.obtenerCapacitacionesEnCurso
  });

  return (
    <MainLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Gestión de Capacitaciones</h1>
          <p className="text-muted-foreground">
            Administra los programas de formación y capacitación para los empleados
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-lg font-medium">
                <Calendar className="h-5 w-5 text-blue-500" />
                Programadas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{isLoadingProgramadas ? "-" : programadas?.length || 0}</div>
              <p className="text-xs text-muted-foreground">Capacitaciones por realizar</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-lg font-medium">
                <Clock className="h-5 w-5 text-yellow-500" />
                En Curso
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{isLoadingEnCurso ? "-" : enCurso?.length || 0}</div>
              <p className="text-xs text-muted-foreground">Actualmente en desarrollo</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-lg font-medium">
                <CheckCircle2 className="h-5 w-5 text-green-500" />
                Completadas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{isLoadingStats ? "-" : estadisticas?.completadas || 0}</div>
              <p className="text-xs text-muted-foreground">Capacitaciones finalizadas</p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="lista" value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <div className="flex justify-between items-center">
            <TabsList>
              <TabsTrigger value="lista" className="flex items-center gap-2">
                <ListChecks className="h-4 w-4" /> 
                Lista Completa
              </TabsTrigger>
              <TabsTrigger value="dashboard" className="flex items-center gap-2">
                <BarChart3 className="h-4 w-4" /> 
                Dashboard
              </TabsTrigger>
              <TabsTrigger value="calendario" className="flex items-center gap-2">
                <Calendar className="h-4 w-4" /> 
                Calendario
              </TabsTrigger>
              <TabsTrigger value="asistencia" className="flex items-center gap-2">
                <Users className="h-4 w-4" /> 
                Asistencias
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="lista" className="space-y-4">
            <ListaCapacitaciones />
          </TabsContent>

          <TabsContent value="dashboard" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Dashboard de Capacitaciones</CardTitle>
                <CardDescription>
                  Vista general de indicadores y estadísticas de los programas de capacitación
                </CardDescription>
              </CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-md font-medium mb-2">Distribución por Tipo</h3>
                  <div className="bg-gray-100 dark:bg-gray-800 p-6 rounded-lg h-[200px] flex items-center justify-center">
                    <p className="text-muted-foreground">Gráfica de distribución por tipo</p>
                  </div>
                </div>
                <div>
                  <h3 className="text-md font-medium mb-2">Distribución por Estado</h3>
                  <div className="bg-gray-100 dark:bg-gray-800 p-6 rounded-lg h-[200px] flex items-center justify-center">
                    <p className="text-muted-foreground">Gráfica de distribución por estado</p>
                  </div>
                </div>
                <div>
                  <h3 className="text-md font-medium mb-2">Programación Mensual</h3>
                  <div className="bg-gray-100 dark:bg-gray-800 p-6 rounded-lg h-[200px] flex items-center justify-center">
                    <p className="text-muted-foreground">Gráfica de capacitaciones por mes</p>
                  </div>
                </div>
                <div>
                  <h3 className="text-md font-medium mb-2">Participación por Departamento</h3>
                  <div className="bg-gray-100 dark:bg-gray-800 p-6 rounded-lg h-[200px] flex items-center justify-center">
                    <p className="text-muted-foreground">Gráfica de participación por departamento</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="calendario" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Calendario de Capacitaciones</CardTitle>
                <CardDescription>
                  Visualiza programación de capacitaciones en formato calendario
                </CardDescription>
              </CardHeader>
              <CardContent className="h-[500px] flex items-center justify-center bg-gray-50 dark:bg-gray-900 rounded-md">
                <div className="text-center">
                  <GraduationCap className="h-12 w-12 mb-4 mx-auto text-muted-foreground" />
                  <h3 className="text-lg font-medium">Visualización de Calendario</h3>
                  <p className="text-muted-foreground mt-2 max-w-md">
                    Esta vista mostrará las capacitaciones programadas en un formato de calendario
                    para visualizar fácilmente la distribución temporal.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="asistencia" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Control de Asistencias</CardTitle>
                <CardDescription>
                  Gestiona la asistencia de los empleados a las capacitaciones
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="rounded-md border">
                  <div className="flex items-center justify-between p-4">
                    <h3 className="text-md font-medium">Selecciona una capacitación para gestionar asistencias</h3>
                    <Badge variant="outline">EN DESARROLLO</Badge>
                  </div>
                  <div className="h-[400px] flex flex-col items-center justify-center border-t">
                    <GraduationCap className="h-12 w-12 mb-4 text-muted-foreground" />
                    <p className="text-muted-foreground">
                      Aquí se mostrará la lista de empleados inscritos en la capacitación seleccionada
                      para registrar su asistencia y calificaciones.
                    </p>
                    <Button variant="outline" className="mt-4">
                      Seleccionar Capacitación
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
}