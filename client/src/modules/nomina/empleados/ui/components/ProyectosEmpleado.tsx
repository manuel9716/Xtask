import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  Briefcase, 
  Loader2,
  AlertCircle,
  Star,
  StarOff,
  X,
  Plus
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle 
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { 
  Card,
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle, 
  CardFooter
} from '@/components/ui/card';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

// Tipo de proyecto con campo para indicar si es el proyecto principal
interface Proyecto {
  id: number;
  name: string;
  description?: string;
  status: string;
  startDate?: string;
  endDate?: string;
  category?: string;
  budget?: number;
  remainingBudget?: number;
  esPrincipal?: boolean;
}

interface ProyectosEmpleadoProps {
  empleadoId: number;
}

// Función para obtener los proyectos del empleado
const fetchProyectosEmpleado = async (empleadoId: number) => {
  try {
    // Utilizamos la API dedicada para obtener proyectos asignados
    const response = await fetch(`/api/employee-projects/${empleadoId}`);
    
    if (!response.ok) {
      throw new Error('Error al obtener proyectos asignados al empleado');
    }
    
    // La API retorna los datos con el proyecto principal marcado
    const data = await response.json();
    console.log('Proyectos obtenidos:', data);
    return data;
  } catch (error) {
    console.error('Error en fetchProyectosEmpleado:', error);
    throw error;
  }
};

