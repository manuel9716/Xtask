import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { 
  AlertCircle, 
  CalendarClock, 
  Check, 
  Clock, 
  Loader2, 
  Plus, 
  SquarePen,
  User,
  X
} from "lucide-react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

// Esquema para validar el formulario
const taskSchema = z.object({
  title: z.string().min(3, "El título debe tener al menos 3 caracteres"),
  description: z.string().optional(),
  priority: z.enum(["low", "medium", "high", "urgent"], {
    required_error: "Selecciona la prioridad",
  }),
  status: z.enum(["todo", "in_progress", "completed"], {
    required_error: "Selecciona el estado",
  }),
  assigneeId: z.number().nullable().optional(),
});

export default function TareasProyecto({ proyectoId }) {
  const [activeTab, setActiveTab] = useState("todas");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Consulta para obtener las tareas del proyecto
  const { 
    data: tareas, 
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["/api/tasks", { projectId: proyectoId }],
    queryFn: async () => {
      const res = await apiRequest("GET", `/api/tasks?projectId=${proyectoId}`);
      return res.json();
    },
    enabled: !!proyectoId,
  });
  
  // Consulta para obtener los empleados (para asignar responsables)
  const { data: empleados } = useQuery({
    queryKey: ["/api/employees"],
    queryFn: async () => {
      const res = await apiRequest("GET", "/api/employees");
      return res.json();
    },
  });
  
  // Mutation para crear una tarea
  const crearTareaMutation = useMutation({
    mutationFn: async (data) => {
      const payload = {
        ...data,
        projectId: proyectoId,
      };
      const res = await apiRequest("POST", "/api/tasks", payload);
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "Tarea creada",
        description: "La tarea ha sido creada exitosamente",
      });
      queryClient.invalidateQueries(["/api/tasks", { projectId: proyectoId }]);
      setDialogOpen(false);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `No se pudo crear la tarea: ${error.message}`,
        variant: "destructive",
      });
    },
  });
  
  // Mutation para actualizar una tarea
  const actualizarTareaMutation = useMutation({
    mutationFn: async (data) => {
      const { id, ...rest } = data;
      const res = await apiRequest("PATCH", `/api/tasks/${id}`, rest);
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "Tarea actualizada",
        description: "La tarea ha sido actualizada exitosamente",
      });
      queryClient.invalidateQueries(["/api/tasks", { projectId: proyectoId }]);
      setDialogOpen(false);
      setEditingTask(null);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `No se pudo actualizar la tarea: ${error.message}`,
        variant: "destructive",
      });
    },
  });
  
  // Formulario con react-hook-form y zod
  const form = useForm({
    resolver: zodResolver(taskSchema),
    defaultValues: {
      title: "",
      description: "",
      priority: "medium",
      status: "todo",
      assigneeId: null,
    },
  });
  
  // Función para abrir el formulario de edición
  const handleEditTask = (task) => {
    setEditingTask(task);
    
    // Establecer valores por defecto
    form.reset({
      title: task.title,
      description: task.description || "",
      priority: task.priority,
      status: task.status,
      assigneeId: task.assigneeId,
    });
    
    setDialogOpen(true);
  };
  
  // Función para abrir el formulario de creación
  const handleCreateTask = () => {
    setEditingTask(null);
    form.reset({
      title: "",
      description: "",
      priority: "medium",
      status: "todo",
      assigneeId: null,
    });
    setDialogOpen(true);
  };
  
  // Función para enviar el formulario
  const onSubmit = (data) => {
    if (editingTask) {
      actualizarTareaMutation.mutate({ id: editingTask.id, ...data });
    } else {
      crearTareaMutation.mutate(data);
    }
  };
  
  // Función para filtrar tareas según la pestaña activa
  const getTareasFiltradas = () => {
    if (!tareas) return [];
    
    switch (activeTab) {
      case "pendientes":
        return tareas.filter(tarea => tarea.status === "todo");
      case "en_progreso":
        return tareas.filter(tarea => tarea.status === "in_progress");
      case "completadas":
        return tareas.filter(tarea => tarea.status === "completed");
      default:
        return tareas;
    }
  };
  
  // Renderizar el estado de la tarea
  const renderEstadoTarea = (status) => {
    switch (status) {
      case "todo":
        return (
          <Badge variant="outline" className="bg-amber-50 text-amber-600 border-amber-200">
            <Clock className="h-3 w-3 mr-1" />
            Pendiente
          </Badge>
        );
      case "in_progress":
        return (
          <Badge variant="outline" className="bg-blue-50 text-blue-600 border-blue-200">
            <CalendarClock className="h-3 w-3 mr-1" />
            En progreso
          </Badge>
        );
      case "completed":
        return (
          <Badge variant="outline" className="bg-green-50 text-green-600 border-green-200">
            <Check className="h-3 w-3 mr-1" />
            Completada
          </Badge>
        );
      default:
        return (
          <Badge variant="outline">
            Desconocido
          </Badge>
        );
    }
  };
  
  // Renderizar la prioridad de la tarea
  const renderPrioridadTarea = (priority) => {
    switch (priority) {
      case "low":
        return <Badge variant="outline" className="bg-gray-50 text-gray-600 border-gray-200">Baja</Badge>;
      case "medium":
        return <Badge variant="outline" className="bg-blue-50 text-blue-600 border-blue-200">Media</Badge>;
      case "high":
        return <Badge variant="outline" className="bg-amber-50 text-amber-600 border-amber-200">Alta</Badge>;
      case "urgent":
        return <Badge variant="outline" className="bg-red-50 text-red-600 border-red-200">Urgente</Badge>;
      default:
        return <Badge variant="outline">Desconocida</Badge>;
    }
  };
  
  // Obtener nombre de empleado por ID de usuario
  const getNombreEmpleado = (usuarioId) => {
    if (!empleados) return "Sin asignar";
    
    const empleado = empleados.find(emp => emp.userId === usuarioId);
    if (!empleado) return "Sin asignar";
    
    return `${empleado.firstName || ''} ${empleado.lastName || ''}`.trim() || "Empleado " + empleado.id || "Sin asignar";
  };
  
  // Renderizar lista de tareas
  const renderTareas = () => {
    if (isLoading) {
      return (
        <div className="flex justify-center items-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      );
    }
    
    if (isError) {
      return (
        <div className="py-8 text-center">
          <AlertCircle className="h-8 w-8 text-destructive mx-auto mb-2" />
          <p className="text-muted-foreground">Error al cargar las tareas.</p>
          <p className="text-sm text-muted-foreground">{error?.message}</p>
        </div>
      );
    }
    
    const tareasFiltradas = getTareasFiltradas();
    
    if (tareasFiltradas.length === 0) {
      return (
        <div className="text-center py-8">
          <p className="text-muted-foreground">No hay tareas para mostrar.</p>
          <Button 
            variant="outline" 
            className="mt-4"
            onClick={handleCreateTask}
          >
            <Plus className="h-4 w-4 mr-2" />
            Crear una tarea
          </Button>
        </div>
      );
    }
    
    return (
      <div className="space-y-4">
        {tareasFiltradas.map((tarea) => (
          <Card key={tarea.id} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-2">
              <div className="flex justify-between items-start">
                <CardTitle className="text-base font-medium">{tarea.title}</CardTitle>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-8 w-8 p-0" 
                  onClick={() => handleEditTask(tarea)}
                >
                  <SquarePen className="h-4 w-4" />
                  <span className="sr-only">Editar</span>
                </Button>
              </div>
              <div className="flex gap-2 mt-1">
                {renderEstadoTarea(tarea.status)}
                {renderPrioridadTarea(tarea.priority)}
              </div>
            </CardHeader>
            
            <CardContent className="pb-3">
              {tarea.description && (
                <p className="text-sm text-muted-foreground mb-3">{tarea.description}</p>
              )}
              
              {tarea.assigneeId && (
                <div className="flex items-center text-sm text-muted-foreground">
                  <User className="h-3.5 w-3.5 mr-1" />
                  <span>Asignado a: {getNombreEmpleado(tarea.assigneeId)}</span>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    );
  };
  
  // Renderizar formulario de tarea
  const renderFormulario = () => {
    return (
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Título*</FormLabel>
                <FormControl>
                  <Input placeholder="Título de la tarea" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Descripción</FormLabel>
                <FormControl>
                  <Textarea 
                    placeholder="Descripción detallada de la tarea" 
                    className="resize-none" 
                    rows={3}
                    {...field} 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="priority"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Prioridad*</FormLabel>
                  <Select 
                    onValueChange={field.onChange} 
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar prioridad" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="low">Baja</SelectItem>
                      <SelectItem value="medium">Media</SelectItem>
                      <SelectItem value="high">Alta</SelectItem>
                      <SelectItem value="urgent">Urgente</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Estado*</FormLabel>
                  <Select 
                    onValueChange={field.onChange} 
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar estado" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="todo">Pendiente</SelectItem>
                      <SelectItem value="in_progress">En progreso</SelectItem>
                      <SelectItem value="completed">Completada</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          
          <FormField
            control={form.control}
            name="assigneeId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Responsable</FormLabel>
                <Select 
                  onValueChange={(value) => field.onChange(value === "unassigned" ? null : Number(value))} 
                  defaultValue={field.value ? field.value.toString() : "unassigned"}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar responsable" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="unassigned">Sin asignar</SelectItem>
                    {empleados?.map((empleado) => (
                      <SelectItem key={empleado.id} value={empleado.userId.toString()}>
                        {`${empleado.firstName || ''} ${empleado.lastName || ''}`.trim() || "Empleado " + empleado.id}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormDescription>
                  Persona responsable de realizar esta tarea
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <DialogFooter className="pt-4">
            <Button 
              type="button" 
              variant="outline"
              onClick={() => setDialogOpen(false)}
            >
              Cancelar
            </Button>
            <Button 
              type="submit"
              disabled={crearTareaMutation.isPending || actualizarTareaMutation.isPending}
            >
              {(crearTareaMutation.isPending || actualizarTareaMutation.isPending) && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              {editingTask ? 'Actualizar tarea' : 'Crear tarea'}
            </Button>
          </DialogFooter>
        </form>
      </Form>
    );
  };
  
  return (
    <Card className="mt-4">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-center">
          <CardTitle>Tareas del Proyecto</CardTitle>
          <Button onClick={handleCreateTask}>
            <Plus className="h-4 w-4 mr-2" />
            Nueva tarea
          </Button>
        </div>
        <CardDescription>
          Gestiona las tareas asociadas a este proyecto
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-4">
            <TabsTrigger value="todas">Todas</TabsTrigger>
            <TabsTrigger value="pendientes">Pendientes</TabsTrigger>
            <TabsTrigger value="en_progreso">En progreso</TabsTrigger>
            <TabsTrigger value="completadas">Completadas</TabsTrigger>
          </TabsList>
        
          {renderTareas()}
        </Tabs>
        
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
      </CardContent>
    </Card>
  );
}