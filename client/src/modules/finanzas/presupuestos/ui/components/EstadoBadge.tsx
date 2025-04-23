import React from 'react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Badge } from '@/components/ui/badge';
import { EstadoPresupuesto } from '../../domain/entities/Presupuesto';
import { useTranslation } from 'react-i18next';

interface EstadoBadgeProps {
  estado: EstadoPresupuesto;
  className?: string;
}

/**
 * Componente que muestra el estado de un presupuesto con un badge coloreado y tooltip informativo
 */
export const EstadoBadge: React.FC<EstadoBadgeProps> = ({ estado, className }) => {
  const { t } = useTranslation();

  // Determinar la variante y mensaje basado en el estado
  let variant: 'default' | 'success' | 'warning' | 'destructive' = 'default';
  let tooltipMessage = '';
  let icon = null;

  switch (estado) {
    case EstadoPresupuesto.ACTIVO:
      variant = 'success';
      tooltipMessage = t('finances.budgets.status.activeTooltip');
      icon = '✅';
      break;
    case EstadoPresupuesto.EN_RIESGO:
      variant = 'warning';
      tooltipMessage = t('finances.budgets.status.riskTooltip');
      icon = '⚠️';
      break;
    case EstadoPresupuesto.CRITICO:
      variant = 'destructive';
      tooltipMessage = t('finances.budgets.status.criticalTooltip');
      icon = '🔴';
      break;
  }

  // Traducir el estado para mostrarlo
  const estadoLabel = estado === EstadoPresupuesto.ACTIVO 
    ? t('finances.budgets.status.active')
    : estado === EstadoPresupuesto.EN_RIESGO 
      ? t('finances.budgets.status.risk')
      : t('finances.budgets.status.critical');

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Badge variant={variant} className={`font-medium ${className}`}>
            <span className="mr-1">{icon}</span> {estadoLabel}
          </Badge>
        </TooltipTrigger>
        <TooltipContent>
          <p>{tooltipMessage}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};