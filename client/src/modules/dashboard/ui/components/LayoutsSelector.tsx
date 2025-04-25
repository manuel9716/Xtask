import React, { useState } from 'react';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuGroup,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuPortal,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import {
  CheckCircle2,
  ChevronDown,
  Trash2,
  Plus,
  StarIcon,
  LayoutDashboard
} from 'lucide-react';
import { DashboardLayout } from '../../domain/entities/Widget';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface LayoutsSelectorProps {
  layouts: DashboardLayout[];
  currentLayoutId: string;
  onSelectLayout: (layoutId: string) => void;
  onSetDefault: (layoutId: string) => void;
  onDelete: (layoutId: string) => void;
}

/**
 * Selector de layouts para el dashboard
 */
export function LayoutsSelector({
  layouts,
  currentLayoutId,
  onSelectLayout,
  onSetDefault,
  onDelete,
}: LayoutsSelectorProps) {
  const [isNewLayoutDialogOpen, setIsNewLayoutDialogOpen] = useState(false);
  const [newLayoutName, setNewLayoutName] = useState('');
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  
  const currentLayout = layouts.find(l => l.id === currentLayoutId);
  
  // Crear un nuevo layout clonando el actual
  const handleCreateNewLayout = () => {
    // Esta funcionalidad se implementará más adelante en un componente padre
    // Por ahora solo cerramos el diálogo
    setIsNewLayoutDialogOpen(false);
    setNewLayoutName('');
  };
  
  // Confirmar eliminación de un layout
  const handleConfirmDelete = (layoutId: string) => {
    onDelete(layoutId);
    setConfirmDeleteId(null);
  };
  
  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" className="flex items-center gap-2">
            <LayoutDashboard className="h-4 w-4" />
            {currentLayout?.name || 'Seleccionar layout'}
            {currentLayout?.isDefault && (
              <StarIcon className="h-3 w-3 text-yellow-500" />
            )}
            <ChevronDown className="h-3 w-3 ml-2" />
          </Button>
        </DropdownMenuTrigger>
        
        <DropdownMenuContent align="start" className="w-56">
          <DropdownMenuLabel>Layouts de Dashboard</DropdownMenuLabel>
          <DropdownMenuSeparator />
          
          <DropdownMenuRadioGroup value={currentLayoutId} onValueChange={onSelectLayout}>
            {layouts.map(layout => (
              <DropdownMenuRadioItem
                key={layout.id}
                value={layout.id}
                className="flex items-center justify-between cursor-pointer"
              >
                <span className="flex items-center gap-2">
                  {layout.name}
                  {layout.isDefault && (
                    <StarIcon className="h-3 w-3 text-yellow-500" />
                  )}
                </span>
              </DropdownMenuRadioItem>
            ))}
          </DropdownMenuRadioGroup>
          
          <DropdownMenuSeparator />
          
          <DropdownMenuGroup>
            <DropdownMenuItem 
              onClick={() => setIsNewLayoutDialogOpen(true)}
              className="text-blue-600"
            >
              <Plus className="h-4 w-4 mr-2" />
              Nuevo layout
            </DropdownMenuItem>
            
            {!currentLayout?.isDefault && (
              <DropdownMenuItem onClick={() => onSetDefault(currentLayoutId)}>
                <StarIcon className="h-4 w-4 mr-2" />
                Establecer como predeterminado
              </DropdownMenuItem>
            )}
            
            {layouts.length > 1 && !currentLayout?.isDefault && (
              <DropdownMenuItem 
                onClick={() => setConfirmDeleteId(currentLayoutId)}
                className="text-red-600"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Eliminar layout actual
              </DropdownMenuItem>
            )}
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>
      
      {/* Diálogo para crear nuevo layout */}
      <Dialog open={isNewLayoutDialogOpen} onOpenChange={setIsNewLayoutDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Crear nuevo layout</DialogTitle>
            <DialogDescription>
              Crea un nuevo layout personalizable para tu dashboard.
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="layout-name" className="text-right">
                Nombre
              </Label>
              <Input
                id="layout-name"
                value={newLayoutName}
                onChange={(e) => setNewLayoutName(e.target.value)}
                placeholder="Mi dashboard personalizado"
                className="col-span-3"
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setIsNewLayoutDialogOpen(false)}
            >
              Cancelar
            </Button>
            <Button 
              onClick={handleCreateNewLayout}
              disabled={!newLayoutName.trim()}
            >
              Crear layout
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Diálogo para confirmar eliminación */}
      <Dialog 
        open={confirmDeleteId !== null} 
        onOpenChange={() => setConfirmDeleteId(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar eliminación</DialogTitle>
            <DialogDescription>
              ¿Estás seguro de que deseas eliminar este layout? Esta acción no se puede deshacer.
            </DialogDescription>
          </DialogHeader>
          
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setConfirmDeleteId(null)}
            >
              Cancelar
            </Button>
            <Button 
              variant="destructive"
              onClick={() => confirmDeleteId && handleConfirmDelete(confirmDeleteId)}
            >
              Eliminar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}