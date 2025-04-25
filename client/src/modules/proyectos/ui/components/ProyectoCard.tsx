import { Proyecto, EstadoProyecto } from "../../domain/entities/Proyecto";
import { Calendar, Clock, DollarSign, Tag, User } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { formatCurrency } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";

interface ProyectoCardProps {
  proyecto: Proyecto;
}

// Mapeo de estado a color de badge
const estadoColorMap: Record<EstadoProyecto, string> = {
  [EstadoProyecto.ACTIVO]: "bg-green-500",
  [EstadoProyecto.PAUSADO]: "bg-yellow-500",
  [EstadoProyecto.FINALIZADO]: "bg-blue-500",
  [EstadoProyecto.ARCHIVADO]: "bg-gray-500",
  [EstadoProyecto.CANCELADO]: "bg-red-500",
};

export function ProyectoCard({ proyecto }: ProyectoCardProps) {
  const [, navigate] = useLocation();

  // Formatear fechas y valores para presentación
  const fechaInicio = format(proyecto.fechaInicio, "dd MMM yyyy", { locale: es });
  const fechaFinPrevista = proyecto.fechaFinPrevista 
    ? format(proyecto.fechaFinPrevista, "dd MMM yyyy", { locale: es })
    : "No definida";
  
  // Calcular días restantes si hay fecha de fin prevista
  const diasRestantes = proyecto.fechaFinPrevista 
    ? Math.ceil((proyecto.fechaFinPrevista.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
    : null;
  
  // Determinar mensaje según días restantes
  let mensajePlazo = "";
  if (diasRestantes !== null) {
    if (diasRestantes < 0) {
      mensajePlazo = `Vencido hace ${Math.abs(diasRestantes)} días`;
    } else if (diasRestantes === 0) {
      mensajePlazo = "Vence hoy";
    } else {
      mensajePlazo = `${diasRestantes} días restantes`;
    }
  }

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-lg">{proyecto.nombre}</CardTitle>
            <CardDescription className="mt-1">ID: {proyecto.id}</CardDescription>
          </div>
          <Badge className={`${estadoColorMap[proyecto.estado]} hover:${estadoColorMap[proyecto.estado]}`}>
            {proyecto.estado.charAt(0).toUpperCase() + proyecto.estado.slice(1)}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="pb-2 flex-grow">
        <p className="text-sm text-gray-500 mb-4 line-clamp-2">{proyecto.descripcion}</p>
        
        <div className="space-y-2">
          <div className="flex items-center text-sm">
            <Calendar className="h-4 w-4 mr-2 text-gray-500" />
            <span>Inicio: {fechaInicio}</span>
          </div>
          
          <div className="flex items-center text-sm">
            <Clock className="h-4 w-4 mr-2 text-gray-500" />
            <span>
              Fin previsto: {fechaFinPrevista}
              {mensajePlazo && (
                <span className={`ml-2 font-medium ${diasRestantes && diasRestantes < 0 ? 'text-red-500' : 'text-blue-500'}`}>
                  ({mensajePlazo})
                </span>
              )}
            </span>
          </div>
          
          <div className="flex items-center text-sm">
            <DollarSign className="h-4 w-4 mr-2 text-gray-500" />
            <span>Presupuesto: {formatCurrency(proyecto.presupuesto)}</span>
          </div>
          
          <div className="flex items-center text-sm">
            <User className="h-4 w-4 mr-2 text-gray-500" />
            <span>Responsable ID: {proyecto.responsableId}</span>
          </div>
        </div>
        
        {proyecto.tags && proyecto.tags.length > 0 && (
          <div className="mt-3 flex items-start gap-1">
            <Tag className="h-4 w-4 mr-1 text-gray-500 shrink-0 mt-0.5" />
            <div className="flex flex-wrap gap-1">
              {proyecto.tags.map((tag, index) => (
                <Badge key={index} variant="outline" className="text-xs">
                  {tag}
                </Badge>
              ))}
            </div>
          </div>
        )}
      </CardContent>
      
      <CardFooter className="pt-2">
        <Button 
          variant="default" 
          className="w-full"
          onClick={() => navigate(`/admin/proyectos/${proyecto.id}`)}
        >
          Ver detalles
        </Button>
      </CardFooter>
    </Card>
  );
}