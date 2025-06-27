import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { TabsControlPresupuesto } from './TabsControlPresupuesto';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { 
  DollarSign, 
  Calendar, 
  TrendingUp, 
  Building2,
  X 
} from 'lucide-react';

interface ControlPresupuestoPanelProps {
  isOpen: boolean;
  onClose: () => void;
  presupuestoId: number | null;
  presupuestoNombre?: string;
}

interface PresupuestoDetalle {
  id: number;
  nombre: string;
  monto: number;
  gastado: number;
  porcentajeEjecucion: number;
  fechaInicio: string;
  fechaFin: string;
  area: string;
  estado: string;
  descripcion?: string;
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount);
}

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('es-CO', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}

export function ControlPresupuestoPanel({ 
  isOpen, 
  onClose, 
  presupuestoId,
  presupuestoNombre 
}: ControlPresupuestoPanelProps) {
  // Obtener detalles del presupuesto
  const { data: presupuesto, isLoading } = useQuery({
    queryKey: ['presupuesto-detalle', presupuestoId],
    queryFn: async () => {
      if (!presupuestoId) return null;
      const response = await fetch(`/api/finanzas/presupuestos/${presupuestoId}/detalle`);
      if (!response.ok) {
        throw new Error('Error al obtener detalles del presupuesto');
      }
      return response.json();
    },
    enabled: isOpen && !!presupuestoId,
  });

  if (!presupuestoId) return null;

  const getEstadoColor = (estado: string) => {
    switch (estado.toLowerCase()) {
      case 'activo': return 'bg-green-100 text-green-800 border-green-200';
      case 'en alerta': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'completado': return 'bg-blue-100 text-blue-800 border-blue-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent side="right" className="w-full sm:max-w-4xl p-0 overflow-hidden">
        {/* Header del Panel */}
        <SheetHeader className="px-6 py-4 border-b bg-gradient-to-r from-[#251948] to-[#623BA6] text-white">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <SheetTitle className="text-xl font-bold text-white">
                Control de Presupuesto
              </SheetTitle>
              <SheetDescription className="text-gray-200">
                {presupuestoNombre || presupuesto?.nombre || `Presupuesto #${presupuestoId}`}
              </SheetDescription>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:text-gray-200 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </SheetHeader>

        {/* Resumen General */}
        {isLoading ? (
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-24 bg-gray-100 rounded animate-pulse" />
              ))}
            </div>
          </div>
        ) : presupuesto ? (
          <div className="px-6 py-4 border-b bg-gray-50">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
              {/* Monto Presupuestado */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
                    <DollarSign className="h-4 w-4" />
                    Presupuestado
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-xl font-bold text-[#251948]">
                    {formatCurrency(presupuesto.monto)}
                  </div>
                </CardContent>
              </Card>

              {/* Total Gastado */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
                    <TrendingUp className="h-4 w-4" />
                    Gastado
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-xl font-bold text-red-600">
                    {formatCurrency(presupuesto.gastado)}
                  </div>
                  <Progress 
                    value={presupuesto.porcentajeEjecucion} 
                    className="mt-2 h-2"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    {presupuesto.porcentajeEjecucion.toFixed(1)}% ejecutado
                  </p>
                </CardContent>
              </Card>

              {/* Disponible */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
                    <Building2 className="h-4 w-4" />
                    Disponible
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-xl font-bold text-green-600">
                    {formatCurrency(presupuesto.monto - presupuesto.gastado)}
                  </div>
                  <Badge className={getEstadoColor(presupuesto.estado)}>
                    {presupuesto.estado}
                  </Badge>
                </CardContent>
              </Card>

              {/* Fechas */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    Período
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-sm">
                    <p className="font-medium">Inicio: {formatDate(presupuesto.fechaInicio)}</p>
                    <p className="text-gray-600">Fin: {formatDate(presupuesto.fechaFin)}</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        ) : null}

        {/* Contenido con Tabs */}
        <div className="flex-1 overflow-y-auto">
          <TabsControlPresupuesto presupuestoId={presupuestoId} />
        </div>
      </SheetContent>
    </Sheet>
  );
}