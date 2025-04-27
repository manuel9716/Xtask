/**
 * Vista TalentoHumanoDashboard
 * Pantalla principal del módulo de Talento Humano que integra todas las funcionalidades
 * de gestión de empleados, evaluaciones, capacitaciones y nóminas.
 */

import React, { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";

// UI Components
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";

// Iconos
import {
  Users,
  ClipboardCheck,
  GraduationCap,
  DollarSign,
  Plus,
  RefreshCw,
  Download,
  BarChart3,
} from "lucide-react";

// Componentes del módulo
import { KpiCard } from "../components/KpiCard";
import { ListaEmpleados } from "./ListaEmpleados";
import { EmpleadoCard } from "../components/EmpleadoCard";
import { RRHHDashboard } from "../components/RRHHDashboard";
import { ListaEvaluaciones } from "./ListaEvaluaciones";
import { ListaCapacitaciones } from "./ListaCapacitaciones";
import { ListaNominas } from "./ListaNominas";

// API y casos de uso
import { EmpleadosApi } from "../../infrastructure/api/empleadosApi";
import { ObtenerIndicadoresRRHHUseCase } from "../../application/useCases/obtenerIndicadoresRRHH";
import { ListarEmpleadosUseCase } from "../../application/useCases/empleados/listarEmpleados";

// Modales
import { EmpleadoModal } from "../components/EmpleadoModal";
import { EvaluacionModal } from "../components/EvaluacionModal";
import { CapacitacionModal } from "../components/CapacitacionModal";

export const TalentoHumanoDashboard: React.FC = () => {
  const [location, navigate] = useLocation();
  const { toast } = useToast();
  
  // Repositorios y casos de uso
  const empleadosApi = new EmpleadosApi();
  const obtenerIndicadoresUseCase = new ObtenerIndicadoresRRHHUseCase(empleadosApi);
  const listarEmpleadosUseCase = new ListarEmpleadosUseCase(empleadosApi);
  
  // Estado para controlar modales
  const [modalEmpleadoOpen, setModalEmpleadoOpen] = useState(false);
  const [modalEvaluacionOpen, setModalEvaluacionOpen] = useState(false);
  const [modalCapacitacionOpen, setModalCapacitacionOpen] = useState(false);
  
  // Estado para tab activo - recuperamos de URL o usamos valor por defecto
  const getTabFromUrl = () => {
    const hash = window.location.hash.replace('#', '');
    if (['empleados', 'evaluaciones', 'capacitaciones', 'nomina', 'metricas'].includes(hash)) {
      return hash;
    }
    return 'empleados';
  };
  
  const [tabActivo, setTabActivo] = useState(getTabFromUrl());
  
  // Actualizar hash en la URL cuando cambia el tab
  useEffect(() => {
    window.location.hash = tabActivo;
  }, [tabActivo]);
  
  // Detectar cambios en el hash de la URL para mantener sincronizado el estado
  useEffect(() => {
    const handleHashChange = () => {
      setTabActivo(getTabFromUrl());
    };
    
    window.addEventListener('hashchange', handleHashChange);
    return () => {
      window.removeEventListener('hashchange', handleHashChange);
    };
  }, []);
  
  // Consulta para obtener métricas generales (KPIs)
  const { 
    data: metricasGenerales, 
    isLoading: isLoadingMetricas,
    isError: isErrorMetricas,
    refetch: refetchMetricas
  } = useQuery({
    queryKey: ['/api/recursos-humanos/indicadores/generales'],
    queryFn: () => obtenerIndicadoresUseCase.executeGenerales(),
  });
  
  // Consulta para obtener estadísticas de evaluaciones
  const {
    data: estadisticasEvaluaciones,
    isLoading: isLoadingEstadisticasEvaluaciones
  } = useQuery({
    queryKey: ['/api/recursos-humanos/evaluaciones/estadisticas'],
    queryFn: async () => {
      // Esta es una implementación simulada hasta que tengamos la API real
      return {
        total: 24,
        completadas: 18,
        pendientes: 6,
        calificacionPromedio: 4.2
      };
    }
  });
  
  // Consulta para obtener estadísticas de capacitaciones
  const {
    data: estadisticasCapacitaciones,
    isLoading: isLoadingEstadisticasCapacitaciones
  } = useQuery({
    queryKey: ['/api/recursos-humanos/capacitaciones/estadisticas'],
    queryFn: async () => {
      // Esta es una implementación simulada hasta que tengamos la API real
      return {
        total: 12,
        programadas: 5,
        enCurso: 3,
        completadas: 4
      };
    }
  });
  
  // Consulta para obtener estadísticas de nómina
  const {
    data: estadisticasNomina,
    isLoading: isLoadingEstadisticasNomina
  } = useQuery({
    queryKey: ['/api/recursos-humanos/nomina/estadisticas'],
    queryFn: async () => {
      // Esta es una implementación simulada hasta que tengamos la API real
      return {
        totalMes: 185000,
        empleadosPagados: 32,
        empleadosPendientes: 3,
        nominaProyectadaAnual: 2220000
      };
    }
  });
  
  // Función para renderizar los KPIs principales
  const renderizarKPIs = () => {
    if (isLoadingMetricas || isLoadingEstadisticasEvaluaciones || 
        isLoadingEstadisticasCapacitaciones || isLoadingEstadisticasNomina) {
      return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map(i => (
            <Skeleton key={i} className="h-[160px] w-full" />
          ))}
        </div>
      );
    }
    
    if (isErrorMetricas || !metricasGenerales) {
      return (
        <Card>
          <CardContent className="pt-6 text-center">
            <p className="text-destructive mb-4">Error al cargar las métricas.</p>
            <Button onClick={() => refetchMetricas()} variant="outline">
              <RefreshCw className="mr-2 h-4 w-4" />
              Reintentar
            </Button>
          </CardContent>
        </Card>
      );
    }
    
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <KpiCard 
          title="Empleados Activos"
          value={metricasGenerales.empleadosActivos}
          description={`${metricasGenerales.nuevosDelMes} nuevos este mes`}
          icon="users"
          color="primary"
        />
        
        <KpiCard 
          title="Evaluaciones"
          value={estadisticasEvaluaciones?.completadas || 0}
          description={`Calificación: ${estadisticasEvaluaciones?.calificacionPromedio?.toFixed(1) || 0}`}
          icon="custom"
          customIcon={<ClipboardCheck className="h-5 w-5" />}
          color="success"
        />
        
        <KpiCard 
          title="Capacitaciones"
          value={estadisticasCapacitaciones?.enCurso || 0}
          description={`${estadisticasCapacitaciones?.programadas || 0} programadas`}
          icon="custom"
          customIcon={<GraduationCap className="h-5 w-5" />}
          color="warning"
        />
        
        <KpiCard 
          title="Nómina Mensual"
          value={`$${(estadisticasNomina?.totalMes || 0).toLocaleString('es-ES')}`}
          description={`${estadisticasNomina?.empleadosPagados || 0} empleados pagados`}
          icon="money"
          color="info"
        />
      </div>
    );
  };
  
  return (
    <div className="space-y-6 pb-8">
      {/* Header principal */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Talento Humano</h1>
        <p className="text-muted-foreground">
          Gestión de empleados, evaluaciones y formación
        </p>
      </div>
      
      {/* KPIs principales */}
      {renderizarKPIs()}
      
      <Separator className="my-6" />
      
      {/* Navegación por tabs */}
      <Tabs 
        value={tabActivo} 
        onValueChange={setTabActivo}
        className="w-full"
      >
        <div className="flex justify-between items-center">
          <TabsList className="grid w-full max-w-3xl grid-cols-5">
            <TabsTrigger value="empleados" className="flex items-center space-x-2">
              <Users className="h-4 w-4" />
              <span className="hidden sm:inline-block">Empleados</span>
            </TabsTrigger>
            
            <TabsTrigger value="evaluaciones" className="flex items-center space-x-2">
              <ClipboardCheck className="h-4 w-4" />
              <span className="hidden sm:inline-block">Evaluaciones</span>
            </TabsTrigger>
            
            <TabsTrigger value="capacitaciones" className="flex items-center space-x-2">
              <GraduationCap className="h-4 w-4" />
              <span className="hidden sm:inline-block">Capacitaciones</span>
            </TabsTrigger>
            
            <TabsTrigger value="nomina" className="flex items-center space-x-2">
              <DollarSign className="h-4 w-4" />
              <span className="hidden sm:inline-block">Nómina</span>
            </TabsTrigger>
            
            <TabsTrigger value="metricas" className="flex items-center space-x-2">
              <BarChart3 className="h-4 w-4" />
              <span className="hidden sm:inline-block">Métricas</span>
            </TabsTrigger>
          </TabsList>
          
          {/* Botones específicos por tab */}
          <div>
            {tabActivo === 'empleados' && (
              <Button onClick={() => setModalEmpleadoOpen(true)} size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Nuevo Empleado
              </Button>
            )}
            
            {tabActivo === 'evaluaciones' && (
              <Button onClick={() => setModalEvaluacionOpen(true)} size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Nueva Evaluación
              </Button>
            )}
            
            {tabActivo === 'capacitaciones' && (
              <Button onClick={() => setModalCapacitacionOpen(true)} size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Nueva Capacitación
              </Button>
            )}
            
            {tabActivo === 'nomina' && (
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Exportar Nómina
              </Button>
            )}
            
            {tabActivo === 'metricas' && (
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Exportar Informes
              </Button>
            )}
          </div>
        </div>
        
        <div className="mt-6">
          <TabsContent value="empleados" className="space-y-4">
            <ListaEmpleados />
          </TabsContent>
          
          <TabsContent value="evaluaciones" className="space-y-4">
            <ListaEvaluaciones />
          </TabsContent>
          
          <TabsContent value="capacitaciones" className="space-y-4">
            <ListaCapacitaciones />
          </TabsContent>
          
          <TabsContent value="nomina" className="space-y-4">
            <ListaNominas />
          </TabsContent>
          
          <TabsContent value="metricas" className="space-y-4">
            <RRHHDashboard />
          </TabsContent>
        </div>
      </Tabs>
      
      {/* Modales */}
      <EmpleadoModal
        open={modalEmpleadoOpen}
        onOpenChange={setModalEmpleadoOpen}
        onSuccess={() => {
          toast({
            title: "Empleado creado",
            description: "El empleado ha sido creado correctamente",
          });
          refetchMetricas();
        }}
      />
      
      <EvaluacionModal
        open={modalEvaluacionOpen}
        onOpenChange={setModalEvaluacionOpen}
        onSuccess={() => {
          toast({
            title: "Evaluación creada",
            description: "La evaluación ha sido creada correctamente",
          });
        }}
      />
      
      <CapacitacionModal
        open={modalCapacitacionOpen}
        onOpenChange={setModalCapacitacionOpen}
        onSuccess={() => {
          toast({
            title: "Capacitación creada",
            description: "La capacitación ha sido creada correctamente",
          });
        }}
      />
    </div>
  );
};