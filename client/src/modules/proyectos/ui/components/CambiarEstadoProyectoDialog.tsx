import { useState } from "react";
import { CambiarEstadoProyectoDTO, EstadoProyecto } from "../../domain/entities/Proyecto";
import { useCambiarEstadoProyecto } from "../../application/useCases/cambiarEstadoProyecto";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface CambiarEstadoProyectoDialogProps {
  proyectoId: number;
  estadoActual: EstadoProyecto;
  onEstadoCambiado?: () => void;
  children: React.ReactNode;
}

export function CambiarEstadoProyectoDialog({ 
  proyectoId, 
  estadoActual, 
  onEstadoCambiado,
  children 
}: CambiarEstadoProyectoDialogProps) {
  const [open, setOpen] = useState(false);
  const [estado, setEstado] = useState<EstadoProyecto | "">("");
  const [comentario, setComentario] = useState("");
  const { cambiarEstado, isLoading, error } = useCambiarEstadoProyecto(proyectoId);
  const { toast } = useToast();

  // Obtener estados permitidos según el estado actual
  const getEstadosPermitidos = () => {
    const todosEstados = Object.values(EstadoProyecto);
    
    // Reglas de negocio para transiciones permitidas
    switch (estadoActual) {
      case EstadoProyecto.ARCHIVADO:
        return [EstadoProyecto.ACTIVO]; // Solo puede ir a activo
      
      case EstadoProyecto.CANCELADO:
        return []; // No puede cambiar a ningún otro estado
      
      case EstadoProyecto.FINALIZADO:
        return [EstadoProyecto.ARCHIVADO, EstadoProyecto.ACTIVO];
      
      default: // ACTIVO o PAUSADO
        return todosEstados.filter(e => e !== estadoActual);
    }
  };

  const estadosPermitidos = getEstadosPermitidos();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!estado) {
      toast({
        title: "Error",
        description: "Debes seleccionar un estado",
        variant: "destructive",
      });
      return;
    }
    
    try {
      const cambioEstado: CambiarEstadoProyectoDTO = {
        estado: estado as EstadoProyecto,
        comentario: comentario.trim() || undefined,
      };
      
      await cambiarEstado(cambioEstado);
      
      toast({
        title: "Estado actualizado",
        description: `El proyecto ha sido cambiado a "${estado}"`,
      });
      
      // Resetear el formulario y cerrar el diálogo
      setEstado("");
      setComentario("");
      setOpen(false);
      
      // Notificar al componente padre
      if (onEstadoCambiado) {
        onEstadoCambiado();
      }
    } catch (error) {
      console.error("Error al cambiar estado:", error);
      // El toast de error ya se muestra desde el hook useCambiarEstadoProyecto
    }
  };

  // Textos descriptivos según el estado destino
  const getDescripcionEstado = () => {
    if (!estado) return "";
    
    switch (estado) {
      case EstadoProyecto.ACTIVO:
        return "El proyecto estará en ejecución activa.";
      case EstadoProyecto.PAUSADO:
        return "El proyecto se detendrá temporalmente.";
      case EstadoProyecto.FINALIZADO:
        return "El proyecto se marcará como completado.";
      case EstadoProyecto.ARCHIVADO:
        return "El proyecto se moverá al archivo histórico.";
      case EstadoProyecto.CANCELADO:
        return "El proyecto se cancelará permanentemente.";
      default:
        return "";
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Cambiar estado del proyecto</DialogTitle>
          <DialogDescription>
            Estado actual: <span className="font-medium">{estadoActual}</span>
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4 pt-4">
          <div className="space-y-2">
            <Label htmlFor="estado">Nuevo estado</Label>
            {estadosPermitidos.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                Este proyecto no puede cambiar de estado.
              </p>
            ) : (
              <>
                <Select 
                  value={estado} 
                  onValueChange={(value) => setEstado(value as EstadoProyecto)}
                >
                  <SelectTrigger id="estado">
                    <SelectValue placeholder="Seleccionar estado" />
                  </SelectTrigger>
                  <SelectContent>
                    {estadosPermitidos.map((e) => (
                      <SelectItem key={e} value={e}>
                        {e.charAt(0).toUpperCase() + e.slice(1)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                
                {estado && (
                  <p className="text-sm text-muted-foreground mt-1">
                    {getDescripcionEstado()}
                  </p>
                )}
              </>
            )}
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="comentario">Comentario (opcional)</Label>
            <Textarea
              id="comentario"
              placeholder="Añade un comentario explicando el cambio de estado"
              value={comentario}
              onChange={(e) => setComentario(e.target.value)}
              className="resize-none"
              rows={3}
            />
          </div>
          
          {error && (
            <p className="text-sm text-destructive">
              {error}
            </p>
          )}
          
          <DialogFooter>
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => setOpen(false)}
              disabled={isLoading}
            >
              Cancelar
            </Button>
            <Button 
              type="submit" 
              disabled={!estado || isLoading || estadosPermitidos.length === 0}
            >
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Guardar cambios
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}