import { Badge } from "@/components/ui/badge";
import { EstadoProyecto } from "../../domain/entities/Proyecto";

interface EstadoProyectoBadgeProps {
  estado: EstadoProyecto;
  className?: string;
}

// Mapeo de estado a color de badge y texto localizado
const estadoConfig: Record<EstadoProyecto, { color: string, texto: string }> = {
  [EstadoProyecto.ACTIVO]: { 
    color: "bg-green-500 hover:bg-green-600", 
    texto: "Activo" 
  },
  [EstadoProyecto.PAUSADO]: { 
    color: "bg-yellow-500 hover:bg-yellow-600", 
    texto: "Pausado" 
  },
  [EstadoProyecto.FINALIZADO]: { 
    color: "bg-blue-500 hover:bg-blue-600", 
    texto: "Finalizado" 
  },
  [EstadoProyecto.ARCHIVADO]: { 
    color: "bg-gray-500 hover:bg-gray-600", 
    texto: "Archivado" 
  },
  [EstadoProyecto.CANCELADO]: { 
    color: "bg-red-500 hover:bg-red-600", 
    texto: "Cancelado" 
  },
};

/**
 * Componente para mostrar el estado de un proyecto como un badge con colores según el tipo
 */
export function EstadoProyectoBadge({ estado, className = "" }: EstadoProyectoBadgeProps) {
  const config = estadoConfig[estado];
  
  return (
    <Badge className={`${config.color} ${className}`}>
      {config.texto}
    </Badge>
  );
}