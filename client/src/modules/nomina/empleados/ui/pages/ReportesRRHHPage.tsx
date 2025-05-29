import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell
} from 'recharts';
import {
  ChevronDown,
  Download,
  FileText,
  Users,
  Building,
  TrendingUp,
  DollarSign,
  Calendar,
  Briefcase,
  Loader2,
  RefreshCw,
  AlertCircle,
  FileOutput
} from 'lucide-react';

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';

import { obtenerEmpleados } from '../../api/empleadosApi';
import { AnalisisRRHHService, MetricsRRHH } from '../../domain/services/AnalisisRRHH';
import { useToast } from '@/hooks/use-toast';

// Colores para gráficos
const COLORS = ['#623BA6', '#02BDEA', '#FFA41B', '#251948', '#5B7DB1', '#A3BFFA', '#8884d8', '#83a6ed'];

export default function ReportesRRHHPage() {
  const { toast } = useToast();
  const [periodoInforme, setPeriodoInforme] = useState<string>('actual');
  
  // Consulta para obtener empleados
  const {
    data: datosEmpleados,
    isLoading,
    isError,
    refetch
  } = useQuery({
    queryKey: ['/api/nomina/empleados'],
    queryFn: () => obtenerEmpleados({ pageSize: 100 }), // Obtener con límite grande
  });
  
  // Consulta para obtener proyectos (simplificada, habría que implementarla)
  const { data: proyectos = [] } = useQuery({
    queryKey: ['/api/projects'],
    queryFn: () => fetch('/api/projects').then(res => res.json()),
  });
  
  // Calcular métricas si tenemos datos
  const metricas: MetricsRRHH | null = datosEmpleados?.empleados
    ? AnalisisRRHHService.calcularMetricas(datosEmpleados.empleados, proyectos)
    : null;
  
  // Función para exportar a Excel (placeholder)
  const exportarExcel = () => {
    toast({
      title: 'Exportación a Excel',
      description: 'La exportación a Excel estará disponible en la siguiente fase',
    });
  };
  
  // Función para exportar a PDF (placeholder)
  const exportarPDF = () => {
    toast({
      title: 'Exportación a PDF',
      description: 'La exportación a PDF estará disponible en la siguiente fase',
    });
  };
  
  // Si está cargando
  if (isLoading) {
    return (
      <div className="container mx-auto py-6">
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-10">
            <Loader2 className="h-8 w-8 text-primary animate-spin mb-4" />
            <p className="text-lg text-muted-foreground">Cargando datos para reportes...</p>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  // Si hay un error
  if (isError) {
    return (
      <div className="container mx-auto py-6">
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-10 text-center">
            <AlertCircle className="h-10 w-10 text-destructive mb-4" />
            <h3 className="text-xl font-semibold mb-2">Error al cargar los datos</h3>
            <p className="text-muted-foreground mb-6">
              No se pudieron cargar los datos necesarios para generar los reportes
            </p>
            <Button onClick={() => refetch()} variant="outline">
              <RefreshCw className="mr-2 h-4 w-4" />
              Reintentar
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto py-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">Reportes de Recursos Humanos</h1>
          <p className="text-muted-foreground">
            Análisis y estadísticas del personal de la empresa
          </p>
        </div>
        
        <div className="flex items-center space-x-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline">
                <Download className="mr-2 h-4 w-4" />
                Exportar
                <ChevronDown className="ml-2 h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={exportarExcel}>
                <FileText className="mr-2 h-4 w-4" />
                Exportar a Excel
              </DropdownMenuItem>
              <DropdownMenuItem onClick={exportarPDF}>
                <FileOutput className="mr-2 h-4 w-4" />
                Exportar a PDF
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button>
                {periodoInforme === 'actual' ? 'Mes Actual' : 
                 periodoInforme === 'trimestre' ? 'Último Trimestre' : 'Último Año'}
                <ChevronDown className="ml-2 h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setPeriodoInforme('actual')}>
                Mes Actual
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setPeriodoInforme('trimestre')}>
                Último Trimestre
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setPeriodoInforme('anual')}>
                Último Año
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
      
      {/* Tarjetas de información general */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-muted-foreground">Total de Empleados</p>
                <h3 className="text-3xl font-bold">{metricas?.totalEmpleados || 0}</h3>
              </div>
              <Users className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-muted-foreground">Empleados Nuevos (Mes)</p>
                <h3 className="text-3xl font-bold">{metricas?.empleadosNuevosMes || 0}</h3>
              </div>
              <Calendar className="h-8 w-8 text-indigo-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-muted-foreground">Salario Promedio</p>
                <h3 className="text-3xl font-bold">
                  {new Intl.NumberFormat('es-CO', {
                    style: 'currency',
                    currency: 'COP',
                    maximumFractionDigits: 0
                  }).format(metricas?.promedioSalarial.general || 0)}
                </h3>
              </div>
              <DollarSign className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-muted-foreground">Departamentos</p>
                <h3 className="text-3xl font-bold">{metricas?.empleadosPorDepartamento.length || 0}</h3>
              </div>
              <Building className="h-8 w-8 text-amber-500" />
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Gráficos */}
      <Tabs defaultValue="distribucion" className="mb-6">
        <TabsList className="w-full mb-4">
          <TabsTrigger value="distribucion" className="flex-1">Distribución de Empleados</TabsTrigger>
          <TabsTrigger value="salarios" className="flex-1">Análisis Salarial</TabsTrigger>
          <TabsTrigger value="proyectos" className="flex-1">Asignación de Proyectos</TabsTrigger>
        </TabsList>
        
        <TabsContent value="distribucion">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Distribución por tipo de contrato */}
            <Card>
              <CardHeader>
                <CardTitle>Distribución por Tipo de Contrato</CardTitle>
                <CardDescription>
                  Cantidad de empleados por cada tipo de contrato
                </CardDescription>
              </CardHeader>
              <CardContent className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={metricas?.empleadosPorContrato || []}
                      dataKey="cantidad"
                      nameKey="tipo"
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      fill="#8884d8"
                      label={({tipo, cantidad}) => `${tipo}: ${cantidad}`}
                    >
                      {metricas?.empleadosPorContrato.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => [`${value} empleados`, 'Cantidad']} />
                    <Legend verticalAlign="bottom" height={36} />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
            
            {/* Distribución por departamento */}
            <Card>
              <CardHeader>
                <CardTitle>Distribución por Departamento</CardTitle>
                <CardDescription>
                  Cantidad de empleados en cada departamento
                </CardDescription>
              </CardHeader>
              <CardContent className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart 
                    data={metricas?.empleadosPorDepartamento || []}
                    layout="vertical"
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" />
                    <YAxis 
                      dataKey="departamento" 
                      type="category" 
                      width={100}
                      tick={{ fontSize: 12 }}
                    />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="cantidad" name="Cantidad" fill="#02BDEA" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="salarios">
          <div className="grid grid-cols-1 gap-6">
            {/* Promedio salarial por departamento */}
            <Card>
              <CardHeader>
                <CardTitle>Promedio Salarial por Departamento</CardTitle>
                <CardDescription>
                  Comparativa de salarios promedio en cada departamento
                </CardDescription>
              </CardHeader>
              <CardContent className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart 
                    data={metricas?.promedioSalarial.porDepartamento || []}
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="departamento" />
                    <YAxis 
                      tickFormatter={(value) => new Intl.NumberFormat('es-CO', {
                        style: 'currency',
                        currency: 'COP',
                        notation: 'compact',
                        maximumFractionDigits: 0
                      }).format(value)}
                    />
                    <Tooltip 
                      formatter={(value) => [
                        new Intl.NumberFormat('es-CO', {
                          style: 'currency',
                          currency: 'COP',
                          maximumFractionDigits: 0
                        }).format(Number(value)),
                        'Promedio'
                      ]}
                    />
                    <Legend />
                    <Bar dataKey="promedio" name="Salario Promedio" fill="#623BA6" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="proyectos">
          <div className="grid grid-cols-1 gap-6">
            {/* Empleados por proyecto */}
            <Card>
              <CardHeader>
                <CardTitle>Empleados por Proyecto</CardTitle>
                <CardDescription>
                  Distribución de empleados en los diferentes proyectos activos
                </CardDescription>
              </CardHeader>
              <CardContent className="h-80">
                {metricas?.proyectosConEmpleados && metricas.proyectosConEmpleados.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart 
                      data={metricas.proyectosConEmpleados}
                      margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="proyecto" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar 
                        dataKey="cantidadEmpleados" 
                        name="Cantidad de Empleados" 
                        fill="#FFA41B"
                      />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex flex-col items-center justify-center h-full">
                    <Briefcase className="h-12 w-12 text-muted-foreground mb-4" />
                    <p className="text-muted-foreground text-center">
                      No hay datos disponibles de asignación de proyectos
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
      
      {/* Tabla de datos */}
      <Card>
        <CardHeader>
          <CardTitle>Detalle de Datos</CardTitle>
          <CardDescription>
            Información detallada para el periodo: {
              periodoInforme === 'actual' ? 'Mes Actual' : 
              periodoInforme === 'trimestre' ? 'Último Trimestre' : 'Último Año'
            }
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="border rounded-md">
            <table className="w-full">
              <thead>
                <tr className="border-b bg-slate-50">
                  <th className="p-3 text-left font-medium">Métrica</th>
                  <th className="p-3 text-right font-medium">Valor</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b">
                  <td className="p-3">Total de empleados</td>
                  <td className="p-3 text-right">{metricas?.totalEmpleados || 0}</td>
                </tr>
                <tr className="border-b">
                  <td className="p-3">Nuevas contrataciones (mes actual)</td>
                  <td className="p-3 text-right">{metricas?.empleadosNuevosMes || 0}</td>
                </tr>
                <tr className="border-b">
                  <td className="p-3">Salario promedio</td>
                  <td className="p-3 text-right">
                    {new Intl.NumberFormat('es-CO', {
                      style: 'currency',
                      currency: 'COP',
                      maximumFractionDigits: 0
                    }).format(metricas?.promedioSalarial.general || 0)}
                  </td>
                </tr>
                <tr className="border-b">
                  <td className="p-3">Departamento con más empleados</td>
                  <td className="p-3 text-right">
                    {metricas?.empleadosPorDepartamento.sort((a, b) => b.cantidad - a.cantidad)[0]?.departamento || 'N/A'}
                  </td>
                </tr>
                <tr className="border-b">
                  <td className="p-3">Tipo de contrato predominante</td>
                  <td className="p-3 text-right">
                    {metricas?.empleadosPorContrato.sort((a, b) => b.cantidad - a.cantidad)[0]?.tipo || 'N/A'}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <p className="text-sm text-muted-foreground">
            Último actualización: {format(new Date(), "dd 'de' MMMM 'de' yyyy, HH:mm", { locale: es })}
          </p>
          <Button variant="outline" onClick={() => refetch()}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Actualizar datos
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}