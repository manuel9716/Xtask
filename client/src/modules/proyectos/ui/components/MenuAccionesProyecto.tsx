import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";
import { MoreVertical, CheckCircle2, ClockIcon, PauseCircle, ExternalLink, Edit } from "lucide-react";
import { Link } from "wouter";
import { useState } from "react";
import { CambiarEstadoProyectoDialog } from "./CambiarEstadoProyectoDialog";
import { proyectosApi } from "../../infrastructure/api/proyectosApi";
import * as Schema from '@shared/schema';

const EstadoProyecto = Schema.EstadoProyecto;

interface MenuAccionesProyectoProps {
  proyectoId: number;
  estadoActual: typeof EstadoProyecto[keyof typeof EstadoProyecto];
  onEliminar?: (id: number) => void;
  onEstadoCambiado?: () => void;
}

export function MenuAccionesProyecto({
  proyectoId,
  estadoActual,
  onEliminar,
  onEstadoCambiado,
}: MenuAccionesProyectoProps) {
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
    } catch (error) {
      console.error(`Error al cambiar estado a ${estado}:`, error);
      toast({
        title: "Error",
        description: "No se pudo cambiar el estado del proyecto",
        variant: "destructive",
      });
    }
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon">
            <MoreVertical className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem asChild>
            <Link href={`/admin/proyectos/${proyectoId}`}>
              <ExternalLink className="mr-2 h-4 w-4" />
              Ver detalles
            </Link>
          </DropdownMenuItem>
          
          <DropdownMenuItem asChild>
            <Link href={`/admin/proyectos/${proyectoId}/editar`}>
              <Edit className="mr-2 h-4 w-4" />
              Editar
            </Link>
          </DropdownMenuItem>

          <DropdownMenuSeparator />
          
          {/* Botón para abrir diálogo completo de cambio de estado */}
          <DropdownMenuItem onClick={() => setDialogoAbierto(true)}>
            <ClockIcon className="mr-2 h-4 w-4" />
            Cambiar estado
          </DropdownMenuItem>

          <DropdownMenuSeparator />
          <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground">
            Acciones rápidas:
          </div>

          {/* ACTIVO */}
          {estadoActual !== EstadoProyecto.ACTIVO && (
            <DropdownMenuItem
              onClick={() => cambiarEstado("ACTIVO", "El proyecto ha sido activado")}
            >
              <svg
                className="mr-2 h-4 w-4"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
              </svg>
              Activar proyecto
            </DropdownMenuItem>
          )}

          {/* FINALIZADO */}
          {estadoActual !== EstadoProyecto.FINALIZADO && (
            <DropdownMenuItem
              onClick={() => cambiarEstado("FINALIZADO", "El proyecto ha sido finalizado")}
            >
              <CheckCircle2 className="mr-2 h-4 w-4" />
              Finalizar proyecto
            </DropdownMenuItem>
          )}

          {/* RETRASADO */}
          {estadoActual !== EstadoProyecto.RETRASADO && (
            <DropdownMenuItem
              onClick={() => cambiarEstado("RETRASADO", "El proyecto ha sido marcado como retrasado")}
            >
              <svg
                className="mr-2 h-4 w-4"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="12" cy="12" r="10" />
                <path d="M12 8v4l2 2" />
              </svg>
              Marcar como retrasado
            </DropdownMenuItem>
          )}

          {/* PAUSADO */}
          {estadoActual !== EstadoProyecto.PAUSADO && (
            <DropdownMenuItem
              onClick={() => cambiarEstado("PAUSADO", "El proyecto ha sido pausado")}
            >
              <PauseCircle className="mr-2 h-4 w-4" />
              Pausar proyecto
            </DropdownMenuItem>
          )}

          {/* Archivar proyectos finalizados o cancelados */}
          {(estadoActual === EstadoProyecto.FINALIZADO || estadoActual === EstadoProyecto.CANCELADO) && (
            <DropdownMenuItem
              onClick={() => cambiarEstado("ARCHIVADO", "El proyecto ha sido archivado")}
            >
              <svg
                className="mr-2 h-4 w-4"
                width="15"
                height="15"
                viewBox="0 0 15 15"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M2 5h11v7.5c0 .83-.67 1.5-1.5 1.5h-8A1.5 1.5 0 012 12.5V5z"
                  stroke="currentColor"
                />
                <path
                  d="M6 8h3M1 5h13V3.5C14 2.67 13.33 2 12.5 2h-10C1.67 2 1 2.67 1 3.5V5z"
                  stroke="currentColor"
                />
              </svg>
              Archivar proyecto
            </DropdownMenuItem>
          )}

          {/* Opción de eliminar */}
          {onEliminar && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => onEliminar(proyectoId)}
                className="text-destructive focus:text-destructive"
              >
                Eliminar
              </DropdownMenuItem>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Diálogo para cambiar estado */}
      <CambiarEstadoProyectoDialog
        proyectoId={proyectoId}
        estadoActual={estadoActual}
        onEstadoCambiado={onEstadoCambiado}
        open={dialogoAbierto}
        onOpenChange={setDialogoAbierto}
      >
        <span></span>
      </CambiarEstadoProyectoDialog>
    </>
  );
}