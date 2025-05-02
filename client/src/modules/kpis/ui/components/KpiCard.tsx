import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Indicador, EstadoKpi } from "../../domain/entities/Indicador";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CheckCircle, XCircle, AlertCircle, HelpCircle, Clock, ArrowUpRight } from "lucide-react";
import { Progress } from "@/components/ui/progress";

export interface KpiCardProps {
  kpi: Indicador;
  onRegisterResult?: () => void;
}

export function KpiCard({ kpi, onRegisterResult }: KpiCardProps) {
  // Determinar color y icono según el estado
  const getBadgeDetails = (estado: EstadoKpi) => {
    switch (estado) {
      case EstadoKpi.PENDIENTE:
        return { color: "bg-amber-100 text-amber-800 hover:bg-amber-100", icon: <Clock className="h-4 w-4" /> };
      case EstadoKpi.EN_PROGRESO:
        return { color: "bg-blue-100 text-blue-800 hover:bg-blue-100", icon: <ArrowUpRight className="h-4 w-4" /> };
      case EstadoKpi.CUMPLIDO:
        return { color: "bg-green-100 text-green-800 hover:bg-green-100", icon: <CheckCircle className="h-4 w-4" /> };
      case EstadoKpi.NO_CUMPLIDO:
        return { color: "bg-red-100 text-red-800 hover:bg-red-100", icon: <XCircle className="h-4 w-4" /> };
      case EstadoKpi.VALIDADO:
        return { color: "bg-indigo-100 text-indigo-800 hover:bg-indigo-100", icon: <CheckCircle className="h-4 w-4" /> };
      case EstadoKpi.RECHAZADO:
        return { color: "bg-red-100 text-red-800 hover:bg-red-100", icon: <XCircle className="h-4 w-4" /> };
      default:
        return { color: "bg-gray-100 text-gray-800 hover:bg-gray-100", icon: <HelpCircle className="h-4 w-4" /> };
    }
  };

  // Formatear texto de estado
  const getEstadoText = (estado: EstadoKpi) => {
    switch (estado) {
      case EstadoKpi.PENDIENTE:
        return "Pendiente";
      case EstadoKpi.EN_PROGRESO:
        return "En progreso";
      case EstadoKpi.CUMPLIDO:
        return "Cumplido";
      case EstadoKpi.NO_CUMPLIDO:
        return "No cumplido";
      case EstadoKpi.VALIDADO:
        return "Validado";
      case EstadoKpi.RECHAZADO:
        return "Rechazado";
      default:
        return "Desconocido";
    }
  };

  // Color para la barra de progreso
  const getProgressColor = (porcentaje?: number) => {
    if (!porcentaje) return "bg-gray-200";
    if (porcentaje >= 100) return "bg-green-500";
    if (porcentaje >= 75) return "bg-amber-500";
    return "bg-red-500";
  };

  const { color, icon } = getBadgeDetails(kpi.estado);
  const canRegisterResult = kpi.estado === EstadoKpi.PENDIENTE && onRegisterResult;
  const showProgress = kpi.valorObtenido !== undefined && kpi.porcentajeCumplimiento !== undefined;

  return (
    <Card className="shadow-sm hover:shadow transition-shadow duration-300">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <CardTitle className="text-base font-medium">{kpi.descripcion}</CardTitle>
          <Badge variant="outline" className={color}>
            <span className="flex items-center">
              {icon}
              <span className="ml-1 text-xs">{getEstadoText(kpi.estado)}</span>
            </span>
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="pb-2 text-sm">
        <div className="grid grid-cols-2 gap-2 mb-2">
          <div>
            <p className="text-xs text-muted-foreground">Fórmula</p>
            <p className="font-medium">{kpi.formula}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Peso</p>
            <p className="font-medium">{kpi.porcentajePeso}%</p>
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-2">
          <div>
            <p className="text-xs text-muted-foreground">Meta</p>
            <p className="font-medium">{kpi.valorEsperado}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Obtenido</p>
            <p className="font-medium">
              {kpi.valorObtenido !== undefined ? kpi.valorObtenido : "-"}
            </p>
          </div>
        </div>

        {showProgress && (
          <div className="mt-3">
            <div className="flex justify-between mb-1">
              <p className="text-xs text-muted-foreground">Cumplimiento</p>
              <p className="text-xs font-medium">{kpi.porcentajeCumplimiento}%</p>
            </div>
            <Progress 
              value={kpi.porcentajeCumplimiento} 
              max={100}
              className={`h-2 ${getProgressColor(kpi.porcentajeCumplimiento)}`}
            />
          </div>
        )}
      </CardContent>
      <CardFooter className="pt-0">
        {canRegisterResult && (
          <Button 
            variant="outline" 
            size="sm" 
            className="w-full text-xs"
            onClick={onRegisterResult}
          >
            Registrar resultado
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}