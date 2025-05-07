import { ReactNode, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from '@/components/ui/button';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Loader2 } from 'lucide-react';
import { useCambiarEstadoProyecto } from '../../application/useCases/cambiarEstadoProyecto';
import { EstadoProyecto } from '../../domain/entities/Proyecto';
import { EstadoProyectoBadge } from './EstadoProyectoBadge';
import { useToast } from '@/hooks/use-toast';

interface CambiarEstadoProyectoDialogProps {
  children: ReactNode;
  proyectoId: number;
  estadoActual: EstadoProyecto;
  onEstadoCambiado?: () => void;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function CambiarEstadoProyectoDialog({ 
  children, 
  proyectoId, 
  estadoActual,
  onEstadoCambiado,
  open: controlledOpen,
  onOpenChange: controlledOpenChange
}: CambiarEstadoProyectoDialogProps) {
  // Usar estado local solo si no hay props de control externo
  const [uncontrolledOpen, setUncontrolledOpen] = useState(false);
  const [estado, setEstado] = useState<EstadoProyecto | ''>('');
  const [comentario, setComentario] = useState('');
  
  // Determinar si el componente está controlado externamente
  const isControlled = controlledOpen !== undefined && controlledOpenChange !== undefined;
  
  // Usar los valores controlados o no controlados según corresponda
  const open = isControlled ? controlledOpen : uncontrolledOpen;
  const setOpen = isControlled ? controlledOpenChange : setUncontrolledOpen;
  
  const mutation = useCambiarEstadoProyecto(proyectoId);
  const { toast } = useToast();
  
  // Resetear el estado del formulario al cerrarse
  const handleOpenChange = (isOpen: boolean) => {
    setOpen(isOpen);
    if (!isOpen) {
      setEstado('');
      setComentario('');
    }
  };
  
  // Manejar cambio de estado
  const handleSubmit = async () => {
    if (!estado) {
      toast({
        title: 'Error',
        description: 'Debes seleccionar un estado',
        variant: 'destructive',
      });
      return;
    }
    
    try {
      await mutation.mutateAsync({
        estado,
        comentario: comentario.trim() || undefined
      });
      
      setOpen(false);
      if (onEstadoCambiado) {
        onEstadoCambiado();
      }
    } catch (error) {
      // El manejo de errores ya se hace en el hook
    }
  };
  
  // Filtrar estados no permitidos (no se puede volver al mismo estado)
  const estadosDisponibles = Object.values(EstadoProyecto).filter(
    e => e !== estadoActual
  );
  
  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Cambiar estado del proyecto</DialogTitle>
          <DialogDescription>
            Estado actual: <EstadoProyectoBadge estado={estadoActual} className="ml-1" />
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="estado">Nuevo estado</Label>
            <Select
              value={estado}
              onValueChange={(value) => setEstado(value as EstadoProyecto)}
            >
              <SelectTrigger id="estado">
                <SelectValue placeholder="Seleccionar estado" />
              </SelectTrigger>
              <SelectContent>
                {estadosDisponibles.map((estado) => (
                  <SelectItem key={estado} value={estado}>
                    <div className="flex items-center">
                      <EstadoProyectoBadge estado={estado} />
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="grid gap-2">
            <Label htmlFor="comentario">Comentario (opcional)</Label>
            <Textarea
              id="comentario"
              placeholder="Razón del cambio de estado..."
              value={comentario}
              onChange={(e) => setComentario(e.target.value)}
              rows={3}
            />
          </div>
        </div>
        
        <DialogFooter>
          <Button 
            type="button" 
            variant="outline" 
            onClick={() => setOpen(false)}
            disabled={mutation.isPending}
          >
            Cancelar
          </Button>
          <Button 
            type="button" 
            onClick={handleSubmit}
            disabled={!estado || mutation.isPending}
          >
            {mutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Guardar cambios
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}