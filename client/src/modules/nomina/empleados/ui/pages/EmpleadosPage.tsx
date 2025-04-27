import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useLocation } from 'wouter';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { 
  Search, 
  Plus, 
  Edit, 
  Trash2, 
  MoreHorizontal, 
  FileText, 
  RefreshCw, 
  ChevronLeft, 
  ChevronRight, 
  AlertCircle,
  Loader2,
  Download,
  FileDown,
  Briefcase,
  Clock
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { EmpleadoForm } from '../forms/EmpleadoForm';
import { FiltrosEmpleado } from '../../domain/entities/Empleado';
import { obtenerEmpleados, cambiarEstadoEmpleado, eliminarEmpleado, descargarContratoEmpleado } from '../../api/empleadosApi';
import { useToast } from '@/hooks/use-toast';

export default function EmpleadosPage() {
  const [location, setLocation] = useLocation();
  const { toast } = useToast();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [filtros, setFiltros] = useState<FiltrosEmpleado>({
    page: 1,
    pageSize: 10,
    search: '',
    contractStatus: '',
    department: ''
  });
  
  // Consulta para obtener empleados
  const { 
    data, 
    isLoading, 
    isError, 
    refetch 
  } = useQuery({
    queryKey: ['/api/nomina/empleados', filtros],
    queryFn: () => obtenerEmpleados(filtros),
  });
  
  // Función para cambiar filtros
  const actualizarFiltro = (key: keyof FiltrosEmpleado, value: string | number) => {
    let valorFinal = value;
    
    // Manejar valores especiales para filtros
    if (key === 'contractStatus' && value === 'all') {
      valorFinal = ''; // Valor vacío indica "todos" en el backend
    }
    
    if (key === 'department' && value === 'all_departments') {
      valorFinal = ''; // Valor vacío indica "todos" en el backend
    }
    
    setFiltros(prev => ({
      ...prev,
      [key]: valorFinal,
      // Si cambiamos cualquier filtro que no sea la página, volvemos a la página 1
      ...(key !== 'page' ? { page: 1 } : {})
    }));
  };
  
  // Función para cambiar página
  const cambiarPagina = (nuevaPagina: number) => {
    actualizarFiltro('page', nuevaPagina);
  };
  
  // Función para cambiar el estado de un empleado
  const handleCambiarEstado = async (id: number, nuevoEstado: string) => {
    try {
      // Convertiría a booleano pero en este caso el API debe estar esperando un string
      // Verificamos qué espera la API en la implementación
      await cambiarEstadoEmpleado(id, nuevoEstado === 'active');
      refetch();
      toast({
        title: 'Estado actualizado',
        description: 'El estado del empleado ha sido actualizado exitosamente',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Error al actualizar el estado del empleado',
        variant: 'destructive',
      });
    }
  };
  
  // Función para eliminar un empleado
  const handleEliminarEmpleado = async (id: number) => {
    try {
      await eliminarEmpleado(id);
      refetch();
      toast({
        title: 'Empleado eliminado',
        description: 'El empleado ha sido marcado como terminado',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Error al eliminar el empleado',
        variant: 'destructive',
      });
    }
  };
  
  // Estado de contrato como badge
  const renderEstadoContrato = (estado: string) => {
    switch (estado) {
      case 'active':
        return <Badge className="bg-green-500 hover:bg-green-600">Activo</Badge>;
      case 'inactive':
        return <Badge className="bg-gray-500 hover:bg-gray-600">Inactivo</Badge>;
      case 'on_leave':
        return <Badge className="bg-yellow-500 hover:bg-yellow-600">Permiso</Badge>;
      case 'terminated':
        return <Badge className="bg-red-500 hover:bg-red-600">Terminado</Badge>;
      default:
        return <Badge>{estado}</Badge>;
    }
  };
  
  // Tipo de contrato como badge
  const renderTipoContrato = (tipo: string) => {
    switch (tipo) {
      case 'fulltime':
        return <Badge className="bg-blue-500 hover:bg-blue-600">Tiempo completo</Badge>;
      case 'parttime':
        return <Badge className="bg-indigo-500 hover:bg-indigo-600">Tiempo parcial</Badge>;
      case 'contractor':
        return <Badge className="bg-purple-500 hover:bg-purple-600">Contratista</Badge>;
      case 'temporary':
        return <Badge className="bg-orange-500 hover:bg-orange-600">Temporal</Badge>;
      case 'internship':
        return <Badge className="bg-teal-500 hover:bg-teal-600">Pasantía</Badge>;
      default:
        return <Badge>{tipo}</Badge>;
    }
  };
  
  return (
    <div className="container mx-auto py-6">
      <Card>
        <CardHeader>
          <div>
            <CardTitle className="text-2xl font-bold">Gestión de Empleados</CardTitle>
            <CardDescription>
              Administre los empleados registrados en el sistema para cálculo de nómina
            </CardDescription>
          </div>
          
          {/* Mantenemos el Dialog para usarlo desde otro lugar pero quitamos el botón */}
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Crear Nuevo Empleado</DialogTitle>
                <DialogDescription>
                  Complete el formulario para registrar un nuevo empleado en el sistema
                </DialogDescription>
              </DialogHeader>
              <EmpleadoForm onSuccess={() => {
                setDialogOpen(false);
                refetch();
              }} />
            </DialogContent>
          </Dialog>
        </CardHeader>
        
        <CardContent>
          {/* Filtros */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="col-span-1 md:col-span-2">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por nombre o identificación..."
                  className="pl-8"
                  value={filtros.search}
                  onChange={(e) => actualizarFiltro('search', e.target.value)}
                />
              </div>
            </div>
            
            <div>
              <Select 
                value={filtros.contractStatus}
                onValueChange={(value) => actualizarFiltro('contractStatus', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Estado de contrato" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los estados</SelectItem>
                  <SelectItem value="active">Activo</SelectItem>
                  <SelectItem value="inactive">Inactivo</SelectItem>
                  <SelectItem value="on_leave">Permiso</SelectItem>
                  <SelectItem value="terminated">Terminado</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Select 
                value={filtros.department}
                onValueChange={(value) => actualizarFiltro('department', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Departamento" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all_departments">Todos los departamentos</SelectItem>
                  <SelectItem value="Administración">Administración</SelectItem>
                  <SelectItem value="Finanzas">Finanzas</SelectItem>
                  <SelectItem value="Recursos Humanos">Recursos Humanos</SelectItem>
                  <SelectItem value="Tecnología">Tecnología</SelectItem>
                  <SelectItem value="Ventas">Ventas</SelectItem>
                  <SelectItem value="Marketing">Marketing</SelectItem>
                  <SelectItem value="Operaciones">Operaciones</SelectItem>
                  <SelectItem value="Logística">Logística</SelectItem>
                  <SelectItem value="Producción">Producción</SelectItem>
                  <SelectItem value="Legal">Legal</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          {/* Tabla de Empleados */}
          {isLoading ? (
            <div className="flex justify-center items-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <span className="ml-2 text-lg text-muted-foreground">Cargando empleados...</span>
            </div>
          ) : isError ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <AlertCircle className="h-8 w-8 text-destructive mb-2" />
              <h3 className="text-lg font-semibold">Error al cargar los empleados</h3>
              <p className="text-muted-foreground mb-4">
                No se pudieron cargar los datos. Por favor, inténtelo de nuevo.
              </p>
              <Button onClick={() => refetch()} variant="outline">
                <RefreshCw className="mr-2 h-4 w-4" />
                Reintentar
              </Button>
            </div>
          ) : data?.empleados && data.empleados.length > 0 ? (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nombre</TableHead>
                    <TableHead>Identificación</TableHead>
                    <TableHead>Cargo</TableHead>
                    <TableHead>Departamento</TableHead>
                    <TableHead>Fecha Ingreso</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Proyectos</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.empleados.map((empleado) => (
                    <TableRow key={empleado.id}>
                      <TableCell className="font-medium">
                        {empleado.firstName && empleado.lastName 
                          ? `${empleado.firstName} ${empleado.lastName}`
                          : (empleado as any).fullName || `Usuario #${empleado.userId}`}
                      </TableCell>
                      <TableCell>{empleado.identification}</TableCell>
                      <TableCell>{empleado.position}</TableCell>
                      <TableCell>{empleado.department}</TableCell>
                      <TableCell>
                        {empleado.hireDate ? 
                          format(new Date(empleado.hireDate), 'dd/MM/yyyy', {locale: es}) : 
                          'N/A'
                        }
                      </TableCell>
                      <TableCell>
                        {renderEstadoContrato(empleado.contractStatus || 'active')}
                      </TableCell>
                      <TableCell>
                        {renderTipoContrato(empleado.contractType || 'fulltime')}
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <span className="sr-only">Abrir menú</span>
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Acciones</DropdownMenuLabel>
                            <DropdownMenuItem
                              onClick={() => setLocation(`/admin/nomina/empleados/${empleado.id}/editar`)}
                            >
                              <Edit className="mr-2 h-4 w-4" />
                              Editar
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => setLocation(`/admin/nomina/empleados/${empleado.id}/historial`)}
                            >
                              <FileText className="mr-2 h-4 w-4" />
                              Ver historial de pagos
                            </DropdownMenuItem>
                            {empleado.contratoUrl && (
                              <DropdownMenuItem
                                onClick={() => descargarContratoEmpleado(empleado.id)}
                              >
                                <FileDown className="mr-2 h-4 w-4" />
                                Descargar contrato
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuSeparator />
                            <DropdownMenuLabel>Cambiar estado</DropdownMenuLabel>
                            <DropdownMenuItem
                              onClick={() => handleCambiarEstado(empleado.id, 'active')}
                              disabled={empleado.contractStatus === 'active'}
                            >
                              Marcar como Activo
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleCambiarEstado(empleado.id, 'inactive')}
                              disabled={empleado.contractStatus === 'inactive'}
                            >
                              Marcar como Inactivo
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleCambiarEstado(empleado.id, 'on_leave')}
                              disabled={empleado.contractStatus === 'on_leave'}
                            >
                              Marcar como En Permiso
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() => handleEliminarEmpleado(empleado.id)}
                              className="text-destructive"
                              disabled={empleado.contractStatus === 'terminated'}
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Eliminar
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center border rounded-md">
              <p className="text-lg text-muted-foreground mb-4">
                No se encontraron empleados con los filtros seleccionados.
              </p>
              <Button onClick={() => setFiltros({
                page: 1,
                pageSize: 10,
                search: '',
                contractStatus: '',
                department: ''
              })} variant="outline">
                <RefreshCw className="mr-2 h-4 w-4" />
                Limpiar filtros
              </Button>
            </div>
          )}
        </CardContent>
        
        {data && data.totalPages > 1 && (
          <CardFooter className="flex justify-between">
            <div className="text-sm text-muted-foreground">
              Mostrando {(data.page - 1) * data.pageSize + 1} a {
                Math.min(data.page * data.pageSize, data.total)
              } de {data.total} empleados
            </div>
            
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => cambiarPagina(data.page - 1)}
                disabled={data.page <= 1}
              >
                <ChevronLeft className="h-4 w-4" />
                <span className="sr-only">Página anterior</span>
              </Button>
              
              <span className="text-sm font-medium">
                Página {data.page} de {data.totalPages}
              </span>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => cambiarPagina(data.page + 1)}
                disabled={data.page >= data.totalPages}
              >
                <ChevronRight className="h-4 w-4" />
                <span className="sr-only">Página siguiente</span>
              </Button>
            </div>
          </CardFooter>
        )}
      </Card>
    </div>
  );
}