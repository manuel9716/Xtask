import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { KpiApi } from "../../infrastructure/api/kpiApi";
import { Bonificacion, EstadoBonificacion } from "../../domain/entities/Bonificacion";
import { Indicador, EstadoKpi } from "../../domain/entities/Indicador";
import { BarChart3, TrendingUp, FileBarChart, CheckCircle, XCircle, AlertCircle } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

const kpiApi = new KpiApi();

/**
 * Vista de historial de KPIs y bonificaciones
 */
export const HistorialKpis: React.FC = () => {
  // Estado para filtros
  const [year, setYear] = useState<string>(() => new Date().getFullYear().toString());
  
  // Consultas
  const {
    data: bonificaciones,
    isLoading: isLoadingBonificaciones
  } = useQuery<Bonificacion[]>({
    queryKey: ['/api/kpis/bonificaciones/historial'],
    queryFn: () => kpiApi.getBonificacionesHistory()
  });
  
  // Obtener datos del año seleccionado
  const filteredBonificaciones = bonificaciones?.filter(b => {
    return b.mes.startsWith(year);
  }) || [];
  
  // Ordenar por mes (más reciente primero)
  const sortedBonificaciones = [...filteredBonificaciones].sort((a, b) => {
    return b.mes.localeCompare(a.mes);
  });
  
  // Calcular estadísticas
  const calcularEstadisticas = () => {
    if (!sortedBonificaciones.length) {
      return {
        totalBonificaciones: 0,
        promedioCumplimiento: 0,
        mejorMes: null,
        peorMes: null,
      };
    }
    
    const totalBonificaciones = sortedBonificaciones.reduce(
      (sum, b) => sum + b.bonificacionTotal, 
      0
    );
    
    const promedioCumplimiento = sortedBonificaciones.reduce(
      (sum, b) => sum + b.porcentajeCumplimientoGlobal, 
      0
    ) / sortedBonificaciones.length;
    
    const mejorMes = [...sortedBonificaciones].sort(
      (a, b) => b.porcentajeCumplimientoGlobal - a.porcentajeCumplimientoGlobal
    )[0];
    
    const peorMes = [...sortedBonificaciones].sort(
      (a, b) => a.porcentajeCumplimientoGlobal - b.porcentajeCumplimientoGlobal
    )[0];
    
    return {
      totalBonificaciones,
      promedioCumplimiento,
      mejorMes,
      peorMes,
    };
  };
  
  const estadisticas = calcularEstadisticas();
  
  // Formatear mes para mostrarlo más amigable (ej: Mayo 2025)
  const formatearMes = (mesString: string) => {
    if (!mesString) return "";
    try {
      const [year, month] = mesString.split("-");
      const date = new Date(parseInt(year), parseInt(month) - 1);
      return date.toLocaleDateString("es-ES", { 
        month: "long", 
        year: "numeric" 
      });
    } catch (error) {
      return mesString;
    }
  };
  
  // Obtener color según estado bonificación
  const getEstadoColor = (estado: EstadoBonificacion) => {
    switch (estado) {
      case EstadoBonificacion.APROBADO:
        return "bg-green-100 text-green-800 border-green-200";
      case EstadoBonificacion.PAGADO:
        return "bg-blue-100 text-blue-800 border-blue-200";
      case EstadoBonificacion.RECHAZADO:
        return "bg-red-100 text-red-800 border-red-200";
      case EstadoBonificacion.CALCULADO:
      default:
        return "bg-amber-100 text-amber-800 border-amber-200";
    }
  };
  
  // Generar opciones de años
  const getYearOptions = () => {
    const currentYear = new Date().getFullYear();
    const options = [];
    
    for (let i = 0; i < 5; i++) {
      const year = currentYear - i;
      options.push({ value: year.toString(), label: year.toString() });
    }
    
    return options;
  };
  
  return (
    <div className="container py-6 space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Historial de KPIs</h1>
          <p className="text-muted-foreground">
            Revisa tu desempeño y bonificaciones históricas
          </p>
        </div>
        
        <div>
          <Select
            value={year}
            onValueChange={setYear}
          >
            <SelectTrigger className="w-[120px]">
              <SelectValue placeholder="Año" />
            </SelectTrigger>
            <SelectContent>
              {getYearOptions().map(option => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      
      <Tabs defaultValue="resumen">
        <TabsList className="mb-4">
          <TabsTrigger value="resumen">Resumen</TabsTrigger>
          <TabsTrigger value="bonificaciones">Bonificaciones</TabsTrigger>
        </TabsList>
        
        <TabsContent value="resumen" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Total Bonificaciones ({year})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center">
                  <BarChart3 className="h-5 w-5 text-primary mr-2" />
                  <span className="text-2xl font-bold">
                    {formatCurrency(estadisticas.totalBonificaciones)}
                  </span>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Promedio Cumplimiento
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center">
                  <TrendingUp className="h-5 w-5 text-primary mr-2" />
                  <span className="text-2xl font-bold">
                    {estadisticas.promedioCumplimiento.toFixed(1)}%
                  </span>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Mejor Desempeño
                </CardTitle>
              </CardHeader>
              <CardContent>
                {estadisticas.mejorMes ? (
                  <div className="space-y-2">
                    <div className="text-lg font-medium">
                      {formatearMes(estadisticas.mejorMes.mes)}
                    </div>
                    <div className="flex items-center text-green-600">
                      <CheckCircle className="h-4 w-4 mr-1" />
                      <span className="font-medium">
                        {estadisticas.mejorMes.porcentajeCumplimientoGlobal.toFixed(1)}%
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="text-muted-foreground text-sm">
                    Sin datos para este año
                  </div>
                )}
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Menor Desempeño
                </CardTitle>
              </CardHeader>
              <CardContent>
                {estadisticas.peorMes ? (
                  <div className="space-y-2">
                    <div className="text-lg font-medium">
                      {formatearMes(estadisticas.peorMes.mes)}
                    </div>
                    <div className="flex items-center text-amber-600">
                      <AlertCircle className="h-4 w-4 mr-1" />
                      <span className="font-medium">
                        {estadisticas.peorMes.porcentajeCumplimientoGlobal.toFixed(1)}%
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="text-muted-foreground text-sm">
                    Sin datos para este año
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
          
          <Card>
            <CardHeader>
              <CardTitle>Rendimiento mensual</CardTitle>
              <CardDescription>
                Visión general de tu desempeño durante {year}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoadingBonificaciones ? (
                <div className="flex justify-center py-12">
                  <div className="animate-spin w-12 h-12 border-t-2 border-b-2 border-primary rounded-full"></div>
                </div>
              ) : sortedBonificaciones.length > 0 ? (
                <div className="space-y-6">
                  {sortedBonificaciones.map(bonificacion => (
                    <div key={bonificacion.id} className="space-y-2">
                      <div className="flex justify-between items-center">
                        <div className="flex items-center">
                          <FileBarChart className="h-4 w-4 mr-2 text-muted-foreground" />
                          <span className="font-medium">
                            {formatearMes(bonificacion.mes)}
                          </span>
                        </div>
                        <Badge variant="outline" className={getEstadoColor(bonificacion.estado as EstadoBonificacion)}>
                          {bonificacion.estado}
                        </Badge>
                      </div>
                      <div className="space-y-1">
                        <div className="flex justify-between items-center text-sm">
                          <span>Cumplimiento: {bonificacion.porcentajeCumplimientoGlobal.toFixed(1)}%</span>
                          <span className="font-medium">{formatCurrency(bonificacion.bonificacionTotal)}</span>
                        </div>
                        <Progress value={bonificacion.porcentajeCumplimientoGlobal} className="h-2" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-12 text-center">
                  <p className="text-muted-foreground">
                    No hay datos de bonificaciones para {year}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="bonificaciones">
          <Card>
            <CardHeader>
              <CardTitle>Bonificaciones del {year}</CardTitle>
              <CardDescription>
                Detalle de todas tus bonificaciones durante el año
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoadingBonificaciones ? (
                <div className="flex justify-center py-12">
                  <div className="animate-spin w-12 h-12 border-t-2 border-b-2 border-primary rounded-full"></div>
                </div>
              ) : sortedBonificaciones.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Mes</TableHead>
                      <TableHead>Cumplimiento</TableHead>
                      <TableHead>Salario Base</TableHead>
                      <TableHead>Salario Variable</TableHead>
                      <TableHead>Bonificación</TableHead>
                      <TableHead>Estado</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {sortedBonificaciones.map(bonificacion => (
                      <TableRow key={bonificacion.id}>
                        <TableCell className="font-medium">
                          {formatearMes(bonificacion.mes)}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center">
                            <span className="mr-2">{bonificacion.porcentajeCumplimientoGlobal.toFixed(1)}%</span>
                            <Progress 
                              value={bonificacion.porcentajeCumplimientoGlobal} 
                              className="h-2 w-16" 
                            />
                          </div>
                        </TableCell>
                        <TableCell>{formatCurrency(bonificacion.salarioBase)}</TableCell>
                        <TableCell>{formatCurrency(bonificacion.salarioVariable)}</TableCell>
                        <TableCell className="font-medium">
                          {formatCurrency(bonificacion.bonificacionTotal)}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className={getEstadoColor(bonificacion.estado as EstadoBonificacion)}>
                            {bonificacion.estado}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="py-12 text-center">
                  <p className="text-muted-foreground">
                    No hay datos de bonificaciones para {year}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default HistorialKpis;