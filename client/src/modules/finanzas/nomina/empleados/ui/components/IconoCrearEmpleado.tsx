import { Plus, UserPlus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface IconoCrearEmpleadoProps {
  onClick: () => void;
  variant?: 'default' | 'icon';
}

export function IconoCrearEmpleado({ onClick, variant = 'default' }: IconoCrearEmpleadoProps) {
  if (variant === 'icon') {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button 
              onClick={onClick} 
              size="icon" 
              className="rounded-full h-12 w-12 shadow-lg hover:shadow-xl transition-all duration-300"
            >
              <UserPlus className="h-6 w-6" />
              <span className="sr-only">Crear nuevo empleado</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Ingresar nuevo empleado</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return (
    <Button onClick={onClick} className="flex items-center gap-2">
      <UserPlus className="h-4 w-4" />
      <span>Ingresar nuevo empleado</span>
    </Button>
  );
}