import React, { useState } from "react";
import { MainLayout } from "@/layouts/main-layout";
import { ListaCapacitaciones } from "@/modules/recursos-humanos/ui/views/ListaCapacitaciones";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, SelectLabel } from "@/components/ui/select";
import { GraduationCap, Calendar, ListChecks, BarChart3, Users, Clock, CheckCircle2, ChevronLeft, ChevronRight, Edit, FileText, Check } from "lucide-react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import * as capacitacionesApi from "@/modules/recursos-humanos/infrastructure/api/capacitacionesApi";
import { CapacitacionModal } from "@/modules/recursos-humanos/ui/components/CapacitacionModal";

export default function CapacitacionesPage() {
  const [activeTab, setActiveTab] = useState("lista");
  const [modalCrearCapacitacionAbierto, setModalCrearCapacitacionAbierto] = useState(false);
  const [capacitacionSeleccionada, setCapacitacionSeleccionada] = useState<string | undefined>(undefined);
  const queryClient = useQueryClient();

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
  
  // Obtener detalles de la capacitación seleccionada
  const { data: capacitacionDetalle, isLoading: isLoadingDetalle } = useQuery({
    queryKey: ['/api/capacitaciones/detalle', capacitacionSeleccionada],
    queryFn: () => capacitacionSeleccionada ? capacitacionesApi.obtenerCapacitacionPorId(Number(capacitacionSeleccionada)) : null,
    enabled: !!capacitacionSeleccionada
  });
  
  // Obtener participantes de la capacitación (simular datos para esta demo)
  const { data: participantes, isLoading: isLoadingParticipantes } = useQuery({
    queryKey: ['/api/capacitaciones/participantes', capacitacionSeleccionada],
    queryFn: async () => {
      // Simulamos una llamada a API
      if (!capacitacionSeleccionada) return [];
      await new Promise(resolve => setTimeout(resolve, 700));
      
      // En una implementación real, esto vendría del backend
      return [
        { 
          id: 1, 
          nombreCompleto: "Carlos Ramírez", 
          cargo: "Desarrollador Senior", 
          departamento: "Tecnología",
          asistencia: true,
          evaluacion: 4
        },
        { 
          id: 2, 
          nombreCompleto: "Ana Martinez", 
          cargo: "Product Manager", 
          departamento: "Tecnología",
          asistencia: true,
          evaluacion: 5
        },
        { 
          id: 3, 
          nombreCompleto: "Miguel Sánchez", 
          cargo: "Desarrollador Junior", 
          departamento: "Tecnología",
          asistencia: false,
          evaluacion: 0
        }
      ];
    },
    enabled: !!capacitacionSeleccionada
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
            <Button onClick={() => setModalCrearCapacitacionAbierto(true)} className="bg-primary">
              <GraduationCap className="h-4 w-4 mr-2" />
              Nueva Capacitación
            </Button>
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
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Calendario de Capacitaciones</CardTitle>
                  <CardDescription>
                    Visualiza programación de capacitaciones en formato calendario
                  </CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" onClick={() => {}}>
                    <Calendar className="h-4 w-4 mr-2" />
                    Hoy
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => {}}>
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => {}}>
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="p-0 border-t">
                <div className="flex h-[600px]">
                  {/* Sidebar */}
                  <div className="w-24 border-r border-gray-200 dark:border-gray-800 flex flex-col flex-shrink-0">
                    <div className="h-14 border-b border-gray-200 dark:border-gray-800"></div>
                    {Array.from({ length: 10 }).map((_, i) => (
                      <div key={i} className="h-14 flex items-center justify-center text-sm text-muted-foreground">
                        {`${8 + i}:00`}
                      </div>
                    ))}
                  </div>
                  
                  {/* Calendar Body */}
                  <div className="flex-1 overflow-auto">
                    {/* Header Row - Days */}
                    <div className="flex border-b border-gray-200 dark:border-gray-800">
                      {['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes'].map(day => (
                        <div key={day} className="flex-1 h-14 p-2 text-center">
                          <div className="font-medium">{day}</div>
                          <div className="text-xs text-muted-foreground">
                            {new Date(new Date().setDate(new Date().getDate() + ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes'].indexOf(day))).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })}
                          </div>
                        </div>
                      ))}
                    </div>
                    
                    {/* Calendar Grid */}
                    <div className="relative">
                      {/* Time Slots */}
                      <div className="grid grid-cols-5">
                        {Array.from({ length: 5 }).map((_, dayIndex) => (
                          <div key={dayIndex} className="border-r border-gray-200 dark:border-gray-800">
                            {Array.from({ length: 10 }).map((_, timeIndex) => (
                              <div 
                                key={timeIndex} 
                                className="h-14 border-b border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-900"
                              ></div>
                            ))}
                          </div>
                        ))}
                      </div>
                      
                      {/* Eventos de capacitaciones */}
                      {programadas && programadas.map((capacitacion) => {
                        // Determinar en qué día de la semana está la capacitación
                        const fecha = new Date(capacitacion.fechaInicio);
                        const diaSemana = fecha.getDay(); // 0 es domingo, 1 es lunes, etc.
                        
                        // Si es sábado o domingo, no mostrar
                        if (diaSemana === 0 || diaSemana === 6) return null;
                        
                        // Convertir a índice 0-4 (lunes a viernes)
                        const dayIndex = diaSemana - 1;
                        
                        // Calcular hora de inicio
                        const horaInicio = fecha.getHours();
                        const horaFin = new Date(capacitacion.fechaFin).getHours();
                        
                        // Sólo mostrar si la hora está entre 8 y 18
                        if (horaInicio < 8 || horaInicio >= 18) return null;
                        
                        // Calcular posición y altura
                        const topPosition = (horaInicio - 8) * 56; // 56px por hora (14px * 4 cuartos de hora)
                        const height = (horaFin - horaInicio) * 56;
                        
                        return (
                          <div 
                            key={capacitacion.id}
                            className={`absolute rounded-md p-2 overflow-hidden shadow-sm border-l-4 ${capacitacion.estado === 'PROGRAMADA' ? 'bg-blue-50 dark:bg-blue-950 border-blue-500' : 'bg-green-50 dark:bg-green-950 border-green-500'}`}
                            style={{
                              top: `${topPosition + 56}px`, // +56px por el header
                              left: `${(dayIndex * 20) + 24 + 0.5}%`, // 20% por columna, 24% por el sidebar
                              height: `${height}px`,
                              width: '19%'
                            }}
                          >
                            <div className="text-xs font-medium truncate">{capacitacion.titulo}</div>
                            <div className="text-xs text-muted-foreground truncate">
                              {`${horaInicio}:00 - ${horaFin}:00`}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
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
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-md font-medium">Selecciona una capacitación para gestionar asistencias</h3>
                    {programadas?.length === 0 && enCurso?.length === 0 && (
                      <Badge variant="outline">No hay capacitaciones disponibles</Badge>
                    )}
                  </div>
                  
                  {(programadas?.length === 0 && enCurso?.length === 0) ? (
                    <div className="h-[300px] flex flex-col items-center justify-center rounded-md border">
                      <GraduationCap className="h-12 w-12 mb-4 text-muted-foreground" />
                      <p className="text-muted-foreground">
                        No hay capacitaciones programadas o en curso para gestionar asistencias.
                      </p>
                      <Button 
                        variant="outline" 
                        className="mt-4"
                        onClick={() => setModalCrearCapacitacionAbierto(true)}
                      >
                        Crear Nueva Capacitación
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      <Select 
                        value={capacitacionSeleccionada} 
                        onValueChange={setCapacitacionSeleccionada}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Seleccionar capacitación" />
                        </SelectTrigger>
                        <SelectContent>
                          {programadas && programadas.length > 0 && (
                            <>
                              <SelectLabel>Programadas</SelectLabel>
                              {programadas.map(capacitacion => (
                                <SelectItem key={`prog-${capacitacion.id}`} value={capacitacion.id.toString()}>
                                  {capacitacion.titulo} - {new Date(capacitacion.fechaInicio).toLocaleDateString('es-ES')}
                                </SelectItem>
                              ))}
                            </>
                          )}
                          {enCurso && enCurso.length > 0 && (
                            <>
                              <SelectLabel>En Curso</SelectLabel>
                              {enCurso.map(capacitacion => (
                                <SelectItem key={`curso-${capacitacion.id}`} value={capacitacion.id.toString()}>
                                  {capacitacion.titulo} - {new Date(capacitacion.fechaInicio).toLocaleDateString('es-ES')}
                                </SelectItem>
                              ))}
                            </>
                          )}
                        </SelectContent>
                      </Select>
                      
                      <div className="rounded-md border">
                        <div className="p-4 bg-muted/50">
                          <h3 className="text-md font-medium">Participantes</h3>
                        </div>
                        
                        <div className="p-0">
                          <table className="w-full">
                            <thead>
                              <tr className="border-b">
                                <th className="p-3 text-left font-medium">Empleado</th>
                                <th className="p-3 text-left font-medium">Departamento</th>
                                <th className="p-3 text-center font-medium">Asistencia</th>
                                <th className="p-3 text-center font-medium">Evaluación</th>
                                <th className="p-3 text-right font-medium">Acciones</th>
                              </tr>
                            </thead>
                            <tbody>
                              {isLoadingParticipantes ? (
                                // Estado de carga
                                <tr>
                                  <td colSpan={5} className="p-8 text-center">
                                    <div className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
                                    <p className="mt-2 text-sm text-muted-foreground">Cargando participantes...</p>
                                  </td>
                                </tr>
                              ) : participantes && participantes.length > 0 ? (
                                // Mostrar participantes si hay datos
                                participantes.map((participante) => (
                                  <tr key={participante.id} className="border-b hover:bg-muted/50">
                                    <td className="p-3">
                                      <div className="font-medium">{participante.nombreCompleto}</div>
                                      <div className="text-sm text-muted-foreground">{participante.cargo}</div>
                                    </td>
                                    <td className="p-3 text-sm">{participante.departamento}</td>
                                    <td className="p-3 text-center">
                                      <Badge variant="outline" className={participante.asistencia ? "bg-green-100 text-green-800 hover:bg-green-100" : "bg-amber-100 text-amber-800 hover:bg-amber-100"}>
                                        {participante.asistencia ? "Asistió" : "Pendiente"}
                                      </Badge>
                                    </td>
                                    <td className="p-3 text-center">
                                      <div className="flex items-center justify-center">
                                        {participante.evaluacion ? (
                                          <div className="text-amber-500">
                                            {"★".repeat(participante.evaluacion)}
                                            <span className="text-muted-foreground">{"★".repeat(5 - participante.evaluacion)}</span>
                                          </div>
                                        ) : (
                                          <span className="text-muted-foreground text-sm">Sin evaluar</span>
                                        )}
                                      </div>
                                    </td>
                                    <td className="p-3 text-right">
                                      <Button variant="ghost" size="sm">
                                        <Edit className="h-4 w-4" />
                                      </Button>
                                    </td>
                                  </tr>
                                ))
                              ) : (
                                // Mensaje si no hay participantes
                                <tr>
                                  <td colSpan={5} className="p-8 text-center">
                                    <p className="text-muted-foreground">No hay participantes registrados en esta capacitación.</p>
                                    <Button 
                                      variant="outline" 
                                      className="mt-4"
                                      onClick={() => {
                                        setModalCrearCapacitacionAbierto(true);
                                      }}
                                    >
                                      Editar Capacitación
                                    </Button>
                                  </td>
                                </tr>
                              )}
                            </tbody>
                          </table>
                        </div>
                        
                        <div className="p-4 flex justify-between items-center border-t">
                          <div className="text-sm text-muted-foreground">
                            {participantes?.length || 0} participantes registrados
                          </div>
                          <div className="flex gap-2">
                            <Button variant="outline" size="sm" disabled={!participantes?.length}>
                              <FileText className="h-4 w-4 mr-2" />
                              Exportar
                            </Button>
                            <Button size="sm" disabled={!participantes?.length}>
                              <Check className="h-4 w-4 mr-2" />
                              Guardar Asistencia
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
      <CapacitacionModal 
        open={modalCrearCapacitacionAbierto} 
        onOpenChange={setModalCrearCapacitacionAbierto}
        onSuccess={() => {
          queryClient.invalidateQueries({ queryKey: ['/api/capacitaciones'] });
          queryClient.invalidateQueries({ queryKey: ['/api/capacitaciones/estado/programadas'] });
          queryClient.invalidateQueries({ queryKey: ['/api/capacitaciones/estado/en-curso'] });
          queryClient.invalidateQueries({ queryKey: ['/api/capacitaciones/estadisticas/resumen'] });
        }}
      />
    </MainLayout>
  );
}