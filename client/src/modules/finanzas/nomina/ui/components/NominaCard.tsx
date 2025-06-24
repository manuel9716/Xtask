import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { NominaConDetalles, calculosNomina } from '../../domain/entities/Nomina';
import { 
  DollarSign, 
  Clock, 
  TrendingUp, 
  User, 
  Calendar,
  CreditCard,
  FileText,
  Building2
} from 'lucide-react';

interface NominaCardProps {
  nomina: NominaConDetalles;
  onRegistrarPago: (nomina: NominaConDetalles) => void;
  onVerDetalle: (nomina: NominaConDetalles) => void;
  onVerHistorial: (recursoId: number) => void;
}

export function NominaCard({ 
  nomina, 
  onRegistrarPago, 
  onVerDetalle, 
  onVerHistorial 
}: NominaCardProps) {
  
  // Función para formatear números en pesos colombianos
  const formatCOP = (amount: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const estadoColor = calculosNomina.colorEstado(nomina.estado);
  const mesFormateado = calculosNomina.formatearMes(nomina.mes);

  return (
    <Card className="hover:shadow-lg transition-shadow duration-200">
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <CardTitle className="flex items-center gap-2 text-lg">
              <User className="h-5 w-5 text-[#251948]" />
              {nomina.recurso.perfil}
            </CardTitle>
            <CardDescription className="flex items-center gap-1">
              <Building2 className="h-4 w-4" />
              {nomina.proyecto.nombre} • {mesFormateado}
            </CardDescription>
          </div>
          <Badge className={`${estadoColor} border font-medium`}>
            {nomina.estado.toUpperCase()}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Información económica principal */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-[#02BDEA]" />
              <span className="text-sm font-medium text-gray-600">Salario Base</span>
            </div>
            <p className="text-lg font-bold text-[#251948]">
              {formatCOP(nomina.recurso.salarioMensual)}
            </p>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-[#623BA6]" />
              <span className="text-sm font-medium text-gray-600">Total a Pagar</span>
            </div>
            <p className="text-lg font-bold text-[#623BA6]">
              {formatCOP(nomina.totalPagar)}
            </p>
          </div>
        </div>

        {/* Bonificación si existe */}
        {nomina.bonificacion && nomina.bonificacion > 0 && (
          <div className="bg-green-50 p-3 rounded-lg border border-green-200">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-green-700">Bonificación</span>
              <span className="font-bold text-green-800">
                {formatCOP(nomina.bonificacion)}
              </span>
            </div>
          </div>
        )}

        <Separator />

        {/* Detalles de tiempo y dedicación */}
        <div className="grid grid-cols-3 gap-3">
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 mb-1">
              <Clock className="h-4 w-4 text-gray-500" />
              <span className="text-xs text-gray-500">Horas/Mes</span>
            </div>
            <p className="font-semibold text-sm">{nomina.horasTotales}h</p>
          </div>

          <div className="text-center">
            <div className="flex items-center justify-center gap-1 mb-1">
              <TrendingUp className="h-4 w-4 text-gray-500" />
              <span className="text-xs text-gray-500">Dedicación</span>
            </div>
            <p className="font-semibold text-sm">{nomina.dedicacion}%</p>
          </div>

          <div className="text-center">
            <div className="flex items-center justify-center gap-1 mb-1">
              <DollarSign className="h-4 w-4 text-gray-500" />
              <span className="text-xs text-gray-500">Valor/Hora</span>
            </div>
            <p className="font-semibold text-sm">{formatCOP(nomina.recurso.valorHora)}</p>
          </div>
        </div>

        {/* Información adicional */}
        <div className="text-xs text-gray-500 space-y-1">
          <div className="flex items-center justify-between">
            <span>Origen:</span>
            <Badge variant="outline" className="text-xs">
              {nomina.recurso.origen}
            </Badge>
          </div>
          {nomina.fechaPago && (
            <div className="flex items-center justify-between">
              <span>Fecha de pago:</span>
              <span className="font-medium">{new Date(nomina.fechaPago).toLocaleDateString('es-CO')}</span>
            </div>
          )}
        </div>

        <Separator />

        {/* Botones de acción */}
        <div className="flex gap-2">
          {nomina.estado === 'pendiente' && (
            <Button 
              onClick={() => onRegistrarPago(nomina)}
              className="flex-1 bg-[#02BDEA] hover:bg-[#02BDEA]/90 text-white"
              size="sm"
            >
              <CreditCard className="h-4 w-4 mr-2" />
              Registrar Pago
            </Button>
          )}
          
          <Button 
            variant="outline" 
            onClick={() => onVerDetalle(nomina)}
            className="flex-1"
            size="sm"
          >
            <FileText className="h-4 w-4 mr-2" />
            Ver Detalle
          </Button>
          
          <Button 
            variant="ghost" 
            onClick={() => onVerHistorial(nomina.recursoId)}
            size="sm"
          >
            <Calendar className="h-4 w-4 mr-2" />
            Historial
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}