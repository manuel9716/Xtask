import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { WidgetType, WidgetSize } from '../../domain/entities/Widget';

interface AddWidgetDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onAddWidget: (type: WidgetType, title: string, size: WidgetSize) => void;
}

/**
 * Diálogo para añadir un nuevo widget al dashboard
 */
export function AddWidgetDialog({ isOpen, onClose, onAddWidget }: AddWidgetDialogProps) {
  const [type, setType] = useState<WidgetType>(WidgetType.PROJECTS_OVERVIEW);
  const [title, setTitle] = useState('');
  const [size, setSize] = useState<WidgetSize>(WidgetSize.MEDIUM);
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    
    onAddWidget(type, title, size);
    
    // Reset form
    setTitle('');
    setType(WidgetType.PROJECTS_OVERVIEW);
    setSize(WidgetSize.MEDIUM);
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[450px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Añadir nuevo widget</DialogTitle>
            <DialogDescription>
              Configura el tipo de widget que deseas añadir a tu dashboard.
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="title" className="text-right">
                Título
              </Label>
              <Input
                id="title"
                placeholder="Nombre del widget"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="col-span-3"
                required
              />
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="type" className="text-right">
                Tipo
              </Label>
              <Select
                value={type}
                onValueChange={(value) => setType(value as WidgetType)}
              >
                <SelectTrigger id="type" className="col-span-3">
                  <SelectValue placeholder="Selecciona un tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={WidgetType.PROJECTS_OVERVIEW}>Vista general de proyectos</SelectItem>
                  <SelectItem value={WidgetType.PROJECTS_STATUS}>Estado de proyectos</SelectItem>
                  <SelectItem value={WidgetType.TASKS_OVERVIEW}>Vista general de tareas</SelectItem>
                  <SelectItem value={WidgetType.RECENT_ACTIVITY}>Actividad reciente</SelectItem>
                  <SelectItem value={WidgetType.BUDGET_SUMMARY}>Resumen de presupuestos</SelectItem>
                  <SelectItem value={WidgetType.TEAM_PERFORMANCE}>Rendimiento del equipo</SelectItem>
                  <SelectItem value={WidgetType.CALENDAR}>Calendario</SelectItem>
                  <SelectItem value={WidgetType.NOTIFICATIONS}>Notificaciones</SelectItem>
                  <SelectItem value={WidgetType.CUSTOM_CHART}>Gráfico personalizado</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="size" className="text-right">
                Tamaño
              </Label>
              <Select
                value={size}
                onValueChange={(value) => setSize(value as WidgetSize)}
              >
                <SelectTrigger id="size" className="col-span-3">
                  <SelectValue placeholder="Selecciona un tamaño" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={WidgetSize.SMALL}>Pequeño (1x1)</SelectItem>
                  <SelectItem value={WidgetSize.MEDIUM}>Mediano (2x1)</SelectItem>
                  <SelectItem value={WidgetSize.LARGE}>Grande (2x2)</SelectItem>
                  <SelectItem value={WidgetSize.EXTRA_LARGE}>Extra grande (4x2)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit">Añadir widget</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}