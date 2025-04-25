import { Badge } from '@/components/ui/badge';
import { EstadoProyecto } from '../../domain/entities/Proyecto';
import { cn } from '@/lib/utils';

interface EstadoProyectoBadgeProps {
  estado: EstadoProyecto;
  className?: string;
}

export function EstadoProyectoBadge({ estado, className }: EstadoProyectoBadgeProps) {
  // Determinar variante según el estado
  let variant: 'default' | 'secondary' | 'destructive' | 'outline' = 'default';
  let label: string = estado;
  
  switch (estado) {
    case EstadoProyecto.ACTIVO:
      variant = 'default'; // Verde (primary) para activo
      label = 'Activo';
      break;
    case EstadoProyecto.PAUSADO:
      variant = 'secondary'; // Gris para pausado
      label = 'Pausado';
      break;
    case EstadoProyecto.FINALIZADO:
      variant = 'outline'; // Con borde para finalizado
      label = 'Finalizado';
      break;
    case EstadoProyecto.CANCELADO:
      variant = 'destructive'; // Rojo para cancelado
      label = 'Cancelado';
      break;
    case EstadoProyecto.ARCHIVADO:
      variant = 'outline'; // Con borde para archivado
      label = 'Archivado';
      break;
  }
  
  return (
    <Badge 
      variant={variant} 
      className={cn(
        estado === EstadoProyecto.ARCHIVADO && 'text-muted-foreground',
        className
      )}
    >
      {label}
    </Badge>
  );
}