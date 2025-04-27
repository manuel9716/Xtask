import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { 
  Users, 
  UserPlus, 
  Building, 
  Award,
  Briefcase,
  Calendar,
  Percent,
  GraduationCap
} from 'lucide-react';
import { 
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { EmpleadosApiRepository } from '../../infrastructure/api/empleadosApi';
import { createRRHHMetricsService } from '../../domain/services/RRHHMetricsService';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';

// Crear el servicio de métricas
const metricsService = createRRHHMetricsService(new EmpleadosApiRepository());

// Colores para gráficos
const COLORS = ['#623BA6', '#02BDEA', '#251948', '#FFA41B', '#E5E5E5', '#888888', '#AAAAAA', '#CCCCCC'];

export function RRHHDashboard() {
  const [selectedTab, setSelectedTab] = useState('general');

  // Consulta para obtener el total de empleados activos
  const { 
    data: totalActivos, 
    isLoading: loadingActivos
  } = useQuery({
    queryKey: ['rrhh-metrics', 'activos'],
    queryFn: () => metricsService.getTotalEmpleadosActivos(),
  });

  // Consulta para obtener empleados nuevos del mes
  const { 
    data: nuevosDelMes, 
    isLoading: loadingNuevos
  } = useQuery({
    queryKey: ['rrhh-metrics', 'nuevos-mes'],
    queryFn: () => metricsService.getEmpleadosNuevosMes(),
  });

  // Consulta para obtener distribución por departamento
  const { 
    data: distribucionDepartamentos, 
    isLoading: loadingDepartamentos
  } = useQuery({
    queryKey: ['rrhh-metrics', 'departamentos'],
    queryFn: () => metricsService.getEmpleadosPorDepartamento(),
  });

  // Consulta para obtener distribución por estado
  const { 
    data: distribucionEstados, 
    isLoading: loadingEstados
  } = useQuery({
    queryKey: ['rrhh-metrics', 'estados'],
    queryFn: () => metricsService.getDistribucionPorEstado(),
  });

  // Preparar datos para el gráfico de departamentos
  const departamentosChartData = distribucionDepartamentos 
    ? Object.entries(distribucionDepartamentos).map(([departamento, cantidad], index) => ({
        name: departamento,
        value: cantidad,
        color: COLORS[index % COLORS.length]
      }))
    : [];

  // Preparar datos para el gráfico de estados
  const estadosChartData = distribucionEstados
    ? distribucionEstados.map((item, index) => ({
        name: item.estado.charAt(0).toUpperCase() + item.estado.slice(1).replace('_', ' '),
        value: item.cantidad,
        porcentaje: item.porcentaje,
        color: COLORS[index % COLORS.length]
      }))
    : [];

  // Verificar que los tabs tengan siempre valores válidos
  const tab = selectedTab || "general";

  return (
    <div className="space-y-4">
      <Tabs
        defaultValue="general"
        value={tab}
        onValueChange={setSelectedTab}
        className="w-full"
      >
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="general">Visión General</TabsTrigger>
          <TabsTrigger value="departamentos">Por Departamento</TabsTrigger>
          <TabsTrigger value="estados">Por Estado</TabsTrigger>
        </TabsList>
        
        {/* Pestaña de visión general */}
        <TabsContent value="general" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Tarjeta de empleados activos */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Empleados Activos
                </CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                {loadingActivos ? (
                  <Skeleton className="h-8 w-24" />
                ) : (
                  <div className="text-2xl font-bold">{totalActivos || 0}</div>
                )}
                <p className="text-xs text-muted-foreground">
                  Empleados en estado activo
                </p>
              </CardContent>
            </Card>

            {/* Tarjeta de nuevas contrataciones */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Nuevas Contrataciones
                </CardTitle>
                <UserPlus className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                {loadingNuevos ? (
                  <Skeleton className="h-8 w-24" />
                ) : (
                  <div className="text-2xl font-bold">{nuevosDelMes || 0}</div>
                )}
                <p className="text-xs text-muted-foreground">
                  Contrataciones este mes
                </p>
              </CardContent>
            </Card>

            {/* Tarjeta de departamentos */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Departamentos
                </CardTitle>
                <Building className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                {loadingDepartamentos ? (
                  <Skeleton className="h-8 w-24" />
                ) : (
                  <div className="text-2xl font-bold">{departamentosChartData.length}</div>
                )}
                <p className="text-xs text-muted-foreground">
                  Departamentos con personal
                </p>
              </CardContent>
            </Card>

            {/* Tarjeta de estados */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Estados de Empleados
                </CardTitle>
                <Award className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                {loadingEstados ? (
                  <Skeleton className="h-8 w-24" />
                ) : (
                  <div className="text-2xl font-bold">{estadosChartData.length}</div>
                )}
                <p className="text-xs text-muted-foreground">
                  Diferentes estados activos
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Gráfico general de distribución de empleados */}
          <Card className="col-span-4">
            <CardHeader>
              <CardTitle>Distribución General de Empleados</CardTitle>
              <CardDescription>
                Visión general de la distribución de empleados por departamento y estado
              </CardDescription>
            </CardHeader>
            <CardContent className="h-80">
              {loadingDepartamentos || loadingEstados ? (
                <div className="flex items-center justify-center h-full">
                  <Skeleton className="h-64 w-full" />
                </div>
              ) : departamentosChartData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={departamentosChartData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    >
                      {departamentosChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value: number) => [`${value} empleado(s)`, 'Cantidad']} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-center">
                  <Users className="h-16 w-16 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium">No hay datos disponibles</h3>
                  <p className="text-sm text-muted-foreground">
                    No hay información de empleados para mostrar en este momento.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Pestaña de departamentos */}
        <TabsContent value="departamentos" className="space-y-4">
          <Card className="col-span-4">
            <CardHeader>
              <CardTitle>Distribución por Departamento</CardTitle>
              <CardDescription>
                Cantidad de empleados en cada departamento de la empresa
              </CardDescription>
            </CardHeader>
            <CardContent className="h-96">
              {loadingDepartamentos ? (
                <div className="flex items-center justify-center h-full">
                  <Skeleton className="h-80 w-full" />
                </div>
              ) : departamentosChartData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={departamentosChartData}
                    margin={{
                      top: 5,
                      right: 30,
                      left: 20,
                      bottom: 5,
                    }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="value" name="Empleados" fill="#623BA6" />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-center">
                  <Building className="h-16 w-16 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium">No hay datos disponibles</h3>
                  <p className="text-sm text-muted-foreground">
                    No hay información de departamentos para mostrar en este momento.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Pestaña de estados */}
        <TabsContent value="estados" className="space-y-4">
          <Card className="col-span-4">
            <CardHeader>
              <CardTitle>Distribución por Estado</CardTitle>
              <CardDescription>
                Porcentaje de empleados en cada estado (activo, inactivo, vacaciones, etc.)
              </CardDescription>
            </CardHeader>
            <CardContent className="h-96">
              {loadingEstados ? (
                <div className="flex items-center justify-center h-full">
                  <Skeleton className="h-80 w-full" />
                </div>
              ) : estadosChartData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={estadosChartData}
                      cx="50%"
                      cy="50%"
                      labelLine={true}
                      outerRadius={120}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, porcentaje }) => `${name}: ${porcentaje}%`}
                    >
                      {estadosChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip 
                      formatter={(value: number, name: string, props: any) => 
                        [`${value} empleado(s) (${props.payload.porcentaje}%)`, 'Cantidad']} 
                    />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-center">
                  <Award className="h-16 w-16 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium">No hay datos disponibles</h3>
                  <p className="text-sm text-muted-foreground">
                    No hay información de estados de empleados para mostrar en este momento.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}