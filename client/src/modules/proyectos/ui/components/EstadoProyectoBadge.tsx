import React from "react";
import { Badge } from "@/components/ui/badge";
import { EstadoProyecto } from "@shared/schema";
import { Clock, CheckCircle, PauseCircle, XCircle, Archive, AlertCircle } from "lucide-react";

interface EstadoProyectoBadgeProps {
  estado: EstadoProyecto;
  className?: string;
}

export function EstadoProyectoBadge({ estado, className = "" }: EstadoProyectoBadgeProps) {
  const getVariant = () => {
    switch (estado) {
      case EstadoProyecto.ACTIVO:
        return "bg-green-600 text-white hover:bg-green-700 border-green-600";
      case EstadoProyecto.PAUSADO:
        return "bg-amber-500 text-white hover:bg-amber-600 border-amber-500";
      case EstadoProyecto.RETRASADO:
        return "bg-red-600 text-white hover:bg-red-700 border-red-600";
      case EstadoProyecto.FINALIZADO:
        return "bg-blue-600 text-white hover:bg-blue-700 border-blue-600";
      case EstadoProyecto.CANCELADO:
        return "bg-orange-600 text-white hover:bg-orange-700 border-orange-600";
      case EstadoProyecto.ARCHIVADO:
        return "bg-gray-600 text-white hover:bg-gray-700 border-gray-600";
      default:
        return "bg-gray-600 text-white hover:bg-gray-700 border-gray-600";
    }
  };

  const getIcon = () => {
    switch (estado) {
      case EstadoProyecto.ACTIVO:
        return <Clock className="h-3.5 w-3.5 mr-1" />;
      case EstadoProyecto.PAUSADO:
        return <PauseCircle className="h-3.5 w-3.5 mr-1" />;
      case EstadoProyecto.RETRASADO:
        return <AlertCircle className="h-3.5 w-3.5 mr-1" />;
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