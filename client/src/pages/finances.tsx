import React, { useState } from 'react';
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
  Loader2
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
  return new Intl.NumberFormat('es-ES', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 2
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
              areas={areas}
              onSuccess={handleCreateSuccess}
            />
          </DialogContent>
        </Dialog>
      </div>

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

      <Tabs defaultValue="todos" className="mb-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
          <TabsList>
            <TabsTrigger value="todos">Todos</TabsTrigger>
            <TabsTrigger value="activos">Activos</TabsTrigger>
            <TabsTrigger value="alerta">En Alerta</TabsTrigger>
            <TabsTrigger value="completados">Completados</TabsTrigger>
          </TabsList>

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
              value={filtroArea || ""}
              onValueChange={(value) => setFiltroArea(value || null)}
            >
              <SelectTrigger className="w-full sm:w-[180px]">
                <div className="flex items-center">
                  <Filter className="mr-2 h-4 w-4" />
                  <SelectValue placeholder="Filtrar por área" />
                </div>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Todas las áreas</SelectItem>
                {areas.map(area => (
                  <SelectItem key={area} value={area}>{area}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <TabsContent value="todos" className="mt-0">
          <div className="bg-white p-6 rounded-md shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b">
                    <th className="py-3 px-4 font-semibold text-gray-700">Nombre</th>
                    <th className="py-3 px-4 font-semibold text-gray-700">Monto</th>
                    <th className="py-3 px-4 font-semibold text-gray-700">Gastado</th>
                    <th className="py-3 px-4 font-semibold text-gray-700">Ejecución</th>
                    <th className="py-3 px-4 font-semibold text-gray-700">Estado</th>
                    <th className="py-3 px-4 font-semibold text-gray-700">Área</th>
                    <th className="py-3 px-4 font-semibold text-gray-700">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {presupuestosFiltrados.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-4 text-center text-gray-500">
                        No se encontraron presupuestos
                      </td>
                    </tr>
                  ) : (
                    presupuestosFiltrados.map((presupuesto) => (
                      <tr key={presupuesto.id} className="border-b hover:bg-gray-50">
                        <td className="py-3 px-4">
                          <div className="font-medium">{presupuesto.nombre}</div>
                          <div className="text-xs text-gray-500">
                            {new Date(presupuesto.fechaInicio).toLocaleDateString()} - {new Date(presupuesto.fechaFin).toLocaleDateString()}
                          </div>
                        </td>
                        <td className="py-3 px-4 font-medium">
                          {formatCurrency(presupuesto.monto)}
                        </td>
                        <td className="py-3 px-4">
                          {formatCurrency(presupuesto.gastado)}
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            <Progress 
                              value={presupuesto.porcentajeEjecucion} 
                              className="h-2 w-24"
                              aria-label={`${presupuesto.porcentajeEjecucion.toFixed(1)}% completado`}
                            />
                            <span className="text-xs font-medium">{presupuesto.porcentajeEjecucion.toFixed(1)}%</span>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <EstadoBadge estado={presupuesto.estado} />
                        </td>
                        <td className="py-3 px-4">
                          <Badge variant="outline" className="font-normal">
                            {presupuesto.area}
                          </Badge>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            <Button variant="ghost" size="sm">
                              <FileBarChart2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="activos" className="mt-0">
          <div className="bg-white p-6 rounded-md shadow-sm">
            {/* Contenido similar pero filtrado para ACTIVOS */}
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                {/* Contenido similar */}
                <thead>
                  <tr className="border-b">
                    <th className="py-3 px-4 font-semibold text-gray-700">Nombre</th>
                    <th className="py-3 px-4 font-semibold text-gray-700">Monto</th>
                    <th className="py-3 px-4 font-semibold text-gray-700">Gastado</th>
                    <th className="py-3 px-4 font-semibold text-gray-700">Ejecución</th>
                    <th className="py-3 px-4 font-semibold text-gray-700">Estado</th>
                    <th className="py-3 px-4 font-semibold text-gray-700">Área</th>
                    <th className="py-3 px-4 font-semibold text-gray-700">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {presupuestosFiltrados
                    .filter(p => p.estado === 'ACTIVO')
                    .map((presupuesto) => (
                      <tr key={presupuesto.id} className="border-b hover:bg-gray-50">
                        <td className="py-3 px-4">
                          <div className="font-medium">{presupuesto.nombre}</div>
                          <div className="text-xs text-gray-500">
                            {new Date(presupuesto.fechaInicio).toLocaleDateString()} - {new Date(presupuesto.fechaFin).toLocaleDateString()}
                          </div>
                        </td>
                        <td className="py-3 px-4 font-medium">
                          {formatCurrency(presupuesto.monto)}
                        </td>
                        <td className="py-3 px-4">
                          {formatCurrency(presupuesto.gastado)}
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            <Progress 
                              value={presupuesto.porcentajeEjecucion} 
                              className="h-2 w-24"
                              aria-label={`${presupuesto.porcentajeEjecucion.toFixed(1)}% completado`}
                            />
                            <span className="text-xs font-medium">{presupuesto.porcentajeEjecucion.toFixed(1)}%</span>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <EstadoBadge estado={presupuesto.estado} />
                        </td>
                        <td className="py-3 px-4">
                          <Badge variant="outline" className="font-normal">
                            {presupuesto.area}
                          </Badge>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            <Button variant="ghost" size="sm">
                              <FileBarChart2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="alerta" className="mt-0">
          <div className="bg-white p-6 rounded-md shadow-sm">
            {/* Contenido similar pero filtrado para ALERTA */}
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                {/* Contenido similar */}
                <thead>
                  <tr className="border-b">
                    <th className="py-3 px-4 font-semibold text-gray-700">Nombre</th>
                    <th className="py-3 px-4 font-semibold text-gray-700">Monto</th>
                    <th className="py-3 px-4 font-semibold text-gray-700">Gastado</th>
                    <th className="py-3 px-4 font-semibold text-gray-700">Ejecución</th>
                    <th className="py-3 px-4 font-semibold text-gray-700">Estado</th>
                    <th className="py-3 px-4 font-semibold text-gray-700">Área</th>
                    <th className="py-3 px-4 font-semibold text-gray-700">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {presupuestosFiltrados
                    .filter(p => p.estado === 'ALERTA')
                    .map((presupuesto) => (
                      <tr key={presupuesto.id} className="border-b hover:bg-gray-50">
                        <td className="py-3 px-4">
                          <div className="font-medium">{presupuesto.nombre}</div>
                          <div className="text-xs text-gray-500">
                            {new Date(presupuesto.fechaInicio).toLocaleDateString()} - {new Date(presupuesto.fechaFin).toLocaleDateString()}
                          </div>
                        </td>
                        <td className="py-3 px-4 font-medium">
                          {formatCurrency(presupuesto.monto)}
                        </td>
                        <td className="py-3 px-4">
                          {formatCurrency(presupuesto.gastado)}
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            <Progress 
                              value={presupuesto.porcentajeEjecucion} 
                              className="h-2 w-24"
                              aria-label={`${presupuesto.porcentajeEjecucion.toFixed(1)}% completado`}
                            />
                            <span className="text-xs font-medium">{presupuesto.porcentajeEjecucion.toFixed(1)}%</span>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <EstadoBadge estado={presupuesto.estado} />
                        </td>
                        <td className="py-3 px-4">
                          <Badge variant="outline" className="font-normal">
                            {presupuesto.area}
                          </Badge>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            <Button variant="ghost" size="sm">
                              <FileBarChart2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="completados" className="mt-0">
          <div className="bg-white p-6 rounded-md shadow-sm">
            {/* Contenido similar pero filtrado para COMPLETADO */}
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                {/* Contenido similar */}
                <thead>
                  <tr className="border-b">
                    <th className="py-3 px-4 font-semibold text-gray-700">Nombre</th>
                    <th className="py-3 px-4 font-semibold text-gray-700">Monto</th>
                    <th className="py-3 px-4 font-semibold text-gray-700">Gastado</th>
                    <th className="py-3 px-4 font-semibold text-gray-700">Ejecución</th>
                    <th className="py-3 px-4 font-semibold text-gray-700">Estado</th>
                    <th className="py-3 px-4 font-semibold text-gray-700">Área</th>
                    <th className="py-3 px-4 font-semibold text-gray-700">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {presupuestosFiltrados
                    .filter(p => p.estado === 'COMPLETADO')
                    .map((presupuesto) => (
                      <tr key={presupuesto.id} className="border-b hover:bg-gray-50">
                        <td className="py-3 px-4">
                          <div className="font-medium">{presupuesto.nombre}</div>
                          <div className="text-xs text-gray-500">
                            {new Date(presupuesto.fechaInicio).toLocaleDateString()} - {new Date(presupuesto.fechaFin).toLocaleDateString()}
                          </div>
                        </td>
                        <td className="py-3 px-4 font-medium">
                          {formatCurrency(presupuesto.monto)}
                        </td>
                        <td className="py-3 px-4">
                          {formatCurrency(presupuesto.gastado)}
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            <Progress 
                              value={presupuesto.porcentajeEjecucion} 
                              className="h-2 w-24"
                              aria-label={`${presupuesto.porcentajeEjecucion.toFixed(1)}% completado`}
                            />
                            <span className="text-xs font-medium">{presupuesto.porcentajeEjecucion.toFixed(1)}%</span>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <EstadoBadge estado={presupuesto.estado} />
                        </td>
                        <td className="py-3 px-4">
                          <Badge variant="outline" className="font-normal">
                            {presupuesto.area}
                          </Badge>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            <Button variant="ghost" size="sm">
                              <FileBarChart2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}