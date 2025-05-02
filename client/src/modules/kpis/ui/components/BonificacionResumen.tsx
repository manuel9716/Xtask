import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Calculator, CheckCircle, Clock, Ban } from "lucide-react";
import { Bonificacion, EstadoBonificacion } from "../../domain/entities/Bonificacion";
import { Skeleton } from "@/components/ui/skeleton";

export interface BonificacionResumenProps {
  bonificacion?: Bonificacion;
  isLoading?: boolean;
  onCalcular?: () => void;
  canCalculate?: boolean;
  mesActual: string; // formato YYYY-MM
}

export function BonificacionResumen({
  bonificacion,
  isLoading = false,
  onCalcular,
  canCalculate = true,
  mesActual
}: BonificacionResumenProps) {
  // Formatear mes para mostrar
  const formatearMes = (mes: string) => {
    const [year, month] = mes.split('-');
    const fecha = new Date(parseInt(year), parseInt(month) - 1, 1);
    return format(fecha, 'MMMM yyyy', { locale: es });
  };

  // Determinar color y icono según el estado
  const getBadgeDetails = (estado?: EstadoBonificacion) => {
    switch (estado) {
      case EstadoBonificacion.CALCULADO:
        return { color: "bg-blue-100 text-blue-800 hover:bg-blue-100", icon: <Calculator className="h-4 w-4" /> };
      case EstadoBonificacion.APROBADO:
        return { color: "bg-green-100 text-green-800 hover:bg-green-100", icon: <CheckCircle className="h-4 w-4" /> };
      case EstadoBonificacion.RECHAZADO:
        return { color: "bg-red-100 text-red-800 hover:bg-red-100", icon: <Ban className="h-4 w-4" /> };
      case EstadoBonificacion.PAGADO:
        return { color: "bg-indigo-100 text-indigo-800 hover:bg-indigo-100", icon: <CheckCircle className="h-4 w-4" /> };
      default:
        return { color: "bg-amber-100 text-amber-800 hover:bg-amber-100", icon: <Clock className="h-4 w-4" /> };
    }
  };

  // Formatear texto de estado
  const getEstadoText = (estado?: EstadoBonificacion) => {
    switch (estado) {
      case EstadoBonificacion.CALCULADO:
        return "Calculado";
      case EstadoBonificacion.APROBADO:
        return "Aprobado";
      case EstadoBonificacion.RECHAZADO:
        return "Rechazado";
      case EstadoBonificacion.PAGADO:
        return "Pagado";
      default:
        return "Pendiente";
    }
  };

  // Formatear número como cantidad monetaria
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const { color, icon } = getBadgeDetails(bonificacion?.estado);

  return (
    <Card className="shadow-sm">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <CardTitle className="text-lg">Bonificación</CardTitle>
          <Badge variant="outline" className={bonificacion ? color : "bg-gray-100 text-gray-800 hover:bg-gray-100"}>
            <span className="flex items-center">
              {bonificacion ? icon : <Clock className="h-4 w-4" />}
              <span className="ml-1 text-xs">{bonificacion ? getEstadoText(bonificacion.estado) : "Pendiente"}</span>
            </span>
          </Badge>
        </div>
        <p className="text-sm text-muted-foreground">
          Periodo: {formatearMes(mesActual)}
        </p>
      </CardHeader>
      <CardContent className="pb-2">
        {isLoading ? (
          <div className="space-y-3">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
          </div>
        ) : bonificacion ? (
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <p className="text-xs text-muted-foreground">Salario base</p>
                <p className="font-medium">{formatCurrency(bonificacion.salarioBase)}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Salario variable</p>
                <p className="font-medium">{formatCurrency(bonificacion.salarioVariable)}</p>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-2">
              <div>
                <p className="text-xs text-muted-foreground">Cumplimiento</p>
                <p className="font-medium">{bonificacion.porcentajeCumplimientoGlobal}%</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Bonificación</p>
                <p className="font-medium text-green-600">{formatCurrency(bonificacion.bonificacionTotal)}</p>
              </div>
            </div>
          </div>
        ) : (
          <div className="py-6 text-center">
            <p className="text-muted-foreground text-sm">
              No se ha calculado bonificación para este mes.
            </p>
          </div>
        )}
      </CardContent>
      {onCalcular && !bonificacion && (
        <CardFooter>
          <Button 
            variant="outline" 
            className="w-full" 
            disabled={!canCalculate}
            onClick={onCalcular}
          >
            <Calculator className="h-4 w-4 mr-2" />
            Calcular bonificación
          </Button>
        </CardFooter>
      )}
    </Card>
  );
}