/**
 * Vista de Lista de Empleados
 * Muestra una lista paginada de empleados con opciones de filtrado y acciones
 */

import React, { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
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
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { EmpleadoCard } from "../components/EmpleadoCard";
import { EmpleadosApi } from "../../infrastructure/api/empleadosApi";
import { Empleado, EstadoEmpleado, FiltrosEmpleadoRRHH } from "../../domain/entities/Empleado";
import { ListarEmpleadosUseCase } from "../../application/useCases/empleados/listarEmpleados";
import { EliminarEmpleadoUseCase } from "../../application/useCases/empleados/eliminarEmpleado";
import { 
  Plus, 
  Search, 
  Filter, 
  X, 
  UserPlus,
  Download,
  RefreshCw,
  Trash2
} from "lucide-react";

// Configuraciones por defecto
const PAGE_SIZE = 10;

export const ListaEmpleados: React.FC = () => {
  const [location, navigate] = useLocation();
  const { toast } = useToast();
  const empleadosApi = new EmpleadosApi();
  const listarEmpleadosUseCase = new ListarEmpleadosUseCase(empleadosApi);
  const eliminarEmpleadoUseCase = new EliminarEmpleadoUseCase(empleadosApi);
  
  // Estados
  const [pagina, setPagina] = useState(1);
  const [filtros, setFiltros] = useState<FiltrosEmpleadoRRHH>({});
  const [filtrosAplicados, setFiltrosAplicados] = useState<FiltrosEmpleadoRRHH>({});
  const [mostrarFiltros, setMostrarFiltros] = useState(false);
  const [empleadoAEliminar, setEmpleadoAEliminar] = useState<Empleado | null>(null);
  const [busqueda, setBusqueda] = useState("");
  const [modoVisualizacion, setModoVisualizacion] = useState<"tarjetas" | "lista">("tarjetas");

  // Consulta para obtener empleados
  const { 
    data: resultadoEmpleados, 
    isLoading, 
    isError,
    refetch 
  } = useQuery({
    queryKey: ['/api/recursos-humanos/empleados', pagina, filtrosAplicados],
    queryFn: () => listarEmpleadosUseCase.execute(filtrosAplicados, { page: pagina, pageSize: PAGE_SIZE }),
  });

  // Mutación para eliminar empleado
  const eliminarMutation = useMutation({
    mutationFn: (id: number) => eliminarEmpleadoUseCase.execute(id, true),
    onSuccess: () => {
      toast({
        title: "Empleado eliminado",
        description: "El empleado ha sido desactivado correctamente",
      });
      refetch();
      setEmpleadoAEliminar(null);
    },
    onError: (error) => {
      toast({
        title: "Error al eliminar",
        description: error instanceof Error ? error.message : "Ha ocurrido un error al desactivar el empleado",
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
      nombre: busqueda
    });
    setPagina(1);
  };

  // Función para confirmar eliminación
  const confirmarEliminacion = () => {
    if (empleadoAEliminar) {
      eliminarMutation.mutate(empleadoAEliminar.id);
    }
  };

  // Renderizar esqueletos de carga
  const renderizarEsqueletos = () => {
    return Array(PAGE_SIZE).fill(0).map((_, index) => (
      <div key={index} className="space-y-2">
        <div className="flex items-center space-x-4">
          <Skeleton className="h-12 w-12 rounded-full" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-[150px]" />
            <Skeleton className="h-4 w-[100px]" />
          </div>
        </div>
        <Skeleton className="h-[125px] w-full" />
      </div>
    ));
  };

  // Renderizar mensaje de error
  const renderizarError = () => (
    <Card className="col-span-full">
      <CardContent className="pt-6 text-center">
        <p className="text-destructive mb-4">Error al cargar los empleados.</p>
        <Button onClick={() => refetch()} variant="outline">
          <RefreshCw className="mr-2 h-4 w-4" />
          Reintentar
        </Button>
      </CardContent>
    </Card>
  );

  // Renderizar mensaje de no hay resultados
  const renderizarSinResultados = () => (
    <Card className="col-span-full">
      <CardContent className="pt-6 text-center">
        <p className="text-muted-foreground mb-4">No se encontraron empleados.</p>
        {Object.keys(filtrosAplicados).length > 0 && (
          <Button onClick={limpiarFiltros} variant="outline">
            <X className="mr-2 h-4 w-4" />
            Limpiar filtros
          </Button>
        )}
      </CardContent>
    </Card>
  );

  // Renderizar paginación
  const renderizarPaginacion = () => {
    if (!resultadoEmpleados || resultadoEmpleados.totalPages <= 1) return null;

    return (
      <Pagination>
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious 
              onClick={() => setPagina(p => Math.max(1, p - 1))}
              aria-disabled={pagina === 1}
              className={pagina === 1 ? "pointer-events-none opacity-50" : ""}
            />
          </PaginationItem>
          
          {Array.from({ length: resultadoEmpleados.totalPages }, (_, i) => i + 1).map(p => {
            // Mostrar solo primera, última y páginas cercanas a la actual
            if (p === 1 || p === resultadoEmpleados.totalPages || (p >= pagina - 1 && p <= pagina + 1)) {
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
            if (p === 2 || p === resultadoEmpleados.totalPages - 1) {
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
              onClick={() => setPagina(p => Math.min(resultadoEmpleados.totalPages, p + 1))}
              aria-disabled={pagina === resultadoEmpleados.totalPages}
              className={pagina === resultadoEmpleados.totalPages ? "pointer-events-none opacity-50" : ""}
            />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    );
  };

  return (
    <>
      <div className="space-y-4">
        {/* Encabezado con acciones */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Empleados</h2>
            <p className="text-muted-foreground">
              Gestiona la información de los empleados de la empresa
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-2">
            <Button onClick={() => setMostrarFiltros(true)} variant="outline" size="sm">
              <Filter className="mr-2 h-4 w-4" />
              Filtros
            </Button>
            <Button onClick={() => navigate("/recursos-humanos/empleados/nuevo")} size="sm">
              <UserPlus className="mr-2 h-4 w-4" />
              Nuevo empleado
            </Button>
          </div>
        </div>

        {/* Barra de búsqueda */}
        <form onSubmit={manejarBusqueda} className="flex w-full max-w-sm items-center space-x-2">
          <Input
            type="search"
            placeholder="Buscar empleados..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
          />
          <Button type="submit" size="sm">
            <Search className="h-4 w-4" />
          </Button>
        </form>

        {/* Filtros aplicados */}
        {Object.keys(filtrosAplicados).length > 0 && (
          <div className="flex items-center gap-2 text-sm">
            <span className="font-medium">Filtros aplicados:</span>
            {filtrosAplicados.nombre && (
              <Badge variant="secondary">
                Nombre: {filtrosAplicados.nombre}
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-4 w-4 ml-1"
                  onClick={() => {
                    const { nombre, ...rest } = filtrosAplicados;
                    setFiltrosAplicados(rest);
                    const { nombre: n, ...restFiltros } = filtros;
                    setFiltros(restFiltros);
                    setBusqueda("");
                  }}
                >
                  <X className="h-3 w-3" />
                </Button>
              </Badge>
            )}
            {filtrosAplicados.departamento && (
              <Badge variant="secondary">
                Departamento: {filtrosAplicados.departamento}
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-4 w-4 ml-1"
                  onClick={() => {
                    const { departamento, ...rest } = filtrosAplicados;
                    setFiltrosAplicados(rest);
                    const { departamento: d, ...restFiltros } = filtros;
                    setFiltros(restFiltros);
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
            <Button variant="ghost" size="sm" onClick={limpiarFiltros}>
              Limpiar todos
            </Button>
          </div>
        )}

        {/* Lista de empleados */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {isLoading ? (
            renderizarEsqueletos()
          ) : isError ? (
            renderizarError()
          ) : resultadoEmpleados?.data.length === 0 ? (
            renderizarSinResultados()
          ) : (
            resultadoEmpleados?.data.map(empleado => (
              <EmpleadoCard 
                key={empleado.id}
                empleado={empleado}
                onEdit={() => navigate(`/recursos-humanos/empleados/${empleado.id}/editar`)}
                onDelete={() => setEmpleadoAEliminar(empleado)}
                modo="completo"
              />
            ))
          )}
        </div>

        {/* Paginación */}
        {!isLoading && !isError && resultadoEmpleados?.data.length !== 0 && (
          <div className="flex justify-center mt-4">
            {renderizarPaginacion()}
          </div>
        )}
      </div>

      {/* Modal de filtros */}
      <Dialog open={mostrarFiltros} onOpenChange={setMostrarFiltros}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Filtrar empleados</DialogTitle>
            <DialogDescription>
              Aplica filtros para encontrar empleados específicos.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="departamento" className="text-right">
                Departamento
              </Label>
              <Select 
                value={filtros.departamento || ""}
                onValueChange={(value) => 
                  setFiltros(prev => ({...prev, departamento: value || undefined}))
                }
              >
                <SelectTrigger id="departamento" className="col-span-3">
                  <SelectValue placeholder="Selecciona departamento" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Todos</SelectItem>
                  <SelectItem value="Tecnología">Tecnología</SelectItem>
                  <SelectItem value="Ventas">Ventas</SelectItem>
                  <SelectItem value="Marketing">Marketing</SelectItem>
                  <SelectItem value="Finanzas">Finanzas</SelectItem>
                  <SelectItem value="Recursos Humanos">Recursos Humanos</SelectItem>
                  <SelectItem value="Operaciones">Operaciones</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="estado" className="text-right">
                Estado
              </Label>
              <Select 
                value={filtros.estado || ""}
                onValueChange={(value: any) => 
                  setFiltros(prev => ({...prev, estado: value || undefined}))
                }
              >
                <SelectTrigger id="estado" className="col-span-3">
                  <SelectValue placeholder="Selecciona estado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Todos</SelectItem>
                  <SelectItem value={EstadoEmpleado.ACTIVO}>Activo</SelectItem>
                  <SelectItem value={EstadoEmpleado.INACTIVO}>Inactivo</SelectItem>
                  <SelectItem value={EstadoEmpleado.VACACIONES}>Vacaciones</SelectItem>
                  <SelectItem value={EstadoEmpleado.PERMISO}>Permiso</SelectItem>
                  <SelectItem value={EstadoEmpleado.BAJA_MEDICA}>Baja médica</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="fecha-desde" className="text-right">
                Contratado desde
              </Label>
              <Input
                id="fecha-desde"
                type="date"
                className="col-span-3"
                value={filtros.fechaContratacionDesde?.toISOString().split('T')[0] || ""}
                onChange={(e) =>
                  setFiltros(prev => ({
                    ...prev,
                    fechaContratacionDesde: e.target.value ? new Date(e.target.value) : undefined
                  }))
                }
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="fecha-hasta" className="text-right">
                Contratado hasta
              </Label>
              <Input
                id="fecha-hasta"
                type="date"
                className="col-span-3"
                value={filtros.fechaContratacionHasta?.toISOString().split('T')[0] || ""}
                onChange={(e) =>
                  setFiltros(prev => ({
                    ...prev,
                    fechaContratacionHasta: e.target.value ? new Date(e.target.value) : undefined
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
      <Dialog open={!!empleadoAEliminar} onOpenChange={(open) => !open && setEmpleadoAEliminar(null)}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Confirmar desactivación</DialogTitle>
            <DialogDescription>
              ¿Estás seguro de que deseas desactivar a este empleado? Esta acción no eliminará permanentemente al empleado,
              solo cambiará su estado a "Inactivo".
            </DialogDescription>
          </DialogHeader>
          {empleadoAEliminar && (
            <div className="py-4">
              <p className="font-medium">{empleadoAEliminar.nombreCompleto}</p>
              <p className="text-sm text-muted-foreground">{empleadoAEliminar.cargo} - {empleadoAEliminar.departamento}</p>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setEmpleadoAEliminar(null)}>
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
                  Desactivando...
                </>
              ) : (
                <>
                  <Trash2 className="mr-2 h-4 w-4" />
                  Desactivar
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};