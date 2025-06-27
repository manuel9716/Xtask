import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, Plus, FileText, Download, Filter, Mail } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
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
  const [modalEnviarEmail, setModalEnviarEmail] = useState(false);
  const [emailData, setEmailData] = useState({
    destinatario: '',
    asunto: '',
    mensaje: ''
  });

  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Mutation para enviar factura por email
  const enviarEmailMutation = useMutation({
    mutationFn: async ({ facturaId, emailData }: { facturaId: number, emailData: any }) => {
      const response = await fetch(`/api/facturacion/${facturaId}/enviar-email`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(emailData),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Error al enviar email');
      }
      
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Email enviado",
        description: `Factura enviada exitosamente a ${data.destinatario}`,
      });
      setModalEnviarEmail(false);
      setEmailData({ destinatario: '', asunto: '', mensaje: '' });
    },
    onError: (error: Error) => {
      toast({
        title: "Error al enviar email",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Obtener datos del proyecto
  const { data: proyecto, isLoading: proyectoLoading } = useQuery({
    queryKey: ['/api/projects', proyectoSeleccionado],
    enabled: !!proyectoSeleccionado,
  });

  // Obtener facturas
  const {
    data: facturas = [],
    isLoading: facturasLoading,
    refetch: refetchFacturas,
  } = useListarFacturasPorProyecto(proyectoSeleccionado || 0);

  // Obtener indicadores
  const {
    data: indicadores,
    isLoading: indicadoresLoading,
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

  const handleEnviarEmail = () => {
    if (facturaSeleccionada) {
      setEmailData({
        destinatario: '',
        asunto: `Factura ${facturaSeleccionada.numeroFactura} - ${facturaSeleccionada.cliente}`,
        mensaje: `Estimado cliente,\n\nAdjunto encontrará la factura ${facturaSeleccionada.numeroFactura} correspondiente a los servicios prestados.\n\nGracias por su confianza.`
      });
      setModalEnviarEmail(true);
    }
  };

  const handleEnviarEmailSubmit = () => {
    if (facturaSeleccionada && emailData.destinatario && emailData.asunto) {
      enviarEmailMutation.mutate({ 
        facturaId: facturaSeleccionada.id, 
        emailData 
      });
    }
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
      {!indicadoresLoading && indicadores && (
        <IndicadoresFacturacionComponent indicadores={indicadores} />
      )}

      {/* Controles */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
        <div className="flex flex-wrap gap-2">
          <Dialog open={modalNuevaFactura} onOpenChange={setModalNuevaFactura}>
            <DialogTrigger asChild>
              <Button className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Nueva Factura
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Nueva Factura</DialogTitle>
              </DialogHeader>
              <FacturaForm
                proyectoId={proyectoSeleccionado}
                onSuccess={handleNuevaFacturaSuccess}
                onCancel={() => setModalNuevaFactura(false)}
              />
            </DialogContent>
          </Dialog>

          <Button
            variant="outline"
            onClick={() => setMostrarFiltros(!mostrarFiltros)}
            className="flex items-center gap-2"
          >
            <Filter className="h-4 w-4" />
            Filtros
          </Button>
        </div>
      </div>

      {/* Panel de filtros */}
      {mostrarFiltros && (
        <Card>
          <CardContent className="pt-6">
            <FiltroFacturas
              filtros={filtros}
              onFiltrosChange={setFiltros}
              clientesDisponibles={clientesUnicos}
            />
          </CardContent>
        </Card>
      )}

      {/* Lista de facturas */}
      {facturasLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : facturas.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <FileText className="h-16 w-16 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No hay facturas registradas
            </h3>
            <p className="text-gray-500 text-center max-w-md mb-4">
              Comenzar creando la primera factura para este proyecto.
            </p>
            <Button onClick={() => setModalNuevaFactura(true)}>
              Crear Primera Factura
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {facturas
            .filter(factura => {
              if (filtros.cliente && !factura.cliente.toLowerCase().includes(filtros.cliente.toLowerCase())) {
                return false;
              }
              if (filtros.estado && factura.estado !== filtros.estado) {
                return false;
              }
              if (filtros.fechaInicio && new Date(factura.fechaEmision) < new Date(filtros.fechaInicio)) {
                return false;
              }
              if (filtros.fechaFin && new Date(factura.fechaEmision) > new Date(filtros.fechaFin)) {
                return false;
              }
              return true;
            })
            .map((factura) => (
              <FacturaCard
                key={factura.id}
                factura={factura}
                onEdit={handleEditarFactura}
                onView={handleVerDetalle}
              />
            ))
          }
        </div>
      )}

      {/* Modal de detalle de factura */}
      <Dialog open={modalDetalleFactura} onOpenChange={setModalDetalleFactura}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>
              Detalle de Factura
            </DialogTitle>
          </DialogHeader>
          {facturaSeleccionada && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Número de Factura</label>
                  <p className="text-lg font-bold">{facturaSeleccionada.numeroFactura}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Estado</label>
                  <Badge variant={
                    facturaSeleccionada.estado === 'PAGADA' ? 'default' :
                    facturaSeleccionada.estado === 'PENDIENTE' ? 'secondary' :
                    'destructive'
                  }>
                    {facturaSeleccionada.estado}
                  </Badge>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-500">Cliente</label>
                <p className="text-sm mt-1">{facturaSeleccionada.cliente}</p>
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

              {/* Botones de acción */}
              <div className="flex justify-end gap-2 pt-4 border-t">
                <Button 
                  variant="outline"
                  onClick={() => {
                    const link = document.createElement('a');
                    link.href = `/api/facturacion/${facturaSeleccionada.id}/pdf`;
                    link.download = `Factura-${facturaSeleccionada.numeroFactura}.pdf`;
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                  }}
                  className="flex items-center gap-2"
                >
                  <Download className="h-4 w-4" />
                  Descargar PDF
                </Button>
                <Button 
                  onClick={handleEnviarEmail}
                  className="flex items-center gap-2"
                >
                  <Mail className="h-4 w-4" />
                  Enviar por Email
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Modal para enviar email */}
      <Dialog open={modalEnviarEmail} onOpenChange={setModalEnviarEmail}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>
              Enviar Factura por Email
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-700">Destinatario</label>
              <Input
                type="email"
                placeholder="cliente@empresa.com"
                value={emailData.destinatario}
                onChange={(e) => setEmailData(prev => ({ ...prev, destinatario: e.target.value }))}
                className="mt-1"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700">Asunto</label>
              <Input
                type="text"
                value={emailData.asunto}
                onChange={(e) => setEmailData(prev => ({ ...prev, asunto: e.target.value }))}
                className="mt-1"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700">Mensaje (Opcional)</label>
              <Textarea
                placeholder="Escriba un mensaje personalizado..."
                value={emailData.mensaje}
                onChange={(e) => setEmailData(prev => ({ ...prev, mensaje: e.target.value }))}
                rows={4}
                className="mt-1"
              />
            </div>

            <div className="flex justify-between pt-4">
              <Button 
                variant="outline" 
                onClick={() => setModalEnviarEmail(false)}
              >
                Cancelar
              </Button>
              <Button 
                onClick={handleEnviarEmailSubmit}
                disabled={!emailData.destinatario || !emailData.asunto || enviarEmailMutation.isPending}
              >
                {enviarEmailMutation.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Enviando...
                  </>
                ) : (
                  <>
                    <Mail className="h-4 w-4 mr-2" />
                    Enviar
                  </>
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}