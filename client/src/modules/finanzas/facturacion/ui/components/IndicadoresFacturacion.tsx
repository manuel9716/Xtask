import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { TrendingUp, TrendingDown, AlertTriangle, CheckCircle, Clock, DollarSign, Calendar, BarChart3 } from 'lucide-react';
import { IndicadoresFacturacion } from '../../domain/entities/Factura';
import { EstadoFactura } from '@shared/schema';

interface IndicadoresFacturacionProps {
  indicadores: IndicadoresFacturacion;
  isLoading?: boolean;
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount);
}

export function IndicadoresFacturacionComponent({ indicadores, isLoading }: IndicadoresFacturacionProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader className="pb-2">
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            </CardHeader>
            <CardContent>
              <div className="h-8 bg-gray-200 rounded w-1/2 mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-full"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Indicadores principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Facturado */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500 flex items-center">
              <DollarSign className="h-4 w-4 mr-2" />
              Total Facturado
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <span className="text-2xl font-bold text-gray-900">
                {formatCurrency(indicadores.totalFacturado)}
              </span>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Todos los proyectos
            </p>
          </CardContent>
        </Card>

        {/* Porcentaje Pagadas */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500 flex items-center">
              <CheckCircle className="h-4 w-4 mr-2" />
              % Facturas Pagadas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2">
              <span className="text-2xl font-bold text-green-600">
                {indicadores.porcentajePagadas.toFixed(1)}%
              </span>
              {indicadores.porcentajePagadas >= 80 ? (
                <TrendingUp className="h-4 w-4 text-green-600" />
              ) : (
                <TrendingDown className="h-4 w-4 text-red-600" />
              )}
            </div>
            <Progress value={indicadores.porcentajePagadas} className="mt-2" />
          </CardContent>
        </Card>

        {/* Días Promedio Pago */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500 flex items-center">
              <Clock className="h-4 w-4 mr-2" />
              Días Promedio Pago
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <span className="text-2xl font-bold text-blue-600">
                {indicadores.diasPromedioPago}
              </span>
              <span className="text-sm text-gray-500 ml-1">días</span>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Tiempo promedio de cobro
            </p>
          </CardContent>
        </Card>

        {/* Facturas Vencidas */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500 flex items-center">
              <AlertTriangle className="h-4 w-4 mr-2" />
              Facturas Vencidas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <span className={`text-2xl font-bold ${indicadores.facturasVencidas > 0 ? 'text-red-600' : 'text-green-600'}`}>
                {indicadores.facturasVencidas}
              </span>
              {indicadores.facturasVencidas > 0 && (
                <AlertTriangle className="h-4 w-4 text-red-600 ml-2" />
              )}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Requieren atención inmediata
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Indicadores secundarios */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Distribución por Estado */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold flex items-center">
              <BarChart3 className="h-5 w-5 mr-2" />
              Distribución por Estado
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span className="text-sm font-medium">Pagadas</span>
                </div>
                <Badge variant="secondary" className="bg-green-100 text-green-800">
                  {indicadores.distribucionPorEstado[EstadoFactura.PAGADA] || 0}
                </Badge>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                  <span className="text-sm font-medium">Pendientes</span>
                </div>
                <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                  {indicadores.distribucionPorEstado[EstadoFactura.PENDIENTE] || 0}
                </Badge>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                  <span className="text-sm font-medium">Vencidas</span>
                </div>
                <Badge variant="secondary" className="bg-red-100 text-red-800">
                  {indicadores.distribucionPorEstado[EstadoFactura.VENCIDA] || 0}
                </Badge>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-gray-500 rounded-full"></div>
                  <span className="text-sm font-medium">Rechazadas</span>
                </div>
                <Badge variant="secondary" className="bg-gray-100 text-gray-800">
                  {indicadores.distribucionPorEstado[EstadoFactura.RECHAZADA] || 0}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Proyección de Ingresos */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold flex items-center">
              <Calendar className="h-5 w-5 mr-2" />
              Proyección Próximos 30 Días
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center">
              <p className="text-sm text-gray-500 mb-2">Ingresos esperados</p>
              <p className="text-3xl font-bold text-blue-600">
                {formatCurrency(indicadores.proyeccionIngresos30Dias)}
              </p>
            </div>
            
            <div className="space-y-2 pt-4 border-t">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Pendiente de cobro</span>
                <span className="font-medium">{formatCurrency(indicadores.totalPendiente)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Total pagado</span>
                <span className="font-medium text-green-600">{formatCurrency(indicadores.totalPagado)}</span>
              </div>
            </div>

            {indicadores.facturasVencidas > 0 && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3 mt-4">
                <div className="flex items-center space-x-2">
                  <AlertTriangle className="h-4 w-4 text-red-600" />
                  <p className="text-sm font-medium text-red-800">Atención Requerida</p>
                </div>
                <p className="text-xs text-red-600 mt-1">
                  {indicadores.facturasVencidas} facturas requieren seguimiento inmediato
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}