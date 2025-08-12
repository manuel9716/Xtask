import { useState } from 'react';
import { useParams, useLocation } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Separator } from '@/components/ui/separator';
import { ArrowLeft, Edit, Trash2, FileText, Calendar, Briefcase, User, DollarSign, Download, Clock } from 'lucide-react';
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
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);

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
      refetch();
      refetchHistorial();
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

  const handleExportNomina = async (nominaId: number) => {
    try {
      const response = await fetch(`/api/nominas/${nominaId}/export`, {
        method: 'GET',
      });
      
      if (!response.ok) {
        throw new Error('Error al exportar nómina');
      }
      
      const blob = await response.blob();
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
        title: "Exportación exitosa",
        description: "La nómina se ha descargado correctamente",
      });
    } catch (error: any) {
      toast({
        title: "Error al exportar",
        description: error.message || "Error al exportar la nómina",
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
          />
        </TabsContent>

        <TabsContent value="nominas" className="space-y-4">
          <HistorialNominaTable
            historial={historialNomina || []}
            isLoading={isLoadingHistorial}
            onChangeEstado={handleChangeNominaEstado}
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
                                    onClick={() => handleExportNomina(evento.nominaId)}
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
    </div>
  );
}