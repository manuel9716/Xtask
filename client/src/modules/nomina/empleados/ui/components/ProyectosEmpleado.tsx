import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { 
  Briefcase, 
  Loader2,
  AlertCircle
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
  CardTitle 
} from '@/components/ui/card';

// Tipo de proyecto simplificado para mostrar en la celda
interface Proyecto {
  id: number;
  name: string;
  description?: string;
  status: string;
  startDate?: string;
  endDate?: string;
  category?: string;
}

interface ProyectosEmpleadoProps {
  empleadoId: number;
}

// Dado que hay un problema con la ruta, usamos una solución alternativa
// que consulta las tareas y proyectos directamente
const fetchProyectosEmpleado = async (empleadoId: number) => {
  try {
    // Primero obtenemos el empleado para obtener el userId
    const empleadoResponse = await fetch(`/api/nomina/empleados/${empleadoId}`);
    if (!empleadoResponse.ok) {
      throw new Error('Error al obtener información del empleado');
    }
    
    const empleado = await empleadoResponse.json();
    const userId = empleado.userId;
    
    // Luego obtenemos todas las tareas
    const tasksResponse = await fetch('/api/tasks');
    if (!tasksResponse.ok) {
      throw new Error('Error al obtener tareas');
    }
    
    const tasks = await tasksResponse.json();
    
    // Filtramos las tareas del empleado por userId
    const tareasFiltradas = tasks.filter((tarea: any) => tarea.assigneeId === userId);
    
    // Obtenemos todos los proyectos
    const projectsResponse = await fetch('/api/projects');
    if (!projectsResponse.ok) {
      throw new Error('Error al obtener proyectos');
    }
    
    const allProjects = await projectsResponse.json();
    
    // Extraemos los IDs de proyecto únicos de las tareas del empleado
    const projectIds = [...new Set(tareasFiltradas.map((tarea: any) => tarea.projectId))];
    
    // Filtramos los proyectos que coinciden con esos IDs
    const proyectosAsignados = allProjects.filter((proyecto: any) => 
      projectIds.includes(proyecto.id)
    );
    
    // Devolvemos en el mismo formato que esperaría el endpoint original
    return {
      empleadoId,
      cantidadProyectos: proyectosAsignados.length,
      proyectos: proyectosAsignados
    };
  } catch (error) {
    console.error('Error en fetchProyectosEmpleado:', error);
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
  
  const { data, isLoading, isError } = useQuery({
    queryKey: ['/api/nomina/empleados/proyectos', empleadoId],
    queryFn: () => fetchProyectosEmpleado(empleadoId),
    enabled: dialogOpen // Solo cargar datos cuando el diálogo esté abierto
  });
  
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
        </div>
      );
    }
    
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-2">
        {data.proyectos.map((proyecto: Proyecto) => (
          <Card key={proyecto.id} className="overflow-hidden">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">{proyecto.name}</CardTitle>
              <div className="flex justify-between items-center">
                <CardDescription>
                  {proyecto.category || "Sin categoría"}
                </CardDescription>
                <ProyectoEstadoBadge estado={proyecto.status} />
              </div>
            </CardHeader>
            <CardContent className="pb-4">
              <p className="text-sm text-muted-foreground line-clamp-2">
                {proyecto.description || "Sin descripción"}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  };
  
  return (
    <>
      {renderResumen()}
      
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Proyectos Asignados</DialogTitle>
          </DialogHeader>
          {renderDetalles()}
        </DialogContent>
      </Dialog>
    </>
  );
}