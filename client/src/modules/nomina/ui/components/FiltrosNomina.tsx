import React, { useState } from 'react';
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { EstadoNomina } from '../../domain/entities/Nomina';
import { useEmpleadosNomina } from '../../application/useEmpleadosNomina';
import { CalendarIcon, SearchIcon, XCircle } from 'lucide-react';
import { Separator } from '@/components/ui/separator';

interface FiltrosNominaProps {
  onFiltrar: (filtros: {
    empleadoId?: number;
    mes?: number;
    anio?: number;
    estado?: string;
  }) => void;
  filtrosActuales: {
    empleadoId?: number;
    mes?: number;
    anio?: number;
    estado?: string;
  };
}

export function FiltrosNomina({ onFiltrar, filtrosActuales }: FiltrosNominaProps) {
  const { empleadosParaSelect, isLoading: cargandoEmpleados } = useEmpleadosNomina();
  
  // Estado local para los filtros
  const [filtros, setFiltros] = useState({
    empleadoId: filtrosActuales.empleadoId?.toString() || '',
    mes: filtrosActuales.mes?.toString() || '',
    anio: filtrosActuales.anio?.toString() || '',
    estado: filtrosActuales.estado || ''
  });

  // Manejar cambios en los filtros
  const handleChange = (campo: string, valor: string) => {
    setFiltros(prev => ({
      ...prev,
      [campo]: valor
    }));
  };

  // Aplicar filtros
  const aplicarFiltros = () => {
    onFiltrar({
      empleadoId: filtros.empleadoId ? parseInt(filtros.empleadoId) : undefined,
      mes: filtros.mes ? parseInt(filtros.mes) : undefined,
      anio: filtros.anio ? parseInt(filtros.anio) : undefined,
      estado: filtros.estado || undefined
    });
  };

  // Limpiar filtros
  const limpiarFiltros = () => {
    setFiltros({
      empleadoId: '',
      mes: '',
      anio: '',
      estado: ''
    });
    onFiltrar({});
  };

  // Generar años para el selector
  const anioActual = new Date().getFullYear();
  const anios = Array.from({ length: 5 }, (_, i) => anioActual - i);

  // Opciones de estados
  const estadosOptions = [
    { value: EstadoNomina.PENDIENTE, label: 'Pendiente' },
    { value: EstadoNomina.APROBADO, label: 'Aprobado' },
    { value: EstadoNomina.PAGADO, label: 'Pagado' },
    { value: EstadoNomina.RECHAZADO, label: 'Rechazado' },
    { value: EstadoNomina.CANCELADO, label: 'Cancelado' }
  ];

  // Meses del año
  const meses = [
    { value: '1', label: 'Enero' },
    { value: '2', label: 'Febrero' },
    { value: '3', label: 'Marzo' },
    { value: '4', label: 'Abril' },
    { value: '5', label: 'Mayo' },
    { value: '6', label: 'Junio' },
    { value: '7', label: 'Julio' },
    { value: '8', label: 'Agosto' },
    { value: '9', label: 'Septiembre' },
    { value: '10', label: 'Octubre' },
    { value: '11', label: 'Noviembre' },
    { value: '12', label: 'Diciembre' }
  ];

  return (
    <Card className="mb-6">
      <CardContent className="pt-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Filtro de empleado */}
          <div className="space-y-2">
            <Label htmlFor="empleado">Empleado</Label>
            <Select
              value={filtros.empleadoId}
              onValueChange={(value) => handleChange('empleadoId', value)}
            >
              <SelectTrigger id="empleado">
                <SelectValue placeholder="Todos los empleados" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos los empleados</SelectItem>
                {empleadosParaSelect.map((emp) => (
                  <SelectItem key={emp.value} value={emp.value}>
                    {emp.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          {/* Filtro de mes */}
          <div className="space-y-2">
            <Label htmlFor="mes">Mes</Label>
            <Select
              value={filtros.mes}
              onValueChange={(value) => handleChange('mes', value)}
            >
              <SelectTrigger id="mes">
                <SelectValue placeholder="Todos los meses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos los meses</SelectItem>
                {meses.map((mes) => (
                  <SelectItem key={mes.value} value={mes.value}>
                    {mes.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          {/* Filtro de año */}
          <div className="space-y-2">
            <Label htmlFor="anio">Año</Label>
            <Select
              value={filtros.anio}
              onValueChange={(value) => handleChange('anio', value)}
            >
              <SelectTrigger id="anio">
                <SelectValue placeholder="Todos los años" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos los años</SelectItem>
                {anios.map((anio) => (
                  <SelectItem key={anio} value={anio.toString()}>
                    {anio}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          {/* Filtro de estado */}
          <div className="space-y-2">
            <Label htmlFor="estado">Estado</Label>
            <Select
              value={filtros.estado}
              onValueChange={(value) => handleChange('estado', value)}
            >
              <SelectTrigger id="estado">
                <SelectValue placeholder="Todos los estados" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos los estados</SelectItem>
                {estadosOptions.map((estado) => (
                  <SelectItem key={estado.value} value={estado.value}>
                    {estado.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        
        <Separator className="my-4" />
        
        <div className="flex justify-end space-x-2">
          <Button 
            variant="outline" 
            onClick={limpiarFiltros}
          >
            <XCircle className="h-4 w-4 mr-2" />
            Limpiar
          </Button>
          <Button 
            onClick={aplicarFiltros}
          >
            <SearchIcon className="h-4 w-4 mr-2" />
            Filtrar
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}