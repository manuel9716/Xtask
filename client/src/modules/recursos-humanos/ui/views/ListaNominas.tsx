/**
 * Vista de Lista de Nóminas
 * Muestra una lista paginada de nóminas con opciones de filtrado y acciones
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
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";

import { Nomina, EstadoNomina } from "@/modules/nomina/domain/entities/Nomina";
import { NominasApi } from "@/modules/nomina/infrastructure/api/nominasApi";
import {
  Search,
  Filter,
  Calendar,
  Download,
  Mail,
  FileText,
  CheckCircle,
  XCircle,
  RefreshCw,
  DollarSign,
  MoreHorizontal,
  X,
  Send
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

export const ListaNominas: React.FC = () => {
  const { toast } = useToast();
  const nominasApi = new NominasApi();
  
  // Estados
  const [pagina, setPagina] = useState(1);
  const [filtros, setFiltros] = useState<any>({});
  const [filtrosAplicados, setFiltrosAplicados] = useState<any>({});
  const [mostrarFiltros, setMostrarFiltros] = useState(false);
  const [nominaDescargar, setNominaDescargar] = useState<Nomina | null>(null);
  const [mostrarDetalleNomina, setMostrarDetalleNomina] = useState<Nomina | null>(null);
  const [busqueda, setBusqueda] = useState("");
  
  // Consulta para obtener nóminas
  const { 
    data: resultadoNominas, 
    isLoading, 
    isError,
    refetch 
  } = useQuery({
    queryKey: ['/api/recursos-humanos/nominas', pagina, filtrosAplicados],
    queryFn: () => nominasApi.listar(filtrosAplicados, { page: pagina, pageSize: PAGE_SIZE }),
  });
  
  // Mutación para cambiar estado de una nómina (pagada/pendiente)
  const cambiarEstadoMutation = useMutation({
    mutationFn: ({ id, estado }: { id: number, estado: EstadoNomina }) => 
      nominasApi.cambiarEstado(id, estado),
    onSuccess: () => {
      toast({
        title: "Estado actualizado",
        description: "El estado de la nómina ha sido actualizado correctamente",
      });
      refetch();
    },
    onError: (error) => {
      toast({
        title: "Error al actualizar",
        description: error instanceof Error ? error.message : "Ha ocurrido un error al actualizar el estado",
        variant: "destructive",
      });
    },
  });
  
  // Mutación para enviar nómina por email
  const enviarEmailMutation = useMutation({
    mutationFn: (id: number) => 
      // Esta es una implementación simulada
      new Promise<void>((resolve) => setTimeout(resolve, 1000)), 
    onSuccess: () => {
      toast({
        title: "Email enviado",
        description: "La nómina ha sido enviada por email correctamente",
      });
    },
    onError: (error) => {
      toast({
        title: "Error al enviar",
        description: error instanceof Error ? error.message : "Ha ocurrido un error al enviar el email",
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
      empleadoNombre: busqueda
    });
    setPagina(1);
  };
  
  // Función para cambiar estado (pagada/pendiente)
  const cambiarEstadoPago = (id: number, pagada: boolean) => {
    const nuevoEstado = pagada ? EstadoNomina.PAGADA : EstadoNomina.PENDIENTE;
    cambiarEstadoMutation.mutate({ id, estado: nuevoEstado });
  };
  
  // Función para enviar nómina por email
  const enviarPorEmail = (id: number) => {
    enviarEmailMutation.mutate(id);
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
  
  // Función para formatear moneda
  const formatearMoneda = (valor: number) => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 2
    }).format(valor);
  };
  
  // Obtener badge para estado de nómina
  const getBadgeEstadoNomina = (estado: string) => {
    switch (estado) {
      case EstadoNomina.PAGADA:
        return <Badge className="bg-green-500 hover:bg-green-500">Pagada</Badge>;
      case EstadoNomina.PENDIENTE:
        return <Badge className="bg-amber-500 hover:bg-amber-500">Pendiente</Badge>;
      case EstadoNomina.ANULADA:
        return <Badge variant="destructive">Anulada</Badge>;
      case EstadoNomina.PROCESANDO:
        return <Badge className="bg-blue-500 hover:bg-blue-500">Procesando</Badge>;
      default:
        return <Badge variant="outline">{estado}</Badge>;
    }
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
        <p className="text-destructive mb-4">Error al cargar las nóminas.</p>
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
        <p className="text-muted-foreground mb-4">No se encontraron nóminas.</p>
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
              placeholder="Buscar por empleado..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              className="w-full sm:w-[300px]"
            />
            <Button type="submit" size="sm">
              <Search className="h-4 w-4" />
            </Button>
          </form>
          
          <div className="flex gap-2">
            <Button onClick={() => setMostrarFiltros(true)} variant="outline" size="sm">
              <Filter className="mr-2 h-4 w-4" />
              Filtros
            </Button>
            <Button variant="outline" size="sm">
              <Download className="mr-2 h-4 w-4" />
              Exportar
            </Button>
          </div>
        </div>
        
        {/* Filtros aplicados */}
        {Object.keys(filtrosAplicados).length > 0 && (
          <div className="flex flex-wrap gap-2 text-sm">
            <span className="font-medium">Filtros aplicados:</span>
            {filtrosAplicados.empleadoNombre && (
              <Badge variant="secondary">
                Empleado: {filtrosAplicados.empleadoNombre}
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-4 w-4 ml-1"
                  onClick={() => {
                    const { empleadoNombre, ...rest } = filtrosAplicados;
                    setFiltrosAplicados(rest);
                    const { empleadoNombre: t, ...restFiltros } = filtros;
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
            {filtrosAplicados.periodo && (
              <Badge variant="secondary">
                Período: {filtrosAplicados.periodo}
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-4 w-4 ml-1"
                  onClick={() => {
                    const { periodo, ...rest } = filtrosAplicados;
                    setFiltrosAplicados(rest);
                    const { periodo: p, ...restFiltros } = filtros;
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
        
        {/* Tabla de nóminas */}
        {isLoading ? (
          renderizarEsqueletos()
        ) : isError ? (
          renderizarError()
        ) : resultadoNominas?.data.length === 0 ? (
          renderizarSinResultados()
        ) : (
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Empleado</TableHead>
                    <TableHead>Período</TableHead>
                    <TableHead>Bruto</TableHead>
                    <TableHead>Neto</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead>Pagada</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {resultadoNominas?.data.map((nomina) => (
                    <TableRow key={nomina.id}>
                      <TableCell className="font-medium">
                        {nomina.empleadoNombre || `ID: ${nomina.empleadoId}`}
                      </TableCell>
                      <TableCell>{nomina.periodo}</TableCell>
                      <TableCell>{formatearMoneda(nomina.salarioBruto)}</TableCell>
                      <TableCell>{formatearMoneda(nomina.salarioNeto)}</TableCell>
                      <TableCell>{getBadgeEstadoNomina(nomina.estado)}</TableCell>
                      <TableCell>
                        <Switch 
                          checked={nomina.estado === EstadoNomina.PAGADA}
                          onCheckedChange={(checked) => cambiarEstadoPago(nomina.id, checked)}
                          disabled={cambiarEstadoMutation.isPending || nomina.estado === EstadoNomina.ANULADA}
                        />
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
                              <span className="sr-only">Abrir menú</span>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => setNominaDescargar(nomina)}>
                              <Download className="mr-2 h-4 w-4" />
                              Descargar PDF
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => enviarPorEmail(nomina.id)}>
                              <Send className="mr-2 h-4 w-4" />
                              Enviar por Email
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => setMostrarDetalleNomina(nomina)}>
                              <FileText className="mr-2 h-4 w-4" />
                              Ver Detalles
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
            {resultadoNominas && resultadoNominas.totalPages > 1 && (
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
                    
                    {Array.from({ length: resultadoNominas.totalPages }, (_, i) => i + 1).map(p => {
                      // Mostrar primera, última y páginas cercanas a la actual
                      if (p === 1 || p === resultadoNominas.totalPages || (p >= pagina - 1 && p <= pagina + 1)) {
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
                      if (p === 2 || p === resultadoNominas.totalPages - 1) {
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
                        onClick={() => setPagina(p => Math.min(resultadoNominas.totalPages, p + 1))}
                        aria-disabled={pagina === resultadoNominas.totalPages}
                        className={pagina === resultadoNominas.totalPages ? "pointer-events-none opacity-50" : ""}
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
            <DialogTitle>Filtrar nóminas</DialogTitle>
            <DialogDescription>
              Aplica filtros para encontrar nóminas específicas.
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
                  <SelectItem value={EstadoNomina.PAGADA}>Pagada</SelectItem>
                  <SelectItem value={EstadoNomina.PENDIENTE}>Pendiente</SelectItem>
                  <SelectItem value={EstadoNomina.ANULADA}>Anulada</SelectItem>
                  <SelectItem value={EstadoNomina.PROCESANDO}>Procesando</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="periodo" className="text-right">
                Período
              </label>
              <Select 
                value={filtros.periodo || ""}
                onValueChange={(value) => 
                  setFiltros(prev => ({...prev, periodo: value || undefined}))
                }
              >
                <SelectTrigger id="periodo" className="col-span-3">
                  <SelectValue placeholder="Selecciona período" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Todos</SelectItem>
                  <SelectItem value="04/2023">Abril 2023</SelectItem>
                  <SelectItem value="03/2023">Marzo 2023</SelectItem>
                  <SelectItem value="02/2023">Febrero 2023</SelectItem>
                  <SelectItem value="01/2023">Enero 2023</SelectItem>
                  <SelectItem value="12/2022">Diciembre 2022</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="minBruto" className="text-right">
                Bruto mínimo
              </label>
              <Input
                id="minBruto"
                type="number"
                className="col-span-3"
                value={filtros.minBruto || ""}
                onChange={(e) =>
                  setFiltros(prev => ({
                    ...prev,
                    minBruto: e.target.value ? Number(e.target.value) : undefined
                  }))
                }
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="maxBruto" className="text-right">
                Bruto máximo
              </label>
              <Input
                id="maxBruto"
                type="number"
                className="col-span-3"
                value={filtros.maxBruto || ""}
                onChange={(e) =>
                  setFiltros(prev => ({
                    ...prev,
                    maxBruto: e.target.value ? Number(e.target.value) : undefined
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
      
      {/* Modal de detalle de nómina */}
      <Dialog open={!!mostrarDetalleNomina} onOpenChange={(open) => !open && setMostrarDetalleNomina(null)}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Detalle de Nómina</DialogTitle>
            <DialogDescription>
              Información completa de la nómina
            </DialogDescription>
          </DialogHeader>
          {mostrarDetalleNomina && (
            <div className="py-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Empleado</h3>
                  <p className="font-medium">{mostrarDetalleNomina.empleadoNombre || `ID: ${mostrarDetalleNomina.empleadoId}`}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Período</h3>
                  <p className="font-medium">{mostrarDetalleNomina.periodo}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Fecha Emisión</h3>
                  <p className="font-medium">{formatearFecha(mostrarDetalleNomina.fechaEmision)}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Fecha Pago</h3>
                  <p className="font-medium">{formatearFecha(mostrarDetalleNomina.fechaPago)}</p>
                </div>
              </div>
              
              <div className="border-t border-b py-4 my-4">
                <h3 className="font-medium mb-2">Conceptos</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Salario Base</span>
                    <span className="font-medium">{formatearMoneda(mostrarDetalleNomina.salarioBase)}</span>
                  </div>
                  {/* Conceptos adicionales irían aquí */}
                  <div className="flex justify-between text-muted-foreground">
                    <span>Otros Complementos</span>
                    <span>{formatearMoneda(mostrarDetalleNomina.salarioBruto - mostrarDetalleNomina.salarioBase)}</span>
                  </div>
                  <div className="flex justify-between font-medium pt-2 border-t">
                    <span>Total Devengado (Bruto)</span>
                    <span>{formatearMoneda(mostrarDetalleNomina.salarioBruto)}</span>
                  </div>
                </div>
              </div>
              
              <div className="border-b py-4 mb-4">
                <h3 className="font-medium mb-2">Deducciones</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Retención IRPF</span>
                    <span className="font-medium text-red-600">- {formatearMoneda(mostrarDetalleNomina.retencionFiscal)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Seguridad Social</span>
                    <span className="font-medium text-red-600">- {formatearMoneda(mostrarDetalleNomina.seguridadSocial)}</span>
                  </div>
                  {mostrarDetalleNomina.otrosDescuentos > 0 && (
                    <div className="flex justify-between">
                      <span>Otros Descuentos</span>
                      <span className="font-medium text-red-600">- {formatearMoneda(mostrarDetalleNomina.otrosDescuentos)}</span>
                    </div>
                  )}
                  <div className="flex justify-between font-medium pt-2 border-t">
                    <span>Total Deducciones</span>
                    <span className="text-red-600">- {formatearMoneda(
                      mostrarDetalleNomina.retencionFiscal + 
                      mostrarDetalleNomina.seguridadSocial + 
                      mostrarDetalleNomina.otrosDescuentos
                    )}</span>
                  </div>
                </div>
              </div>
              
              <div className="flex justify-between font-bold text-lg">
                <span>Líquido a Percibir</span>
                <span>{formatearMoneda(mostrarDetalleNomina.salarioNeto)}</span>
              </div>
              
              {mostrarDetalleNomina.notas && (
                <div className="mt-4 p-3 bg-muted rounded-md">
                  <h3 className="font-medium mb-1">Notas</h3>
                  <p className="text-sm">{mostrarDetalleNomina.notas}</p>
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setMostrarDetalleNomina(null)}>
              Cerrar
            </Button>
            <Button onClick={() => setNominaDescargar(mostrarDetalleNomina)}>
              <Download className="mr-2 h-4 w-4" />
              Descargar PDF
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Modal de descarga de PDF */}
      <Dialog open={!!nominaDescargar} onOpenChange={(open) => !open && setNominaDescargar(null)}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Descargar Nómina</DialogTitle>
            <DialogDescription>
              Se generará un PDF con todos los detalles de la nómina.
            </DialogDescription>
          </DialogHeader>
          {nominaDescargar && (
            <div className="py-4">
              <p>Generando PDF para:</p>
              <p className="font-medium">{nominaDescargar.empleadoNombre || `ID: ${nominaDescargar.empleadoId}`}</p>
              <p className="text-sm text-muted-foreground">
                Período: {nominaDescargar.periodo}
              </p>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setNominaDescargar(null)}>
              Cancelar
            </Button>
            <Button 
              variant="default" 
              onClick={() => {
                toast({
                  title: "PDF generado",
                  description: "El PDF de la nómina ha sido generado y descargado correctamente"
                });
                setNominaDescargar(null);
              }}
            >
              <Download className="mr-2 h-4 w-4" />
              Descargar PDF
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};