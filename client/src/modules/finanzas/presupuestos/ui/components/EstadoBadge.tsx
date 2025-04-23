import React from 'react';
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { PresupuestoEstado } from "../../domain/entities/Presupuesto";

interface EstadoBadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  estado: PresupuestoEstado;
}

/**
 * Componente que muestra una etiqueta con el estado del presupuesto
 * con un color distintivo según el estado
 */
export function EstadoBadge({ estado, className, ...props }: EstadoBadgeProps) {
  const getEstadoConfig = (estado: PresupuestoEstado) => {
    switch (estado) {
      case 'ACTIVO':
        return {
          label: 'Activo',
          variant: 'default',
          className: 'bg-green-500 hover:bg-green-600'
        };
      case 'ALERTA':
        return {
          label: 'En alerta',
          variant: 'warning',
          className: 'bg-yellow-500 hover:bg-yellow-600'
        };
      case 'COMPLETADO':
        return {
          label: 'Completado',
          variant: 'destructive',
          className: 'bg-red-500 hover:bg-red-600'
        };
      default:
        return {
          label: estado,
          variant: 'default',
          className: ''
        };
    }
  };

  const config = getEstadoConfig(estado);

  return (
    <div className={cn("flex items-center", className)} {...props}>
      <Badge 
        className={cn(config.className)}
        variant={config.variant as any}
      >
        {config.label}
      </Badge>
    </div>
  );
}