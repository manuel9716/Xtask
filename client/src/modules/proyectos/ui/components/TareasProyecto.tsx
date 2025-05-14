import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { 
  Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter 
} from "@/components/ui/card";
import { 
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger 
} from "@/components/ui/dialog";
import { 
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue 
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { 
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow 
} from "@/components/ui/table";
import { 
  CheckCircle2, Clock, AlertCircle, PlusCircle, Loader2,
  Edit2, Trash2, User, ListTodo, Calendar
} from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Proyecto } from "../../domain/entities/Proyecto";

// Interfaces
interface Tarea {
  id: number;
  title: string;
  description: string | null;
  status: string; // 'todo', 'in_progress', 'completed'
  priority: string; // 'low', 'medium', 'high'
  dueDate: string | null;
  projectId: number;
  assigneeId: number | null;
  assigneeNombre?: string;
  createdAt: string;
}

interface CrearTareaDTO {
  title: string;
  description?: string;
  status: string;
  priority: string;
  dueDate?: string;
  projectId: number;
  assigneeId?: number;
}

interface Empleado {
  id: number;
  firstName: string;
  lastName: string;
  position: string;
  department: string;
}

interface TareasProyectoProps {
  proyecto: Proyecto;
}

// Función para traducir estado de tarea
const traducirEstadoTarea = (estado: string): string => {
  switch (estado) {
    case 'todo': return 'Pendiente';
    case 'in_progress': return 'En progreso';
    case 'completed': return 'Completada';
    default: return estado;
  }
};

// Función para traducir prioridad de tarea
const traducirPrioridadTarea = (prioridad: string): string => {
  switch (prioridad) {
    case 'low': return 'Baja';
    case 'medium': return 'Media';
    case 'high': return 'Alta';
    default: return prioridad;
  }
};

// Función para obtener color de badge según prioridad
const getBadgeVariant = (prioridad: string): "default" | "secondary" | "destructive" | "outline" => {
  switch (prioridad) {
    case 'low': return "outline";
    case 'medium': return "secondary";
    case 'high': return "destructive";
    default: return "default";
  }
};

