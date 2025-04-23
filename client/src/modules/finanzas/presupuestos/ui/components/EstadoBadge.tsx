import React from 'react';
import { Badge } from '@/components/ui/badge';
import { PresupuestoEstado } from '../../domain/entities/Presupuesto';
import { ArrowUpCircle, AlertCircle, CheckCircle } from 'lucide-react';

interface EstadoBadgeProps {
  estado: PresupuestoEstado;
}

/**
 * Componente para mostrar el estado de un presupuesto con un estilo visual adecuado
 */
export function EstadoBadge({ estado }: EstadoBadgeProps) {
  let badgeStyle = '';
  let icon = null;
  let label = '';

  switch (estado) {
    case 'ACTIVO':
      badgeStyle = 'bg-green-100 text-green-800 hover:bg-green-200 border-green-200';
      icon = <ArrowUpCircle className="h-3 w-3 mr-1" />;
      label = 'Activo';
      break;
    case 'ALERTA':
      badgeStyle = 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200 border-yellow-200';
      icon = <AlertCircle className="h-3 w-3 mr-1" />;
      label = 'En alerta';
      break;
    case 'COMPLETADO':
      badgeStyle = 'bg-red-100 text-red-800 hover:bg-red-200 border-red-200';
      icon = <CheckCircle className="h-3 w-3 mr-1" />;
      label = 'Completado';
      break;
    default:
      badgeStyle = 'bg-gray-100 text-gray-800 hover:bg-gray-200 border-gray-200';
      label = 'Desconocido';
  }

  return (
    <Badge className={`flex items-center font-medium ${badgeStyle}`} variant="outline">
      {icon}
      {label}
    </Badge>
  );
}