import { Proyecto } from '../../domain/entities/Proyecto';
import * as Schema from '@shared/schema';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { formatCurrency } from '@/lib/utils';
import { Link } from 'wouter';

const EstadoProyecto = Schema.EstadoProyecto;
import { 
  CalendarIcon, 
  CheckCircle2,
  ClockIcon,
  DollarSignIcon, 
  ExternalLinkIcon, 
  MoreHorizontal, 
  PauseCircle,
  UserIcon 
} from 'lucide-react';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { EstadoProyectoBadge } from './EstadoProyectoBadge';
import { useState } from 'react';
import { CambiarEstadoProyectoDialog } from './CambiarEstadoProyectoDialog';
import { proyectosApi } from '../../infrastructure/api/proyectosApi';

interface ProyectoCardProps {
  proyecto: Proyecto & { 
    progreso: number;
    retrasado: boolean;
  };
  onEliminar?: (id: number) => void;
  onEstadoCambiado?: () => void;
}

export function ProyectoCard({ proyecto, onEliminar, onEstadoCambiado }: ProyectoCardProps) {
  const [cambioEstadoAbierto, setCambioEstadoAbierto] = useState(false);
  
  // Formatear fechas para presentación
  const fechaInicio = format(new Date(proyecto.fechaInicio), 'dd MMM yyyy', { locale: es });
  const fechaFin = proyecto.fechaFin 
    ? format(new Date(proyecto.fechaFin), 'dd MMM yyyy', { locale: es })
    : 'No definida';
  
  // Clase para resaltar si está retrasado
  const borderClass = proyecto.retrasado 
    ? 'border-destructive/50' 
    : '';
  
  return (
    <Card className={`hover:shadow-md transition-shadow ${borderClass}`}>
      <CardHeader className="p-4 pb-0 flex flex-row justify-between items-start space-y-0">
        <div>
          <Link href={`/admin/proyectos/${proyecto.id}`}>
            <h3 className="font-semibold text-lg hover:text-primary hover:underline cursor-pointer">
              {proyecto.nombre}
            </h3>
          </Link>
          <EstadoProyectoBadge estado={proyecto.estado} className="mt-1" />
        </div>
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <Link href={`/admin/proyectos/${proyecto.id}`}>
              <DropdownMenuItem>
                <ExternalLinkIcon className="mr-2 h-4 w-4" />
                Ver detalles
              </DropdownMenuItem>
            </Link>
            <Link href={`/admin/proyectos/${proyecto.id}/editar`}>
              <DropdownMenuItem>
                Editar
              </DropdownMenuItem>
            </Link>
            
            <DropdownMenuSeparator />
            
            {/* Acciones de estado */}
            <DropdownMenuItem 
              onClick={() => setCambioEstadoAbierto(true)}
              className="text-primary focus:text-primary"
            >
              <ClockIcon className="mr-2 h-4 w-4" />
              Cambiar estado
            </DropdownMenuItem>
            
            {/* Acciones rápidas de estado */}
            {proyecto.estado !== EstadoProyecto.FINALIZADO && (
              <DropdownMenuItem 
                onClick={async () => {
                  try {
                    await proyectosApi.cambiarEstado(proyecto.id, "FINALIZADO");
                    if (onEstadoCambiado) onEstadoCambiado();
                  } catch (error) {
                    console.error("Error al finalizar proyecto:", error);
                  }
                }}
                className="text-green-600 focus:text-green-600"
              >
                <CheckCircle2 className="mr-2 h-4 w-4" />
                Finalizar proyecto
              </DropdownMenuItem>
            )}
            
            {proyecto.estado !== EstadoProyecto.PAUSADO && proyecto.estado !== EstadoProyecto.FINALIZADO && (
              <DropdownMenuItem 
                onClick={async () => {
                  try {
                    await proyectosApi.cambiarEstado(proyecto.id, "PAUSADO");
                    if (onEstadoCambiado) onEstadoCambiado();
                  } catch (error) {
                    console.error("Error al pausar proyecto:", error);
                  }
                }}
                className="text-amber-600 focus:text-amber-600"
              >
                <PauseCircle className="mr-2 h-4 w-4" />
                Pausar proyecto
              </DropdownMenuItem>
            )}
            
            <DropdownMenuSeparator />
            
            {onEliminar && (
              <DropdownMenuItem 
                onClick={() => onEliminar(proyecto.id)}
                className="text-destructive focus:text-destructive"
              >
                Eliminar
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
          
          {/* Diálogo para cambiar estado */}
          <CambiarEstadoProyectoDialog
            proyectoId={proyecto.id}
            estadoActual={proyecto.estado}
            onEstadoCambiado={onEstadoCambiado}
            open={cambioEstadoAbierto}
            onOpenChange={setCambioEstadoAbierto}
          >
            {/* Este children no se usa, pero es requerido por la interfaz del componente */}
            <span></span>
          </CambiarEstadoProyectoDialog>
        </DropdownMenu>
      </CardHeader>
      
      <CardContent className="p-4">
        <p className="text-sm text-muted-foreground line-clamp-2 h-10">
          {proyecto.descripcion}
        </p>
        
        <div className="mt-4 space-y-3">
          <div className="flex justify-between items-center text-sm">
            <div className="flex items-center text-muted-foreground">
              <CalendarIcon className="mr-1 h-4 w-4" />
              <span>Inicio:</span>
            </div>
            <span className="font-medium">{fechaInicio}</span>
          </div>
          
          <div className="flex justify-between items-center text-sm">
            <div className="flex items-center text-muted-foreground">
              <CalendarIcon className="mr-1 h-4 w-4" />
              <span>Fin previsto:</span>
            </div>
            <span className={`font-medium ${proyecto.retrasado ? 'text-destructive' : ''}`}>
              {fechaFin}
            </span>
          </div>
          
          <div className="flex justify-between items-center text-sm">
            <div className="flex items-center text-muted-foreground">
              <DollarSignIcon className="mr-1 h-4 w-4" />
              <span>Presupuesto:</span>
            </div>
            <span className="font-medium">{formatCurrency(proyecto.presupuesto)}</span>
          </div>
          
          <div className="flex justify-between items-center text-sm">
            <div className="flex items-center text-muted-foreground">
              <UserIcon className="mr-1 h-4 w-4" />
              <span>Responsable ID:</span>
            </div>
            <span className="font-medium">{proyecto.responsableId}</span>
          </div>
        </div>
        
        <div className="mt-4">
          <div className="flex justify-between mb-1 text-sm">
            <span className="text-muted-foreground">Progreso estimado</span>
            <span className="font-medium">{proyecto.progreso}%</span>
          </div>
          <Progress value={proyecto.progreso} className="h-2" />
        </div>
      </CardContent>
      
      <CardFooter className="p-4 pt-0 flex justify-between">
        <div className="text-xs text-muted-foreground">
          Actualizado: {format(new Date(proyecto.updatedAt), 'dd/MM/yyyy', { locale: es })}
        </div>
      </CardFooter>
    </Card>
  );
}