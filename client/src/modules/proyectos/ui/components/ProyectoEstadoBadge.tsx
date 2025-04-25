import React from 'react';
import { Badge } from '@/components/ui/badge';
import { EstadoProyecto } from '@shared/schema';
import { 
  Clock, 
  CheckCircle, 
  PauseCircle, 
  XCircle, 
  Archive, 
  AlertCircle 
} from 'lucide-react';

interface ProyectoEstadoBadgeProps {
  estado: EstadoProyecto;
  className?: string;
}

/**
 * Componente para mostrar el estado de un proyecto con un estilo visual similar
 * al utilizado en el módulo de finanzas.
 */
export function ProyectoEstadoBadge({ estado, className = '' }: ProyectoEstadoBadgeProps) {
  let badgeStyle = '';
  let icon = null;
  let label = '';

  switch (estado) {
    case EstadoProyecto.ACTIVO:
      badgeStyle = 'bg-green-100 text-green-800 hover:bg-green-200 border-green-200';
      icon = <Clock className="h-3 w-3 mr-1" />;
      label = 'Activo';
      break;
    case EstadoProyecto.PAUSADO:
      badgeStyle = 'bg-amber-100 text-amber-800 hover:bg-amber-200 border-amber-200';
      icon = <PauseCircle className="h-3 w-3 mr-1" />;
      label = 'Pausado';
      break;
    case EstadoProyecto.RETRASADO:
      badgeStyle = 'bg-red-100 text-red-800 hover:bg-red-200 border-red-200';
      icon = <AlertCircle className="h-3 w-3 mr-1" />;
      label = 'Retrasado';
      break;
    case EstadoProyecto.FINALIZADO:
      badgeStyle = 'bg-blue-100 text-blue-800 hover:bg-blue-200 border-blue-200';
      icon = <CheckCircle className="h-3 w-3 mr-1" />;
      label = 'Finalizado';
      break;
    case EstadoProyecto.CANCELADO:
      badgeStyle = 'bg-orange-100 text-orange-800 hover:bg-orange-200 border-orange-200';
      icon = <XCircle className="h-3 w-3 mr-1" />;
      label = 'Cancelado';
      break;
    case EstadoProyecto.ARCHIVADO:
      badgeStyle = 'bg-gray-100 text-gray-800 hover:bg-gray-200 border-gray-200';
      icon = <Archive className="h-3 w-3 mr-1" />;
      label = 'Archivado';
      break;
    default:
      badgeStyle = 'bg-gray-100 text-gray-800 hover:bg-gray-200 border-gray-200';
      label = 'Desconocido';
  }

  return (
    <Badge className={`flex items-center font-medium ${badgeStyle} ${className}`} variant="outline">
      {icon}
      {label}
    </Badge>
  );
}