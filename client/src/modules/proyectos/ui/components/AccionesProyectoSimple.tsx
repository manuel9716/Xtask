import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Link } from 'wouter';
import { Card } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import * as Schema from '@shared/schema';
import { CambiarEstadoProyectoDialog } from './CambiarEstadoProyectoDialog';
import { proyectosApi } from '../../infrastructure/api/proyectosApi';
import { 
  CheckCircle2, 
  Clock, 
  Edit, 
  ExternalLink, 
  MoreVertical, 
  PauseCircle, 
  RefreshCw, 
  Trash2, 
  X 
} from 'lucide-react';

const EstadoProyecto = Schema.EstadoProyecto;

interface AccionesProyectoSimpleProps {
  proyectoId: number;
  estadoActual: typeof EstadoProyecto[keyof typeof EstadoProyecto];
  onEliminar?: (id: number) => void;
  onEstadoCambiado?: () => void;
}

export function AccionesProyectoSimple({
  proyectoId,
  estadoActual,
  onEliminar,
  onEstadoCambiado,
}: AccionesProyectoSimpleProps) {
  const [mostrarAcciones, setMostrarAcciones] = useState(false);
  const [dialogoAbierto, setDialogoAbierto] = useState(false);
  const { toast } = useToast();

  // Función para cambiar estados directamente
  const cambiarEstado = async (estado: string, mensaje: string) => {
    try {
      await proyectosApi.cambiarEstado(proyectoId, estado);
      toast({
        title: "Estado actualizado",
        description: mensaje,
      });
      if (onEstadoCambiado) onEstadoCambiado();
      setMostrarAcciones(false);
    } catch (error) {
      console.error(`Error al cambiar estado a ${estado}:`, error);
      toast({
        title: "Error",
        description: "No se pudo cambiar el estado del proyecto",
        variant: "destructive",
      });
    }
  };

  if (!mostrarAcciones) {
    return (
      <Button 
        variant="ghost" 
        size="icon"
        onClick={() => setMostrarAcciones(true)}
        className="relative z-10"
      >
        <MoreVertical className="h-4 w-4" />
      </Button>
    );
  }

  return (
    <>
      <div className="absolute top-0 right-0 mt-12 mr-2 z-20">
        <Card className="p-2 shadow-lg border">
          <div className="flex flex-col space-y-1">
            <div className="flex justify-between items-center">
              <h4 className="text-sm font-medium px-2">Acciones</h4>
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-6 w-6"
                onClick={() => setMostrarAcciones(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            
            <div className="p-1 flex flex-col space-y-1">
              <Button 
                variant="ghost" 
                size="sm" 
                asChild 
                className="justify-start"
              >
                <Link href={`/admin/proyectos/${proyectoId}`}>
                  <ExternalLink className="mr-2 h-4 w-4" />
                  Ver detalles
                </Link>
              </Button>
              
              <Button 
                variant="ghost" 
                size="sm" 
                asChild 
                className="justify-start"
              >
                <Link href={`/admin/proyectos/${proyectoId}/editar`}>
                  <Edit className="mr-2 h-4 w-4" />
                  Editar
                </Link>
              </Button>
              
              <Button 
                variant="ghost" 
                size="sm" 
                className="justify-start"
                onClick={() => setDialogoAbierto(true)}
              >
                <Clock className="mr-2 h-4 w-4" />
                Cambiar estado
              </Button>
            </div>
            
            <div className="border-t my-1" />
            
            <div className="p-1 flex flex-col space-y-1">
              <h4 className="text-xs text-muted-foreground px-2">Cambiar estado a:</h4>
              
              {estadoActual !== EstadoProyecto.ACTIVO && (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="justify-start hover:text-primary"
                  onClick={() => cambiarEstado("ACTIVO", "El proyecto ha sido activado")}
                >
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Activar
                </Button>
              )}
              
              {estadoActual !== EstadoProyecto.FINALIZADO && (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="justify-start hover:text-green-600"
                  onClick={() => cambiarEstado("FINALIZADO", "El proyecto ha sido finalizado")}
                >
                  <CheckCircle2 className="mr-2 h-4 w-4" />
                  Finalizar
                </Button>
              )}
              
              {estadoActual !== EstadoProyecto.RETRASADO && (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="justify-start hover:text-red-600"
                  onClick={() => cambiarEstado("RETRASADO", "El proyecto ha sido marcado como retrasado")}
                >
                  <Clock className="mr-2 h-4 w-4" />
                  Retrasado
                </Button>
              )}
              
              {estadoActual !== EstadoProyecto.PAUSADO && (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="justify-start hover:text-amber-600"
                  onClick={() => cambiarEstado("PAUSADO", "El proyecto ha sido pausado")}
                >
                  <PauseCircle className="mr-2 h-4 w-4" />
                  Pausar
                </Button>
              )}
            </div>
            
            {onEliminar && (
              <>
                <div className="border-t my-1" />
                <div className="p-1">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="justify-start text-destructive hover:text-destructive hover:bg-destructive/10"
                    onClick={() => {
                      onEliminar(proyectoId);
                      setMostrarAcciones(false);
                    }}
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Eliminar
                  </Button>
                </div>
              </>
            )}
          </div>
        </Card>
      </div>
      
      {/* Diálogo para cambiar estado */}
      <CambiarEstadoProyectoDialog
        proyectoId={proyectoId}
        estadoActual={estadoActual}
        onEstadoCambiado={(nuevoEstado) => {
          if (onEstadoCambiado) onEstadoCambiado();
          setMostrarAcciones(false);
        }}
        open={dialogoAbierto}
        onOpenChange={setDialogoAbierto}
      >
        <span></span>
      </CambiarEstadoProyectoDialog>
    </>
  );
}