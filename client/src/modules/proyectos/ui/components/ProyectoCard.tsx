import { Proyecto } from '../../domain/entities/Proyecto';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { formatCurrency } from '@/lib/utils';
import { Link } from 'wouter';
import { CalendarIcon, DollarSignIcon, UserIcon } from 'lucide-react';
import { EstadoProyectoBadge } from './EstadoProyectoBadge';
import { MenuAccionesProyecto } from './MenuAccionesProyecto';

interface ProyectoCardProps {
  proyecto: Proyecto & { 
    progreso: number;
    retrasado: boolean;
  };
  onEliminar?: (id: number) => void;
  onEstadoCambiado?: () => void;
}

export function ProyectoCard({ proyecto, onEliminar, onEstadoCambiado }: ProyectoCardProps) {
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
        
        {/* Menú de acciones */}
        <MenuAccionesProyecto 
          proyectoId={proyecto.id}
          estadoActual={proyecto.estado}
          onEliminar={onEliminar}
          onEstadoCambiado={onEstadoCambiado}
        />
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