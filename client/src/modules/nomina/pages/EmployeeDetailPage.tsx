import { useState } from 'react';
import { useParams, useLocation } from 'wouter';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Separator } from '@/components/ui/separator';
import { ArrowLeft, Edit, Trash2, FileText, Calendar, Briefcase, User, DollarSign, Download, Clock, Edit3, FileText as FileTextIcon } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Link } from 'wouter';
import { EmployeeEditModal } from '../components/EmployeeEditModal';
import { ConfirmDeleteModal } from '../components/ConfirmDeleteModal';
import { ProjectMultiSelect } from '../components/ProjectMultiSelect';
import { HistorialNominaTable } from '../components/HistorialNominaTable';
import { empleadosApi } from '../services/empleados.api';
import { nominaApi } from '../services/nomina.api';
import { useToast } from '@/hooks/use-toast';

export default function EmployeeDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [editNominaModalOpen, setEditNominaModalOpen] = useState(false);
  const [selectedNominaForEdit, setSelectedNominaForEdit] = useState<any>(null);
  const [isConfirmingPayment, setIsConfirmingPayment] = useState(false);

  const { data: empleado, isLoading, refetch } = useQuery({
    queryKey: ['/api/empleados', id, 'full'],
    queryFn: () => empleadosApi.getEmpleadoCompleto(parseInt(id!)),
    enabled: !!id,
  });

  const { data: historialNomina, isLoading: isLoadingHistorial, refetch: refetchHistorial } = useQuery({
    queryKey: ['/api/empleados', id, 'historial-nomina'],
    queryFn: () => empleadosApi.getHistorialNomina(parseInt(id!)),
    enabled: !!id,
  });

  const handleUpdateProjects = async (projectIds: number[]) => {
    try {
      await empleadosApi.updateEmpleadoProyectos(parseInt(id!), projectIds);
      refetch();
      toast({
        title: "Proyectos actualizados",
        description: "Los proyectos del empleado han sido actualizados correctamente.",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Error al actualizar proyectos",
        variant: "destructive",
      });
    }
  };

  const handleChangeNominaEstado = async (nominaId: number, nuevoEstado: string) => {
    try {
      await empleadosApi.updateEstadoNomina(parseInt(id!), nominaId, nuevoEstado);
      
      // Invalidar caches relacionadas
      await queryClient.invalidateQueries({ 
        queryKey: ['/api/empleados', id, 'historial-nomina'] 
      });
      await queryClient.invalidateQueries({ 
        queryKey: ['/api/empleados', id, 'full'] 
      });
      
      toast({
        title: "Estado actualizado",
        description: `La nómina ha sido marcada como ${nuevoEstado}`,
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Error al actualizar estado",
        variant: "destructive",
      });
    }
  };

  const handleEliminarNomina = async (nominaId: number) => {
    try {
      console.log('Eliminando nómina:', nominaId);
      const result = await nominaApi.eliminarNomina(nominaId);
      console.log('Resultado:', result);
      
      // Invalidar múltiples caches relacionadas
      await queryClient.invalidateQueries({ 
        queryKey: ['/api/empleados', id, 'historial-nomina'] 
      });
      await queryClient.invalidateQueries({ 
        queryKey: ['/api/empleados', id, 'full'] 
      });
      await queryClient.invalidateQueries({ 
        queryKey: ['/api/nomina-modulo/dashboard'] 
      });
      
      toast({
        title: "Nómina eliminada",
        description: "La nómina ha sido eliminada correctamente",
      });
    } catch (error: any) {
      console.error('Error al eliminar:', error);
      toast({
        title: "Error",
        description: error.message || "Error al eliminar nómina",
        variant: "destructive",
      });
    }
  };

  const handleEditarNomina = (nominaId: number) => {
    const nomina = historialNomina?.find((n: any) => n.id === nominaId);
    if (nomina) {
      setSelectedNominaForEdit(nomina);
      setEditNominaModalOpen(true);
    }
  };

  const handleExportarNomina = async (nominaId: number) => {
    try {
      const blob = await nominaApi.exportNomina(nominaId);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = `nomina-${nominaId}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      toast({
        title: "Nómina exportada",
        description: "La nómina ha sido exportada correctamente",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Error al exportar nómina",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async () => {
    try {
      await empleadosApi.deleteEmpleado(parseInt(id!));
      toast({
        title: "Empleado eliminado",
        description: "El empleado ha sido dado de baja correctamente",
      });
      setLocation('/nomina');
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Error al eliminar empleado",
        variant: "destructive",
      });
    }
  };


  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!empleado) {
    return (
      <div className="container mx-auto py-6">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <h2 className="text-xl font-semibold mb-2">Empleado no encontrado</h2>
              <p className="text-muted-foreground mb-4">El empleado solicitado no existe</p>
              <Button asChild>
                <Link to="/nomina">Volver al dashboard</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const getEstadoBadgeVariant = (estado: string) => {
    switch (estado) {
      case 'activo': return 'default';
      case 'inactivo': return 'secondary';
      case 'suspendido': return 'destructive';
      default: return 'secondary';
    }
  };

  const getNominaEstadoBadgeVariant = (estado: string) => {
    switch (estado) {
      case 'pagada': return 'default';
      case 'pendiente': return 'secondary';
      case 'parcial': return 'destructive';
      default: return 'secondary';
    }
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Breadcrumb */}
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link to="/nomina">Nómina</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>
              {empleado.nombre} {empleado.apellido}
            </BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" asChild>
            <Link to="/nomina">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold">
              {empleado.nombre} {empleado.apellido}
            </h1>
            <p className="text-muted-foreground">
              {empleado.cargo} - {empleado.depto}
            </p>
          </div>
          <Badge variant={getEstadoBadgeVariant(empleado.estado_contrato)}>
            {empleado.estado_contrato}
          </Badge>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setEditModalOpen(true)}>
            <Edit className="h-4 w-4 mr-2" />
            Editar
          </Button>
          <Button variant="destructive" onClick={() => setDeleteModalOpen(true)}>
            <Trash2 className="h-4 w-4 mr-2" />
            Eliminar
          </Button>
        </div>
      </div>

      <Tabs defaultValue="resumen" className="space-y-4">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="resumen">Resumen</TabsTrigger>
          <TabsTrigger value="personal">Información Personal</TabsTrigger>
          <TabsTrigger value="nominas">Nóminas</TabsTrigger>
          <TabsTrigger value="proyectos">Proyectos</TabsTrigger>
          <TabsTrigger value="documentos">Documentos</TabsTrigger>
          <TabsTrigger value="actividad">Actividad</TabsTrigger>
        </TabsList>

        <TabsContent value="resumen" className="space-y-6">
          {/* KPIs Grid Mejorada */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-blue-600/5" />
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Proyectos Asignados</CardTitle>
                <Briefcase className="h-4 w-4 text-blue-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">{empleado.proyectos?.length || 0}</div>
                <p className="text-xs text-muted-foreground line-clamp-2">
                  {empleado.proyectos?.length > 0 
                    ? empleado.proyectos.map((p: any) => p.nombre).join(', ')
                    : 'Sin proyectos asignados'}
                </p>
              </CardContent>
            </Card>

            <Card className="relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 to-green-600/5" />
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Antigüedad</CardTitle>
                <Calendar className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  {Math.floor((new Date().getTime() - new Date(empleado.fecha_ingreso).getTime()) / (1000 * 60 * 60 * 24 * 365))} años
                </div>
                <p className="text-xs text-muted-foreground">
                  Desde {new Date(empleado.fecha_ingreso).toLocaleDateString('es-ES')}
                </p>
              </CardContent>
            </Card>

            <Card className="relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-purple-600/5" />
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Sueldo Base</CardTitle>
                <DollarSign className="h-4 w-4 text-purple-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-purple-600">
                  ${Number(empleado.nomina?.sueldo_base || 0).toLocaleString('es-ES')}
                </div>
                <p className="text-xs text-muted-foreground">
                  {empleado.nomina?.frecuencia_pago || 'Mensual'}
                </p>
              </CardContent>
            </Card>

            <Card className="relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-orange-500/10 to-orange-600/5" />
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Bonificaciones</CardTitle>
                <DollarSign className="h-4 w-4 text-orange-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-orange-600">
                  ${Number(empleado.nomina?.bonificacion || 0).toLocaleString('es-ES')}
                </div>
                <p className="text-xs text-muted-foreground">
                  Mensual promedio
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Resumen de Último Pago */}
          {empleado.ultimoPago && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Último Pago Realizado</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-2xl font-bold text-green-600">
                      ${Number(empleado.ultimoPago.monto).toLocaleString('es-ES')}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(empleado.ultimoPago.fecha).toLocaleDateString('es-ES', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </p>
                  </div>
                  <Badge variant="default" className="bg-green-100 text-green-800">
                    Pagado
                  </Badge>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Gasto por Proyecto */}
          {empleado.gastoPorProyecto && empleado.gastoPorProyecto.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Gasto por Proyecto</CardTitle>
                <CardDescription>Total invertido por proyecto en nóminas</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {empleado.gastoPorProyecto.map((gasto: any, index: number) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-2 h-2 rounded-full bg-blue-500" />
                        <span className="font-medium">
                          {gasto.proyecto_nombre || 'Proyecto sin nombre'}
                        </span>
                      </div>
                      <span className="text-lg font-bold">
                        ${Number(gasto.total_gastado).toLocaleString('es-ES')}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Cronograma de Pagos - Nueva sección visual con datos reales */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Cronograma de Pagos - Gráfico de barras */}
            <Card className="lg:col-span-1">
              <CardHeader>
                <CardTitle className="text-lg font-semibold">Cronograma de Pagos</CardTitle>
                <CardDescription>Últimos pagos realizados</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Usar datos reales de pagos */}
                  {empleado.pagos && empleado.pagos.length > 0 ? (
                    empleado.pagos.slice(0, 6).map((pago: any, index: number) => {
                      const maxMonto = Math.max(...empleado.pagos.slice(0, 6).map((p: any) => Number(p.valor_neto || 0)));
                      const porcentaje = maxMonto > 0 ? (Number(pago.valor_neto || 0) / maxMonto) * 100 : 0;
                      const fechaPago = new Date(pago.fecha_pago || pago.fecha);
                      const fechaFormateada = fechaPago.toLocaleDateString('es-ES', { 
                        day: '2-digit', 
                        month: 'short' 
                      });
                      
                      return (
                        <div key={index} className="flex items-center gap-3">
                          <div className="text-xs text-muted-foreground w-14">
                            {fechaFormateada}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-sm font-medium">
                                {pago.proyecto_nombre || 'Sin proyecto'}
                              </span>
                              <span className="text-sm font-semibold">
                                ${Number(pago.valor_neto || 0).toLocaleString('es-ES')}
                              </span>
                            </div>
                            <div className="w-full bg-gray-100 rounded-full h-2">
                              <div 
                                className={`h-2 rounded-full transition-all duration-300 ${
                                  pago.estado === 'pagada' 
                                    ? 'bg-gradient-to-r from-green-400 to-green-600'
                                    : 'bg-gradient-to-r from-yellow-400 to-orange-500'
                                }`}
                                style={{ width: `${porcentaje}%` }}
                              />
                            </div>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="text-center text-muted-foreground py-4">
                      <p className="text-sm">No hay pagos registrados</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Distribución de Gastos - Gráfico circular con datos reales */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg font-semibold">Distribución Gastos</CardTitle>
                <CardDescription>Por tipo de pago</CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                {empleado.pagos && empleado.pagos.length > 0 ? (() => {
                  // Calcular totales de datos reales
                  const totalSueldos = empleado.pagos.reduce((sum: number, pago: any) => 
                    sum + Number(pago.valor_bruto || 0), 0);
                  const totalBonificaciones = empleado.pagos.reduce((sum: number, pago: any) => 
                    sum + Number(pago.bonificaciones || 0), 0);
                  const totalDescuentos = empleado.pagos.reduce((sum: number, pago: any) => 
                    sum + Number(pago.deducciones || 0) + Number(pago.impuestos || 0), 0);
                  const totalGeneral = totalSueldos + totalBonificaciones;
                  
                  const porcentajeSueldos = totalGeneral > 0 ? (totalSueldos / totalGeneral * 100) : 0;
                  const porcentajeBonificaciones = totalGeneral > 0 ? (totalBonificaciones / totalGeneral * 100) : 0;
                  // Mostrar descuentos como información separada pero no en el total
                  const porcentajeDescuentos = totalSueldos > 0 ? (totalDescuentos / totalSueldos * 100) : 0;
                  
                  return (
                    <>
                      <div className="flex items-center justify-center mb-6">
                        <div className="relative w-32 h-32">
                          <svg className="w-32 h-32 transform -rotate-90" viewBox="0 0 36 36">
                            <path
                              className="text-gray-200"
                              stroke="currentColor"
                              strokeWidth="3"
                              fill="transparent"
                              d="m18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                            />
                            <path
                              className="text-blue-600"
                              stroke="currentColor"
                              strokeWidth="3"
                              strokeDasharray={`${porcentajeSueldos}, 100`}
                              strokeLinecap="round"
                              fill="transparent"
                              d="m18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                            />
                            <path
                              className="text-purple-600"
                              stroke="currentColor"
                              strokeWidth="3"
                              strokeDasharray={`${porcentajeBonificaciones}, 100`}
                              strokeDashoffset={`-${porcentajeSueldos}`}
                              strokeLinecap="round"
                              fill="transparent"
                              d="m18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                            />
                          </svg>
                          <div className="absolute inset-0 flex items-center justify-center">
                            <div className="text-center">
                              <div className="text-xs font-semibold">Total</div>
                              <div className="text-sm font-bold">
                                ${totalGeneral.toLocaleString('es-ES')}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className="w-3 h-3 bg-blue-600 rounded-full"></div>
                            <span className="text-sm">Sueldos</span>
                          </div>
                          <span className="text-sm font-semibold">{porcentajeSueldos.toFixed(0)}%</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className="w-3 h-3 bg-purple-600 rounded-full"></div>
                            <span className="text-sm">Bonificaciones</span>
                          </div>
                          <span className="text-sm font-semibold">{porcentajeBonificaciones.toFixed(0)}%</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className="w-3 h-3 bg-gray-400 rounded-full"></div>
                            <span className="text-sm">Descuentos</span>
                          </div>
                          <span className="text-sm font-semibold">{porcentajeDescuentos.toFixed(0)}%</span>
                        </div>
                      </div>
                    </>
                  );
                })() : (
                  <div className="text-center text-muted-foreground py-8">
                    <p className="text-sm">No hay datos de distribución disponibles</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Calendario y Nóminas Recientes con datos reales */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg font-semibold">Calendario</CardTitle>
                <CardDescription>Nóminas recientes</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Mini calendario con días de pago reales */}
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="text-center mb-3">
                      <p className="text-sm font-semibold text-gray-700">
                        {new Date().toLocaleDateString('es-ES', { month: 'long', year: 'numeric' }).toUpperCase()}
                      </p>
                    </div>
                    <div className="grid grid-cols-7 gap-1 text-xs mb-2">
                      <div className="text-center text-muted-foreground font-medium">D</div>
                      <div className="text-center text-muted-foreground font-medium">L</div>
                      <div className="text-center text-muted-foreground font-medium">M</div>
                      <div className="text-center text-muted-foreground font-medium">X</div>
                      <div className="text-center text-muted-foreground font-medium">J</div>
                      <div className="text-center text-muted-foreground font-medium">V</div>
                      <div className="text-center text-muted-foreground font-medium">S</div>
                    </div>
                    <div className="grid grid-cols-7 gap-1 text-xs">
                      {(() => {
                        const fechasPago = empleado.pagos?.map((pago: any) => {
                          const fecha = new Date(pago.fecha_pago || pago.fecha_fin);
                          return fecha.getDate();
                        }) || [];
                        
                        const daysInMonth = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).getDate();
                        return Array.from({length: daysInMonth}, (_, i) => i + 1).map(day => (
                          <div 
                            key={day} 
                            className={`text-center p-1 rounded text-xs transition-colors ${
                              fechasPago.includes(day) 
                                ? 'bg-blue-500 text-white font-bold shadow-sm' 
                                : 'text-gray-600 hover:bg-gray-200'
                            }`}
                          >
                            {day}
                          </div>
                        ));
                      })()}
                    </div>
                  </div>

                  {/* Lista de nóminas recientes con datos reales */}
                  <div className="space-y-2">
                    <h4 className="text-sm font-semibold text-gray-700 mb-2">Nóminas Recientes</h4>
                    
                    {empleado.pagos && empleado.pagos.length > 0 ? (
                      empleado.pagos.slice(0, 3).map((pago: any, index: number) => {
                        const estiloEstado = pago.estado === 'pagada' ? 'green' : 
                                           pago.estado === 'procesada' ? 'blue' : 'yellow';
                        
                        return (
                          <div key={index} className={`flex items-center justify-between p-3 bg-${estiloEstado}-50 rounded-lg border border-${estiloEstado}-100`}>
                            <div className="flex items-center gap-3">
                              <div className={`w-2 h-2 bg-${estiloEstado}-500 rounded-full`}></div>
                              <div>
                                <div className="text-sm font-medium">
                                  {new Date(pago.fecha_inicio).toLocaleDateString('es-ES')} - {new Date(pago.fecha_fin).toLocaleDateString('es-ES')}
                                </div>
                                <div className={`text-xs text-${estiloEstado}-700 capitalize`}>
                                  {pago.estado}
                                </div>
                              </div>
                            </div>
                            <Badge variant="outline" className={`bg-${estiloEstado}-100 text-${estiloEstado}-800 border-${estiloEstado}-200 text-xs`}>
                              ${Number(pago.neto || 0).toLocaleString('es-ES')}
                            </Badge>
                          </div>
                        );
                      })
                    ) : (
                      <div className="text-center text-muted-foreground py-4">
                        <p className="text-sm">No hay nóminas registradas</p>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="personal" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Información Personal</CardTitle>
              <CardDescription>Datos personales y de contacto del empleado</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Identificación</label>
                  <p className="text-sm">{empleado.identificacion}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Teléfono</label>
                  <p className="text-sm">{empleado.telefono || 'No especificado'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Dirección</label>
                  <p className="text-sm">{empleado.direccion || 'No especificada'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Contacto de Emergencia</label>
                  <p className="text-sm">{empleado.contacto_emergencia || 'No especificado'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Tipo de Contrato</label>
                  <p className="text-sm">{empleado.tipo_contrato}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Método de Pago</label>
                  <p className="text-sm">{empleado.nomina?.metodo_pago || 'No especificado'}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="nominas" className="space-y-4">
          <HistorialNominaTable
            historial={historialNomina || []}
            isLoading={isLoadingHistorial}
            onChangeEstado={handleChangeNominaEstado}
            onEliminar={handleEliminarNomina}
            onExportar={handleExportarNomina}
            onEditar={handleEditarNomina}
          />
        </TabsContent>

        <TabsContent value="proyectos" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Asignación de Proyectos</CardTitle>
              <CardDescription>Gestión de proyectos asignados al empleado</CardDescription>
            </CardHeader>
            <CardContent>
              <ProjectMultiSelect
                empleadoId={parseInt(id!)}
                proyectosAsignados={empleado.proyectos || []}
                onUpdate={handleUpdateProjects}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="documentos" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Documentos</CardTitle>
              <CardDescription>Contratos y documentos relacionados</CardDescription>
            </CardHeader>
            <CardContent>
              {empleado.contratos && empleado.contratos.length > 0 ? (
                <div className="space-y-4">
                  {empleado.contratos.map((contrato: any) => (
                    <div key={contrato.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <FileText className="h-5 w-5 text-muted-foreground" />
                        <div>
                          <p className="font-medium">{contrato.filename}</p>
                          <p className="text-sm text-muted-foreground">
                            Subido el {new Date(contrato.uploaded_at).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <Button variant="outline" size="sm" asChild>
                        <a href={contrato.url} download>
                          <Download className="h-4 w-4 mr-2" />
                          Descargar
                        </a>
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No hay documentos subidos</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="actividad" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-gradient-to-r from-indigo-500 to-purple-600 flex items-center justify-center">
                  <Calendar className="w-4 h-4 text-white" />
                </div>
                Timeline de Actividad
              </CardTitle>
              <CardDescription>Historial cronológico de eventos y cambios del empleado</CardDescription>
            </CardHeader>
            <CardContent>
              {empleado.historial && empleado.historial.length > 0 ? (
                <div className="relative">
                  {/* Línea vertical del timeline */}
                  <div className="absolute left-6 top-0 bottom-0 w-px bg-gradient-to-b from-indigo-200 via-purple-200 to-transparent" />
                  
                  <div className="space-y-6">
                    {empleado.historial.map((evento: any, index: number) => (
                      <div key={index} className="relative flex items-start gap-4 group">
                        <div className={`relative z-10 flex items-center justify-center w-12 h-12 rounded-full border-4 border-white shadow-lg transition-all duration-300 group-hover:scale-110 ${
                          evento.tipo === 'alta' ? 'bg-gradient-to-r from-green-400 to-green-600' :
                          evento.tipo === 'pago' ? 'bg-gradient-to-r from-blue-400 to-blue-600' :
                          evento.tipo === 'nomina_creada' ? 'bg-gradient-to-r from-yellow-400 to-orange-500' :
                          'bg-gradient-to-r from-gray-400 to-gray-600'
                        }`}>
                          {evento.tipo === 'alta' ? (
                            <User className="w-5 h-5 text-white" />
                          ) : evento.tipo === 'pago' ? (
                            <DollarSign className="w-5 h-5 text-white" />
                          ) : (
                            <FileText className="w-5 h-5 text-white" />
                          )}
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <Card className="transition-all duration-300 group-hover:shadow-md border-l-4 border-l-indigo-500">
                            <CardContent className="pt-4">
                              <div className="flex items-start justify-between">
                                <div className="flex-1">
                                  <h4 className="font-semibold text-gray-900 mb-1">
                                    {evento.descripcion}
                                  </h4>
                                  {evento.detalle && (
                                    <p className="text-sm text-muted-foreground mb-2">
                                      {evento.detalle}
                                    </p>
                                  )}
                                  <div className="flex items-center gap-2">
                                    <Badge variant="outline" className="text-xs">
                                      {evento.tipo === 'alta' ? 'Registro' :
                                       evento.tipo === 'pago' ? 'Pago' : 'Nómina'}
                                    </Badge>
                                    <span className="text-xs text-muted-foreground">
                                      {new Date(evento.fecha).toLocaleDateString('es-ES', {
                                        year: 'numeric',
                                        month: 'long',
                                        day: 'numeric',
                                        hour: '2-digit',
                                        minute: '2-digit'
                                      })}
                                    </span>
                                  </div>
                                </div>
                                
                                {evento.tipo === 'pago' && (
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleExportarNomina(evento.nominaId)}
                                    className="ml-4"
                                  >
                                    <Download className="w-3 h-3 mr-1" />
                                    Exportar
                                  </Button>
                                )}
                              </div>
                            </CardContent>
                          </Card>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No hay actividad registrada</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Modales */}
      <EmployeeEditModal
        empleado={empleado}
        open={editModalOpen}
        onOpenChange={setEditModalOpen}
        onSuccess={() => {
          refetch();
          setEditModalOpen(false);
        }}
      />

      <ConfirmDeleteModal
        open={deleteModalOpen}
        onOpenChange={setDeleteModalOpen}
        onConfirm={handleDelete}
        empleadoNombre={`${empleado.nombre} ${empleado.apellido}`}
      />

      {/* Modal de Edición de Nómina */}
      <Dialog open={editNominaModalOpen} onOpenChange={setEditNominaModalOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Detalle de Nómina</DialogTitle>
            <div className="text-sm text-muted-foreground">
              {empleado?.nombre} {empleado?.apellido} • {selectedNominaForEdit && new Date(selectedNominaForEdit.periodo_inicio).toLocaleDateString('es-ES', { month: 'long', year: 'numeric' })}
            </div>
          </DialogHeader>

          {selectedNominaForEdit && (
            <div className="space-y-6">
              {/* Tarjetas de montos */}
              <div className="grid grid-cols-2 gap-4">
                <Card>
                  <CardContent className="p-4">
                    <div className="text-sm text-muted-foreground mb-1">Sueldo Base</div>
                    <div className="text-xl font-bold">${selectedNominaForEdit.valor_bruto?.toLocaleString('es-ES') || '0'}</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <div className="text-sm text-muted-foreground mb-1">Bonificaciones</div>
                    <div className="text-xl font-bold">${selectedNominaForEdit.bonificaciones?.toLocaleString('es-ES') || '0'}</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <div className="text-sm text-muted-foreground mb-1">Deducciones</div>
                    <div className="text-xl font-bold">${selectedNominaForEdit.deducciones?.toLocaleString('es-ES') || '0'}</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <div className="text-sm text-muted-foreground mb-1">Neto a pagar</div>
                    <div className="text-xl font-bold text-green-600">${selectedNominaForEdit.valor_neto?.toLocaleString('es-ES') || '0'}</div>
                  </CardContent>
                </Card>
              </div>

              {/* Registrar pago */}
              <div>
                <h3 className="font-semibold mb-4">Registrar pago</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm text-muted-foreground">Mes</label>
                    <Input 
                      value={new Date(selectedNominaForEdit.periodo_inicio).toLocaleDateString('es-ES', { month: 'long', year: 'numeric' })}
                      disabled
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <label className="text-sm text-muted-foreground">Fecha de pago</label>
                    <Input 
                      type="date"
                      defaultValue={selectedNominaForEdit.fecha_pago || new Date().toISOString().split('T')[0]}
                      className="mt-1"
                    />
                  </div>
                </div>
              </div>

              {/* Bonificación adicional */}
              <div>
                <label className="text-sm text-muted-foreground">Bonificación adicional (opcional)</label>
                <Textarea 
                  placeholder="Ingrese detalles de bonificación adicional..."
                  className="mt-1"
                  rows={3}
                />
              </div>

              {/* Estado */}
              <div>
                <label className="text-sm font-medium">Estado</label>
                <div className="mt-1">
                  <Badge 
                    variant="secondary"
                    className="bg-purple-100 text-purple-700 border-purple-200"
                  >
                    {selectedNominaForEdit.estado || 'Pendiente'}
                  </Badge>
                </div>
              </div>

              {/* Botones */}
              <div className="space-y-2 pt-4">
                <Button 
                  className="w-full bg-purple-600 hover:bg-purple-700"
                  onClick={() => {
                    toast({
                      title: "Pago PSE iniciado",
                      description: "Redirigiendo a la plataforma de pagos PSE...",
                    });
                    // Aquí se implementaría la integración con PSE
                  }}
                >
                  Pagar con PSE
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={async () => {
                    if (!selectedNominaForEdit) return;
                    
                    setIsConfirmingPayment(true);
                    try {
                      // Usar el endpoint que realmente actualiza la base de datos
                      const response = await fetch(`/api/empleados-nuevos/${id}/historial-nomina/${selectedNominaForEdit.id}/estado`, {
                        method: 'PATCH',
                        headers: {
                          'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({ estado: 'pagada' }),
                      });
                      
                      if (!response.ok) {
                        throw new Error('Error al actualizar estado de nómina');
                      }
                      
                      const result = await response.json();
                      
                      toast({
                        title: "Pago confirmado",
                        description: "El pago ha sido registrado correctamente",
                      });
                      
                      // Invalidar cache para actualizar la vista
                      await Promise.all([
                        queryClient.invalidateQueries({ queryKey: ['/api/empleados', id, 'historial-nomina'] }),
                        queryClient.invalidateQueries({ queryKey: ['/api/empleados', id, 'full'] }),
                        queryClient.invalidateQueries({ queryKey: ['/api/nomina-modulo/dashboard'] })
                      ]);
                      
                      setEditNominaModalOpen(false);
                    } catch (error) {
                      console.error('Error al confirmar pago:', error);
                      toast({
                        title: "Error",
                        description: "No se pudo confirmar el pago",
                        variant: "destructive",
                      });
                    } finally {
                      setIsConfirmingPayment(false);
                    }
                  }}
                  disabled={isConfirmingPayment}
                >
                  {isConfirmingPayment ? (
                    <>
                      <div className="animate-spin w-4 h-4 mr-2 border-2 border-gray-400 border-t-transparent rounded-full"></div>
                      Procesando...
                    </>
                  ) : (
                    'Confirmar pago'
                  )}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}