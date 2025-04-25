import { useParams, useLocation } from "wouter";
import { useProyecto } from "../../application/useCases/obtenerProyecto";
import { EstadoProyectoBadge } from "../components/EstadoProyectoBadge";
import { CambiarEstadoProyectoDialog } from "../components/CambiarEstadoProyectoDialog";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { formatCurrency } from "@/lib/utils";
import { 
  ArrowLeft, 
  Calendar, 
  Clock, 
  DollarSign, 
  Edit, 
  Loader2, 
  MoreVertical, 
  Tag, 
  Trash2, 
  User, 
  Users
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { 
  AlertDialog, 
  AlertDialogAction, 
  AlertDialogCancel, 
  AlertDialogContent, 
  AlertDialogDescription, 
  AlertDialogFooter, 
  AlertDialogHeader, 
  AlertDialogTitle, 
  AlertDialogTrigger 
} from "@/components/ui/alert-dialog";
import { proyectosApi } from "../../infrastructure/api/proyectosApi";

export function DetalleProyecto() {
  const { id } = useParams<{ id: string }>();
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const proyectoId = id ? parseInt(id) : undefined;
  
  const [eliminando, setEliminando] = useState(false);
  
  // Consultar datos del proyecto
  const { 
    data: proyecto,
    isLoading, 
    isError, 
    error, 
    refetch 
  } = useProyecto(proyectoId);
  
  // Método para eliminar el proyecto
  const handleEliminar = async () => {
    if (!proyectoId) return;
    
    try {
      setEliminando(true);
      await proyectosApi.eliminarProyecto(proyectoId);
      
      toast({
        title: "Proyecto eliminado",
        description: "El proyecto ha sido archivado correctamente.",
      });
      
      navigate("/admin/proyectos");
    } catch (error) {
      console.error("Error al eliminar:", error);
      
      toast({
        title: "Error al eliminar",
        description: error instanceof Error ? error.message : "No se pudo eliminar el proyecto",
        variant: "destructive",
      });
    } finally {
      setEliminando(false);
    }
  };

  // Estado de carga
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }
  
  // Estado de error
  if (isError || !proyecto) {
    return (
      <div className="py-8">
        <div className="flex items-center mb-4">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => navigate("/admin/proyectos")}
            className="mr-2"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-2xl font-bold">Error</h1>
        </div>
        
        <Card>
          <CardContent className="pt-6">
            <p className="text-destructive">No se pudo cargar el proyecto</p>
            <p className="text-sm text-muted-foreground mt-2">{error?.toString()}</p>
            <Button 
              onClick={() => navigate("/admin/proyectos")}
              className="mt-4"
            >
              Volver a proyectos
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  // Formatear fechas para presentación
  const fechaInicio = format(new Date(proyecto.fechaInicio), "dd MMMM yyyy", { locale: es });
  const fechaFinPrevista = proyecto.fechaFinPrevista 
    ? format(new Date(proyecto.fechaFinPrevista), "dd MMMM yyyy", { locale: es })
    : "No definida";
  const fechaFinReal = proyecto.fechaFinReal 
    ? format(new Date(proyecto.fechaFinReal), "dd MMMM yyyy", { locale: es })
    : "No finalizado";
  
  // Calcular días restantes si hay fecha de fin prevista
  const diasRestantes = proyecto.fechaFinPrevista 
    ? Math.ceil((new Date(proyecto.fechaFinPrevista).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
    : null;
  
  // Determinar mensaje según días restantes
  let mensajePlazo = "";
  let colorPlazo = "";
  
  if (diasRestantes !== null) {
    if (diasRestantes < 0) {
      mensajePlazo = `Vencido hace ${Math.abs(diasRestantes)} días`;
      colorPlazo = "text-destructive";
    } else if (diasRestantes === 0) {
      mensajePlazo = "Vence hoy";
      colorPlazo = "text-yellow-500";
    } else if (diasRestantes <= 7) {
      mensajePlazo = `${diasRestantes} días restantes`;
      colorPlazo = "text-yellow-500";
    } else {
      mensajePlazo = `${diasRestantes} días restantes`;
      colorPlazo = "text-green-500";
    }
  }

  return (
    <div>
      {/* Header con acciones */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 gap-4">
        <div className="flex items-center">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => navigate("/admin/proyectos")}
            className="mr-2"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">{proyecto.nombre}</h1>
            <p className="text-muted-foreground">ID: {proyecto.id}</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <EstadoProyectoBadge estado={proyecto.estado} />
          
          <Button 
            variant="outline"
            onClick={() => navigate(`/admin/proyectos/${proyecto.id}/editar`)}
            className="gap-2"
          >
            <Edit className="h-4 w-4" />
            Editar
          </Button>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Acciones</DropdownMenuLabel>
              <DropdownMenuSeparator />
              
              <CambiarEstadoProyectoDialog 
                proyectoId={proyecto.id}
                estadoActual={proyecto.estado}
                onEstadoCambiado={refetch}
              >
                <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                  Cambiar estado
                </DropdownMenuItem>
              </CambiarEstadoProyectoDialog>
              
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <DropdownMenuItem 
                    onSelect={(e) => e.preventDefault()}
                    className="text-destructive"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Eliminar proyecto
                  </DropdownMenuItem>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>¿Eliminar este proyecto?</AlertDialogTitle>
                    <AlertDialogDescription>
                      Esta acción archivará el proyecto y ya no aparecerá en la lista principal.
                      Podrás recuperarlo posteriormente si es necesario.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel disabled={eliminando}>Cancelar</AlertDialogCancel>
                    <AlertDialogAction 
                      onClick={handleEliminar}
                      disabled={eliminando}
                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    >
                      {eliminando && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                      Eliminar
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
      
      {/* Contenido principal */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Información general */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Información General</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-1">Descripción</h3>
              <p>{proyecto.descripcion}</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-1">Fechas</h3>
                <ul className="space-y-2">
                  <li className="flex items-center">
                    <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                    <span>Inicio: {fechaInicio}</span>
                  </li>
                  <li className="flex items-center">
                    <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                    <span>Fin previsto: {fechaFinPrevista}</span>
                    {mensajePlazo && (
                      <span className={`ml-2 text-sm font-medium ${colorPlazo}`}>
                        ({mensajePlazo})
                      </span>
                    )}
                  </li>
                  <li className="flex items-center">
                    <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                    <span>Fin real: {fechaFinReal}</span>
                  </li>
                </ul>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-1">Responsables</h3>
                <ul className="space-y-2">
                  <li className="flex items-center">
                    <User className="h-4 w-4 mr-2 text-muted-foreground" />
                    <span>ID Responsable: {proyecto.responsableId}</span>
                  </li>
                  
                  {proyecto.clienteId && (
                    <li className="flex items-center">
                      <Users className="h-4 w-4 mr-2 text-muted-foreground" />
                      <span>ID Cliente: {proyecto.clienteId}</span>
                    </li>
                  )}
                </ul>
              </div>
            </div>
            
            {proyecto.tags && proyecto.tags.length > 0 && (
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-1">Etiquetas</h3>
                <div className="flex flex-wrap gap-2">
                  {proyecto.tags.map((tag, index) => (
                    <Badge key={index} variant="secondary">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
        
        {/* Información financiera y temporal */}
        <Card>
          <CardHeader>
            <CardTitle>Resumen</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-1">Presupuesto</h3>
              <div className="flex items-center text-2xl font-bold">
                <DollarSign className="h-5 w-5 mr-1 text-muted-foreground" />
                {formatCurrency(proyecto.presupuesto)}
              </div>
            </div>
            
            <Separator />
            
            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-1">Estado</h3>
              <div className="flex items-center">
                <EstadoProyectoBadge estado={proyecto.estado} className="text-sm" />
              </div>
            </div>
            
            <Separator />
            
            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-1">Temporalidad</h3>
              <div className="space-y-2">
                {proyecto.fechaFinPrevista && (
                  <div className="flex items-center">
                    <Clock className="h-4 w-4 mr-2 text-muted-foreground" />
                    <span className={colorPlazo}>{mensajePlazo}</span>
                  </div>
                )}
                
                <div className="text-sm">
                  Creado el {format(new Date(proyecto.createdAt), "dd MMM yyyy", { locale: es })}
                </div>
                <div className="text-sm">
                  Actualizado el {format(new Date(proyecto.updatedAt), "dd MMM yyyy", { locale: es })}
                </div>
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button 
              variant="outline" 
              className="w-full"
              onClick={() => navigate(`/admin/proyectos/${proyecto.id}/editar`)}
            >
              <Edit className="h-4 w-4 mr-2" />
              Editar proyecto
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}