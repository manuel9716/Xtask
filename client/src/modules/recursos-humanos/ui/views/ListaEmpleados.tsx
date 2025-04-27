import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useLocation } from 'wouter';
import { 
  Users, 
  Plus, 
  Search, 
  Filter, 
  Loader2, 
  ChevronLeft, 
  ChevronRight, 
  RefreshCcw,
  AlertCircle,
  Download
} from 'lucide-react';
import { obtenerEmpleados } from '../../infrastructure/api/empleadosApi';
import { FiltrosEmpleadoRRHH, EstadoEmpleado } from '../../domain/entities/Empleado';
import { EmpleadoCard } from '../components/EmpleadoCard';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';

export default function ListaEmpleados() {
  // Estado para paginación y filtros
  const [pagina, setPagina] = useState(1);
  const [porPagina, setPorPagina] = useState(10);
  const [filtros, setFiltros] = useState<FiltrosEmpleadoRRHH>({});
  const [busquedaNombre, setBusquedaNombre] = useState('');
  const [filtroDepartamento, setFiltroDepartamento] = useState<string | undefined>(undefined);
  const [filtroEstado, setFiltroEstado] = useState<EstadoEmpleado | undefined>(undefined);
  const [, setLocation] = useLocation();

  // Lista de departamentos para el filtro
  const departamentos = [
    'Tecnología', 
    'Ventas', 
    'Marketing', 
    'Finanzas', 
    'Recursos Humanos', 
    'Operaciones', 
    'Legal', 
    'Administrativo'
  ];

  // Consulta para obtener empleados
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['/api/recursos-humanos/empleados', pagina, porPagina, filtros],
    queryFn: () => obtenerEmpleados(filtros, pagina, porPagina),
  });

  // Función para aplicar filtros
  const aplicarFiltros = () => {
    const nuevosFiltros: FiltrosEmpleadoRRHH = {};
    
    if (busquedaNombre) {
      nuevosFiltros.nombre = busquedaNombre;
    }
    
    if (filtroDepartamento) {
      nuevosFiltros.departamento = filtroDepartamento;
    }
    
    if (filtroEstado) {
      nuevosFiltros.estado = filtroEstado;
    }
    
    setFiltros(nuevosFiltros);
    setPagina(1); // Resetear a primera página al filtrar
  };

  // Función para limpiar filtros
  const limpiarFiltros = () => {
    setBusquedaNombre('');
    setFiltroDepartamento(undefined);
    setFiltroEstado(undefined);
    setFiltros({});
    setPagina(1);
  };

  // Función para renderizar la paginación
  const renderPaginacion = () => {
    if (!data || data.total === 0) return null;

    const totalPaginas = data.totalPaginas;
    
    return (
      <Pagination className="mt-8">
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious 
              onClick={() => setPagina(p => Math.max(1, p - 1))}
              disabled={pagina === 1} 
            />
          </PaginationItem>
          
          {Array.from({ length: totalPaginas }, (_, i) => i + 1)
            .filter(p => p === 1 || p === totalPaginas || (p >= pagina - 1 && p <= pagina + 1))
            .map((p, i, arr) => {
              // Mostrar elipsis si hay saltos
              if (i > 0 && p > arr[i - 1] + 1) {
                return (
                  <PaginationItem key={`ellipsis-${p}`}>
                    <PaginationEllipsis />
                  </PaginationItem>
                );
              }
              
              return (
                <PaginationItem key={p}>
                  <PaginationLink 
                    isActive={pagina === p}
                    onClick={() => setPagina(p)}
                  >
                    {p}
                  </PaginationLink>
                </PaginationItem>
              );
            })}
          
          <PaginationItem>
            <PaginationNext 
              onClick={() => setPagina(p => Math.min(totalPaginas, p + 1))}
              disabled={pagina === totalPaginas} 
            />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    );
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Users className="h-6 w-6 text-primary" />
          <h1 className="text-2xl font-bold">Empleados</h1>
        </div>
        
        <Button 
          onClick={() => setLocation('/admin/recursos-humanos/empleados/nuevo')}
          className="flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          <span>Nuevo Empleado</span>
        </Button>
      </div>

      {/* Filtros */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg font-medium">Filtros de búsqueda</CardTitle>
          <CardDescription>Busca y filtra los empleados según diferentes criterios</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Nombre o apellido</label>
              <div className="flex">
                <Input
                  placeholder="Buscar por nombre..."
                  value={busquedaNombre}
                  onChange={(e) => setBusquedaNombre(e.target.value)}
                  className="rounded-r-none"
                />
                <Button 
                  variant="default" 
                  size="icon" 
                  className="rounded-l-none"
                  onClick={aplicarFiltros}
                >
                  <Search className="h-4 w-4" />
                </Button>
              </div>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Departamento</label>
              <Select value={filtroDepartamento} onValueChange={setFiltroDepartamento}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar departamento" />
                </SelectTrigger>
                <SelectContent>
                  {departamentos.map(depto => (
                    <SelectItem key={depto} value={depto}>{depto}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Estado</label>
              <Select 
                value={filtroEstado} 
                onValueChange={(value) => setFiltroEstado(value as EstadoEmpleado)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar estado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={EstadoEmpleado.ACTIVO}>Activo</SelectItem>
                  <SelectItem value={EstadoEmpleado.INACTIVO}>Inactivo</SelectItem>
                  <SelectItem value={EstadoEmpleado.VACACIONES}>En vacaciones</SelectItem>
                  <SelectItem value={EstadoEmpleado.PERMISO}>Con permiso</SelectItem>
                  <SelectItem value={EstadoEmpleado.BAJA_MEDICA}>Baja médica</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between pt-0">
          <Button variant="outline" onClick={limpiarFiltros}>
            Limpiar filtros
          </Button>
          <Button onClick={aplicarFiltros}>
            <Filter className="h-4 w-4 mr-2" />
            Aplicar filtros
          </Button>
        </CardFooter>
      </Card>

      {/* Estado de carga */}
      {isLoading && (
        <div className="flex justify-center items-center py-12">
          <Loader2 className="h-8 w-8 text-primary animate-spin" />
          <span className="ml-2 text-lg">Cargando empleados...</span>
        </div>
      )}

      {/* Estado de error */}
      {isError && !isLoading && (
        <Card className="border-destructive">
          <CardHeader className="pb-3">
            <div className="flex items-center">
              <AlertCircle className="h-5 w-5 text-destructive mr-2" />
              <CardTitle className="text-lg font-medium">Error al cargar empleados</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              No se pudieron cargar los datos de empleados. Por favor, intenta nuevamente.
            </p>
          </CardContent>
          <CardFooter>
            <Button variant="outline" onClick={() => refetch()}>
              <RefreshCcw className="h-4 w-4 mr-2" />
              Reintentar
            </Button>
          </CardFooter>
        </Card>
      )}

      {/* Sin resultados */}
      {!isLoading && !isError && data && data.total === 0 && (
        <Card className="border-dashed border-muted">
          <CardHeader className="pb-3 text-center">
            <CardTitle className="text-lg font-medium">No se encontraron empleados</CardTitle>
          </CardHeader>
          <CardContent className="text-center pb-6">
            <p className="text-muted-foreground">
              No hay empleados que coincidan con los criterios de búsqueda.
            </p>
            {Object.keys(filtros).length > 0 && (
              <Button 
                variant="link" 
                onClick={limpiarFiltros}
                className="mt-2"
              >
                Limpiar filtros para ver todos los empleados
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      {/* Lista de empleados */}
      {!isLoading && !isError && data && data.total > 0 && (
        <>
          <div className="flex justify-between items-center">
            <div className="text-sm text-muted-foreground">
              Mostrando {data.empleados.length} de {data.total} empleados
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Exportar
              </Button>
              <Select 
                value={porPagina.toString()} 
                onValueChange={(value) => {
                  setPorPagina(Number(value));
                  setPagina(1);
                }}
              >
                <SelectTrigger className="w-[140px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="5">5 por página</SelectItem>
                  <SelectItem value="10">10 por página</SelectItem>
                  <SelectItem value="25">25 por página</SelectItem>
                  <SelectItem value="50">50 por página</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {data.empleados.map((empleado) => (
              <EmpleadoCard 
                key={empleado.id} 
                empleado={empleado} 
                onSelect={() => setLocation(`/admin/recursos-humanos/empleados/${empleado.id}`)}
              />
            ))}
          </div>

          {renderPaginacion()}
        </>
      )}
    </div>
  );
}