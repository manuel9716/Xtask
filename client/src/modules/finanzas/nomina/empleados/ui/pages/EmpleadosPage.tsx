import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { 
  Download, FileEdit, Loader2, 
  Plus, Search, UserPlus, Trash2, 
  Eye, CheckCircle, XCircle, User 
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Table, 
  TableBody, 
  TableCaption, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

import { FiltrosEmpleado } from '../../domain/entities/Empleado';
import { EmpleadoForm } from '../forms/EmpleadoForm';

export default function EmpleadosPage() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [filtros, setFiltros] = useState<FiltrosEmpleado>({
    page: 1,
    pageSize: 10,
  });
  const [busqueda, setBusqueda] = useState('');

  // Consulta para obtener los empleados
  const {
    data,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ['/api/finanzas/nomina/empleados', filtros],
    queryFn: async () => {
      const queryParams = new URLSearchParams();
      
      if (filtros.contractStatus) {
        queryParams.append('contractStatus', filtros.contractStatus);
      }
      
      if (filtros.department) {
        queryParams.append('department', filtros.department);
      }
      
      if (filtros.page) {
        queryParams.append('page', filtros.page.toString());
      }
      
      if (filtros.pageSize) {
        queryParams.append('pageSize', filtros.pageSize.toString());
      }
      
      const url = `/api/finanzas/nomina/empleados?${queryParams.toString()}`;
      const res = await apiRequest('GET', url);
      
      if (!res.ok) {
        throw new Error('Error al obtener los empleados');
      }
      
      return res.json();
    },
  });

  // Función para obtener el color del badge según el estado del contrato
  const getEstadoContractoBadge = (estado: string) => {
    switch (estado) {
      case 'active':
        return <Badge className="bg-green-500 hover:bg-green-600">Activo</Badge>;
      case 'inactive':
        return <Badge variant="secondary">Inactivo</Badge>;
      case 'on_leave':
        return <Badge className="bg-yellow-500 hover:bg-yellow-600">Permiso</Badge>;
      case 'terminated':
        return <Badge variant="destructive">Terminado</Badge>;
      default:
        return <Badge>{estado}</Badge>;
    }
  };

  // Función para cambiar de página
  const cambiarPagina = (pagina: number) => {
    setFiltros({
      ...filtros,
      page: pagina,
    });
  };

  // Función para manejar el cambio en los filtros
  const handleFiltroChange = (key: keyof FiltrosEmpleado, value: string | number | undefined) => {
    setFiltros({
      ...filtros,
      [key]: value,
      page: 1, // Resetear a la primera página al cambiar un filtro
    });
  };

  // Función para formatear la fecha
  const formatFecha = (fecha: string | Date) => {
    if (!fecha) return 'N/A';
    return format(new Date(fecha), 'dd MMM yyyy', { locale: es });
  };

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-primary">Gestión de Empleados</h1>
          <p className="text-muted-foreground mt-1">
            Administra los datos de empleados para el módulo de nómina
          </p>
        </div>
        
        <div className="mt-4 lg:mt-0">
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <UserPlus className="mr-2 h-4 w-4" />
                Nuevo Empleado
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[900px] max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Registrar Nuevo Empleado</DialogTitle>
                <DialogDescription>
                  Complete el formulario para registrar un nuevo empleado en el sistema.
                </DialogDescription>
              </DialogHeader>
              <EmpleadoForm onSuccess={() => setDialogOpen(false)} />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Tabs defaultValue="lista" className="w-full">
        <TabsList>
          <TabsTrigger value="lista">Lista de Empleados</TabsTrigger>
          <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
        </TabsList>
        
        <TabsContent value="lista" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Filtros de Búsqueda</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex w-full items-center space-x-2">
                  <Input
                    placeholder="Buscar por nombre o identificación"
                    value={busqueda}
                    onChange={(e) => setBusqueda(e.target.value)}
                    className="w-full"
                  />
                  <Button variant="outline" size="icon" onClick={() => console.log('Buscar:', busqueda)}>
                    <Search className="h-4 w-4" />
                  </Button>
                </div>
                
                <Select
                  value={filtros.department || ''}
                  onValueChange={(value) => handleFiltroChange('department', value || undefined)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Departamento" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Todos los departamentos</SelectItem>
                    <SelectItem value="Administración">Administración</SelectItem>
                    <SelectItem value="Finanzas">Finanzas</SelectItem>
                    <SelectItem value="Recursos Humanos">Recursos Humanos</SelectItem>
                    <SelectItem value="Tecnología">Tecnología</SelectItem>
                    <SelectItem value="Ventas">Ventas</SelectItem>
                  </SelectContent>
                </Select>
                
                <Select
                  value={filtros.contractStatus || ''}
                  onValueChange={(value) => handleFiltroChange('contractStatus', value || undefined)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Estado del Contrato" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Todos los estados</SelectItem>
                    <SelectItem value="active">Activo</SelectItem>
                    <SelectItem value="inactive">Inactivo</SelectItem>
                    <SelectItem value="on_leave">Permiso</SelectItem>
                    <SelectItem value="terminated">Terminado</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <Table>
                <TableCaption>Lista de empleados registrados en el sistema</TableCaption>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Nombre</TableHead>
                    <TableHead>Identificación</TableHead>
                    <TableHead>Cargo</TableHead>
                    <TableHead>Departamento</TableHead>
                    <TableHead>Fecha Ingreso</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-8">
                        <div className="flex justify-center">
                          <Loader2 className="h-8 w-8 animate-spin text-primary" />
                        </div>
                        <p className="mt-2 text-muted-foreground">Cargando empleados...</p>
                      </TableCell>
                    </TableRow>
                  ) : isError ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-8 text-destructive">
                        <p>Error al cargar los empleados: {error?.message || 'Error desconocido'}</p>
                      </TableCell>
                    </TableRow>
                  ) : data?.empleados?.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-8">
                        <p className="text-muted-foreground">No hay empleados registrados</p>
                        <Button 
                          variant="outline" 
                          className="mt-4"
                          onClick={() => setDialogOpen(true)}
                        >
                          <UserPlus className="mr-2 h-4 w-4" />
                          Registrar Empleado
                        </Button>
                      </TableCell>
                    </TableRow>
                  ) : (
                    data?.empleados?.map((empleado: any) => (
                      <TableRow key={empleado.id}>
                        <TableCell className="font-medium">{empleado.id}</TableCell>
                        <TableCell>{empleado.fullName || 'N/A'}</TableCell>
                        <TableCell>{empleado.identification || 'N/A'}</TableCell>
                        <TableCell>{empleado.position}</TableCell>
                        <TableCell>{empleado.department}</TableCell>
                        <TableCell>{formatFecha(empleado.hireDate)}</TableCell>
                        <TableCell>{getEstadoContractoBadge(empleado.contractStatus)}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end space-x-1">
                            <Button variant="ghost" size="icon">
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon">
                              <FileEdit className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
              
              {data?.pagination && data.pagination.totalPages > 1 && (
                <div className="flex justify-between items-center mt-4">
                  <div className="text-sm text-muted-foreground">
                    Mostrando {data.pagination.page * data.pagination.pageSize - data.pagination.pageSize + 1} 
                    - {Math.min(data.pagination.page * data.pagination.pageSize, data.pagination.totalItems)} 
                    {' '}de {data.pagination.totalItems} empleados
                  </div>
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => cambiarPagina(data.pagination.page - 1)}
                      disabled={data.pagination.page === 1}
                    >
                      Anterior
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => cambiarPagina(data.pagination.page + 1)}
                      disabled={data.pagination.page === data.pagination.totalPages}
                    >
                      Siguiente
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="dashboard">
          <Card>
            <CardHeader>
              <CardTitle>Dashboard de Empleados</CardTitle>
              <CardDescription>
                Vista general de empleados por departamento y estado
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">Total de Empleados</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold">
                      {data?.pagination?.totalItems || 0}
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">Empleados Activos</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-green-600">
                      {data?.empleados?.filter((e: any) => e.contractStatus === 'active').length || 0}
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">Departamentos</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold">
                      {new Set(data?.empleados?.map((e: any) => e.department)).size || 0}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}