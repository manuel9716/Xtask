/**
 * Vista de Lista de Capacitaciones
 * Muestra una lista paginada de capacitaciones con opciones de filtrado y acciones
 */

import React, { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious
} from "@/components/ui/pagination";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";

import { Capacitacion, EstadoCapacitacion, TipoCapacitacion } from "../../domain/entities/Capacitacion";
import { CapacitacionesApi } from "../../infrastructure/api/capacitacionesApi";
import { ListarCapacitacionesUseCase } from "../../application/useCases/capacitaciones/listarCapacitaciones";
import { EliminarCapacitacionUseCase } from "../../application/useCases/capacitaciones/eliminarCapacitacion";
import { CapacitacionModal } from "../components/CapacitacionModal";
import {
  Search,
  Filter,
  Calendar,
  Trash2,
  Edit,
  MoreHorizontal,
  RefreshCw,
  FileText,
  Users,
  DollarSign,
  Clock,
  MapPin,
  GraduationCap,
  X
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";

// Configuraciones por defecto
const PAGE_SIZE = 6;

export const ListaCapacitaciones: React.FC = () => {
  const { toast } = useToast();
  const capacitacionesApi = new CapacitacionesApi();
  const listarCapacitacionesUseCase = new ListarCapacitacionesUseCase(capacitacionesApi);
  const eliminarCapacitacionUseCase = new EliminarCapacitacionUseCase(capacitacionesApi);
  
  // Estados
  const [pagina, setPagina] = useState(1);
  const [filtros, setFiltros] = useState<any>({});
  const [filtrosAplicados, setFiltrosAplicados] = useState<any>({});
  const [mostrarFiltros, setMostrarFiltros] = useState(false);
  const [capacitacionAEliminar, setCapacitacionAEliminar] = useState<Capacitacion | null>(null);
  const [capacitacionEditar, setCapacitacionEditar] = useState<Capacitacion | null>(null);
  const [busqueda, setBusqueda] = useState("");
  
  // Consulta para obtener capacitaciones
  const { 
    data: resultadoCapacitaciones, 
    isLoading, 
    isError,
    refetch 
  } = useQuery({
    queryKey: ['/api/recursos-humanos/capacitaciones', pagina, filtrosAplicados],
    queryFn: () => listarCapacitacionesUseCase.execute(filtrosAplicados, { page: pagina, pageSize: PAGE_SIZE }),
  });
  
  // Mutación para eliminar capacitación
  const eliminarMutation = useMutation({
    mutationFn: (id: number) => eliminarCapacitacionUseCase.execute(id),
    onSuccess: () => {
      toast({
        title: "Capacitación eliminada",
        description: "La capacitación ha sido eliminada correctamente",
      });
      refetch();
      setCapacitacionAEliminar(null);
    },
    onError: (error) => {
      toast({
        title: "Error al eliminar",
        description: error instanceof Error ? error.message : "Ha ocurrido un error al eliminar la capacitación",
        variant: "destructive",
      });
    },
  });
  
  // Función para aplicar filtros
  const aplicarFiltros = () => {
    setFiltrosAplicados({...filtros});
    setPagina(1);
    setMostrarFiltros(false);
  };
  
  // Función para limpiar filtros
  const limpiarFiltros = () => {
    setFiltros({});
    setFiltrosAplicados({});
    setPagina(1);
    setMostrarFiltros(false);
  };
  
  // Función para manejar búsqueda
  const manejarBusqueda = (e: React.FormEvent) => {
    e.preventDefault();
    setFiltrosAplicados({
      ...filtrosAplicados,
      titulo: busqueda
    });
    setPagina(1);
  };
  
  // Función para confirmar eliminación
  const confirmarEliminacion = () => {
    if (capacitacionAEliminar) {
      eliminarMutation.mutate(capacitacionAEliminar.id);
    }
  };
  
  // Función para formatear fecha
  const formatearFecha = (fecha?: Date) => {
    if (!fecha) return "N/A";
    
    return new Intl.DateTimeFormat("es-ES", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric"
    }).format(fecha);
  };
  
  // Obtener badge para estado de capacitación
  const getBadgeEstadoCapacitacion = (estado: string) => {
    switch (estado) {
      case EstadoCapacitacion.PLANIFICADA:
        return <Badge className="bg-blue-500 hover:bg-blue-500">Planificada</Badge>;
      case EstadoCapacitacion.EN_CURSO:
        return <Badge className="bg-green-500 hover:bg-green-500">En Curso</Badge>;
      case EstadoCapacitacion.COMPLETADA:
        return <Badge className="bg-purple-500 hover:bg-purple-500">Completada</Badge>;
      case EstadoCapacitacion.CANCELADA:
        return <Badge variant="destructive">Cancelada</Badge>;
      case EstadoCapacitacion.POSPUESTA:
        return <Badge className="bg-amber-500 hover:bg-amber-500">Pospuesta</Badge>;
      default:
        return <Badge variant="outline">{estado}</Badge>;
    }
  };
  
  // Renderizar esqueletos de carga
  const renderizarEsqueletos = () => (
    <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
      {Array(6).fill(0).map((_, i) => (
        <Skeleton key={i} className="h-[300px]" />
      ))}
    </div>
  );
  
  // Renderizar mensaje de error
  const renderizarError = () => (
    <Card>
      <CardContent className="pt-6 text-center">
        <p className="text-destructive mb-4">Error al cargar las capacitaciones.</p>
        <Button onClick={() => refetch()} variant="outline">
          <RefreshCw className="mr-2 h-4 w-4" />
          Reintentar
        </Button>
      </CardContent>
    </Card>
  );
  
  // Renderizar mensaje de no hay resultados
  const renderizarSinResultados = () => (
    <Card>
      <CardContent className="pt-6 text-center">
        <p className="text-muted-foreground mb-4">No se encontraron capacitaciones.</p>
        {Object.keys(filtrosAplicados).length > 0 && (
          <Button onClick={limpiarFiltros} variant="outline">
            <X className="mr-2 h-4 w-4" />
            Limpiar filtros
          </Button>
        )}
      </CardContent>
    </Card>
  );
  
  return (
    <>
      <div className="space-y-4">
        {/* Barra de búsqueda y filtros */}
        <div className="flex flex-col sm:flex-row justify-between gap-4">
          <form onSubmit={manejarBusqueda} className="flex items-center space-x-2">
            <Input
              type="search"
              placeholder="Buscar capacitaciones..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              className="w-full sm:w-[300px]"
            />
            <Button type="submit" size="sm">
              <Search className="h-4 w-4" />
            </Button>
          </form>
          
          <Button onClick={() => setMostrarFiltros(true)} variant="outline" size="sm">
            <Filter className="mr-2 h-4 w-4" />
            Filtros
          </Button>
        </div>
        
        {/* Filtros aplicados */}
        {Object.keys(filtrosAplicados).length > 0 && (
          <div className="flex flex-wrap gap-2 text-sm">
            <span className="font-medium">Filtros aplicados:</span>
            {filtrosAplicados.titulo && (
              <Badge variant="secondary">
                Título: {filtrosAplicados.titulo}
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-4 w-4 ml-1"
                  onClick={() => {
                    const { titulo, ...rest } = filtrosAplicados;
                    setFiltrosAplicados(rest);
                    const { titulo: t, ...restFiltros } = filtros;
                    setFiltros(restFiltros);
                    setBusqueda("");
                  }}
                >
                  <X className="h-3 w-3" />
                </Button>
              </Badge>
            )}
            {filtrosAplicados.estado && (
              <Badge variant="secondary">
                Estado: {filtrosAplicados.estado}
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-4 w-4 ml-1"
                  onClick={() => {
                    const { estado, ...rest } = filtrosAplicados;
                    setFiltrosAplicados(rest);
                    const { estado: e, ...restFiltros } = filtros;
                    setFiltros(restFiltros);
                  }}
                >
                  <X className="h-3 w-3" />
                </Button>
              </Badge>
            )}
            {filtrosAplicados.tipo && (
              <Badge variant="secondary">
                Tipo: {filtrosAplicados.tipo}
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-4 w-4 ml-1"
                  onClick={() => {
                    const { tipo, ...rest } = filtrosAplicados;
                    setFiltrosAplicados(rest);
                    const { tipo: t, ...restFiltros } = filtros;
                    setFiltros(restFiltros);
                  }}
                >
                  <X className="h-3 w-3" />
                </Button>
              </Badge>
            )}
            <Button variant="ghost" size="sm" onClick={limpiarFiltros}>
              Limpiar todos
            </Button>
          </div>
        )}
        
        {/* Lista de capacitaciones */}
        {isLoading ? (
          renderizarEsqueletos()
        ) : isError ? (
          renderizarError()
        ) : resultadoCapacitaciones?.data.length === 0 ? (
          renderizarSinResultados()
        ) : (
          <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
            {resultadoCapacitaciones?.data.map((capacitacion) => (
              <Card key={capacitacion.id} className="overflow-hidden">
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="line-clamp-2">{capacitacion.titulo}</CardTitle>
                      <CardDescription className="line-clamp-1">
                        <GraduationCap className="inline h-4 w-4 mr-1" />
                        {capacitacion.tipo}
                      </CardDescription>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-5 w-5" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => setCapacitacionEditar(capacitacion)}>
                          <Edit className="mr-2 h-4 w-4" />
                          Editar
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => console.log("Ver detalles")}>
                          <FileText className="mr-2 h-4 w-4" />
                          Ver detalles
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem 
                          onClick={() => setCapacitacionAEliminar(capacitacion)}
                          className="text-red-600"
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Eliminar
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                  <div className="mt-2">
                    {getBadgeEstadoCapacitacion(capacitacion.estado)}
                  </div>
                </CardHeader>
                <CardContent className="pb-2">
                  <div className="space-y-2 text-sm">
                    <p className="line-clamp-2 text-muted-foreground">
                      {capacitacion.descripcion}
                    </p>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 mr-1 text-muted-foreground" />
                        <span>{formatearFecha(capacitacion.fechaInicio)}</span>
                      </div>
                      <div className="flex items-center">
                        <Clock className="h-4 w-4 mr-1 text-muted-foreground" />
                        <span>{capacitacion.duracionHoras}h</span>
                      </div>
                      <div className="flex items-center">
                        <MapPin className="h-4 w-4 mr-1 text-muted-foreground" />
                        <span className="truncate">{capacitacion.ubicacion || capacitacion.modalidad}</span>
                      </div>
                      <div className="flex items-center">
                        <DollarSign className="h-4 w-4 mr-1 text-muted-foreground" />
                        <span>${capacitacion.costo?.toLocaleString('es-ES') || '0'}</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between pt-2">
                  <div className="flex items-center text-sm">
                    <Users className="h-4 w-4 mr-1 text-muted-foreground" />
                    <span>{capacitacion.empleadosIds?.length || 0} participantes</span>
                  </div>
                  <Button variant="outline" size="sm">
                    Ver Detalles
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
        
        {/* Paginación */}
        {!isLoading && !isError && resultadoCapacitaciones?.data.length !== 0 && resultadoCapacitaciones?.totalPages > 1 && (
          <div className="flex justify-center mt-6">
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious 
                    onClick={() => setPagina(p => Math.max(1, p - 1))}
                    aria-disabled={pagina === 1}
                    className={pagina === 1 ? "pointer-events-none opacity-50" : ""}
                  />
                </PaginationItem>
                
                {Array.from({ length: resultadoCapacitaciones.totalPages }, (_, i) => i + 1).map(p => {
                  // Mostrar primera, última y páginas cercanas a la actual
                  if (p === 1 || p === resultadoCapacitaciones.totalPages || (p >= pagina - 1 && p <= pagina + 1)) {
                    return (
                      <PaginationItem key={p}>
                        <PaginationLink 
                          isActive={p === pagina}
                          onClick={() => setPagina(p)}
                        >
                          {p}
                        </PaginationLink>
                      </PaginationItem>
                    );
                  }
                  
                  // Mostrar puntos suspensivos para páginas omitidas
                  if (p === 2 || p === resultadoCapacitaciones.totalPages - 1) {
                    return (
                      <PaginationItem key={p}>
                        <PaginationEllipsis />
                      </PaginationItem>
                    );
                  }
                  
                  return null;
                })}
                
                <PaginationItem>
                  <PaginationNext 
                    onClick={() => setPagina(p => Math.min(resultadoCapacitaciones.totalPages, p + 1))}
                    aria-disabled={pagina === resultadoCapacitaciones.totalPages}
                    className={pagina === resultadoCapacitaciones.totalPages ? "pointer-events-none opacity-50" : ""}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        )}
      </div>
      
      {/* Modal de filtros */}
      <Dialog open={mostrarFiltros} onOpenChange={setMostrarFiltros}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Filtrar capacitaciones</DialogTitle>
            <DialogDescription>
              Aplica filtros para encontrar capacitaciones específicas.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="estado" className="text-right">
                Estado
              </label>
              <Select 
                value={filtros.estado || ""}
                onValueChange={(value) => 
                  setFiltros(prev => ({...prev, estado: value || undefined}))
                }
              >
                <SelectTrigger id="estado" className="col-span-3">
                  <SelectValue placeholder="Selecciona estado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Todos</SelectItem>
                  <SelectItem value={EstadoCapacitacion.PLANIFICADA}>Planificada</SelectItem>
                  <SelectItem value={EstadoCapacitacion.EN_CURSO}>En Curso</SelectItem>
                  <SelectItem value={EstadoCapacitacion.COMPLETADA}>Completada</SelectItem>
                  <SelectItem value={EstadoCapacitacion.CANCELADA}>Cancelada</SelectItem>
                  <SelectItem value={EstadoCapacitacion.POSPUESTA}>Pospuesta</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="tipo" className="text-right">
                Tipo
              </label>
              <Select 
                value={filtros.tipo || ""}
                onValueChange={(value) => 
                  setFiltros(prev => ({...prev, tipo: value || undefined}))
                }
              >
                <SelectTrigger id="tipo" className="col-span-3">
                  <SelectValue placeholder="Selecciona tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Todos</SelectItem>
                  <SelectItem value={TipoCapacitacion.TECNICA}>Técnica</SelectItem>
                  <SelectItem value={TipoCapacitacion.HABILIDADES_BLANDAS}>Habilidades Blandas</SelectItem>
                  <SelectItem value={TipoCapacitacion.INDUCCION}>Inducción</SelectItem>
                  <SelectItem value={TipoCapacitacion.SEGURIDAD}>Seguridad</SelectItem>
                  <SelectItem value={TipoCapacitacion.NORMATIVA}>Normativa/Compliance</SelectItem>
                  <SelectItem value={TipoCapacitacion.LIDERAZGO}>Liderazgo</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="fechaDesde" className="text-right">
                Fecha desde
              </label>
              <Input
                id="fechaDesde"
                type="date"
                className="col-span-3"
                value={filtros.fechaDesde || ""}
                onChange={(e) =>
                  setFiltros(prev => ({
                    ...prev,
                    fechaDesde: e.target.value || undefined
                  }))
                }
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="fechaHasta" className="text-right">
                Fecha hasta
              </label>
              <Input
                id="fechaHasta"
                type="date"
                className="col-span-3"
                value={filtros.fechaHasta || ""}
                onChange={(e) =>
                  setFiltros(prev => ({
                    ...prev,
                    fechaHasta: e.target.value || undefined
                  }))
                }
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={limpiarFiltros}>Limpiar</Button>
            <Button onClick={aplicarFiltros}>Aplicar filtros</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Modal de confirmación de eliminación */}
      <Dialog open={!!capacitacionAEliminar} onOpenChange={(open) => !open && setCapacitacionAEliminar(null)}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Confirmar eliminación</DialogTitle>
            <DialogDescription>
              ¿Estás seguro de que deseas eliminar esta capacitación? Esta acción no se puede deshacer.
            </DialogDescription>
          </DialogHeader>
          {capacitacionAEliminar && (
            <div className="py-4">
              <p className="font-medium">{capacitacionAEliminar.titulo}</p>
              <p className="text-sm text-muted-foreground">
                Estado: {capacitacionAEliminar.estado} | Fecha: {formatearFecha(capacitacionAEliminar.fechaInicio)}
              </p>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setCapacitacionAEliminar(null)}>
              Cancelar
            </Button>
            <Button 
              variant="destructive" 
              onClick={confirmarEliminacion}
              disabled={eliminarMutation.isPending}
            >
              {eliminarMutation.isPending ? (
                <>
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  Eliminando...
                </>
              ) : (
                <>
                  <Trash2 className="mr-2 h-4 w-4" />
                  Eliminar
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Modal de edición */}
      {capacitacionEditar && (
        <CapacitacionModal
          open={!!capacitacionEditar}
          onOpenChange={(open) => !open && setCapacitacionEditar(null)}
          capacitacion={capacitacionEditar}
          onSuccess={() => {
            refetch();
            setCapacitacionEditar(null);
          }}
        />
      )}
    </>
  );
};