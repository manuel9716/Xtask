import React from 'react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Search, Filter, CalendarIcon, X } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { EstadoFactura } from '@shared/schema';
import { FiltrosFactura } from '../../domain/entities/Factura';

interface FiltroFacturasProps {
  filtros: FiltrosFactura;
  onFiltrosChange: (filtros: FiltrosFactura) => void;
  clientes?: string[];
}

export function FiltroFacturas({ filtros, onFiltrosChange, clientes }: FiltroFacturasProps) {
  const handleBusquedaChange = (busqueda: string) => {
    onFiltrosChange({ ...filtros, busqueda });
  };

  const handleEstadoChange = (estado: string) => {
    onFiltrosChange({ 
      ...filtros, 
      estado: estado === 'todos' ? undefined : estado as EstadoFactura 
    });
  };

  const handleClienteChange = (cliente: string) => {
    onFiltrosChange({ 
      ...filtros, 
      cliente: cliente === 'todos' ? undefined : cliente 
    });
  };

  const handleFechaDesdeChange = (fecha: Date | undefined) => {
    onFiltrosChange({ 
      ...filtros, 
      fechaDesde: fecha ? format(fecha, 'yyyy-MM-dd') : undefined 
    });
  };

  const handleFechaHastaChange = (fecha: Date | undefined) => {
    onFiltrosChange({ 
      ...filtros, 
      fechaHasta: fecha ? format(fecha, 'yyyy-MM-dd') : undefined 
    });
  };

  const limpiarFiltros = () => {
    onFiltrosChange({});
  };

  const tienesFiltrosActivos = filtros.estado || filtros.cliente || filtros.fechaDesde || filtros.fechaHasta || filtros.busqueda;

  return (
    <div className="space-y-4 p-4 bg-gray-50 rounded-lg border">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Filter className="h-4 w-4 text-gray-600" />
          <h3 className="font-medium text-gray-900">Filtros</h3>
        </div>
        {tienesFiltrosActivos && (
          <Button
            variant="ghost"
            size="sm"
            onClick={limpiarFiltros}
            className="text-gray-500 hover:text-gray-700"
          >
            <X className="h-4 w-4 mr-1" />
            Limpiar
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Búsqueda */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
          <Input
            placeholder="Buscar por número, cliente..."
            className="pl-10"
            value={filtros.busqueda || ''}
            onChange={(e) => handleBusquedaChange(e.target.value)}
          />
        </div>

        {/* Estado */}
        <Select
          value={filtros.estado || 'todos'}
          onValueChange={handleEstadoChange}
        >
          <SelectTrigger>
            <SelectValue placeholder="Estado" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todos los estados</SelectItem>
            <SelectItem value={EstadoFactura.PENDIENTE}>Pendiente</SelectItem>
            <SelectItem value={EstadoFactura.PAGADA}>Pagada</SelectItem>
            <SelectItem value={EstadoFactura.RECHAZADA}>Rechazada</SelectItem>
            <SelectItem value={EstadoFactura.VENCIDA}>Vencida</SelectItem>
          </SelectContent>
        </Select>

        {/* Cliente */}
        <Select
          value={filtros.cliente || 'todos'}
          onValueChange={handleClienteChange}
        >
          <SelectTrigger>
            <SelectValue placeholder="Cliente" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todos los clientes</SelectItem>
            {clientes?.map(cliente => (
              <SelectItem key={cliente} value={cliente}>
                {cliente}
              </SelectItem>
            )) || []}
          </SelectContent>
        </Select>

        {/* Fecha Desde */}
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                "w-full justify-start text-left font-normal",
                !filtros.fechaDesde && "text-muted-foreground"
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {filtros.fechaDesde ? (
                format(new Date(filtros.fechaDesde), "PP", { locale: es })
              ) : (
                <span>Desde</span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={filtros.fechaDesde ? new Date(filtros.fechaDesde) : undefined}
              onSelect={handleFechaDesdeChange}
              disabled={(date) =>
                date > new Date() || date < new Date("1900-01-01")
              }
              initialFocus
            />
          </PopoverContent>
        </Popover>

        {/* Fecha Hasta */}
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                "w-full justify-start text-left font-normal",
                !filtros.fechaHasta && "text-muted-foreground"
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {filtros.fechaHasta ? (
                format(new Date(filtros.fechaHasta), "PP", { locale: es })
              ) : (
                <span>Hasta</span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={filtros.fechaHasta ? new Date(filtros.fechaHasta) : undefined}
              onSelect={handleFechaHastaChange}
              disabled={(date) => {
                if (date > new Date()) return true;
                if (filtros.fechaDesde && date < new Date(filtros.fechaDesde)) return true;
                return false;
              }}
              initialFocus
            />
          </PopoverContent>
        </Popover>
      </div>
    </div>
  );
}