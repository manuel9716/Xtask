import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Check, X, Clock, AlertCircle, DollarSign, Download, Calculator } from "lucide-react";
import { Bonificacion, EstadoBonificacion, DetalleKpiBonificacion } from "../../domain/entities/Bonificacion";
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { useState } from "react";

interface BonificacionResumenProps {
  bonificacion?: Bonificacion;
  isLoading?: boolean;
  onCalcular?: () => void;
  canCalculate?: boolean;
  mesActual?: string;
  onAprobar?: (bonificacion: Bonificacion) => void;
  onRechazar?: (bonificacion: Bonificacion) => void;
  onPagar?: (bonificacion: Bonificacion) => void;
  onDescargar?: (bonificacion: Bonificacion) => void;
}

export function BonificacionResumen({ 
  bonificacion, 
  isLoading,
  onCalcular,
  canCalculate,
  mesActual,
  onAprobar, 
  onRechazar, 
  onPagar,
  onDescargar
}: BonificacionResumenProps) {
  // Estado para controlar visualización de detalles de KPIs
  const [showDetalleKpis, setShowDetalleKpis] = useState(false);

  // Formatear fechas
  const formatDate = (date: Date | string | null | undefined) => {
    if (!date) return 'N/A';
    return format(new Date(date), 'dd MMM yyyy', { locale: es });
  };

  // Formatear montos como moneda
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(amount);
  };

  // Función para determinar color según estado
  const getStatusColor = () => {
    if (!bonificacion) return "bg-amber-500";
    
    switch (bonificacion.estado) {
      case EstadoBonificacion.APROBADA:
        return "bg-green-500";
      case EstadoBonificacion.RECHAZADA:
        return "bg-red-500";
      case EstadoBonificacion.PAGADA:
        return "bg-blue-500";
      case EstadoBonificacion.CALCULADA:
      default:
        return "bg-amber-500";
    }
  };

  // Icono según estado
  const getStatusIcon = () => {
    if (!bonificacion) return <Clock className="h-4 w-4" />;
    
    switch (bonificacion.estado) {
      case EstadoBonificacion.APROBADA:
        return <Check className="h-4 w-4" />;
      case EstadoBonificacion.RECHAZADA:
        return <X className="h-4 w-4" />;
      case EstadoBonificacion.PAGADA:
        return <DollarSign className="h-4 w-4" />;
      case EstadoBonificacion.CALCULADA:
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  // Si está cargando, mostrar skeleton
  if (isLoading) {
    return (
      <Card className="w-full">
        <CardHeader>
          <div className="h-6 w-2/3 bg-gray-200 animate-pulse rounded"></div>
          <div className="h-4 w-full bg-gray-200 animate-pulse rounded mt-2"></div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-4 bg-gray-200 animate-pulse rounded"></div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  // Si no hay bonificación, mostrar card para calcular
  if (!bonificacion) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="text-lg">
            {mesActual ? 
              `Bonificación ${format(new Date(mesActual + '-01'), 'MMMM yyyy', { locale: es })}` : 
              'Bonificación mensual'}
          </CardTitle>
          <CardDescription>
            Calcula tu bonificación mensual basada en el cumplimiento de KPIs
          </CardDescription>
        </CardHeader>
        <CardContent className="pb-2">
          <div className="flex flex-col items-center justify-center py-6 text-center">
            <AlertCircle className="h-12 w-12 text-amber-500 mb-4" />
            <h3 className="text-lg font-medium">No hay bonificación calculada</h3>
            <p className="text-sm text-muted-foreground mt-2 mb-6">
              {canCalculate
                ? "Todos tus KPIs tienen resultados. Puedes calcular tu bonificación ahora."
                : "Registra los resultados de todos tus KPIs para poder calcular tu bonificación."}
            </p>
            {onCalcular && (
              <Button 
                onClick={onCalcular}
                disabled={!canCalculate}
                variant={canCalculate ? "default" : "outline"}
              >
                <Calculator className="h-4 w-4 mr-2" />
                Calcular bonificación
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  // Función para renderizar el detalle de los KPIs
  const renderDetalleKpis = () => {
    if (!bonificacion.detalleKpis || bonificacion.detalleKpis.length === 0) {
      return (
        <div className="text-sm text-muted-foreground py-2 text-center">
          No hay detalle disponible de los KPIs
        </div>
      );
    }

    return (
      <div className="space-y-4 mt-4">
        <h4 className="font-medium text-sm">Detalle de contribución por KPI</h4>
        
        {bonificacion.detalleKpis.map((kpi) => (
          <div key={kpi.id} className={`rounded-md border p-3 text-sm ${kpi.completado ? 'border-green-300 bg-green-50' : 'border-gray-200'}`}>
            <div className="flex justify-between mb-1">
              <span className="font-medium truncate flex items-center gap-1" title={kpi.descripcion}>
                {kpi.completado && <Check className="h-3.5 w-3.5 text-green-600" />}
                {kpi.descripcion}
              </span>
              <span className={`font-bold ${kpi.completado ? 'text-green-600' : 'text-gray-400'}`}>
                {formatCurrency(kpi.montoBonificacion)}
              </span>
            </div>
            
            <div className="flex justify-between text-xs text-muted-foreground mb-1.5">
              <span>Peso: {kpi.porcentajePeso}%</span>
              <span>Cumplimiento: {kpi.porcentajeCumplimiento}%</span>
            </div>
            
            <Progress 
              value={Math.min(kpi.porcentajeCumplimiento, 100)} 
              className={`h-1.5 ${kpi.completado ? 'bg-green-100' : 'bg-gray-100'}`} 
              indicatorClassName={kpi.completado ? 'bg-green-600' : undefined}
            />
            
            <div className="mt-2 text-xs text-muted-foreground">
              {kpi.completado ? (
                <span className="inline-block">
                  Contribución: {formatCurrency(bonificacion.salarioBase)} × {kpi.porcentajePeso}% = {formatCurrency(kpi.montoBonificacion)}
                </span>
              ) : (
                <span className="inline-block text-gray-400">
                  KPI no completado - No contribuye a la bonificación
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    );
  };

  // Si hay bonificación, mostrar detalle
  return (
    <Card className="w-full">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <CardTitle className="text-lg">
            Bonificación {format(new Date(bonificacion.mes + '-01'), 'MMMM yyyy', { locale: es })}
          </CardTitle>
          <Badge className={`${getStatusColor()} text-white flex items-center gap-1 ml-2`}>
            {getStatusIcon()}
            {bonificacion.estado}
          </Badge>
        </div>
        <CardDescription>
          {bonificacion.comentarios ? (
            bonificacion.comentarios
          ) : (
            "Bonificación mensual basada en cumplimiento de KPIs"
          )}
        </CardDescription>
      </CardHeader>
      <CardContent className="pb-1">
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-x-2 gap-y-1 text-sm">
            <span className="text-muted-foreground">Cumplimiento:</span>
            <span className="font-medium text-right">
              {bonificacion.porcentajeCumplimientoGlobal}%
            </span>
            
            <span className="text-muted-foreground">Salario base:</span>
            <span className="font-medium text-right">
              {formatCurrency(bonificacion.salarioBase)}
            </span>
            
            <span className="text-muted-foreground">Bonificación total:</span>
            <span className="font-medium text-right text-primary">
              {formatCurrency(bonificacion.bonificacionTotal)}
            </span>
            
            {bonificacion.aprobadoPor && (
              <>
                <span className="text-muted-foreground">Aprobado por:</span>
                <span className="font-medium text-right">ID: {bonificacion.aprobadoPor}</span>
                
                <span className="text-muted-foreground">Fecha aprobación:</span>
                <span className="font-medium text-right">
                  {formatDate(bonificacion.fechaAprobacion)}
                </span>
              </>
            )}
            
            {bonificacion.fechaPago && (
              <>
                <span className="text-muted-foreground">Pagado el:</span>
                <span className="font-medium text-right">
                  {formatDate(bonificacion.fechaPago)}
                </span>
              </>
            )}
          </div>
          
          <Button 
            variant="ghost" 
            className="w-full text-xs py-1 h-auto mt-2"
            onClick={() => setShowDetalleKpis(!showDetalleKpis)}
          >
            {showDetalleKpis ? "Ocultar detalle" : "Ver detalle de KPIs"}
          </Button>
          
          {showDetalleKpis && renderDetalleKpis()}
        </div>
      </CardContent>
      <CardFooter className="flex justify-between pt-2">
        <div className="text-xs text-muted-foreground">
          Calculado el {formatDate(bonificacion.createdAt)}
        </div>
        <div className="flex gap-2">
          {onDescargar && (
            <Button variant="outline" size="sm" onClick={() => onDescargar(bonificacion)}>
              <Download className="h-3.5 w-3.5 mr-1" />
              Descargar
            </Button>
          )}
          
          {onAprobar && bonificacion.estado === EstadoBonificacion.CALCULADA && (
            <Button variant="default" size="sm" onClick={() => onAprobar(bonificacion)}>
              <Check className="h-3.5 w-3.5 mr-1" />
              Aprobar
            </Button>
          )}
          
          {onRechazar && bonificacion.estado === EstadoBonificacion.CALCULADA && (
            <Button variant="destructive" size="sm" onClick={() => onRechazar(bonificacion)}>
              <X className="h-3.5 w-3.5 mr-1" />
              Rechazar
            </Button>
          )}
          
          {onPagar && bonificacion.estado === EstadoBonificacion.APROBADA && (
            <Button variant="default" size="sm" onClick={() => onPagar(bonificacion)}>
              <DollarSign className="h-3.5 w-3.5 mr-1" />
              Marcar pagado
            </Button>
          )}
        </div>
      </CardFooter>
    </Card>
  );
}