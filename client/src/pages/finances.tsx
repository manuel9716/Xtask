import React, { useState } from 'react';
import { useLocation } from 'wouter';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { PresupuestoForm } from '@/modules/finanzas/presupuestos/ui/forms/PresupuestoForm';
import { useListarPresupuestos } from '@/modules/finanzas/presupuestos/application/useListarPresupuestos';
import { PresupuestoEstado } from '@/modules/finanzas/presupuestos/domain/entities/Presupuesto';
import { EstadoBadge } from '@/modules/finanzas/presupuestos/ui/components/EstadoBadge';
import { PanelFacturacion } from '@/modules/finanzas/facturacion/ui/views/PanelFacturacion';
import { 
  DollarSign, 
  PieChart, 
  BarChart3, 
  Search, 
  Filter, 
  PlusCircle,
  FileBarChart2,
  ArrowUpCircle,
  AlertCircle,
  CheckCircle,
  Loader2,
  Users
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount);
}

function getEstadoColor(estado: PresupuestoEstado): string {
  switch (estado) {
    case 'ACTIVO':
      return 'bg-green-100 text-green-800';
    case 'ALERTA':
      return 'bg-yellow-100 text-yellow-800';
    case 'COMPLETADO':
      return 'bg-red-100 text-red-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
}

function getEstadoIcon(estado: PresupuestoEstado) {
  switch (estado) {
    case 'ACTIVO':
      return <ArrowUpCircle className="h-4 w-4 text-green-600" />;
    case 'ALERTA':
      return <AlertCircle className="h-4 w-4 text-yellow-600" />;
    case 'COMPLETADO':
      return <CheckCircle className="h-4 w-4 text-red-600" />;
    default:
      return null;
  }
}

export default function FinancesPage() {
  const [openDialog, setOpenDialog] = useState(false);
  const [, navigate] = useLocation();
  const {
    presupuestos,
    presupuestosFiltrados,
    isLoading,
    error,
    refetch,
    filtroNombre,
    setFiltroNombre,
    filtroArea,
    setFiltroArea,
    filtroEstado,
    setFiltroEstado,
    areas,
    estadisticas
  } = useListarPresupuestos();

  const handleCreateSuccess = () => {
    setOpenDialog(false);
    refetch();
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <h2 className="text-xl font-bold text-red-600">Error al cargar los presupuestos</h2>
        <p className="text-gray-600">{error.message}</p>
        <Button 
          onClick={() => refetch()} 
          className="mt-4"
          variant="outline"
        >
          Reintentar
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">Finanzas</h1>
          <p className="text-gray-500">Gestión de presupuestos y finanzas</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => navigate('/finanzas/recursos')}>
            <Users className="mr-2 h-4 w-4" />
            Recursos
          </Button>
          <Dialog open={openDialog} onOpenChange={setOpenDialog}>
            <DialogTrigger asChild>
              <Button>
                <PlusCircle className="mr-2 h-4 w-4" />
                Nuevo Presupuesto
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px]">
              <DialogHeader>
                <DialogTitle>Crear Nuevo Presupuesto</DialogTitle>
                <DialogDescription>
                  Complete los detalles para crear un nuevo presupuesto.
                </DialogDescription>
              </DialogHeader>
              <PresupuestoForm
                onSuccess={handleCreateSuccess}
              />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Tabs defaultValue="presupuestos" className="w-full">
        <TabsList className="grid w-full grid-cols-4 mb-8">
          <TabsTrigger value="presupuestos" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Presupuestos
          </TabsTrigger>
          <TabsTrigger value="nomina" className="flex items-center gap-2" onClick={() => navigate('/finanzas/nomina')}>
            <Users className="h-4 w-4" />
            Nómina
          </TabsTrigger>
          <TabsTrigger value="facturacion" className="flex items-center gap-2">
            <FileBarChart2 className="h-4 w-4" />
            Facturación
          </TabsTrigger>
          <TabsTrigger value="reportes" className="flex items-center gap-2">
            <PieChart className="h-4 w-4" />
            Reportes
          </TabsTrigger>
        </TabsList>

        <TabsContent value="presupuestos" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-500">Total Presupuestado</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center">
                  <DollarSign className="h-5 w-5 text-primary mr-2" />
                  <span className="text-2xl font-bold">
                    {formatCurrency(estadisticas.totalPresupuestado)}
                  </span>
                </div>
              </CardContent>
              <CardFooter className="pt-0">
                <p className="text-xs text-gray-500">
                  {estadisticas.totalPresupuestos} presupuestos activos
                </p>
              </CardFooter>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-500">Total Gastado</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center">
                  <BarChart3 className="h-5 w-5 text-primary mr-2" />
                  <span className="text-2xl font-bold">
                    {formatCurrency(estadisticas.totalGastado)}
                  </span>
                </div>
              </CardContent>
              <CardFooter className="pt-0">
                <div className="w-full">
                  <div className="flex justify-between text-xs text-gray-500 mb-1">
                    <span>Ejecución</span>
                    <span>{estadisticas.porcentajeEjecucion.toFixed(2)}%</span>
                  </div>
                  <Progress value={estadisticas.porcentajeEjecucion} className="h-2" />
                </div>
              </CardFooter>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-500">Distribución por Estado</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-4">
                  <PieChart className="h-5 w-5 text-primary" />
                  <div className="flex flex-wrap gap-2">
                    <Badge className="bg-green-100 text-green-800 hover:bg-green-200">
                      Activo: {estadisticas.porEstado.ACTIVO}
                    </Badge>
                    <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-200">
                      Alerta: {estadisticas.porEstado.ALERTA}
                    </Badge>
                    <Badge className="bg-red-100 text-red-800 hover:bg-red-200">
                      Completado: {estadisticas.porEstado.COMPLETADO}
                    </Badge>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="pt-0">
                <p className="text-xs text-gray-500">
                  Basado en el porcentaje de ejecución
                </p>
              </CardFooter>
            </Card>
          </div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
            <div className="flex gap-2">
              <Button variant="outline" className={cn("text-sm", !filtroEstado && "bg-primary text-white")}>
                Todos
              </Button>
              <Button variant="outline" className={cn("text-sm", filtroEstado === 'ACTIVO' && "bg-primary text-white")}>
                Activos
              </Button>
              <Button variant="outline" className={cn("text-sm", filtroEstado === 'ALERTA' && "bg-primary text-white")}>
                En Alerta
              </Button>
              <Button variant="outline" className={cn("text-sm", filtroEstado === 'COMPLETADO' && "bg-primary text-white")}>
                Completados
              </Button>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
                <Input
                  placeholder="Buscar presupuesto..."
                  className="pl-10"
                  value={filtroNombre}
                  onChange={(e) => setFiltroNombre(e.target.value)}
                />
              </div>

              <Select
                value={filtroArea || "all"}
                onValueChange={(value) => setFiltroArea(value === "all" ? null : value)}
              >
                <SelectTrigger className="w-full sm:w-[180px]">
                  <div className="flex items-center">
                    <Filter className="mr-2 h-4 w-4" />
                    <SelectValue placeholder="Filtrar por área" />
                  </div>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas las áreas</SelectItem>
                  {areas.filter(area => area && area.trim() !== '').map(area => (
                    <SelectItem key={area} value={area}>{area}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b">
                      <th className="py-3 px-4 font-semibold text-gray-700">Nombre</th>
                      <th className="py-3 px-4 font-semibold text-gray-700">Monto</th>
                      <th className="py-3 px-4 font-semibold text-gray-700">% Ejecución</th>
                      <th className="py-3 px-4 font-semibold text-gray-700">Monto Ejecución</th>
                      <th className="py-3 px-4 font-semibold text-gray-700">% Garantía</th>
                      <th className="py-3 px-4 font-semibold text-gray-700">Monto Garantía</th>
                      <th className="py-3 px-4 font-semibold text-gray-700">Reservas</th>
                      <th className="py-3 px-4 font-semibold text-gray-700">Estado</th>
                    </tr>
                  </thead>
                  <tbody>
                    {presupuestosFiltrados.length === 0 ? (
                      <tr>
                        <td colSpan={8} className="py-4 text-center text-gray-500">
                          No se encontraron presupuestos
                        </td>
                      </tr>
                    ) : (
                      presupuestosFiltrados.map((presupuesto) => {
                        const formatSafeNumber = (value: any) => {
                          const num = typeof value === 'string' ? parseFloat(value) : value;
                          return !isNaN(num) && num !== null && num !== undefined ? num : 0;
                        };
                        
                        return (
                          <tr key={presupuesto.id} className="border-b hover:bg-gray-50">
                            <td className="py-3 px-4">
                              <div className="font-medium">{presupuesto.nombre}</div>
                              <div className="text-xs text-gray-500">
                                {new Date(presupuesto.fechaInicio).toLocaleDateString()} - {new Date(presupuesto.fechaFin).toLocaleDateString()}
                              </div>
                            </td>
                            <td className="py-3 px-4 font-medium">
                              {formatCurrency(formatSafeNumber(presupuesto.monto))}
                            </td>
                            <td className="py-3 px-4">
                              <span className="text-sm font-medium">
                                {(presupuesto as any).porcentajeEjecucionMeta !== undefined ? `${formatSafeNumber((presupuesto as any).porcentajeEjecucionMeta).toFixed(1)}%` : 'N/A'}
                              </span>
                            </td>
                            <td className="py-3 px-4 font-medium">
                              {(presupuesto as any).montoEjecucionMeta !== undefined ? formatCurrency(formatSafeNumber((presupuesto as any).montoEjecucionMeta)) : 'N/A'}
                            </td>
                            <td className="py-3 px-4">
                              <span className="text-sm font-medium">
                                {(presupuesto as any).porcentajeGarantiaMeta !== undefined ? `${formatSafeNumber((presupuesto as any).porcentajeGarantiaMeta).toFixed(1)}%` : 'N/A'}
                              </span>
                            </td>
                            <td className="py-3 px-4 font-medium">
                              {(presupuesto as any).montoGarantiaMeta !== undefined ? formatCurrency(formatSafeNumber((presupuesto as any).montoGarantiaMeta)) : 'N/A'}
                            </td>
                            <td className="py-3 px-4 font-medium">
                              {(presupuesto as any).reservas !== undefined ? formatCurrency(formatSafeNumber((presupuesto as any).reservas)) : 'N/A'}
                            </td>
                            <td className="py-3 px-4">
                              <div className="flex items-center gap-2">
                                {getEstadoIcon(presupuesto.estado)}
                                <EstadoBadge estado={presupuesto.estado} />
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="facturacion" className="space-y-6">
          <PanelFacturacion />
        </TabsContent>

        <TabsContent value="reportes" className="space-y-6">
          <div className="text-center py-12">
            <PieChart className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Reportes Financieros
            </h3>
            <p className="text-gray-500">
              Funcionalidad de reportes en desarrollo
            </p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}