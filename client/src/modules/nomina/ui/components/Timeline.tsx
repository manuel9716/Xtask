import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Clock, CheckCircle, AlertCircle } from "lucide-react";

interface TimelineItem {
  id: number;
  fecha: Date;
  descripcion: string;
  estado: 'pagado' | 'pendiente' | 'retrasado';
  monto: number;
  proyecto?: string;
}

interface TimelineProps {
  items: TimelineItem[];
}

export function Timeline({ items }: TimelineProps) {
  const getStatusIcon = (estado: string) => {
    switch (estado) {
      case 'pagado':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'retrasado':
        return <AlertCircle className="h-4 w-4 text-red-600" />;
      default:
        return <Clock className="h-4 w-4 text-yellow-600" />;
    }
  };

  const getStatusBadge = (estado: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive"> = {
      pagado: "default",
      pendiente: "secondary",
      retrasado: "destructive"
    };
    
    return (
      <Badge variant={variants[estado] || "secondary"}>
        {estado.charAt(0).toUpperCase() + estado.slice(1)}
      </Badge>
    );
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const formatDate = (date: Date) => {
    try {
      // Verificar si la fecha es válida
      if (!date || isNaN(date.getTime())) {
        return 'Fecha no disponible';
      }
      
      return new Intl.DateTimeFormat('es-CO', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      }).format(date);
    } catch (error) {
      return 'Fecha no disponible';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Timeline de Eventos</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {items.length === 0 ? (
            <p className="text-muted-foreground text-center py-4">
              No hay eventos recientes
            </p>
          ) : (
            items.map((item) => (
              <div key={item.id} className="flex items-start space-x-3">
                <div className="mt-1">
                  {getStatusIcon(item.estado)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-foreground">
                      {item.descripcion}
                    </p>
                    {getStatusBadge(item.estado)}
                  </div>
                  <div className="mt-1 flex items-center space-x-2 text-xs text-muted-foreground">
                    <span>{formatDate(item.fecha)}</span>
                    <span>•</span>
                    <span className="font-medium">{formatCurrency(item.monto)}</span>
                    {item.proyecto && (
                      <>
                        <span>•</span>
                        <span>{item.proyecto}</span>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}