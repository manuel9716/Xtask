import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Loader2, FileText, Plus, Filter, Search, ChevronRight } from 'lucide-react';
import { Input } from "@/components/ui/input";
import { useQuery } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';

interface Proyecto {
  id: number;
  nombre: string;
  monto: string;
  totalRecursos: number;
  costoTotal: number;
}

interface Factura {
  id: number;
  numero: string;
  fecha: string;
  cliente: string;
  subtotal: number;
  iva: number;
  total: number;
  estado: 'Pendiente' | 'Pagada' | 'Vencida';
}

export const PanelFacturacion: React.FC = () => {
  const [proyectoSeleccionado, setProyectoSeleccionado] = useState<number | null>(null);
  const [filtroEstado, setFiltroEstado] = useState<string>('todos');
  const [busqueda, setBusqueda] = useState<string>('');

  // Obtener proyectos disponibles
  const { data: proyectos, isLoading: cargandoProyectos } = useQuery<Proyecto[]>({
    queryKey: ['/api/nomina/proyectos'],
  });

  // Obtener facturas del proyecto seleccionado (datos de ejemplo por ahora)
  const facturasDePrueba: Factura[] = [
    {
      id: 1,
      numero: 'FAC-001',
      fecha: '2025-01-15',
      cliente: 'Cliente Ejemplo S.A.S.',
      subtotal: 1000000,
      iva: 190000,
      total: 1190000,
      estado: 'Pendiente'
    },
    {
      id: 2,
      numero: 'FAC-002',
      fecha: '2025-01-10',
      cliente: 'Empresa Demo Ltda.',
      subtotal: 750000,
      iva: 142500,
      total: 892500,
      estado: 'Pagada'
    }
  ];

  const proyectoActual = proyectos?.find(p => p.id === proyectoSeleccionado);

  const facturasFiltradas = proyectoSeleccionado ? facturasDePrueba.filter(factura => {
    const cumpleFiltroEstado = filtroEstado === 'todos' || factura.estado.toLowerCase() === filtroEstado.toLowerCase();
    const cumpleBusqueda = busqueda === '' || 
      factura.numero.toLowerCase().includes(busqueda.toLowerCase()) ||
      factura.cliente.toLowerCase().includes(busqueda.toLowerCase());
    
    return cumpleFiltroEstado && cumpleBusqueda;
  }) : [];

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const getEstadoBadgeColor = (estado: string) => {
    switch (estado) {
      case 'Pagada':
        return 'bg-green-100 text-green-800';
      case 'Pendiente':
        return 'bg-yellow-100 text-yellow-800';
      case 'Vencida':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (cargandoProyectos) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header con selector de proyecto */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" />
            Facturación
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <label className="text-sm font-medium text-gray-700 mb-2 block">
                  Seleccionar Proyecto
                </label>
                <Select
                  value={proyectoSeleccionado?.toString() || ''}
                  onValueChange={(value) => setProyectoSeleccionado(parseInt(value))}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Seleccione un proyecto para administrar" />
                  </SelectTrigger>
                  <SelectContent>
                    {proyectos?.map((proyecto) => (
                      <SelectItem key={proyecto.id} value={proyecto.id.toString()}>
                        <div className="flex items-center justify-between w-full">
                          <span className="font-medium">{proyecto.nombre}</span>
                          <span className="text-sm text-gray-500 ml-2">
                            {formatCurrency(parseFloat(proyecto.monto))}
                          </span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              {proyectoSeleccionado && (
                <Button className="bg-primary hover:bg-primary/90">
                  <Plus className="h-4 w-4 mr-2" />
                  Nueva Factura
                </Button>
              )}
            </div>

            {proyectoActual && (
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Proyecto Seleccionado</p>
                    <p className="font-semibold">{proyectoActual.nombre}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Presupuesto Total</p>
                    <p className="font-semibold">{formatCurrency(parseFloat(proyectoActual.monto))}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Recursos Asignados</p>
                    <p className="font-semibold">{proyectoActual.totalRecursos}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Contenido de facturas */}
      {proyectoSeleccionado && (
        <>
          {/* Filtros y búsqueda */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Buscar por número de factura o cliente..."
                      value={busqueda}
                      onChange={(e) => setBusqueda(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <div className="flex gap-2">
                  <Select value={filtroEstado} onValueChange={setFiltroEstado}>
                    <SelectTrigger className="w-40">
                      <Filter className="h-4 w-4 mr-2" />
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="todos">Todos los estados</SelectItem>
                      <SelectItem value="pendiente">Pendiente</SelectItem>
                      <SelectItem value="pagada">Pagada</SelectItem>
                      <SelectItem value="vencida">Vencida</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Lista de facturas */}
          <Card>
            <CardHeader>
              <CardTitle>Facturas del Proyecto</CardTitle>
            </CardHeader>
            <CardContent>
              {facturasFiltradas.length === 0 ? (
                <div className="text-center py-8">
                  <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    No hay facturas
                  </h3>
                  <p className="text-gray-500 mb-4">
                    {busqueda || filtroEstado !== 'todos' 
                      ? 'No se encontraron facturas con los filtros aplicados.'
                      : 'Aún no se han creado facturas para este proyecto.'
                    }
                  </p>
                  <Button className="bg-primary hover:bg-primary/90">
                    <Plus className="h-4 w-4 mr-2" />
                    Crear Primera Factura
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {facturasFiltradas.map((factura) => (
                    <div
                      key={factura.id}
                      className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
                    >
                      <div className="flex items-center space-x-4">
                        <div className="flex-shrink-0">
                          <FileText className="h-8 w-8 text-primary" />
                        </div>
                        <div>
                          <div className="flex items-center space-x-2">
                            <p className="font-medium text-gray-900">
                              Factura #{factura.numero}
                            </p>
                            <Badge className={getEstadoBadgeColor(factura.estado)}>
                              {factura.estado}
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-500">
                            Cliente: {factura.cliente} • {factura.fecha}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-4">
                        <div className="text-right">
                          <p className="font-medium text-gray-900">
                            {formatCurrency(factura.total)}
                          </p>
                          <p className="text-sm text-gray-500">
                            Subtotal: {formatCurrency(factura.subtotal)}
                          </p>
                        </div>
                        <ChevronRight className="h-5 w-5 text-gray-400" />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </>
      )}

      {/* Estado inicial sin proyecto seleccionado */}
      {!proyectoSeleccionado && (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-12">
              <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Seleccione un Proyecto
              </h3>
              <p className="text-gray-500 max-w-md mx-auto">
                Para comenzar a administrar facturas, seleccione un proyecto del menú desplegable superior.
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};