// Función para formatear fecha
const formatearFecha = (fecha: string | null): string => {
  if (!fecha) return 'No establecida';
  return new Date(fecha).toLocaleDateString('es-ES', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
};

// Componente principal
export default function TareasProyecto({ proyecto }: TareasProyectoProps) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Tarea | null>(null);
  const [filtroEstado, setFiltroEstado] = useState<string>("all");
  const [nuevaTarea, setNuevaTarea] = useState<CrearTareaDTO>({
    title: "",
    description: "",
    status: "todo",
    priority: "medium",
    projectId: proyecto.id
  });
  
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Consulta de tareas
  const { 
    data: tareas, 
    isLoading, 
    isError 
  } = useQuery({
    queryKey: ['/api/tasks', proyecto.id],
    queryFn: async () => {
      const res = await apiRequest('GET', `/api/tasks?projectId=${proyecto.id}`);
      const data = await res.json();
      return data;
    }
  });
  
  // Consulta de empleados para asignar tareas
  const {
    data: empleados,
    isLoading: isLoadingEmpleados
  } = useQuery({
    queryKey: ['/api/employees'],
    queryFn: async () => {
      const res = await apiRequest('GET', '/api/employees');
      return res.json();
    }
  });
  
  // Mutación para crear nueva tarea
  const crearTareaMutation = useMutation({
    mutationFn: async (tarea: CrearTareaDTO) => {
      const res = await apiRequest('POST', '/api/tasks', tarea);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/tasks', proyecto.id] });
      toast({
        title: "Tarea creada",
        description: "La tarea ha sido creada exitosamente",
      });
      setDialogOpen(false);
      resetFormulario();
    },
    onError: (error) => {
      toast({
        title: "Error al crear la tarea",
        description: "Ocurrió un error al crear la tarea. Inténtalo de nuevo.",
        variant: "destructive",
      });
    }
  });
  
  // Mutación para actualizar tarea
  const actualizarTareaMutation = useMutation({
    mutationFn: async ({ id, tarea }: { id: number, tarea: Partial<CrearTareaDTO> }) => {
      const res = await apiRequest('PATCH', `/api/tasks/${id}`, tarea);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/tasks', proyecto.id] });
      toast({
        title: "Tarea actualizada",
        description: "La tarea ha sido actualizada exitosamente",
      });
      setDialogOpen(false);
      resetFormulario();
    },
    onError: (error) => {
      toast({
        title: "Error al actualizar la tarea",
        description: "Ocurrió un error al actualizar la tarea. Inténtalo de nuevo.",
        variant: "destructive",
      });
    }
  });
  
  // Mutación para eliminar tarea
  const eliminarTareaMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await apiRequest('DELETE', `/api/tasks/${id}`);
      return res;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/tasks', proyecto.id] });
      toast({
        title: "Tarea eliminada",
        description: "La tarea ha sido eliminada exitosamente",
      });
    },
    onError: (error) => {
      toast({
        title: "Error al eliminar la tarea",
        description: "Ocurrió un error al eliminar la tarea. Inténtalo de nuevo.",
        variant: "destructive",
      });
    }
  });
  
  // Resetear formulario
  const resetFormulario = () => {
    setNuevaTarea({
      title: "",
      description: "",
      status: "todo",
      priority: "medium",
      projectId: proyecto.id
    });
    setEditingTask(null);
  };
  
  // Abrir diálogo para editar tarea
  const handleEdit = (tarea: Tarea) => {
    setEditingTask(tarea);
    setNuevaTarea({
      title: tarea.title,
      description: tarea.description || "",
      status: tarea.status,
      priority: tarea.priority,
      projectId: tarea.projectId,
      dueDate: tarea.dueDate || undefined,
      assigneeId: tarea.assigneeId || undefined
    });
    setDialogOpen(true);
  };
  
  // Cambiar estado de tarea rápidamente
  const handleCambiarEstado = async (id: number, nuevoEstado: string) => {
    try {
      await actualizarTareaMutation.mutateAsync({
        id,
        tarea: { status: nuevoEstado }
      });
    } catch (error) {
      console.error("Error al cambiar estado:", error);
    }
  };
  
  // Manejar envío de formulario
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    try {
      if (editingTask) {
        await actualizarTareaMutation.mutateAsync({
          id: editingTask.id,
          tarea: nuevaTarea
        });
      } else {
        await crearTareaMutation.mutateAsync(nuevaTarea);
      }
    } catch (error) {
      console.error("Error:", error);
    }
  };
  
  // Filtrar tareas por estado
  const tareasFiltradas = (tareas || []).filter((tarea: Tarea) => {
    if (filtroEstado === "all") return true;
    return tarea.status === filtroEstado;
  });
  
  // Encontrar nombre de empleado por id
  const getNombreEmpleado = (id: number | null): string => {
    if (!id) return 'Sin asignar';
    const empleado = empleados?.find((e: Empleado) => e.id === id);
    return empleado ? `${empleado.firstName} ${empleado.lastName}` : 'Sin asignar';
  };
  
  // Obtener iniciales para avatar
  const getInitials = (nombre: string): string => {
    if (nombre === 'Sin asignar') return 'SA';
    const partes = nombre.split(' ');
    if (partes.length >= 2) {
      return `${partes[0][0]}${partes[1][0]}`.toUpperCase();
    }
    return partes[0].substring(0, 2).toUpperCase();
  };
  
  // Renderizar icono según estado
  const renderEstadoIcon = (estado: string) => {
    switch (estado) {
      case 'todo':
        return <ListTodo className="h-4 w-4 text-slate-500" />;
      case 'in_progress':
        return <Clock className="h-4 w-4 text-amber-500" />;
      case 'completed':
        return <CheckCircle2 className="h-4 w-4 text-green-500" />;
      default:
        return <AlertCircle className="h-4 w-4" />;
    }
  };
  
  // Renderizar tabla de tareas
  const renderTareas = () => {
    if (isLoading) {
      return (
        <div className="flex justify-center items-center h-40">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      );
    }
    
    if (isError) {
      return (
        <div className="text-center p-4 text-destructive">
          Error al cargar las tareas. Intenta de nuevo.
        </div>
      );
    }
    
    if (!tareas || tareas.length === 0) {
      return (
        <div className="text-center p-6 text-muted-foreground">
          <ListTodo className="h-12 w-12 mx-auto mb-2 opacity-30" />
          <p>No hay tareas asignadas a este proyecto.</p>
          <Button 
            variant="outline" 
            className="mt-4"
            onClick={() => {
              resetFormulario();
              setDialogOpen(true);
            }}
          >
            <PlusCircle className="h-4 w-4 mr-2" />
            Agregar tarea
          </Button>
        </div>
      );
    }
    
    return (
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Título</TableHead>
            <TableHead>Estado</TableHead>
            <TableHead>Prioridad</TableHead>
            <TableHead>Responsable</TableHead>
            <TableHead>Fecha límite</TableHead>
            <TableHead className="text-right">Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {tareasFiltradas.map((tarea: Tarea) => {
            const nombreEmpleado = getNombreEmpleado(tarea.assigneeId);
            
            return (
              <TableRow key={tarea.id}>
                <TableCell className="font-medium">
                  {tarea.title}
                  {tarea.description && (
                    <p className="text-xs text-muted-foreground line-clamp-1 mt-1">
                      {tarea.description}
                    </p>
                  )}
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1">
                    {renderEstadoIcon(tarea.status)}
                    <span>{traducirEstadoTarea(tarea.status)}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant={getBadgeVariant(tarea.priority)}>
                    {traducirPrioridadTarea(tarea.priority)}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Avatar className="h-6 w-6">
                      <AvatarFallback className="text-xs">
                        {getInitials(nombreEmpleado)}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-sm">{nombreEmpleado}</span>
                  </div>
                </TableCell>
                <TableCell>
                  {tarea.dueDate ? (
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      <span>{formatearFecha(tarea.dueDate)}</span>
                    </div>
                  ) : (
                    <span className="text-muted-foreground text-sm">No establecida</span>
                  )}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-2">
                    {tarea.status !== 'completed' && (
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => handleCambiarEstado(tarea.id, 'completed')}
                        title="Marcar como completada"
                      >
                        <CheckCircle2 className="h-4 w-4 text-green-500" />
                      </Button>
                    )}
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => handleEdit(tarea)}
                      title="Editar tarea"
                    >
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => {
                        if (confirm("¿Estás seguro de eliminar esta tarea?")) {
                          eliminarTareaMutation.mutate(tarea.id);
                        }
                      }}
                      title="Eliminar tarea"
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    );
  };
  
  // Formulario para crear/editar tareas
  const renderFormulario = () => {
    return (
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="title">Título*</Label>
          <Input
            id="title"
            placeholder="Título de la tarea"
            value={nuevaTarea.title}
            onChange={(e) => setNuevaTarea({...nuevaTarea, title: e.target.value})}
            required
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="description">Descripción</Label>
          <Textarea
            id="description"
            placeholder="Descripción detallada de la tarea"
            value={nuevaTarea.description || ""}
            onChange={(e) => setNuevaTarea({...nuevaTarea, description: e.target.value})}
            rows={3}
          />
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="status">Estado</Label>
            <Select
              value={nuevaTarea.status}
              onValueChange={(value) => setNuevaTarea({...nuevaTarea, status: value})}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecciona un estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todo">Pendiente</SelectItem>
                <SelectItem value="in_progress">En progreso</SelectItem>
                <SelectItem value="completed">Completada</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="priority">Prioridad</Label>
            <Select
              value={nuevaTarea.priority}
              onValueChange={(value) => setNuevaTarea({...nuevaTarea, priority: value})}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecciona una prioridad" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="low">Baja</SelectItem>
                <SelectItem value="medium">Media</SelectItem>
                <SelectItem value="high">Alta</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="dueDate">Fecha límite</Label>
          <Input
            id="dueDate"
            type="date"
            value={nuevaTarea.dueDate || ""}
            onChange={(e) => setNuevaTarea({...nuevaTarea, dueDate: e.target.value})}
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="assignee">Responsable</Label>
          <Select
            value={nuevaTarea.assigneeId?.toString() || ""}
            onValueChange={(value) => setNuevaTarea({
              ...nuevaTarea, 
              assigneeId: value ? parseInt(value) : undefined
            })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecciona un responsable" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Sin asignar</SelectItem>
              {empleados && empleados.map((empleado: Empleado) => (
                <SelectItem key={empleado.id} value={empleado.id.toString()}>
                  {empleado.firstName} {empleado.lastName} - {empleado.position}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <div className="flex justify-end gap-2 pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              setDialogOpen(false);
              resetFormulario();
            }}
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            disabled={crearTareaMutation.isPending || actualizarTareaMutation.isPending}
          >
            {(crearTareaMutation.isPending || actualizarTareaMutation.isPending) && (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            )}
            {editingTask ? "Actualizar tarea" : "Crear tarea"}
          </Button>
        </div>
      </form>
    );
  };
  
  // Calcular contadores para filtros
  const contarTareasPorEstado = () => {
    if (!tareas) return { total: 0, todo: 0, in_progress: 0, completed: 0 };
    
    return tareas.reduce((acc: any, tarea: Tarea) => {
      acc.total++;
      acc[tarea.status]++;
      return acc;
    }, { total: 0, todo: 0, in_progress: 0, completed: 0 });
  };
  
  const contadores = contarTareasPorEstado();
  
  return (
    <Card className="shadow-sm">
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>Tareas del proyecto</CardTitle>
            <CardDescription>Gestiona las tareas asociadas a este proyecto</CardDescription>
          </div>
          <Button onClick={() => {
            resetFormulario();
            setDialogOpen(true);
          }}>
            <PlusCircle className="h-4 w-4 mr-2" />
            Nueva tarea
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs 
          value={filtroEstado} 
          onValueChange={setFiltroEstado}
          className="mb-6"
        >
          <TabsList className="grid grid-cols-4">
            <TabsTrigger value="all">
              Todas ({contadores.total})
            </TabsTrigger>
            <TabsTrigger value="todo">
              <ListTodo className="h-4 w-4 mr-1" />
              Pendientes ({contadores.todo})
            </TabsTrigger>
            <TabsTrigger value="in_progress">
              <Clock className="h-4 w-4 mr-1" />
              En progreso ({contadores.in_progress})
            </TabsTrigger>
            <TabsTrigger value="completed">
              <CheckCircle2 className="h-4 w-4 mr-1" />
              Completadas ({contadores.completed})
            </TabsTrigger>
          </TabsList>
        </Tabs>
        
        {renderTareas()}
      </CardContent>
      
      {/* Diálogo para crear/editar tarea */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingTask ? "Editar tarea" : "Crear nueva tarea"}
            </DialogTitle>
          </DialogHeader>
          {renderFormulario()}
        </DialogContent>
      </Dialog>
    </Card>
  );
}