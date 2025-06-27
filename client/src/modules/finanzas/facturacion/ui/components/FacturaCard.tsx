import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { FileText, MoreHorizontal, Eye, Edit, CheckCircle, XCircle, Clock, AlertTriangle } from 'lucide-react';
import { Factura } from '../../domain/entities/Factura';
import { EstadoFactura } from '@shared/schema';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { useActualizarEstadoFactura } from '../../application/useCases/actualizarEstadoFactura';

interface FacturaCardProps {
  factura: Factura;
  onEdit: (factura: Factura) => void;
  onView: (factura: Factura) => void;
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

function getEstadoBadgeVariant(estado: EstadoFactura) {
  switch (estado) {
    case EstadoFactura.PAGADA:
      return 'default';
    case EstadoFactura.PENDIENTE:
      return 'secondary';
    case EstadoFactura.VENCIDA:
      return 'destructive';
    case EstadoFactura.RECHAZADA:
      return 'outline';
    default:
      return 'secondary';
  }
}

function getEstadoIcon(estado: EstadoFactura) {
  switch (estado) {
    case EstadoFactura.PAGADA:
      return <CheckCircle className="h-4 w-4" />;
    case EstadoFactura.PENDIENTE:
      return <Clock className="h-4 w-4" />;
    case EstadoFactura.VENCIDA:
      return <AlertTriangle className="h-4 w-4" />;
    case EstadoFactura.RECHAZADA:
      return <XCircle className="h-4 w-4" />;
    default:
      return <Clock className="h-4 w-4" />;
  }
}

function getEstadoColor(estado: EstadoFactura): string {
  switch (estado) {
    case EstadoFactura.PAGADA:
      return 'text-green-600 bg-green-100';
    case EstadoFactura.PENDIENTE:
      return 'text-yellow-600 bg-yellow-100';
    case EstadoFactura.VENCIDA:
      return 'text-red-600 bg-red-100';
    case EstadoFactura.RECHAZADA:
      return 'text-gray-600 bg-gray-100';
    default:
      return 'text-gray-600 bg-gray-100';
  }
}

export function FacturaCard({ factura, onEdit, onView }: FacturaCardProps) {
  const actualizarEstadoMutation = useActualizarEstadoFactura();

  const handleCambiarEstado = async (nuevoEstado: EstadoFactura) => {
    await actualizarEstadoMutation.mutateAsync({
      facturaId: factura.id,
      estado: nuevoEstado
    });
  };

  const fechaVencimiento = new Date(factura.fechaVencimiento);
  const esVencida = fechaVencimiento < new Date() && factura.estado === EstadoFactura.PENDIENTE;

  return (
    <Card className={`transition-all hover:shadow-md ${esVencida ? 'border-red-200 bg-red-50' : ''}`}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-2">
            <FileText className="h-5 w-5 text-gray-500" />
            <CardTitle className="text-lg font-semibold">
              {factura.numeroFactura}
            </CardTitle>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onView(factura)}>
                <Eye className="mr-2 h-4 w-4" />
                Ver Detalle
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onEdit(factura)}>
                <Edit className="mr-2 h-4 w-4" />
                Editar
              </DropdownMenuItem>
              {factura.estado === EstadoFactura.PENDIENTE && (
                <DropdownMenuItem onClick={() => handleCambiarEstado(EstadoFactura.PAGADA)}>
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Marcar como Pagada
                </DropdownMenuItem>
              )}
              {factura.estado === EstadoFactura.PENDIENTE && (
                <DropdownMenuItem onClick={() => handleCambiarEstado(EstadoFactura.RECHAZADA)}>
                  <XCircle className="mr-2 h-4 w-4" />
                  Marcar como Rechazada
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div>
          <h4 className="font-medium text-gray-900">{factura.cliente}</h4>
          <p className="text-sm text-gray-600 mt-1">{factura.concepto}</p>
        </div>

        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500">Fecha emisión</p>
            <p className="font-medium">
              {format(new Date(factura.fechaEmision), 'dd MMM yyyy', { locale: es })}
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-500">Vencimiento</p>
            <p className={`font-medium ${esVencida ? 'text-red-600' : ''}`}>
              {format(new Date(factura.fechaVencimiento), 'dd MMM yyyy', { locale: es })}
            </p>
          </div>
        </div>

        <div className="flex items-center justify-between pt-2 border-t">
          <div className="flex items-center space-x-2">
            {getEstadoIcon(factura.estado)}
            <Badge 
              variant={getEstadoBadgeVariant(factura.estado)}
              className={getEstadoColor(factura.estado)}
            >
              {factura.estado}
            </Badge>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-500">Subtotal: {formatCurrency(factura.valorSubtotal)}</p>
            <p className="text-lg font-bold text-gray-900">
              {formatCurrency(factura.valorTotal)}
            </p>
          </div>
        </div>

        {factura.medioPago && (
          <div className="pt-2 border-t">
            <p className="text-sm text-gray-500">Medio de pago</p>
            <p className="text-sm font-medium">{factura.medioPago}</p>
          </div>
        )}

        {esVencida && (
          <div className="bg-red-100 border border-red-200 rounded-lg p-3">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="h-4 w-4 text-red-600" />
              <p className="text-sm font-medium text-red-800">Factura Vencida</p>
            </div>
            <p className="text-xs text-red-600 mt-1">
              Esta factura ha superado su fecha de vencimiento
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}