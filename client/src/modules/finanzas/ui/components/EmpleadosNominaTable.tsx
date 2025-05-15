import { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Loader2, 
  FileEdit, 
  Eye, 
  Search, 
  FilterX,
  ChevronsLeft, 
  ChevronsRight,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import { useEmpleadosNomina } from "../../../nomina/application/useEmpleadosNomina";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { formatCurrency } from '@/lib/utils';

export default function EmpleadosNominaTable() {
  const [filtros, setFiltros] = useState({
    page: 1,
    pageSize: 10,
    search: '',
    department: '',
    contractStatus: ''
  });
  
  const { data, isLoading, isError } = useEmpleadosNomina(filtros);
  
  // Función para actualizar los filtros
  const actualizarFiltros = (key: string, value: string | number) => {
    setFiltros(prev => ({
      ...prev,
      [key]: value,
      // Resetear la página al aplicar nuevos filtros
      ...(key !== 'page' ? { page: 1 } : {})
    }));
  };
  
  // Limpiar todos los filtros
  const limpiarFiltros = () => {
    setFiltros({
      page: 1,
      pageSize: 10,
      search: '',
      department: '',
      contractStatus: ''
    });
  };
  
  // Renderizar estado del contrato como badge
  const renderEstadoContrato = (estado: string) => {
    switch (estado) {
      case 'active':
        return <Badge className="bg-green-500 hover:bg-green-600">Activo</Badge>;
      case 'on_leave':
        return <Badge className="bg-yellow-500 hover:bg-yellow-600">Licencia</Badge>;
      case 'suspended':
        return <Badge className="bg-orange-500 hover:bg-orange-600">Suspendido</Badge>;
      case 'terminated':
        return <Badge className="bg-red-500 hover:bg-red-600">Terminado</Badge>;
      default:
        return <Badge>{estado}</Badge>;
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2 text-lg text-muted-foreground">Cargando empleados...</span>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <h3 className="text-lg font-semibold">Error al cargar los empleados</h3>
        <p className="text-muted-foreground mb-4">
          No se pudieron cargar los datos. Por favor, inténtelo de nuevo.
        </p>
        <Button onClick={() => window.location.reload()} variant="outline">
          Reintentar
        </Button>
      </div>
    );
  }

  // Control de navegación de páginas
  const handlePageChange = (newPage: number) => {
    const totalPages = data?.totalPages || 1;
    if (newPage > 0 && newPage <= totalPages) {
      actualizarFiltros('page', newPage);
    }
  };

  // Componente de filtros
  const FiltrosComponent = () => (
    <div className="mb-4 flex flex-col sm:flex-row gap-4">
      <div className="flex-1 relative">
        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Buscar por nombre o identificación"
          value={filtros.search}
          onChange={(e) => actualizarFiltros('search', e.target.value)}
          className="pl-8"
        />
      </div>
      
      <Select
        value={filtros.department}
        onValueChange={(value) => actualizarFiltros('department', value)}
      >
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Departamento" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="">Todos</SelectItem>
          <SelectItem value="Tecnología">Tecnología</SelectItem>
          <SelectItem value="Administración">Administración</SelectItem>
          <SelectItem value="Ventas">Ventas</SelectItem>
          <SelectItem value="Recursos Humanos">Recursos Humanos</SelectItem>
        </SelectContent>
      </Select>
      
      <Select
        value={filtros.contractStatus}
        onValueChange={(value) => actualizarFiltros('contractStatus', value)}
      >
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Estado" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="">Todos</SelectItem>
          <SelectItem value="active">Activo</SelectItem>
          <SelectItem value="on_leave">Licencia</SelectItem>
          <SelectItem value="suspended">Suspendido</SelectItem>
          <SelectItem value="terminated">Terminado</SelectItem>
        </SelectContent>
      </Select>
      
      <Button 
        variant="outline" 
        onClick={limpiarFiltros}
        className="shrink-0"
      >
        <FilterX className="mr-2 h-4 w-4" />
        Limpiar
      </Button>
    </div>
  );

  // Componente de paginación
  const PaginacionComponent = () => {
    const currentPage = data?.currentPage || 1;
    const totalPages = data?.totalPages || 1;
    
    return (
      <div className="flex items-center justify-between mt-4">
        <div className="text-sm text-muted-foreground">
          Mostrando {data?.data.length || 0} de {data?.total || 0} empleados
        </div>
        
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="icon"
            onClick={() => handlePageChange(1)}
            disabled={currentPage === 1}
          >
            <ChevronsLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          
          <span className="text-sm">
            Página {currentPage} de {totalPages}
          </span>
          
          <Button
            variant="outline"
            size="icon"
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={() => handlePageChange(totalPages)}
            disabled={currentPage === totalPages}
          >
            <ChevronsRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    );
  };

  if (!data || data.data.length === 0) {
    return (
      <div>
        <FiltrosComponent />
        <div className="text-center py-8 border rounded-md">
          <p className="text-muted-foreground">No se encontraron empleados con los filtros seleccionados.</p>
          {(filtros.search || filtros.department || filtros.contractStatus) && (
            <Button onClick={limpiarFiltros} variant="outline" className="mt-4">
              <FilterX className="mr-2 h-4 w-4" />
              Limpiar filtros
            </Button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div>
      <FiltrosComponent />
      
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nombre</TableHead>
              <TableHead>Puesto</TableHead>
              <TableHead>Departamento</TableHead>
              <TableHead>Salario</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead>Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.data.map((empleado) => (
              <TableRow key={empleado.id}>
                <TableCell className="font-medium">
                  {empleado.firstName} {empleado.lastName}
                </TableCell>
                <TableCell>{empleado.position || 'No definido'}</TableCell>
                <TableCell>{empleado.department || 'No asignado'}</TableCell>
                <TableCell>{formatCurrency(Number(empleado.salary) || 0)}</TableCell>
                <TableCell>{renderEstadoContrato(empleado.contractStatus || 'active')}</TableCell>
                <TableCell>
                  <div className="flex space-x-2">
                    <Button size="sm" variant="ghost" title="Ver detalles" onClick={() => window.location.href = `/nomina/empleados/${empleado.id}`}>
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button size="sm" variant="ghost" title="Editar" onClick={() => window.location.href = `/nomina/empleados/editar/${empleado.id}`}>
                      <FileEdit className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      
      <PaginacionComponent />
    </div>
  );
}