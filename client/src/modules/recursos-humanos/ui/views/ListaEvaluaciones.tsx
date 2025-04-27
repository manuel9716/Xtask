/**
 * Vista de Lista de Evaluaciones
 * Muestra una lista paginada de evaluaciones con opciones de filtrado y acciones
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
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

import { Evaluacion, TipoEvaluacion } from "../../domain/entities/Evaluacion";
import { EvaluacionesApi } from "../../infrastructure/api/evaluacionesApi";
import { ListarEvaluacionesUseCase } from "../../application/useCases/evaluaciones/listarEvaluaciones";
import { EliminarEvaluacionUseCase } from "../../application/useCases/evaluaciones/eliminarEvaluacion";
import { EvaluacionModal } from "../components/EvaluacionModal";
import {
  Search,
  Filter,
  Calendar,
  Trash2,
  Edit,
  MoreHorizontal,
  RefreshCw,
  FileText,
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
const PAGE_SIZE = 10;

export const ListaEvaluaciones: React.FC = () => {
  const { toast } = useToast();
  const evaluacionesApi = new EvaluacionesApi();
  const listarEvaluacionesUseCase = new ListarEvaluacionesUseCase(evaluacionesApi);
  const eliminarEvaluacionUseCase = new EliminarEvaluacionUseCase(evaluacionesApi);
  
  // Estados
  const [pagina, setPagina] = useState(1);
  const [filtros, setFiltros] = useState<any>({});
  const [filtrosAplicados, setFiltrosAplicados] = useState<any>({});
  const [mostrarFiltros, setMostrarFiltros] = useState(false);
  const [evaluacionAEliminar, setEvaluacionAEliminar] = useState<Evaluacion | null>(null);
  const [evaluacionEditar, setEvaluacionEditar] = useState<Evaluacion | null>(null);
  const [busqueda, setBusqueda] = useState("");
  
  // Consulta para obtener evaluaciones
  const { 
    data: resultadoEvaluaciones, 
    isLoading, 
    isError,
    refetch 
  } = useQuery({
    queryKey: ['/api/recursos-humanos/evaluaciones', pagina, filtrosAplicados],
    queryFn: () => listarEvaluacionesUseCase.execute(filtrosAplicados, { page: pagina, pageSize: PAGE_SIZE }),
  });
  
  // Mutación para eliminar evaluación
  const eliminarMutation = useMutation({
    mutationFn: (id: number) => eliminarEvaluacionUseCase.execute(id),
    onSuccess: () => {
      toast({
        title: "Evaluación eliminada",
        description: "La evaluación ha sido eliminada correctamente",
      });
      refetch();
      setEvaluacionAEliminar(null);
    },
    onError: (error) => {
      toast({
        title: "Error al eliminar",
        description: error instanceof Error ? error.message : "Ha ocurrido un error al eliminar la evaluación",
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
    if (evaluacionAEliminar) {
      eliminarMutation.mutate(evaluacionAEliminar.id);
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
  
  // Obtener badge para tipo de evaluación
  const getBadgeTipoEvaluacion = (tipo: string) => {
    switch (tipo) {
      case TipoEvaluacion.RENDIMIENTO:
        return <Badge className="bg-blue-500 hover:bg-blue-500">Rendimiento</Badge>;
      case TipoEvaluacion.OBJETIVOS:
        return <Badge className="bg-green-500 hover:bg-green-500">Objetivos</Badge>;
      case TipoEvaluacion.COMPETENCIAS:
        return <Badge className="bg-purple-500 hover:bg-purple-500">Competencias</Badge>;
      case TipoEvaluacion.PERIODO_PRUEBA:
        return <Badge className="bg-amber-500 hover:bg-amber-500">Período de Prueba</Badge>;
      default:
        return <Badge variant="outline">{tipo}</Badge>;
    }
  };
  
  // Renderizar indicador de calificación por estrellas
  const renderizarCalificacion = (calificacion: number) => {
    // Mostrar estrellas según calificación (redondeada a 0.5)
    const estrellas = Math.round(calificacion * 2) / 2;
    return (
      <div className="flex items-center">
        {Array.from({ length: 5 }).map((_, i) => (
          <span 
            key={i} 
            className={`text-lg ${i < Math.floor(estrellas) 
              ? 'text-amber-500' 
              : (i === Math.floor(estrellas) && estrellas % 1 !== 0) 
                ? 'text-amber-300' 
                : 'text-gray-300'}`}
          >
            ★
          </span>
        ))}
        <span className="ml-2 font-medium">{calificacion.toFixed(1)}</span>
      </div>
    );
  };
  
  // Renderizar esqueletos de carga
  const renderizarEsqueletos = () => (
    <div className="space-y-4">
      <div className="flex items-center space-x-4">
        <Skeleton className="h-4 w-[250px]" />
        <Skeleton className="h-4 w-[200px]" />
      </div>
      <Skeleton className="h-[300px] w-full" />
    </div>
  );
  
  // Renderizar mensaje de error
  const renderizarError = () => (
    <Card>
      <CardContent className="pt-6 text-center">
        <p className="text-destructive mb-4">Error al cargar las evaluaciones.</p>
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
        <p className="text-muted-foreground mb-4">No se encontraron evaluaciones.</p>
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
              placeholder="Buscar evaluaciones..."
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
            {filtrosAplicados.empleadoId && (
              <Badge variant="secondary">
                Empleado ID: {filtrosAplicados.empleadoId}
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-4 w-4 ml-1"
                  onClick={() => {
                    const { empleadoId, ...rest } = filtrosAplicados;
                    setFiltrosAplicados(rest);
                    const { empleadoId: e, ...restFiltros } = filtros;
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
        
        {/* Tabla de evaluaciones */}
        {isLoading ? (
          renderizarEsqueletos()
        ) : isError ? (
          renderizarError()
        ) : resultadoEvaluaciones?.data.length === 0 ? (
          renderizarSinResultados()
        ) : (
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Título</TableHead>
                    <TableHead>Empleado</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Fecha</TableHead>
                    <TableHead>Calificación</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {resultadoEvaluaciones?.data.map((evaluacion) => (
                    <TableRow key={evaluacion.id}>
                      <TableCell className="font-medium">{evaluacion.titulo}</TableCell>
                      <TableCell>
                        {evaluacion.empleadoNombre || `ID: ${evaluacion.empleadoId}`}
                      </TableCell>
                      <TableCell>{getBadgeTipoEvaluacion(evaluacion.tipo)}</TableCell>
                      <TableCell>{formatearFecha(evaluacion.fecha)}</TableCell>
                      <TableCell>{renderizarCalificacion(evaluacion.desempenoGeneral)}</TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
                              <span className="sr-only">Abrir menú</span>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => setEvaluacionEditar(evaluacion)}>
                              <Edit className="mr-2 h-4 w-4" />
                              Editar
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => console.log("Ver PDF")}>
                              <FileText className="mr-2 h-4 w-4" />
                              Ver PDF
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem 
                              onClick={() => setEvaluacionAEliminar(evaluacion)}
                              className="text-red-600"
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
            </CardContent>
            
            {/* Paginación */}
            {resultadoEvaluaciones && resultadoEvaluaciones.totalPages > 1 && (
              <CardFooter className="flex justify-center py-4">
                <Pagination>
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious 
                        onClick={() => setPagina(p => Math.max(1, p - 1))}
                        aria-disabled={pagina === 1}
                        className={pagina === 1 ? "pointer-events-none opacity-50" : ""}
                      />
                    </PaginationItem>
                    
                    {Array.from({ length: resultadoEvaluaciones.totalPages }, (_, i) => i + 1).map(p => {
                      // Mostrar primera, última y páginas cercanas a la actual
                      if (p === 1 || p === resultadoEvaluaciones.totalPages || (p >= pagina - 1 && p <= pagina + 1)) {
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
                      if (p === 2 || p === resultadoEvaluaciones.totalPages - 1) {
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
                        onClick={() => setPagina(p => Math.min(resultadoEvaluaciones.totalPages, p + 1))}
                        aria-disabled={pagina === resultadoEvaluaciones.totalPages}
                        className={pagina === resultadoEvaluaciones.totalPages ? "pointer-events-none opacity-50" : ""}
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              </CardFooter>
            )}
          </Card>
        )}
      </div>
      
      {/* Modal de filtros */}
      <Dialog open={mostrarFiltros} onOpenChange={setMostrarFiltros}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Filtrar evaluaciones</DialogTitle>
            <DialogDescription>
              Aplica filtros para encontrar evaluaciones específicas.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
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
                  <SelectItem value={TipoEvaluacion.RENDIMIENTO}>Rendimiento</SelectItem>
                  <SelectItem value={TipoEvaluacion.OBJETIVOS}>Objetivos</SelectItem>
                  <SelectItem value={TipoEvaluacion.COMPETENCIAS}>Competencias</SelectItem>
                  <SelectItem value={TipoEvaluacion.PERIODO_PRUEBA}>Período de Prueba</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="empleadoId" className="text-right">
                ID Empleado
              </label>
              <Input
                id="empleadoId"
                type="number"
                className="col-span-3"
                value={filtros.empleadoId || ""}
                onChange={(e) =>
                  setFiltros(prev => ({
                    ...prev,
                    empleadoId: e.target.value ? Number(e.target.value) : undefined
                  }))
                }
              />
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
      <Dialog open={!!evaluacionAEliminar} onOpenChange={(open) => !open && setEvaluacionAEliminar(null)}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Confirmar eliminación</DialogTitle>
            <DialogDescription>
              ¿Estás seguro de que deseas eliminar esta evaluación? Esta acción no se puede deshacer.
            </DialogDescription>
          </DialogHeader>
          {evaluacionAEliminar && (
            <div className="py-4">
              <p className="font-medium">{evaluacionAEliminar.titulo}</p>
              <p className="text-sm text-muted-foreground">
                Tipo: {evaluacionAEliminar.tipo} | Fecha: {formatearFecha(evaluacionAEliminar.fecha)}
              </p>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setEvaluacionAEliminar(null)}>
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
      {evaluacionEditar && (
        <EvaluacionModal
          open={!!evaluacionEditar}
          onOpenChange={(open) => !open && setEvaluacionEditar(null)}
          evaluacion={evaluacionEditar}
          onSuccess={() => {
            refetch();
            setEvaluacionEditar(null);
          }}
        />
      )}
    </>
  );
};