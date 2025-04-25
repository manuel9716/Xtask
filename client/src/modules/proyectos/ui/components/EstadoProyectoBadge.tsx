import React from "react";
import { Badge } from "@/components/ui/badge";
import { EstadoProyecto } from "@shared/schema";
import { Clock, CheckCircle, PauseCircle, XCircle, Archive } from "lucide-react";

interface EstadoProyectoBadgeProps {
  estado: EstadoProyecto;
  className?: string;
}

export function EstadoProyectoBadge({ estado, className = "" }: EstadoProyectoBadgeProps) {
  const getVariant = () => {
    switch (estado) {
      case EstadoProyecto.ACTIVO:
        return "bg-green-100 text-green-800 hover:bg-green-100";
      case EstadoProyecto.PAUSADO:
        return "bg-amber-100 text-amber-800 hover:bg-amber-100";
      case EstadoProyecto.FINALIZADO:
        return "bg-blue-100 text-blue-800 hover:bg-blue-100";
      case EstadoProyecto.CANCELADO:
        return "bg-red-100 text-red-800 hover:bg-red-100";
      case EstadoProyecto.ARCHIVADO:
        return "bg-gray-100 text-gray-800 hover:bg-gray-100";
      default:
        return "bg-gray-100 text-gray-800 hover:bg-gray-100";
    }
  };

  const getIcon = () => {
    switch (estado) {
      case EstadoProyecto.ACTIVO:
        return <Clock className="h-3.5 w-3.5 mr-1" />;
      case EstadoProyecto.PAUSADO:
        return <PauseCircle className="h-3.5 w-3.5 mr-1" />;
      case EstadoProyecto.FINALIZADO:
        return <CheckCircle className="h-3.5 w-3.5 mr-1" />;
      case EstadoProyecto.CANCELADO:
        return <XCircle className="h-3.5 w-3.5 mr-1" />;
      case EstadoProyecto.ARCHIVADO:
        return <Archive className="h-3.5 w-3.5 mr-1" />;
      default:
        return null;
    }
  };

  return (
    <Badge
      variant="outline"
      className={`flex items-center ${getVariant()} ${className}`}
    >
      {getIcon()}
      {estado}
    </Badge>
  );
}