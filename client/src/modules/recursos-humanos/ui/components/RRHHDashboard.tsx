/**
 * Componente RRHHDashboard
 * Dashboard con indicadores clave de rendimiento y gráficos para recursos humanos
 */

import React, { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  BarChart, 
  Bar, 
  LineChart, 
  Line, 
  PieChart, 
  Pie, 
  Cell, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer
} from "recharts";
import { KpiCard } from "./KpiCard";
import { EmpleadoCard } from "./EmpleadoCard";
import { EmpleadosApi } from "../../infrastructure/api/empleadosApi";
import { ObtenerIndicadoresRRHHUseCase } from "../../application/useCases/obtenerIndicadoresRRHH";
import { ListarEmpleadosUseCase } from "../../application/useCases/empleados/listarEmpleados";
import { EstadoEmpleado } from "../../domain/entities/Empleado";
import { 
  Users, 
  TrendingUp, 
  Calendar, 
  DollarSign, 
  Briefcase,
  Download,
  UserPlus,
  BarChart3,
  PieChart as PieChartIcon
} from "lucide-react";

export const RRHHDashboard: React.FC = () => {
  const empleadosApi = new EmpleadosApi();
  const obtenerIndicadoresUseCase = new ObtenerIndicadoresRRHHUseCase(empleadosApi);
  const listarEmpleadosUseCase = new ListarEmpleadosUseCase(empleadosApi);
  
  const [periodoEvolucion, setPeriodoEvolucion] = useState<'mes' | 'trimestre' | 'año'>('mes');
  const [mesesProyeccion, setMesesProyeccion] = useState<number>(12);
  
  // Consulta para obtener métricas generales
  const { 
    data: metricasGenerales, 
    isLoading: isLoadingMetricas,
    isError: isErrorMetricas,
  } = useQuery({
    queryKey: ['/api/recursos-humanos/indicadores/generales'],
    queryFn: () => obtenerIndicadoresUseCase.executeGenerales(),
  });
  
  // Consulta para obtener evolución de empleados
  const { 
    data: evolucionEmpleados, 
    isLoading: isLoadingEvolucion,
    isError: isErrorEvolucion,
  } = useQuery({
    queryKey: ['/api/recursos-humanos/indicadores/evolucion', periodoEvolucion],
    queryFn: () => obtenerIndicadoresUseCase.executeEvolucion(6, periodoEvolucion),
  });
  
  // Consulta para obtener proyección de nómina
  const { 
    data: proyeccionNomina, 
    isLoading: isLoadingProyeccion,
    isError: isErrorProyeccion,
  } = useQuery({
    queryKey: ['/api/recursos-humanos/indicadores/proyeccion-nomina', mesesProyeccion],
    queryFn: () => obtenerIndicadoresUseCase.executeProyeccionNomina(mesesProyeccion, 3),
  });
  
  // Consulta para obtener últimos empleados
  const { 
    data: ultimosEmpleados, 
    isLoading: isLoadingEmpleados,
    isError: isErrorEmpleados,
  } = useQuery({
    queryKey: ['/api/recursos-humanos/empleados/recientes'],
    queryFn: () => listarEmpleadosUseCase.execute({ 
      fechaContratacionDesde: new Date(new Date().setMonth(new Date().getMonth() - 1))
    }, { page: 1, pageSize: 3 }),
  });
  
  // Renderizar KPIs principales
  const renderizarKPIs = () => {
    if (isLoadingMetricas) {
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
          <CardContent className="pt-6">
            <p className="text-destructive text-center">Error al cargar las métricas.</p>
          </CardContent>
        </Card>
      );
    }
    
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <KpiCard 
          title="Total Empleados"
          value={metricasGenerales.totalEmpleados}
          description={`${metricasGenerales.empleadosActivos} activos (${Math.round(metricasGenerales.porcentajeActividad)}%)`}
          icon="users"
          color="primary"
        />
        <KpiCard 
          title="Nuevas Contrataciones"
          value={metricasGenerales.nuevosDelMes}
          description="En el último mes"
          trend={metricasGenerales.rotacionMensual ? -metricasGenerales.rotacionMensual : undefined}
          icon="calendar"
          color="success"
        />
        <KpiCard 
          title="Salario Promedio"
          value={`$${metricasGenerales.salarioPromedio.toLocaleString('es-ES', { maximumFractionDigits: 0 })}`}
          description={`Antigüedad promedio: ${metricasGenerales.antiguedadPromedio?.toFixed(1) || 0} años`}
          icon="money"
          color="warning"
        />
        <KpiCard 
          title="Total Nómina Mensual"
          value={`$${metricasGenerales.totalNomina.toLocaleString('es-ES', { maximumFractionDigits: 0 })}`}
          description="Empleados activos"
          icon="money"
          color="info"
        />
      </div>
    );
  };
  
  // Renderizar gráfico de evolución de empleados
  const renderizarGraficoEvolucion = () => {
    if (isLoadingEvolucion) {
      return <Skeleton className="h-[300px] w-full" />;
    }
    
    if (isErrorEvolucion || !evolucionEmpleados || evolucionEmpleados.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center h-[300px]">
          <p className="text-muted-foreground">No hay datos disponibles para mostrar.</p>
        </div>
      );
    }
    
    return (
      <ResponsiveContainer width="100%" height={300}>
        <BarChart
          data={evolucionEmpleados}
          margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="periodo" />
          <YAxis yAxisId="left" orientation="left" />
          <YAxis yAxisId="right" orientation="right" />
          <Tooltip />
          <Legend />
          <Bar yAxisId="left" dataKey="contrataciones" name="Contrataciones" fill="#10b981" />
          <Bar yAxisId="left" dataKey="bajas" name="Bajas" fill="#ef4444" />
          <Line yAxisId="right" type="monotone" dataKey="rotacion" name="Rotación %" stroke="#8884d8" activeDot={{ r: 8 }} />
        </BarChart>
      </ResponsiveContainer>
    );
  };
  
  // Renderizar gráfico de distribución por departamento
  const renderizarGraficoDepartamentos = () => {
    if (isLoadingMetricas) {
      return <Skeleton className="h-[300px] w-full" />;
    }
    
    if (isErrorMetricas || !metricasGenerales || !metricasGenerales.departamentos || metricasGenerales.departamentos.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center h-[300px]">
          <p className="text-muted-foreground">No hay datos disponibles para mostrar.</p>
        </div>
      );
    }
    
    // Generar colores para los departamentos
    const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];
    
    // Preparar datos para el gráfico de pie
    const data = metricasGenerales.departamentos.map(depto => ({
      name: depto.nombre,
      value: depto.cantidadEmpleados
    }));
    
    return (
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            labelLine={true}
            label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
            outerRadius={100}
            fill="#8884d8"
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip formatter={(value) => [`${value} empleados`, 'Cantidad']} />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    );
  };
  
  // Renderizar gráfico de estados de empleados
  const renderizarGraficoEstados = () => {
    if (isLoadingMetricas) {
      return <Skeleton className="h-[300px] w-full" />;
    }
    
    if (isErrorMetricas || !metricasGenerales || !metricasGenerales.estados || metricasGenerales.estados.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center h-[300px]">
          <p className="text-muted-foreground">No hay datos disponibles para mostrar.</p>
        </div>
      );
    }
    
    // Preparar datos para el gráfico de barras
    const data = metricasGenerales.estados.map(estado => ({
      name: estado.nombre,
      cantidad: estado.cantidad,
      color: estado.color
    }));
    
    return (
      <ResponsiveContainer width="100%" height={300}>
        <BarChart
          data={data}
          margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
          layout="vertical"
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis type="number" />
          <YAxis dataKey="name" type="category" />
          <Tooltip />
          <Legend />
          <Bar dataKey="cantidad" name="Cantidad" fill="#8884d8">
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color || "#8884d8"} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    );
  };
  
  // Renderizar gráfico de proyección de nómina
  const renderizarGraficoProyeccion = () => {
    if (isLoadingProyeccion) {
      return <Skeleton className="h-[300px] w-full" />;
    }
    
    if (isErrorProyeccion || !proyeccionNomina || proyeccionNomina.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center h-[300px]">
          <p className="text-muted-foreground">No hay datos disponibles para mostrar.</p>
        </div>
      );
    }
    
    return (
      <ResponsiveContainer width="100%" height={300}>
        <LineChart
          data={proyeccionNomina}
          margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="mes" />
          <YAxis />
          <Tooltip formatter={(value) => [`$${Number(value).toLocaleString('es-ES', { maximumFractionDigits: 0 })}`, 'Costo']} />
          <Legend />
          <Line type="monotone" dataKey="costo" name="Costo Nómina" stroke="#8884d8" activeDot={{ r: 8 }} />
        </LineChart>
      </ResponsiveContainer>
    );
  };
  
  // Renderizar últimos empleados
  const renderizarUltimosEmpleados = () => {
    if (isLoadingEmpleados) {
      return (
        <div className="space-y-4">
          {[1, 2, 3].map(i => (
            <Skeleton key={i} className="h-[100px] w-full" />
          ))}
        </div>
      );
    }
    
    if (isErrorEmpleados || !ultimosEmpleados || ultimosEmpleados.data.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center h-[200px]">
          <p className="text-muted-foreground">No hay empleados recientes para mostrar.</p>
        </div>
      );
    }
    
    return (
      <div className="space-y-4">
        {ultimosEmpleados.data.map(empleado => (
          <EmpleadoCard 
            key={empleado.id}
            empleado={empleado}
            modo="compacto"
          />
        ))}
      </div>
    );
  };
  
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Dashboard de RRHH</h2>
          <p className="text-muted-foreground">
            Análisis y métricas del departamento de Recursos Humanos
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Download className="mr-2 h-4 w-4" />
            Exportar
          </Button>
          <Button size="sm">
            <UserPlus className="mr-2 h-4 w-4" />
            Nuevo empleado
          </Button>
        </div>
      </div>
      
      {/* KPIs principales */}
      {renderizarKPIs()}
      
      {/* Gráficos en pestañas */}
      <Tabs defaultValue="evolucion" className="w-full">
        <div className="flex justify-between items-center mb-4">
          <TabsList>
            <TabsTrigger value="evolucion" className="flex items-center">
              <BarChart3 className="mr-2 h-4 w-4" />
              Evolución
            </TabsTrigger>
            <TabsTrigger value="departamentos" className="flex items-center">
              <PieChartIcon className="mr-2 h-4 w-4" />
              Departamentos
            </TabsTrigger>
            <TabsTrigger value="estados" className="flex items-center">
              <Users className="mr-2 h-4 w-4" />
              Estados
            </TabsTrigger>
            <TabsTrigger value="proyeccion" className="flex items-center">
              <TrendingUp className="mr-2 h-4 w-4" />
              Proyección
            </TabsTrigger>
          </TabsList>
          
          {/* Controles específicos por pestaña */}
          <div className="flex items-center gap-2">
            <TabsContent value="evolucion" className="mt-0 border-0 p-0">
              <Select value={periodoEvolucion} onValueChange={(v: any) => setPeriodoEvolucion(v)}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Período" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="mes">Mensual</SelectItem>
                  <SelectItem value="trimestre">Trimestral</SelectItem>
                  <SelectItem value="año">Anual</SelectItem>
                </SelectContent>
              </Select>
            </TabsContent>
            
            <TabsContent value="proyeccion" className="mt-0 border-0 p-0">
              <Select value={mesesProyeccion.toString()} onValueChange={(v) => setMesesProyeccion(Number(v))}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Meses a proyectar" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="6">6 meses</SelectItem>
                  <SelectItem value="12">12 meses</SelectItem>
                  <SelectItem value="24">24 meses</SelectItem>
                </SelectContent>
              </Select>
            </TabsContent>
          </div>
        </div>
        
        <Card>
          <CardContent className="pt-6">
            <TabsContent value="evolucion" className="mt-0">
              {renderizarGraficoEvolucion()}
            </TabsContent>
            
            <TabsContent value="departamentos" className="mt-0">
              {renderizarGraficoDepartamentos()}
            </TabsContent>
            
            <TabsContent value="estados" className="mt-0">
              {renderizarGraficoEstados()}
            </TabsContent>
            
            <TabsContent value="proyeccion" className="mt-0">
              {renderizarGraficoProyeccion()}
            </TabsContent>
          </CardContent>
        </Card>
      </Tabs>
      
      {/* Contenido adicional */}
      <div className="grid gap-4 grid-cols-1 md:grid-cols-3">
        {/* Últimos empleados */}
        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle>Contrataciones recientes</CardTitle>
            <CardDescription>
              Empleados contratados en el último mes
            </CardDescription>
          </CardHeader>
          <CardContent>
            {renderizarUltimosEmpleados()}
          </CardContent>
          <CardFooter>
            <Button variant="outline" className="w-full">
              Ver todos los empleados
            </Button>
          </CardFooter>
        </Card>
        
        {/* Departamentos */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Distribución por departamento</CardTitle>
            <CardDescription>
              Empleados y salarios promedio por departamento
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoadingMetricas ? (
              <div className="space-y-4">
                {[1, 2, 3, 4].map(i => (
                  <Skeleton key={i} className="h-[20px] w-full" />
                ))}
              </div>
            ) : isErrorMetricas || !metricasGenerales || !metricasGenerales.departamentos ? (
              <p className="text-muted-foreground">No hay datos disponibles.</p>
            ) : (
              <div className="space-y-4">
                {metricasGenerales.departamentos.map((depto, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">{depto.nombre}</p>
                      <p className="text-sm text-muted-foreground">
                        {depto.cantidadEmpleados} empleados ({Math.round(depto.porcentajeTotal)}%)
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">
                        ${depto.salarioPromedio.toLocaleString('es-ES', { maximumFractionDigits: 0 })}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Salario promedio
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};