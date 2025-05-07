import { Proyecto } from '../../domain/entities/Proyecto';
import * as Schema from '@shared/schema';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { formatCurrency } from '@/lib/utils';
import { Link } from 'wouter';
import { CalendarIcon, DollarSignIcon, UserIcon } from 'lucide-react';
import { EstadoProyectoBadge } from './EstadoProyectoBadge';
import { useState } from 'react';
import { CambiarEstadoProyectoDialog } from './CambiarEstadoProyectoDialog';

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
        
        <Button 
          variant="ghost" 
          size="icon"
          onClick={() => setCambioEstadoAbierto(true)}
        >
          <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-4 w-4">
            <path d="M3.625 7.5C3.625 8.12132 3.12132 8.625 2.5 8.625C1.87868 8.625 1.375 8.12132 1.375 7.5C1.375 6.87868 1.87868 6.375 2.5 6.375C3.12132 6.375 3.625 6.87868 3.625 7.5ZM8.625 7.5C8.625 8.12132 8.12132 8.625 7.5 8.625C6.87868 8.625 6.375 8.12132 6.375 7.5C6.375 6.87868 6.87868 6.375 7.5 6.375C8.12132 6.375 8.625 6.87868 8.625 7.5ZM13.625 7.5C13.625 8.12132 13.1213 8.625 12.5 8.625C11.8787 8.625 11.375 8.12132 11.375 7.5C11.375 6.87868 11.8787 6.375 12.5 6.375C13.1213 6.375 13.625 6.87868 13.625 7.5Z" fill="currentColor" fillRule="evenodd" clipRule="evenodd"></path>
          </svg>
        </Button>
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
      
      {/* Diálogo para cambiar estado */}
      <CambiarEstadoProyectoDialog
        proyectoId={proyecto.id}
        estadoActual={proyecto.estado}
        onEstadoCambiado={onEstadoCambiado}
        open={cambioEstadoAbierto}
        onOpenChange={setCambioEstadoAbierto}
      >
        <span></span>
      </CambiarEstadoProyectoDialog>
    </Card>
  );
}