// Función para obtener todos los proyectos disponibles (para asignar)
const fetchProyectosDisponibles = async () => {
  try {
    const response = await fetch('/api/projects');
    if (!response.ok) {
      throw new Error('Error al obtener proyectos');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error al obtener proyectos disponibles:', error);
    throw error;
  }
};

// Componente para el badge de estado del proyecto
const ProyectoEstadoBadge = ({ estado }: { estado: string }) => {
  const estadoNormalizado = estado.toLowerCase();
  
  if (estadoNormalizado === 'active' || estadoNormalizado === 'activo') {
    return (
      <Badge className="bg-green-100 text-green-800 hover:bg-green-200">
        ACTIVO
      </Badge>
    );
  } else if (estadoNormalizado === 'paused' || estadoNormalizado === 'pausado') {
    return (
      <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-200">
        PAUSADO
      </Badge>
    );
  } else if (estadoNormalizado === 'delayed' || estadoNormalizado === 'retrasado') {
    return (
      <Badge className="bg-red-100 text-red-800 hover:bg-red-200">
        RETRASADO
      </Badge>
    );
  } else if (estadoNormalizado === 'completed' || estadoNormalizado === 'finalizado') {
    return (
      <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-200">
        FINALIZADO
      </Badge>
    );
  } else if (estadoNormalizado === 'canceled' || estadoNormalizado === 'cancelado') {
    return (
      <Badge className="bg-orange-100 text-orange-800 hover:bg-orange-200">
        CANCELADO
      </Badge>
    );
  } else if (estadoNormalizado === 'archived' || estadoNormalizado === 'archivado') {
    return (
      <Badge className="bg-gray-100 text-gray-800 hover:bg-gray-200">
        ARCHIVADO
      </Badge>
    );
  }
  
  return <Badge>{estado}</Badge>;
};

export default function ProyectosEmpleado({ empleadoId }: ProyectosEmpleadoProps) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [assignDialogOpen, setAssignDialogOpen] = useState(false);
  const [unassignDialogOpen, setUnassignDialogOpen] = useState(false);
  const [selectedProyecto, setSelectedProyecto] = useState<Proyecto | null>(null);
  const [selectedProyectoId, setSelectedProyectoId] = useState<number | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Consulta de proyectos asignados
  const { 
    data, 
    isLoading, 
    isError, 
    refetch 
  } = useQuery({
    queryKey: ['/api/employee-projects', empleadoId],
    queryFn: () => fetchProyectosEmpleado(empleadoId),
    enabled: dialogOpen || assignDialogOpen // Cargar cuando se abra cualquier diálogo
  });
  
  // Consulta de proyectos disponibles
  const {
    data: proyectosDisponibles,
    isLoading: isLoadingProyectos
  } = useQuery({
    queryKey: ['/api/projects'],
    queryFn: fetchProyectosDisponibles,
    enabled: assignDialogOpen // Solo cargar cuando se abre el diálogo de asignación
  });
  
  // Mutación para asignar un proyecto
  const asignarMutation = useMutation({
    mutationFn: async (projectId: number) => {
      return await apiRequest(
        'POST', 
        `/api/employee-projects/${empleadoId}/assign`,
        { projectId }
      );
    },
    onSuccess: () => {
      toast({
        title: 'Proyecto asignado',
        description: 'El proyecto ha sido asignado correctamente.',
      });
      refetch();
      queryClient.invalidateQueries({ queryKey: ['/api/employee-projects', empleadoId] });
      setAssignDialogOpen(false);
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: `No se pudo asignar el proyecto: ${error.message}`,
        variant: 'destructive',
      });
    }
  });
  
  // Mutación para desasignar un proyecto
  const desasignarMutation = useMutation({
    mutationFn: async (projectId: number) => {
      return await apiRequest(
        'POST', 
        `/api/employee-projects/${empleadoId}/unassign/${projectId}`,
        {}
      );
    },
    onSuccess: () => {
      toast({
        title: 'Proyecto desasignado',
        description: 'El proyecto ha sido desasignado correctamente.',
      });
      refetch();
      queryClient.invalidateQueries({ queryKey: ['/api/employee-projects', empleadoId] });
      setUnassignDialogOpen(false);
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: `No se pudo desasignar el proyecto: ${error.message}`,
        variant: 'destructive',
      });
    }
  });
  
  // Mutación para establecer un proyecto como principal
  const setPrincipalMutation = useMutation({
    mutationFn: async (projectId: number) => {
      return await apiRequest(
        'POST', 
        `/api/employee-projects/${empleadoId}/set-primary/${projectId}`,
        {}
      );
    },
    onSuccess: () => {
      toast({
        title: 'Proyecto principal actualizado',
        description: 'Se ha establecido el proyecto principal correctamente.',
      });
      refetch();
      queryClient.invalidateQueries({ queryKey: ['/api/employee-projects', empleadoId] });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: `No se pudo establecer el proyecto principal: ${error.message}`,
        variant: 'destructive',
      });
    }
  });
  
  // Función para manejar la asignación de un proyecto
  const handleAsignarProyecto = () => {
    if (selectedProyectoId) {
      asignarMutation.mutate(selectedProyectoId);
    }
  };
  
  // Función para manejar la desasignación de un proyecto
  const handleDesasignarProyecto = () => {
    if (selectedProyecto) {
      desasignarMutation.mutate(selectedProyecto.id);
    }
  };
  
  // Función para establecer un proyecto como principal
  const handleSetPrincipal = (proyecto: Proyecto) => {
    setPrincipalMutation.mutate(proyecto.id);
  };
  
  // Renderizar resumen para la celda de la tabla
  const renderResumen = () => {
    return (
      <Button 
        variant="ghost" 
        size="sm" 
        className="flex items-center gap-1 text-muted-foreground hover:text-foreground"
        onClick={() => setDialogOpen(true)}
      >
        <Briefcase className="h-4 w-4" />
        <span>Ver proyectos</span>
      </Button>
    );
  };
  
  // Renderizar detalles para el diálogo
  const renderDetalles = () => {
    if (isLoading) {
      return (
        <div className="flex justify-center items-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="ml-2 text-lg text-muted-foreground">Cargando proyectos...</span>
        </div>
      );
    }
    
    if (isError) {
      return (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <AlertCircle className="h-8 w-8 text-destructive mb-2" />
          <h3 className="text-lg font-semibold">Error al cargar los proyectos</h3>
          <p className="text-muted-foreground mb-4">
            No se pudieron cargar los datos de proyectos del empleado.
          </p>
        </div>
      );
    }
    
    if (!data || !data.proyectos || data.proyectos.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <Briefcase className="h-8 w-8 text-muted-foreground mb-2" />
          <h3 className="text-lg font-semibold">Sin proyectos asignados</h3>
          <p className="text-muted-foreground mb-4">
            Este empleado no tiene proyectos asignados actualmente.
          </p>
          <Button onClick={() => setAssignDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Asignar proyecto
          </Button>
        </div>
      );
    }
    
    return (
      <div className="space-y-4">
        <div className="flex justify-end mb-4">
          <Button onClick={() => setAssignDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Asignar proyecto
          </Button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {data.proyectos.map((proyecto: Proyecto) => (
            <Card key={proyecto.id} className={`overflow-hidden border-2 ${proyecto.esPrincipal ? 'border-amber-300' : 'border-transparent'}`}>
              <CardHeader className="pb-2 relative">
                {proyecto.esPrincipal && (
                  <div className="absolute top-0 left-0 bg-amber-100 text-amber-800 px-2 py-1 text-xs font-medium rounded-br">
                    Principal
                  </div>
                )}
                <div className="mt-4">
                  <CardTitle className="text-lg">{proyecto.name}</CardTitle>
                  <div className="flex justify-between items-center mt-1">
                    <CardDescription>
                      {proyecto.category || "Sin categoría"}
                    </CardDescription>
                    <ProyectoEstadoBadge estado={proyecto.status} />
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pb-2">
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {proyecto.description || "Sin descripción"}
                </p>
              </CardContent>
              <CardFooter className="flex justify-between pt-0">
                {proyecto.esPrincipal ? (
                  <Button 
                    variant="outline" 
                    size="sm"
                    className="text-amber-600 border-amber-200"
                    disabled
                  >
                    <Star className="h-4 w-4 mr-1 fill-amber-500" />
                    Proyecto principal
                  </Button>
                ) : (
                  <Button 
                    variant="outline" 
                    size="sm"
                    className="text-muted-foreground hover:text-amber-600"
                    onClick={() => handleSetPrincipal(proyecto)}
                  >
                    <Star className="h-4 w-4 mr-1" />
                    Establecer como principal
                  </Button>
                )}
                <Button 
                  variant="ghost" 
                  size="sm"
                  className="text-muted-foreground hover:text-destructive"
                  onClick={() => {
                    setSelectedProyecto(proyecto);
                    setUnassignDialogOpen(true);
                  }}
                >
                  <X className="h-4 w-4 mr-1" />
                  Desasignar
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    );
  };
  
  // Función para renderizar el diálogo de asignación de proyectos
  const renderAsignarDialog = () => {
    const proyectosAsignados = data?.proyectos?.map((p: Proyecto) => p.id) || [];
    const proyectosFiltered = proyectosDisponibles?.filter(
      (p: Proyecto) => !proyectosAsignados.includes(p.id)
    ) || [];
    
    if (isLoadingProyectos) {
      return (
        <div className="flex justify-center items-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="ml-2">Cargando proyectos...</span>
        </div>
      );
    }
    
    if (proyectosFiltered.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center py-8 text-center">
          <AlertCircle className="h-8 w-8 text-amber-500 mb-2" />
          <h3 className="text-lg font-semibold">No hay proyectos disponibles</h3>
          <p className="text-muted-foreground mb-4">
            Todos los proyectos ya están asignados a este empleado.
          </p>
        </div>
      );
    }
    
    return (
      <div className="space-y-4 py-4">
        <div className="space-y-2">
          <label htmlFor="proyecto" className="text-sm font-medium">
            Seleccione un proyecto
          </label>
          <Select onValueChange={(value) => setSelectedProyectoId(parseInt(value))}>
            <SelectTrigger id="proyecto">
              <SelectValue placeholder="Seleccionar proyecto" />
            </SelectTrigger>
            <SelectContent>
              {proyectosFiltered.map((proyecto: Proyecto) => (
                <SelectItem key={proyecto.id} value={proyecto.id.toString()}>
                  {proyecto.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <div className="flex justify-end gap-2 mt-4">
          <Button
            variant="outline"
            onClick={() => setAssignDialogOpen(false)}
          >
            Cancelar
          </Button>
          <Button
            onClick={handleAsignarProyecto}
            disabled={!selectedProyectoId || asignarMutation.isPending}
          >
            {asignarMutation.isPending && (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            )}
            Asignar
          </Button>
        </div>
      </div>
    );
  };
  
  return (
    <>
      {renderResumen()}
      
      {/* Diálogo principal para ver proyectos */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Proyectos Asignados</DialogTitle>
          </DialogHeader>
          {renderDetalles()}
        </DialogContent>
      </Dialog>
      
      {/* Diálogo para asignar un nuevo proyecto */}
      <Dialog open={assignDialogOpen} onOpenChange={setAssignDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Asignar Proyecto</DialogTitle>
          </DialogHeader>
          {renderAsignarDialog()}
        </DialogContent>
      </Dialog>
      
      {/* Alerta de confirmación para desasignar */}
      <AlertDialog open={unassignDialogOpen} onOpenChange={setUnassignDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Desasignar proyecto?</AlertDialogTitle>
            <AlertDialogDescription>
              ¿Está seguro que desea desasignar el proyecto "{selectedProyecto?.name}" de este empleado?
              {selectedProyecto?.esPrincipal && (
                <p className="mt-2 text-amber-600 font-medium">
                  Este es el proyecto principal del empleado. Al desasignarlo, perderá esta designación.
                </p>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDesasignarProyecto}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {desasignarMutation.isPending && (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              )}
              Desasignar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}