import React, { ReactNode } from 'react';
import { 
  Card, 
  CardHeader, 
  CardTitle, 
  CardDescription, 
  CardContent, 
  CardFooter 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  MoreHorizontal,
  Edit,
  Trash2,
  LayoutDashboard,
  RefreshCw,
  Maximize2
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Widget as WidgetModel, WidgetSize } from '../../domain/entities/Widget';

interface WidgetProps {
  widget: WidgetModel;
  isEditing?: boolean;
  onEdit?: () => void;
  onRemove?: () => void;
  onResize?: (size: WidgetSize) => void;
  children: ReactNode;
  className?: string;
  onRefresh?: () => void;
}

/**
 * Componente contenedor para widgets del dashboard
 */
export function Widget({
  widget,
  isEditing = false,
  onEdit,
  onRemove,
  onResize,
  children,
  className = '',
  onRefresh
}: WidgetProps) {
  
  // Determinar clases CSS según el tamaño del widget para la cuadrícula
  const getSizeClasses = () => {
    switch (widget.size) {
      case WidgetSize.SMALL:
        return 'col-span-1 row-span-1';
      case WidgetSize.MEDIUM:
        return 'col-span-2 row-span-1';
      case WidgetSize.LARGE:
        return 'col-span-2 row-span-2';
      case WidgetSize.EXTRA_LARGE:
        return 'col-span-4 row-span-2';
      default:
        return 'col-span-1 row-span-1';
    }
  };
  
  // Obtener el siguiente tamaño en ciclo
  const getNextSize = () => {
    switch (widget.size) {
      case WidgetSize.SMALL:
        return WidgetSize.MEDIUM;
      case WidgetSize.MEDIUM:
        return WidgetSize.LARGE;
      case WidgetSize.LARGE:
        return WidgetSize.EXTRA_LARGE;
      case WidgetSize.EXTRA_LARGE:
        return WidgetSize.SMALL;
      default:
        return WidgetSize.MEDIUM;
    }
  };
  
  // Manejar cambio de tamaño
  const handleResize = () => {
    if (onResize) {
      onResize(getNextSize());
    }
  };
  
  return (
    <Card className={`shadow-md ${getSizeClasses()} ${className}`}>
      <CardHeader className="p-4 pb-2">
        <div className="flex justify-between items-center">
          <CardTitle className="text-lg font-semibold">{widget.title}</CardTitle>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Opciones</DropdownMenuLabel>
              
              {onRefresh && (
                <DropdownMenuItem onClick={onRefresh}>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Actualizar
                </DropdownMenuItem>
              )}
              
              {onResize && (
                <DropdownMenuItem onClick={handleResize}>
                  <Maximize2 className="h-4 w-4 mr-2" />
                  Cambiar tamaño
                </DropdownMenuItem>
              )}
              
              {onEdit && (
                <DropdownMenuItem onClick={onEdit}>
                  <Edit className="h-4 w-4 mr-2" />
                  Editar
                </DropdownMenuItem>
              )}
              
              <DropdownMenuSeparator />
              
              {onRemove && (
                <DropdownMenuItem 
                  onClick={onRemove}
                  className="text-red-600"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Eliminar
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      
      <CardContent className="p-4 pt-2 overflow-hidden">
        {children}
      </CardContent>
    </Card>
  );
}