import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Loader2, Plus, FileText, Download, Filter, Mail } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { FacturaCard } from '../components/FacturaCard';
import { FiltroFacturas } from '../components/FiltroFacturas';
import { IndicadoresFacturacionComponent } from '../components/IndicadoresFacturacion';
import { FacturaForm } from '../forms/FacturaForm';
import { useListarFacturasPorProyecto } from '../../application/useCases/listarFacturasPorProyecto';
import { useCalcularIndicadoresFacturacion } from '../../application/useCases/calcularIndicadoresFacturacion';
import { Factura, FiltrosFactura } from '../../domain/entities/Factura';

interface ProyectoData {
  id: number;
  name: string;
  budget: string;
  description: string;
}

interface FacturacionProyectoProps {
  proyectoSeleccionado: number | null;
  userId: number;
}

function formatCurrency(amount: number | string): string {
  const num = typeof amount === 'string' ? parseFloat(amount) : amount;
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(num);
}

export function FacturacionProyecto({ proyectoSeleccionado, userId }: FacturacionProyectoProps) {
  const [filtros, setFiltros] = useState<FiltrosFactura>({});
  const [mostrarFiltros, setMostrarFiltros] = useState(false);
  const [modalNuevaFactura, setModalNuevaFactura] = useState(false);
  const [facturaSeleccionada, setFacturaSeleccionada] = useState<Factura | null>(null);
  const [modalDetalleFactura, setModalDetalleFactura] = useState(false);

  // Obtener datos del proyecto
  const { data: proyecto, isLoading: proyectoLoading } = useQuery<ProyectoData>({
    queryKey: ['/api/projects', proyectoSeleccionado],
    queryFn: async () => {
      const response = await fetch(`/api/projects/${proyectoSeleccionado}`);
      return response.json();
    },
    enabled: !!proyectoSeleccionado
  });

  // Obtener facturas del proyecto
  const { 
    data: facturas = [], 
    isLoading: facturasLoading, 
    refetch: refetchFacturas 
  } = useListarFacturasPorProyecto(proyectoSeleccionado || 0, filtros);

  // Obtener indicadores
  const { 
    data: indicadores, 
    isLoading: indicadoresLoading 
  } = useCalcularIndicadoresFacturacion(proyectoSeleccionado || 0);

  // Obtener lista única de clientes para filtros
  const clientesUnicos = Array.from(new Set(facturas.map(f => f.cliente))).filter(Boolean);

  const handleVerDetalle = (factura: Factura) => {
    setFacturaSeleccionada(factura);
    setModalDetalleFactura(true);
  };

  const handleEditarFactura = (factura: Factura) => {
    setFacturaSeleccionada(factura);
    // Aquí se podría abrir un modal de edición
    console.log('Editar factura:', factura);
  };

  const handleNuevaFacturaSuccess = () => {
    setModalNuevaFactura(false);
    refetchFacturas();
  };

  if (!proyectoSeleccionado) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <FileText className="h-16 w-16 text-gray-400 mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          Selecciona un Proyecto
        </h3>
        <p className="text-gray-500 text-center max-w-md">
          Para gestionar facturas, primero selecciona un proyecto desde el dropdown superior.
        </p>
      </div>
    );
  }

  if (proyectoLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header del proyecto */}
      {proyecto && (
        <Card>
          <CardHeader>
            <div className="flex items-start justify-between">
              <div>
                <CardTitle className="text-xl font-bold text-gray-900">
                  {proyecto.name}
                </CardTitle>
                <p className="text-gray-600 mt-1">{proyecto.description}</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-500">Presupuesto Total</p>
                <p className="text-2xl font-bold text-primary">
                  {formatCurrency(proyecto.budget)}
                </p>
                <Badge variant="secondary" className="mt-1">
                  6 recursos asignados
                </Badge>
              </div>
            </div>
          </CardHeader>
        </Card>
      )}

      {/* Indicadores */}
      {indicadores && (
        <IndicadoresFacturacionComponent 
          indicadores={indicadores} 
          isLoading={indicadoresLoading}
        />
      )}

      {/* Controles y filtros */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setMostrarFiltros(!mostrarFiltros)}
          >
            <Filter className="h-4 w-4 mr-2" />
            Filtros
          </Button>
          
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Exportar
          </Button>
        </div>

        <Dialog open={modalNuevaFactura} onOpenChange={setModalNuevaFactura}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Nueva Factura
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Registrar Nueva Factura</DialogTitle>
            </DialogHeader>
            <FacturaForm
              proyectoId={proyectoSeleccionado}
              userId={userId}
              onSuccess={handleNuevaFacturaSuccess}
              onCancel={() => setModalNuevaFactura(false)}
            />
          </DialogContent>
        </Dialog>
      </div>

      {/* Filtros */}
      {mostrarFiltros && (
        <FiltroFacturas
          filtros={filtros}
          onFiltrosChange={setFiltros}
          clientes={clientesUnicos}
        />
      )}

      {/* Lista de facturas */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">
            Facturas del Proyecto
          </h3>
          <Badge variant="secondary">
            {facturas.length} {facturas.length === 1 ? 'factura' : 'facturas'}
          </Badge>
        </div>

        {facturasLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardHeader>
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="h-3 bg-gray-200 rounded"></div>
                    <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                    <div className="h-6 bg-gray-200 rounded w-1/2"></div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : facturas.length === 0 ? (
          <Card>
            <CardContent className="py-12">
              <div className="text-center">
                <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No hay facturas registradas
                </h3>
                <p className="text-gray-500 mb-4">
                  Comienza registrando la primera factura para este proyecto.
                </p>
                <Button onClick={() => setModalNuevaFactura(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Registrar Primera Factura
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {facturas.map((factura) => (
              <FacturaCard
                key={factura.id}
                factura={factura}
                onEdit={handleEditarFactura}
                onView={handleVerDetalle}
              />
            ))}
          </div>
        )}
      </div>

      {/* Modal de detalle de factura */}
      <Dialog open={modalDetalleFactura} onOpenChange={setModalDetalleFactura}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>
              Detalle de Factura {facturaSeleccionada?.numeroFactura}
            </DialogTitle>
          </DialogHeader>
          {facturaSeleccionada && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Cliente</label>
                  <p className="text-sm font-semibold">{facturaSeleccionada.cliente}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Estado</label>
                  <Badge variant="secondary">{facturaSeleccionada.estado}</Badge>
                </div>
              </div>
              
              <div>
                <label className="text-sm font-medium text-gray-500">Concepto</label>
                <p className="text-sm mt-1">{facturaSeleccionada.concepto}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Subtotal</label>
                  <p className="text-lg font-bold">{formatCurrency(facturaSeleccionada.valorSubtotal)}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Total</label>
                  <p className="text-lg font-bold">{formatCurrency(facturaSeleccionada.valorTotal)}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Fecha Emisión</label>
                  <p className="text-sm">{new Date(facturaSeleccionada.fechaEmision).toLocaleDateString()}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Fecha Vencimiento</label>
                  <p className="text-sm">{new Date(facturaSeleccionada.fechaVencimiento).toLocaleDateString()}</p>
                </div>
              </div>

              {facturaSeleccionada.medioPago && (
                <div>
                  <label className="text-sm font-medium text-gray-500">Medio de Pago</label>
                  <p className="text-sm">{facturaSeleccionada.medioPago}</p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}