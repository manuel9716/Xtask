import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Check, ChevronsUpDown, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from '@/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface Proyecto {
  id: number;
  nombre: string;
  descripcion?: string;
}

interface ProjectMultiSelectProps {
  empleadoId: number;
  proyectosAsignados: Proyecto[];
  onUpdate: (projectIds: number[]) => void;
}

export function ProjectMultiSelect({
  empleadoId,
  proyectosAsignados,
  onUpdate,
}: ProjectMultiSelectProps) {
  const [open, setOpen] = useState(false);
  const [selectedProjects, setSelectedProjects] = useState<Proyecto[]>(
    proyectosAsignados || []
  );

  const { data: proyectos = [], isLoading } = useQuery({
    queryKey: ['/api/proyectos'],
    queryFn: async () => {
      const response = await fetch('/api/proyectos');
      if (!response.ok) throw new Error('Error al cargar proyectos');
      const data = await response.json();
      return data.data || [];
    },
  });

  const handleSelectProject = (proyecto: Proyecto) => {
    const isSelected = selectedProjects.some(p => p.id === proyecto.id);
    let newSelection: Proyecto[];

    if (isSelected) {
      newSelection = selectedProjects.filter(p => p.id !== proyecto.id);
    } else {
      newSelection = [...selectedProjects, proyecto];
    }

    setSelectedProjects(newSelection);
    onUpdate(newSelection.map(p => p.id));
  };

  const handleRemoveProject = (projectId: number) => {
    const newSelection = selectedProjects.filter(p => p.id !== projectId);
    setSelectedProjects(newSelection);
    onUpdate(newSelection.map(p => p.id));
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-center">
            <div className="animate-spin w-6 h-6 border-2 border-primary border-t-transparent rounded-full" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Proyectos actualmente asignados */}
      <div>
        <h4 className="text-sm font-medium mb-2">Proyectos Asignados</h4>
        {selectedProjects.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {selectedProjects.map((proyecto) => (
              <Badge
                key={proyecto.id}
                variant="secondary"
                className="flex items-center gap-1"
              >
                {proyecto.nombre}
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-4 w-4 p-0 hover:bg-destructive hover:text-destructive-foreground"
                  onClick={() => handleRemoveProject(proyecto.id)}
                >
                  <X className="h-3 w-3" />
                </Button>
              </Badge>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">
            No hay proyectos asignados
          </p>
        )}
      </div>

      {/* Selector de proyectos */}
      <div>
        <h4 className="text-sm font-medium mb-2">Asignar Nuevos Proyectos</h4>
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              role="combobox"
              aria-expanded={open}
              className="w-full justify-between"
            >
              Seleccionar proyectos...
              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-full p-0" align="start">
            <Command>
              <CommandInput placeholder="Buscar proyecto..." />
              <CommandEmpty>No se encontraron proyectos.</CommandEmpty>
              <CommandGroup className="max-h-60 overflow-auto">
                {proyectos.map((proyecto: Proyecto) => {
                  const isSelected = selectedProjects.some(p => p.id === proyecto.id);
                  return (
                    <CommandItem
                      key={proyecto.id}
                      onSelect={() => handleSelectProject(proyecto)}
                      className="flex items-center justify-between"
                    >
                      <div className="flex items-center">
                        <Check
                          className={cn(
                            'mr-2 h-4 w-4',
                            isSelected ? 'opacity-100' : 'opacity-0'
                          )}
                        />
                        <div>
                          <div className="font-medium">{proyecto.nombre}</div>
                          {proyecto.descripcion && (
                            <div className="text-sm text-muted-foreground truncate">
                              {proyecto.descripcion}
                            </div>
                          )}
                        </div>
                      </div>
                    </CommandItem>
                  );
                })}
              </CommandGroup>
            </Command>
          </PopoverContent>
        </Popover>
      </div>

      {/* Resumen */}
      <div className="text-sm text-muted-foreground">
        {selectedProjects.length} proyecto(s) asignado(s)
      </div>
    </div>
  );
}