import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { 
  Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter 
} from "@/components/ui/card";
import { 
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription
} from "@/components/ui/dialog";
import { 
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue 
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { 
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow 
} from "@/components/ui/table";
import { 
  Badge
} from "@/components/ui/badge";
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
import { 
  UserPlus, Loader2, X, Star, StarOff, Users
} from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Proyecto } from "../../domain/entities/Proyecto";

// Interfaces
interface Empleado {
  id: number;
  firstName: string;
  lastName: string;
  position: string;
  department: string;
  email?: string;
  phone?: string;
}

interface AsignacionProyecto {
  id: number;
  employeeId: number;
  projectId: number;
  role: string;
  assignedAt: string;
  assignedBy: number;
  isActive: boolean;
  isPrimary?: boolean;
  employee?: Empleado;
}

interface ResponsablesProyectoProps {
  proyecto: Proyecto;
}

export default function ResponsablesProyecto({ proyecto }: ResponsablesProyectoProps) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [selectedEmpleadoId, setSelectedEmpleadoId] = useState<number | null>(null);
  const [selectedRole, setSelectedRole] = useState<string>("member");
  const [employeeToRemove, setEmployeeToRemove] = useState<AsignacionProyecto | null>(null);
  
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Consulta de responsables del proyecto
  const { 
    data: responsables, 
    isLoading, 
    isError 
  } = useQuery({
    queryKey: ['/api/employee-projects', proyecto.id],
    queryFn: async () => {
      const res = await apiRequest('GET', `/api/projects/${proyecto.id}/team`);
      const data = await res.json();
      return data;
    }
  });
  
  // Consulta de empleados disponibles
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
  
  // Mutación para asignar un responsable
  const asignarResponsableMutation = useMutation({
    mutationFn: async ({ employeeId, role }: { employeeId: number, role: string }) => {
      const res = await apiRequest('POST', `/api/projects/${proyecto.id}/team`, { 
        employeeId, 
        role
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/employee-projects', proyecto.id] });
      queryClient.invalidateQueries({ queryKey: ['/api/projects'] });
      toast({
        title: "Responsable asignado",
        description: "El empleado ha sido asignado al proyecto correctamente",
      });
      setDialogOpen(false);
      setSelectedEmpleadoId(null);
      setSelectedRole("member");
    },
    onError: (error) => {
      toast({
        title: "Error al asignar responsable",
        description: "Ocurrió un error al asignar el responsable. Inténtalo de nuevo.",
        variant: "destructive",
      });
    }
  });
  
  // Mutación para eliminar un responsable
  const eliminarResponsableMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await apiRequest('DELETE', `/api/employee-projects/${id}`);
      return res;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/employee-projects', proyecto.id] });
      queryClient.invalidateQueries({ queryKey: ['/api/projects'] });
      toast({
        title: "Responsable eliminado",
        description: "El empleado ha sido removido del proyecto correctamente",
      });
      setEmployeeToRemove(null);
    },
    onError: (error) => {
      toast({
        title: "Error al eliminar responsable",
        description: "Ocurrió un error al eliminar el responsable. Inténtalo de nuevo.",
        variant: "destructive",
      });
    }
  });
  
  // Mutación para establecer responsable principal
  const establecerPrincipalMutation = useMutation({
    mutationFn: async (employeeId: number) => {
      const res = await apiRequest('POST', `/api/projects/${proyecto.id}/manager`, { 
        managerId: employeeId
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/employee-projects', proyecto.id] });
      queryClient.invalidateQueries({ queryKey: ['/api/projects'] });
      toast({
        title: "Responsable principal actualizado",
        description: "Se ha actualizado el responsable principal del proyecto",
      });
    },
    onError: (error) => {
      toast({
        title: "Error al actualizar responsable principal",
        description: "Ocurrió un error al actualizar el responsable principal. Inténtalo de nuevo.",
        variant: "destructive",
      });
    }
  });
  
  // Manejar asignación de responsable
  const handleAsignarResponsable = async () => {
    if (!selectedEmpleadoId) {
      toast({
        title: "Selecciona un empleado",
        description: "Debes seleccionar un empleado para asignarlo al proyecto",
        variant: "destructive",
      });
      return;
    }
    
    try {
      await asignarResponsableMutation.mutateAsync({ 
        employeeId: selectedEmpleadoId, 
        role: selectedRole 
      });
    } catch (error) {
      console.error("Error:", error);
    }
  };
  
  // Manejar eliminación de responsable
  const handleEliminarResponsable = (responsable: AsignacionProyecto) => {
    setEmployeeToRemove(responsable);
    setConfirmDialogOpen(true);
  };
  
  // Manejar establecer responsable principal
  const handleEstablecerPrincipal = async (employeeId: number) => {
    try {
      await establecerPrincipalMutation.mutateAsync(employeeId);
    } catch (error) {
      console.error("Error:", error);
    }
  };
  
  // Obtener empleados disponibles (que no están ya asignados)
  const getEmpleadosDisponibles = () => {
    if (!empleados || !responsables) return [];
    
    // Obtener IDs de empleados ya asignados
    const idsAsignados = responsables.map((r: AsignacionProyecto) => r.employeeId);
    
    // Filtrar empleados disponibles
    return empleados.filter((e: Empleado) => !idsAsignados.includes(e.id));
  };
  
  // Renderizar tabla de responsables
  const renderResponsables = () => {
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
          Error al cargar los responsables. Intenta de nuevo.
        </div>
      );
    }
    
    if (!responsables || responsables.length === 0) {
      return (
        <div className="text-center p-6 text-muted-foreground">
          <Users className="h-12 w-12 mx-auto mb-2 opacity-30" />
          <p>No hay responsables asignados a este proyecto.</p>
          <Button 
            variant="outline" 
            className="mt-4"
            onClick={() => setDialogOpen(true)}
          >
            <UserPlus className="h-4 w-4 mr-2" />
            Asignar responsable
          </Button>
        </div>
      );
    }
    
    return (
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Empleado</TableHead>
            <TableHead>Cargo</TableHead>
            <TableHead>Rol en proyecto</TableHead>
            <TableHead>Fecha asignación</TableHead>
            <TableHead className="text-right">Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {responsables.map((responsable: AsignacionProyecto) => {
            const empleado = responsable.employee || { 
              firstName: "Empleado", 
              lastName: "Desconocido", 
              position: "No disponible",
              department: "No disponible"
            };
            
            const isManager = proyecto.responsableId === responsable.employeeId;
            
            return (
              <TableRow key={responsable.id}>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="text-xs bg-primary text-primary-foreground">
                        {empleado.firstName[0]}{empleado.lastName[0]}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">
                        {empleado.firstName} {empleado.lastName}
                        {isManager && (
                          <Badge variant="secondary" className="ml-2 bg-amber-100 text-amber-700 hover:bg-amber-100">
                            Principal
                          </Badge>
                        )}
                      </p>
                      <p className="text-xs text-muted-foreground">{empleado.department}</p>
                    </div>
                  </div>
                </TableCell>
                <TableCell>{empleado.position}</TableCell>
                <TableCell>
                  <Badge variant="outline">
                    {responsable.role === "member" ? "Miembro" : 
                     responsable.role === "lead" ? "Líder" : 
                     responsable.role === "manager" ? "Gerente" : 
                     responsable.role}
                  </Badge>
                </TableCell>
                <TableCell>
                  {new Date(responsable.assignedAt).toLocaleDateString('es-ES', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric'
                  })}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-2">
                    {!isManager ? (
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => handleEstablecerPrincipal(responsable.employeeId)}
                        title="Establecer como responsable principal"
                      >
                        <Star className="h-4 w-4 text-amber-500" />
                      </Button>
                    ) : (
                      <Button 
                        variant="ghost" 
                        size="sm"
                        disabled
                        title="Responsable principal"
                      >
                        <Star className="h-4 w-4 fill-amber-500 text-amber-500" />
                      </Button>
                    )}
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => handleEliminarResponsable(responsable)}
                      title="Eliminar responsable"
                    >
                      <X className="h-4 w-4 text-destructive" />
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
  
  // Renderizar formulario para asignar responsable
  const renderFormularioAsignar = () => {
    const empleadosDisponibles = getEmpleadosDisponibles();
    
    return (
      <div className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">Empleado</label>
          <Select
            value={selectedEmpleadoId?.toString() || ""}
            onValueChange={(value) => setSelectedEmpleadoId(parseInt(value))}
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecciona un empleado" />
            </SelectTrigger>
            <SelectContent>
              {empleadosDisponibles.length === 0 ? (
                <div className="p-2 text-sm text-muted-foreground">
                  No hay empleados disponibles para asignar
                </div>
              ) : (
                empleadosDisponibles.map((empleado: Empleado) => (
                  <SelectItem key={empleado.id} value={empleado.id.toString()}>
                    {empleado.firstName} {empleado.lastName} - {empleado.position}
                  </SelectItem>
                ))
              )}
            </SelectContent>
          </Select>
        </div>
        
        <div className="space-y-2">
          <label className="text-sm font-medium">Rol en el proyecto</label>
          <Select
            value={selectedRole}
            onValueChange={(value) => setSelectedRole(value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecciona un rol" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="member">Miembro</SelectItem>
              <SelectItem value="lead">Líder técnico</SelectItem>
              <SelectItem value="manager">Gerente de proyecto</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="flex justify-end gap-2 pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => setDialogOpen(false)}
          >
            Cancelar
          </Button>
          <Button
            type="button"
            onClick={handleAsignarResponsable}
            disabled={asignarResponsableMutation.isPending || !selectedEmpleadoId}
          >
            {asignarResponsableMutation.isPending && (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            )}
            Asignar responsable
          </Button>
        </div>
      </div>
    );
  };
  
  return (
    <Card className="shadow-sm">
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>Equipo del proyecto</CardTitle>
            <CardDescription>Gestiona los responsables asignados a este proyecto</CardDescription>
          </div>
          <Button onClick={() => setDialogOpen(true)}>
            <UserPlus className="h-4 w-4 mr-2" />
            Asignar
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {renderResponsables()}
      </CardContent>
      
      {/* Diálogo para asignar responsable */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Asignar responsable al proyecto</DialogTitle>
            <DialogDescription>
              Selecciona un empleado para asignarlo como responsable de este proyecto
            </DialogDescription>
          </DialogHeader>
          {renderFormularioAsignar()}
        </DialogContent>
      </Dialog>
      
      {/* Diálogo de confirmación para eliminar responsable */}
      <AlertDialog open={confirmDialogOpen} onOpenChange={setConfirmDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar responsable?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción eliminará al empleado {employeeToRemove?.employee?.firstName} {employeeToRemove?.employee?.lastName} de los responsables del proyecto.
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