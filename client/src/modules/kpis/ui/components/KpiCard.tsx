import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Pencil, Check, X, Clock, AlertCircle, ChevronRight } from "lucide-react";
import { EstadoKpi, Indicador } from "../../domain/entities/Indicador";
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface KpiCardProps {
  kpi: Indicador;
  onEdit?: (kpi: Indicador) => void;
  onResult?: (kpi: Indicador) => void;
  onValidate?: (kpi: Indicador) => void;
}

export function KpiCard({ kpi, onEdit, onResult, onValidate }: KpiCardProps) {
  // Función para determinar color según estado
  const getStatusColor = () => {
    switch (kpi.estado) {
      case EstadoKpi.CUMPLIDO:
        return "bg-green-500";
      case EstadoKpi.INCUMPLIDO:
        return "bg-red-500";
      case EstadoKpi.PARCIAL:
        return "bg-amber-500";
      case EstadoKpi.EN_PROGRESO:
        return "bg-blue-500";
      case EstadoKpi.PENDIENTE:
        return "bg-slate-500";
      case EstadoKpi.VALIDADO:
        return "bg-green-700";
      case EstadoKpi.COMPLETADO:
        return "bg-violet-500";
      default:
        return "bg-gray-500";
    }
  };

  // Icono según estado
  const getStatusIcon = () => {
    switch (kpi.estado) {
      case EstadoKpi.CUMPLIDO:
        return <Check className="h-4 w-4" />;
      case EstadoKpi.INCUMPLIDO:
        return <X className="h-4 w-4" />;
      case EstadoKpi.PARCIAL:
        return <AlertCircle className="h-4 w-4" />;
      case EstadoKpi.EN_PROGRESO:
      case EstadoKpi.PENDIENTE:
        return <Clock className="h-4 w-4" />;
      case EstadoKpi.VALIDADO:
        return <Check className="h-4 w-4" />;
      case EstadoKpi.COMPLETADO:
        return <ChevronRight className="h-4 w-4" />;
      default:
        return <AlertCircle className="h-4 w-4" />;
    }
  };

  // Verificar si el KPI tiene medición (valor actual)
  const hasMeasurement = kpi.valorActual !== undefined && kpi.valorActual !== null;

  // Formatear fechas
  const formatDate = (date: Date) => {
    if (!date) return '';
    return format(new Date(date), 'dd MMM yyyy', { locale: es });
  };

  return (
    <Card className="w-full">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <CardTitle className="text-lg">{kpi.nombre}</CardTitle>
          <Badge className={`${getStatusColor()} text-white flex items-center gap-1 ml-2`}>
            {getStatusIcon()}
            {kpi.estado}
          </Badge>
        </div>
        <CardDescription>{kpi.descripcion}</CardDescription>
      </CardHeader>
      <CardContent className="pb-1">
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-x-2 gap-y-1 text-sm">
            <span className="text-muted-foreground">Meta:</span>
            <span className="font-medium text-right">{kpi.valorMeta} {kpi.unidadMedida}</span>
            
            <span className="text-muted-foreground">Base:</span>
            <span className="font-medium text-right">{kpi.valorBase} {kpi.unidadMedida}</span>

            {hasMeasurement && (
              <>
                <span className="text-muted-foreground">Actual:</span>
                <span className="font-medium text-right">{kpi.valorActual} {kpi.unidadMedida}</span>
              </>
            )}

            <span className="text-muted-foreground">Período:</span>
            <span className="font-medium text-right">{kpi.periodicidad}</span>
            
            <span className="text-muted-foreground">Peso:</span>
            <span className="font-medium text-right">{kpi.porcentajePeso}%</span>
          </div>

          {hasMeasurement && kpi.porcentajeCumplimiento !== undefined && (
            <div className="mt-3 mb-1">
              <span className="text-sm text-muted-foreground mb-1 block">
                Cumplimiento: <span className="font-medium">{kpi.porcentajeCumplimiento}%</span>
              </span>
              <Progress 
                value={kpi.porcentajeCumplimiento} 
                max={100}
                className={`h-2 ${
                  kpi.porcentajeCumplimiento >= 100 ? 'bg-green-200' :
                  kpi.porcentajeCumplimiento >= 50 ? 'bg-amber-200' : 'bg-red-200'
                }`}
              />
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter className="flex justify-between pt-2">
        <div className="text-xs text-muted-foreground">
          {formatDate(kpi.fechaInicio)} - {formatDate(kpi.fechaFin)}
        </div>
        <div className="flex gap-2">
          {onEdit && (
            <Button variant="outline" size="sm" onClick={() => onEdit(kpi)}>
              <Pencil className="h-3.5 w-3.5 mr-1" />
              Editar
            </Button>
          )}
          {onResult && !kpi.validadoPor && (
            <Button variant="secondary" size="sm" onClick={() => onResult(kpi)}>
              <Check className="h-3.5 w-3.5 mr-1" />
              Resultado
            </Button>
          )}
          {onValidate && hasMeasurement && !kpi.validadoPor && (
            <Button variant="default" size="sm" onClick={() => onValidate(kpi)}>
              <Check className="h-3.5 w-3.5 mr-1" />
              Validar
            </Button>
          )}
        </div>
      </CardFooter>
    </Card>
  );
}