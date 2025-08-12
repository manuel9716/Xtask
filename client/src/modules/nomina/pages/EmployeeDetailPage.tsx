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
import { ArrowLeft, Edit, Trash2, FileText, Calendar, Briefcase, User, DollarSign, Download } from 'lucide-react';
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
    queryKey: ['/api/empleados', id],
    queryFn: () => empleadosApi.getEmpleado(parseInt(id!)),
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
      setLocation('/finanzas/nomina');
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
                <Link href="/finanzas/nomina">Volver al dashboard</Link>
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
              <Link href="/finanzas/nomina">Nómina</Link>
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
            <Link href="/finanzas/nomina">
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

        <TabsContent value="resumen" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Proyectos Asignados</CardTitle>
                <Briefcase className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{empleado.proyectos?.length || 0}</div>
                <p className="text-xs text-muted-foreground">
                  {empleado.proyectos?.map(p => p.nombre).join(', ') || 'Sin proyectos'}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Antigüedad</CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {Math.floor((new Date().getTime() - new Date(empleado.fecha_ingreso).getTime()) / (1000 * 60 * 60 * 24 * 365))} años
                </div>
                <p className="text-xs text-muted-foreground">
                  Desde {new Date(empleado.fecha_ingreso).toLocaleDateString()}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Sueldo Base</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  ${Number(empleado.nomina?.sueldo_base || 0).toLocaleString()}
                </div>
                <p className="text-xs text-muted-foreground">
                  {empleado.nomina?.frecuencia_pago || 'Mensual'}
                </p>
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
          />
        </TabsContent>

        <TabsContent value="proyectos" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Historial de Nóminas</CardTitle>
              <CardDescription>Registro completo de pagos de nómina</CardDescription>
            </CardHeader>
            <CardContent>
              {empleado.nominas && empleado.nominas.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Período</TableHead>
                      <TableHead>Proyecto</TableHead>
                      <TableHead>Sueldo</TableHead>
                      <TableHead>Bono</TableHead>
                      <TableHead>Deducciones</TableHead>
                      <TableHead>Neto</TableHead>
                      <TableHead>Estado</TableHead>
                      <TableHead>Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {empleado.nominas.map((nomina) => (
                      <TableRow key={nomina.id}>
                        <TableCell>
                          {new Date(nomina.rango_inicio).toLocaleDateString()} - {new Date(nomina.rango_fin).toLocaleDateString()}
                        </TableCell>
                        <TableCell>{nomina.proyecto_nombre || 'Sin proyecto'}</TableCell>
                        <TableCell>${Number(nomina.sueldo).toLocaleString()}</TableCell>
                        <TableCell>${Number(nomina.bono).toLocaleString()}</TableCell>
                        <TableCell>${Number(nomina.deduccion).toLocaleString()}</TableCell>
                        <TableCell className="font-medium">${Number(nomina.neto).toLocaleString()}</TableCell>
                        <TableCell>
                          <Badge variant={getNominaEstadoBadgeVariant(nomina.estado)}>
                            {nomina.estado}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            {nomina.estado === 'pendiente' && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleChangeNominaEstado(nomina.id, 'pagada')}
                              >
                                Marcar Pagada
                              </Button>
                            )}
                            <Button size="sm" variant="ghost" asChild>
                              <Link href={`/nomina/nominas/${nomina.id}`}>
                                Ver
                              </Link>
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">No hay nóminas registradas</p>
                </div>
              )}
            </CardContent>
          </Card>
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
                  {empleado.contratos.map((contrato) => (
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
              <CardTitle>Timeline de Actividad</CardTitle>
              <CardDescription>Historial de cambios y eventos del empleado</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full mt-2" />
                  <div>
                    <p className="font-medium">Empleado creado</p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(empleado.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                {empleado.nominas?.map((nomina) => (
                  <div key={nomina.id} className="flex items-start gap-3">
                    <div className={`w-2 h-2 rounded-full mt-2 ${
                      nomina.estado === 'pagada' ? 'bg-green-500' : 'bg-yellow-500'
                    }`} />
                    <div>
                      <p className="font-medium">
                        Nómina {nomina.estado === 'pagada' ? 'pagada' : 'creada'}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(nomina.rango_inicio).toLocaleDateString()} - 
                        ${Number(nomina.neto).toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
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