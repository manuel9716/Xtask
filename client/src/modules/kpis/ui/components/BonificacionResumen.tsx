import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Check, X, Clock, AlertCircle, DollarSign, Download } from "lucide-react";
import { Bonificacion, EstadoBonificacion } from "../../domain/entities/Bonificacion";
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface BonificacionResumenProps {
  bonificacion: Bonificacion;
  onAprobar?: (bonificacion: Bonificacion) => void;
  onRechazar?: (bonificacion: Bonificacion) => void;
  onPagar?: (bonificacion: Bonificacion) => void;
  onDescargar?: (bonificacion: Bonificacion) => void;
}

export function BonificacionResumen({ 
  bonificacion, 
  onAprobar, 
  onRechazar, 
  onPagar,
  onDescargar
}: BonificacionResumenProps) {
  // Función para determinar color según estado
  const getStatusColor = () => {
    switch (bonificacion.estado) {
      case "APROBADA":
        return "bg-green-500";
      case "RECHAZADA":
        return "bg-red-500";
      case "PAGADA":
        return "bg-blue-500";
      case "CALCULADA":
      default:
        return "bg-amber-500";
    }
  };

  // Icono según estado
  const getStatusIcon = () => {
    switch (bonificacion.estado) {
      case "APROBADA":
        return <Check className="h-4 w-4" />;
      case "RECHAZADA":
        return <X className="h-4 w-4" />;
      case "PAGADA":
        return <DollarSign className="h-4 w-4" />;
      case "CALCULADA":
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  // Formatear fechas
  const formatDate = (date: Date | null | undefined) => {
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
            
            <span className="text-muted-foreground">Salario variable:</span>
            <span className="font-medium text-right">
              {formatCurrency(bonificacion.salarioVariable)}
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
          
          {onAprobar && bonificacion.estado === "CALCULADA" && (
            <Button variant="default" size="sm" onClick={() => onAprobar(bonificacion)}>
              <Check className="h-3.5 w-3.5 mr-1" />
              Aprobar
            </Button>
          )}
          
          {onRechazar && bonificacion.estado === "CALCULADA" && (
            <Button variant="destructive" size="sm" onClick={() => onRechazar(bonificacion)}>
              <X className="h-3.5 w-3.5 mr-1" />
              Rechazar
            </Button>
          )}
          
          {onPagar && bonificacion.estado === "APROBADA" && (
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