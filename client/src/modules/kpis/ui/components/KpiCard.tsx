import React from "react";
import { 
  Card, 
  CardHeader, 
  CardTitle, 
  CardDescription, 
  CardContent, 
  CardFooter 
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Pencil, CheckCircle, XCircle, AlertCircle, Calculator } from "lucide-react";
import { Indicador, EstadoKpi } from "../../domain/entities/Indicador";

// Función auxiliar para obtener el color según el estado
const getEstadoColor = (estado: EstadoKpi) => {
  switch (estado) {
    case EstadoKpi.CUMPLIDO:
      return "bg-green-100 text-green-800 border-green-200";
    case EstadoKpi.PARCIAL:
      return "bg-amber-100 text-amber-800 border-amber-200";
    case EstadoKpi.NO_CUMPLIDO:
      return "bg-red-100 text-red-800 border-red-200";
    case EstadoKpi.PENDIENTE:
    default:
      return "bg-gray-100 text-gray-800 border-gray-200";
  }
};

// Función auxiliar para obtener el icono según el estado
const getEstadoIcon = (estado: EstadoKpi) => {
  switch (estado) {
    case EstadoKpi.CUMPLIDO:
      return <CheckCircle className="h-4 w-4" />;
    case EstadoKpi.PARCIAL:
      return <AlertCircle className="h-4 w-4" />;
    case EstadoKpi.NO_CUMPLIDO:
      return <XCircle className="h-4 w-4" />;
    case EstadoKpi.PENDIENTE:
    default:
      return <Calculator className="h-4 w-4" />;
  }
};

interface KpiCardProps {
  kpi: Indicador;
  onEdit?: () => void;
  onRegisterResult?: () => void;
  className?: string;
}

/**
 * Componente que muestra un KPI en forma de tarjeta
 */
export const KpiCard: React.FC<KpiCardProps> = ({ 
  kpi, 
  onEdit, 
  onRegisterResult,
  className = "" 
}) => {
  const porcentajeCumplimiento = kpi.porcentajeCumplimiento ?? 0;
  const tieneResultado = kpi.valorObtenido !== undefined;
  
  return (
    <Card className={`shadow-sm hover:shadow-md transition-shadow ${className}`}>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <CardTitle className="text-lg">{kpi.descripcion}</CardTitle>
          <Badge variant="outline" className={getEstadoColor(kpi.estado)}>
            <span className="flex items-center">
              {getEstadoIcon(kpi.estado)}
              <span className="ml-1">{kpi.estado}</span>
            </span>
          </Badge>
        </div>
        
        <CardDescription>
          <div className="text-xs text-muted-foreground">
            Peso: <span className="font-medium">{kpi.porcentajePeso}%</span>
          </div>
          <div className="text-xs italic mt-1">
            Fórmula: <span className="font-mono">{kpi.formula}</span>
          </div>
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium">Meta:</span>
            <span className="font-medium">{kpi.valorEsperado}</span>
          </div>
          
          {tieneResultado && (
            <>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Resultado:</span>
                <span className="font-medium">{kpi.valorObtenido}</span>
              </div>
              
              <div className="space-y-1">
                <div className="flex justify-between items-center">
                  <span className="text-sm">Cumplimiento:</span>
                  <span className="font-medium">{porcentajeCumplimiento.toFixed(1)}%</span>
                </div>
                <Progress value={porcentajeCumplimiento} className="h-2" />
              </div>
            </>
          )}
          
          {kpi.validadoPor && (
            <div className="border-t pt-2 text-xs text-muted-foreground">
              <div>Validado por: {kpi.validadoPor}</div>
              {kpi.comentariosValidacion && (
                <div className="italic mt-1">"{kpi.comentariosValidacion}"</div>
              )}
            </div>
          )}
        </div>
      </CardContent>
      
      <CardFooter className="flex justify-end gap-2 pt-2">
        {onEdit && (
          <Button 
            variant="outline" 
            size="sm" 
            onClick={onEdit}
            disabled={kpi.validadoPor !== undefined}
          >
            <Pencil className="h-4 w-4 mr-1" /> Editar
          </Button>
        )}
        
        {onRegisterResult && kpi.estado === EstadoKpi.PENDIENTE && (
          <Button 
            variant="default" 
            size="sm" 
            onClick={onRegisterResult}
          >
            <Calculator className="h-4 w-4 mr-1" /> Registrar Resultado
          </Button>
        )}
      </CardFooter>
    </Card>
  );
};

export default KpiCard;