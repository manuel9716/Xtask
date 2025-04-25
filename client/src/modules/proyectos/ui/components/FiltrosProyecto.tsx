import { useState, useEffect } from "react";
import { FiltrosProyecto as IFiltrosProyecto, EstadoProyecto } from "../../domain/entities/Proyecto";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { CalendarIcon, Filter, X } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Checkbox } from "@/components/ui/checkbox";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";

interface FiltrosProyectoProps {
  onFiltrosChange: (filtros: IFiltrosProyecto) => void;
  initialFiltros?: Partial<IFiltrosProyecto>;
}

export function FiltrosProyecto({ onFiltrosChange, initialFiltros = {} }: FiltrosProyectoProps) {
  const [busqueda, setBusqueda] = useState(initialFiltros.busqueda || "");
  const [selectedEstados, setSelectedEstados] = useState<EstadoProyecto[]>(
    initialFiltros.estado 
      ? (Array.isArray(initialFiltros.estado) ? initialFiltros.estado : [initialFiltros.estado]) 
      : []
  );
  const [responsableId, setResponsableId] = useState<string>(initialFiltros.responsableId?.toString() || "");
  const [clienteId, setClienteId] = useState<string>(initialFiltros.clienteId?.toString() || "");
  const [fechaInicioDesde, setFechaInicioDesde] = useState<Date | undefined>(initialFiltros.fechaInicioDesde);
  const [fechaInicioHasta, setFechaInicioHasta] = useState<Date | undefined>(initialFiltros.fechaInicioHasta);
  const [mostrarFiltros, setMostrarFiltros] = useState(false);
  
  // Actualiza los filtros cuando cambian los valores
  useEffect(() => {
    const filtros: IFiltrosProyecto = {};
    
    if (busqueda) filtros.busqueda = busqueda;
    if (selectedEstados.length > 0) filtros.estado = selectedEstados;
    if (responsableId) filtros.responsableId = parseInt(responsableId);
    if (clienteId) filtros.clienteId = parseInt(clienteId);
    if (fechaInicioDesde) filtros.fechaInicioDesde = fechaInicioDesde;
    if (fechaInicioHasta) filtros.fechaInicioHasta = fechaInicioHasta;
    
    onFiltrosChange(filtros);
  }, [busqueda, selectedEstados, responsableId, clienteId, fechaInicioDesde, fechaInicioHasta, onFiltrosChange]);

  // Función para alternar un estado en la selección
  const toggleEstado = (estado: EstadoProyecto) => {
    setSelectedEstados(prevEstados =>
      prevEstados.includes(estado)
        ? prevEstados.filter(e => e !== estado)
        : [...prevEstados, estado]
    );
  };
  
  // Verificar si hay filtros activos
  const hayFiltrosActivos = 
    busqueda !== "" || 
    selectedEstados.length > 0 || 
    responsableId !== "" || 
    clienteId !== "" ||
    fechaInicioDesde !== undefined ||
    fechaInicioHasta !== undefined;
  
  // Resetear todos los filtros
  const resetearFiltros = () => {
    setBusqueda("");
    setSelectedEstados([]);
    setResponsableId("");
    setClienteId("");
    setFechaInicioDesde(undefined);
    setFechaInicioHasta(undefined);
  };

  return (
    <Card className="mb-6">
      <CardContent className="pt-6">
        <div className="flex flex-col md:flex-row gap-4 items-end">
          {/* Input de búsqueda siempre visible */}
          <div className="flex-grow">
            <Label htmlFor="busqueda">Buscar proyectos</Label>
            <Input
              id="busqueda"
              placeholder="Nombre o descripción..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              className="mt-1"
            />
          </div>
          
          {/* Botón para mostrar/ocultar filtros avanzados */}
          <Button
            variant="outline"
            onClick={() => setMostrarFiltros(!mostrarFiltros)}
            className="gap-2"
          >
            <Filter className="h-4 w-4" />
            Filtros
            {hayFiltrosActivos && (
              <span className="bg-primary text-primary-foreground rounded-full w-5 h-5 flex items-center justify-center text-xs">
                {(selectedEstados.length > 0 ? 1 : 0) + 
                (responsableId ? 1 : 0) + 
                (clienteId ? 1 : 0) + 
                ((fechaInicioDesde || fechaInicioHasta) ? 1 : 0)}
              </span>
            )}
          </Button>
          
          {/* Botón para resetear filtros (solo visible si hay filtros) */}
          {hayFiltrosActivos && (
            <Button
              variant="ghost"
              onClick={resetearFiltros}
              className="gap-2"
            >
              <X className="h-4 w-4" />
              Limpiar
            </Button>
          )}
        </div>
        
        {/* Filtros adicionales (expandibles) */}
        {mostrarFiltros && (
          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Filtro por estado */}
            <div>
              <Label className="mb-2 block">Estado</Label>
              <div className="flex flex-wrap gap-2">
                {Object.values(EstadoProyecto).map(estado => (
                  <Button
                    key={estado}
                    variant={selectedEstados.includes(estado) ? "default" : "outline"}
                    size="sm"
                    onClick={() => toggleEstado(estado)}
                    className="capitalize"
                  >
                    {estado}
                  </Button>
                ))}
              </div>
            </div>
            
            {/* Filtro por responsable */}
            <div>
              <Label htmlFor="responsableId">ID Responsable</Label>
              <Input
                id="responsableId"
                type="number"
                placeholder="ID del responsable"
                value={responsableId}
                onChange={(e) => setResponsableId(e.target.value)}
                className="mt-1"
              />
            </div>
            
            {/* Filtro por cliente */}
            <div>
              <Label htmlFor="clienteId">ID Cliente</Label>
              <Input
                id="clienteId"
                type="number"
                placeholder="ID del cliente"
                value={clienteId}
                onChange={(e) => setClienteId(e.target.value)}
                className="mt-1"
              />
            </div>
            
            {/* Filtro por rango de fechas */}
            <div className="space-y-2">
              <Label>Fecha de inicio</Label>
              <div className="flex gap-2">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      id="fecha-inicio-desde"
                      variant="outline"
                      className="w-full justify-start text-left font-normal"
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {fechaInicioDesde ? (
                        format(fechaInicioDesde, "dd MMM yyyy", { locale: es })
                      ) : (
                        <span>Desde fecha...</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={fechaInicioDesde}
                      onSelect={setFechaInicioDesde}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      id="fecha-inicio-hasta"
                      variant="outline"
                      className="w-full justify-start text-left font-normal"
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {fechaInicioHasta ? (
                        format(fechaInicioHasta, "dd MMM yyyy", { locale: es })
                      ) : (
                        <span>Hasta fecha...</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={fechaInicioHasta}
                      onSelect={setFechaInicioHasta}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}