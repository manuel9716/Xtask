import React, { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { MoreHorizontal, FileText, Edit, Eye, AlertTriangle, Settings } from 'lucide-react';
import { Presupuesto } from '../../domain/entities/Presupuesto';
import { EstadoBadge } from './EstadoBadge';
import { Progress } from '@/components/ui/progress';
import { useTranslation } from 'react-i18next';
import { ControlPresupuestoPanel } from './ControlPresupuestoPanel';

interface PresupuestoTableProps {
  presupuestos: Presupuesto[];
  onEdit?: (presupuesto: Presupuesto) => void;
  onView?: (presupuesto: Presupuesto) => void;
  onExport?: (presupuesto: Presupuesto) => void;
  isLoading?: boolean;
}

/**
 * Componente de tabla para mostrar presupuestos con acciones
 */
export const PresupuestoTable: React.FC<PresupuestoTableProps> = ({
  presupuestos,
  onEdit,
  onView,
  onExport,
  isLoading = false
}) => {
  const { t } = useTranslation();
  const [hoveredRow, setHoveredRow] = useState<number | null>(null);
  const [controlPanelOpen, setControlPanelOpen] = useState(false);
  const [selectedPresupuesto, setSelectedPresupuesto] = useState<Presupuesto | null>(null);

  // Ayudantes para formatear valores
  const formatMoney = (amount: number) => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 2
    }).format(amount);
  };

  const formatPercent = (value: number) => {
    return `${value.toFixed(1)}%`;
  };

  // Determinar el color de la barra de progreso según el porcentaje
  const getProgressColor = (percent: number) => {
    if (percent < 80) return 'bg-green-500';
    if (percent < 95) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const handleOpenControlPanel = (presupuesto: Presupuesto) => {
    setSelectedPresupuesto(presupuesto);
    setControlPanelOpen(true);
  };

  const handleCloseControlPanel = () => {
    setControlPanelOpen(false);
    setSelectedPresupuesto(null);
  };

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>{t('finances.budgets.table.name')}</TableHead>
            <TableHead className="text-right">{t('finances.budgets.table.budget')}</TableHead>
            <TableHead className="text-right">{t('finances.budgets.table.spent')}</TableHead>
            <TableHead className="w-[180px]">{t('finances.budgets.table.execution')}</TableHead>
            <TableHead>{t('finances.budgets.table.status')}</TableHead>
            <TableHead className="text-right">{t('finances.budgets.table.actions')}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading ? (
            // Filas de carga (skeleton)
            Array.from({ length: 5 }).map((_, index) => (
              <TableRow key={`skeleton-${index}`}>
                <TableCell className="animate-pulse bg-gray-200 h-6 rounded"></TableCell>
                <TableCell className="animate-pulse bg-gray-200 h-6 rounded"></TableCell>
                <TableCell className="animate-pulse bg-gray-200 h-6 rounded"></TableCell>
                <TableCell className="animate-pulse bg-gray-200 h-6 rounded"></TableCell>
                <TableCell className="animate-pulse bg-gray-200 h-6 rounded"></TableCell>
                <TableCell className="animate-pulse bg-gray-200 h-6 rounded"></TableCell>
              </TableRow>
            ))
          ) : presupuestos.length === 0 ? (
            // Mensaje cuando no hay datos
            <TableRow>
              <TableCell colSpan={6} className="h-24 text-center">
                {t('finances.budgets.noBudgetsFound')}
              </TableCell>
            </TableRow>
          ) : (
            // Datos reales
            presupuestos.map((presupuesto) => (
              <TableRow 
                key={presupuesto.id}
                onMouseEnter={() => setHoveredRow(presupuesto.id)}
                onMouseLeave={() => setHoveredRow(null)}
                className="relative"
              >
                <TableCell className="font-medium">{presupuesto.nombre}</TableCell>
                <TableCell className="text-right">{formatMoney(presupuesto.monto)}</TableCell>
                <TableCell className="text-right">{formatMoney(presupuesto.gastado)}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Progress 
                      value={presupuesto.porcentajeEjecucion} 
                      max={100}
                      className={`h-2 ${getProgressColor(presupuesto.porcentajeEjecucion)}`} 
                    />
                    <span className="text-xs font-medium">
                      {formatPercent(presupuesto.porcentajeEjecucion)}
                    </span>
                  </div>
                </TableCell>
                <TableCell>
                  <EstadoBadge estado={presupuesto.estado} />
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center gap-2 justify-end">
                    {/* Botón principal de control */}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleOpenControlPanel(presupuesto)}
                      className="h-8 w-8 p-0"
                      title="Control de Presupuesto"
                    >
                      <Settings className="h-4 w-4" />
                    </Button>
                    
                    {/* Menú de acciones adicionales */}
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <span className="sr-only">{t('common.openMenu')}</span>
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => onView?.(presupuesto)}>
                          <Eye className="mr-2 h-4 w-4" />
                          {t('finances.budgets.actions.viewDetails')}
                        </DropdownMenuItem>
                        
                        {presupuesto.estado === 'ACTIVO' && (
                          <DropdownMenuItem onClick={() => onEdit?.(presupuesto)}>
                            <Edit className="mr-2 h-4 w-4" />
                            {t('finances.budgets.actions.edit')}
                          </DropdownMenuItem>
                        )}
                        
                        <DropdownMenuItem onClick={() => onExport?.(presupuesto)}>
                          <FileText className="mr-2 h-4 w-4" />
                          {t('finances.budgets.actions.export')}
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
      
      {/* Línea informativa al pie de la tabla */}
      <div className="py-2 px-4 text-sm text-muted-foreground border-t flex items-center gap-2">
        <AlertTriangle className="h-4 w-4" />
        {t('finances.budgets.activeBudgetsListInfo')}
      </div>

      {/* Panel de Control del Presupuesto */}
      <ControlPresupuestoPanel
        isOpen={controlPanelOpen}
        onClose={handleCloseControlPanel}
        presupuestoId={selectedPresupuesto?.id || null}
        presupuestoNombre={selectedPresupuesto?.nombre}
      />
    </div>
  );
};