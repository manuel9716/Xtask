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
import { Calculator, Check, X, AlertTriangle, BarChart3 } from "lucide-react";
import { Bonificacion, EstadoBonificacion } from "../../domain/entities/Bonificacion";
import { formatCurrency } from "@/lib/utils";

// Función auxiliar para obtener el color según el estado
const getEstadoColor = (estado: EstadoBonificacion) => {
  switch (estado) {
    case EstadoBonificacion.APROBADO:
      return "bg-green-100 text-green-800 border-green-200";
    case EstadoBonificacion.PAGADO:
      return "bg-blue-100 text-blue-800 border-blue-200";
    case EstadoBonificacion.RECHAZADO:
      return "bg-red-100 text-red-800 border-red-200";
    case EstadoBonificacion.CALCULADO:
    default:
      return "bg-amber-100 text-amber-800 border-amber-200";
  }
};

// Función auxiliar para obtener el icono según el estado
const getEstadoIcon = (estado: EstadoBonificacion) => {
  switch (estado) {
    case EstadoBonificacion.APROBADO:
      return <Check className="h-4 w-4" />;
    case EstadoBonificacion.PAGADO:
      return <BarChart3 className="h-4 w-4" />;
    case EstadoBonificacion.RECHAZADO:
      return <X className="h-4 w-4" />;
    case EstadoBonificacion.CALCULADO:
    default:
      return <AlertTriangle className="h-4 w-4" />;
  }
};

interface BonificacionResumenProps {
  bonificacion?: Bonificacion;
  isLoading?: boolean;
  onCalcular?: () => void;
  canCalculate?: boolean;
  className?: string;
  mesActual?: string; // Formato "YYYY-MM"
}

/**
 * Componente que muestra un resumen de la bonificación mensual
 */
export const BonificacionResumen: React.FC<BonificacionResumenProps> = ({
  bonificacion,
  isLoading = false,
  onCalcular,
  canCalculate = true,
  className = "",
  mesActual = ""
}) => {
  // Formatear el mes para mostrarlo más amigable (ej: Mayo 2025)
  const formatearMes = (mesString: string) => {
    if (!mesString) return "";
    try {
      const [year, month] = mesString.split("-");
      const date = new Date(parseInt(year), parseInt(month) - 1);
      return date.toLocaleDateString("es-ES", { 
        month: "long", 
        year: "numeric" 
      });
    } catch (error) {
      return mesString;
    }
  };

  const getMesFormateado = () => {
    return bonificacion?.mes 
      ? formatearMes(bonificacion.mes)
      : mesActual 
        ? formatearMes(mesActual)
        : "";
  };

  return (
    <Card className={`shadow-md ${className}`}>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-xl">Bonificación Mensual</CardTitle>
            <CardDescription>
              {getMesFormateado()}
            </CardDescription>
          </div>
          
          {bonificacion && (
            <Badge variant="outline" className={getEstadoColor(bonificacion.estado as EstadoBonificacion)}>
              <span className="flex items-center">
                {getEstadoIcon(bonificacion.estado as EstadoBonificacion)}
                <span className="ml-1">{bonificacion.estado}</span>
              </span>
            </Badge>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="pt-4">
        {isLoading ? (
          <div className="flex justify-center py-6">
            <div className="animate-spin w-12 h-12 border-t-2 border-b-2 border-primary rounded-full"></div>
          </div>
        ) : bonificacion ? (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Salario base</p>
                <p className="text-lg font-medium">{formatCurrency(bonificacion.salarioBase)}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Salario variable</p>
                <p className="text-lg font-medium">{formatCurrency(bonificacion.salarioVariable)}</p>
              </div>
            </div>
            
            <div className="space-y-2 pt-2">
              <div className="flex justify-between items-center">
                <p className="text-sm font-medium">Cumplimiento global</p>
                <p className="font-medium">{bonificacion.porcentajeCumplimientoGlobal.toFixed(1)}%</p>
              </div>
              <Progress value={bonificacion.porcentajeCumplimientoGlobal} className="h-2" />
            </div>
            
            <div className="pt-4 border-t">
              <div className="flex justify-between items-center">
                <p className="text-sm font-medium">Bonificación total</p>
                <p className="text-xl font-bold text-primary">{formatCurrency(bonificacion.bonificacionTotal)}</p>
              </div>
            </div>
            
            {bonificacion.aprobadoPor && (
              <div className="border-t pt-2 mt-4 text-xs text-muted-foreground">
                <div>Aprobado por: {bonificacion.aprobadoPor}</div>
                {bonificacion.comentarios && (
                  <div className="italic mt-1">"{bonificacion.comentarios}"</div>
                )}
              </div>
            )}
          </div>
        ) : (
          <div className="py-6 text-center space-y-4">
            <p className="text-muted-foreground">
              No se ha calculado la bonificación para este mes.
            </p>
            {onCalcular && canCalculate && (
              <Button 
                variant="outline" 
                onClick={onCalcular}
                className="mx-auto"
              >
                <Calculator className="h-4 w-4 mr-2" /> 
                Calcular Bonificación
              </Button>
            )}
          </div>
        )}
      </CardContent>
      
      {bonificacion && onCalcular && canCalculate && (
        <CardFooter className="border-t pt-4">
          <Button 
            variant="outline" 
            onClick={onCalcular}
            className="w-full"
          >
            <Calculator className="h-4 w-4 mr-2" /> 
            Recalcular Bonificación
          </Button>
        </CardFooter>
      )}
    </Card>
  );
};

export default BonificacionResumen;