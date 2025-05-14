import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { 
  AlertCircle, 
  Check, 
  Loader2, 
  Pencil, 
  Plus, 
  Star, 
  Trash, 
  User, 
  Users
} from "lucide-react";

export default function ResponsablesProyecto({ proyectoId }) {
  const [selectedEmpleadoId, setSelectedEmpleadoId] = useState("");
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [employeeToRemove, setEmployeeToRemove] = useState(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Consulta para obtener los empleados asignados al proyecto
  const { 
    data: proyectoEmpleados = [],
    isLoading: cargandoProyectoEmpleados,
    isError: errorProyectoEmpleados,
    refetch: refetchProyectoEmpleados,
  } = useQuery({
    queryKey: ["/api/employee-projects", proyectoId],
    queryFn: async () => {
      const res = await apiRequest("GET", `/api/employee-projects?projectId=${proyectoId}`);
      return res.json();
    },
    enabled: !!proyectoId,
  });
  
  // Consulta para obtener todos los empleados disponibles
  const { 
    data: empleados = [], 
    isLoading: cargandoEmpleados 
  } = useQuery({
    queryKey: ["/api/employees"],
    queryFn: async () => {
      const res = await apiRequest("GET", "/api/employees");
      return res.json();
    },
  });
  
  // Mutation para asignar un empleado al proyecto
  const asignarMutation = useMutation({
    mutationFn: async (empleadoId) => {
      const payload = {
        projectId: proyectoId,
        employeeId: Number(empleadoId),
      };
      const res = await apiRequest("POST", "/api/employee-projects", payload);
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: 'Empleado asignado',
        description: 'Se ha asignado el empleado al proyecto correctamente.',
      });
      setSelectedEmpleadoId("");
      refetchProyectoEmpleados();
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: `No se pudo asignar el empleado: ${error.message}`,
        variant: 'destructive',
      });
    }
  });
  
  // Mutation para eliminar un empleado del proyecto
  const eliminarResponsableMutation = useMutation({
    mutationFn: async (asignacionId) => {
      const res = await apiRequest("DELETE", `/api/employee-projects/${asignacionId}`);
      return res.status === 204 ? {} : res.json();
    },
    onSuccess: () => {
      toast({
        title: 'Responsable eliminado',
        description: 'Se ha eliminado el responsable del proyecto correctamente.',
      });
      refetchProyectoEmpleados();
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: `No se pudo eliminar el responsable: ${error.message}`,
        variant: 'destructive',
      });
    }
  });
  
  // Mutation para establecer un empleado como responsable principal
  const setPrincipalMutation = useMutation({
    mutationFn: async (asignacionId) => {
      const res = await apiRequest("PATCH", `/api/employee-projects/${asignacionId}/set-primary`, {});
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: 'Responsable principal actualizado',
        description: 'Se ha establecido el responsable principal correctamente.',
      });
      refetchProyectoEmpleados();
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: `No se pudo establecer el responsable principal: ${error.message}`,
        variant: 'destructive',
      });
    }
  });
  
  // Función para manejar la asignación de un empleado
  const handleAsignarEmpleado = () => {
    if (selectedEmpleadoId) {
      asignarMutation.mutate(selectedEmpleadoId);
    }
  };
  
  // Obtener lista de empleados filtrada (solo los que no están ya asignados)
  const getEmpleadosDisponibles = () => {
    return empleados.filter(empleado => {
      // Verificar si el empleado ya está asignado al proyecto
      return !proyectoEmpleados.some(pe => pe.employeeId === empleado.id);
    });
  };
  
  // Obtener las iniciales para el avatar
  const getIniciales = (firstName, lastName) => {
    const firstInitial = firstName ? firstName.charAt(0).toUpperCase() : '';
    const lastInitial = lastName ? lastName.charAt(0).toUpperCase() : '';
    return `${firstInitial}${lastInitial}` || 'U';
  };

  // Renderizar lista de responsables del proyecto
  const renderResponsables = () => {
    if (cargandoProyectoEmpleados) {
      return (
        <div className="flex justify-center items-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      );
    }
    
    if (errorProyectoEmpleados) {
      return (
        <div className="py-8 text-center">
          <AlertCircle className="h-8 w-8 text-destructive mx-auto mb-2" />
          <p className="text-muted-foreground">Error al cargar los responsables del proyecto.</p>
        </div>
      );
    }
    
    if (proyectoEmpleados.length === 0) {
      return (
        <div className="text-center py-8">
          <Users className="h-12 w-12 text-muted-foreground mx-auto mb-3 opacity-50" />
          <p className="text-muted-foreground">No hay responsables asignados a este proyecto.</p>
          <p className="text-sm text-muted-foreground mb-4">
            Asigna empleados para formar el equipo del proyecto.
          </p>
        </div>
      );
    }
    
    return (
      <div className="space-y-3 mt-6">
        {proyectoEmpleados.map((asignacion) => {
          const empleadoInfo = empleados.find(e => e.id === asignacion.employeeId) || {};
          const { firstName, lastName, position, department } = empleadoInfo;
          
          return (
            <div 
              key={asignacion.id} 
              className="flex justify-between items-center p-3 border rounded-lg hover:bg-muted/50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <Avatar>
                  <AvatarFallback>{getIniciales(firstName, lastName)}</AvatarFallback>
                </Avatar>
                
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-medium">{`${firstName || ''} ${lastName || ''}`.trim()}</p>
                    {asignacion.isPrimary && (
                      <Badge variant="secondary" className="flex items-center gap-1">
                        <Star className="h-3 w-3" />
                        Principal
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">{position || 'Sin cargo'}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                {!asignacion.isPrimary && (
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => setPrincipalMutation.mutate(asignacion.id)}
                    disabled={setPrincipalMutation.isPending}
                    title="Establecer como responsable principal"
                  >
                    {setPrincipalMutation.isPending ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Star className="h-4 w-4" />
                    )}
                  </Button>
                )}
                
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => {
                    setEmployeeToRemove({
                      id: asignacion.id,
                      name: `${firstName || ''} ${lastName || ''}`.trim()
                    });
                    setConfirmDialogOpen(true);
                  }}
                  disabled={eliminarResponsableMutation.isPending}
                >
                  {eliminarResponsableMutation.isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Trash className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
          );
        })}
      </div>
    );
  };
  
  return (
    <Card className="mt-4">
      <CardHeader>
        <CardTitle>Responsables del Proyecto</CardTitle>
        <CardDescription>
          Gestiona los miembros del equipo a cargo de este proyecto
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        {/* Formulario para asignar empleados */}
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-end">
          <div className="flex-1">
            <p className="text-sm font-medium mb-2">Asignar nuevo responsable</p>
            <Select value={selectedEmpleadoId} onValueChange={setSelectedEmpleadoId}>
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar empleado" />
              </SelectTrigger>
              <SelectContent>
                {getEmpleadosDisponibles().length === 0 ? (
                  <SelectItem value="" disabled>
                    No hay empleados disponibles
                  </SelectItem>
                ) : (
                  getEmpleadosDisponibles().map((empleado) => (
                    <SelectItem key={empleado.id} value={empleado.id.toString()}>
                      {`${empleado.firstName || ''} ${empleado.lastName || ''}`.trim() || 'Usuario ' + empleado.id}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>
          
          <Button 
            onClick={handleAsignarEmpleado}
            disabled={!selectedEmpleadoId || asignarMutation.isPending}
            className="shrink-0"
          >
            {asignarMutation.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : (
              <Plus className="h-4 w-4 mr-2" />
            )}
            Asignar al proyecto
          </Button>
        </div>
        
        <Separator className="my-6" />
        
        {/* Lista de responsables */}
        {renderResponsables()}
      </CardContent>
      
      {/* Diálogo de confirmación para eliminar */}
      <AlertDialog open={confirmDialogOpen} onOpenChange={setConfirmDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar responsable?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción eliminará a {employeeToRemove?.name} como responsable del proyecto.
              Esta acción no se puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (employeeToRemove) {
                  eliminarResponsableMutation.mutate(employeeToRemove.id);
                }
                setConfirmDialogOpen(false);
              }}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
}