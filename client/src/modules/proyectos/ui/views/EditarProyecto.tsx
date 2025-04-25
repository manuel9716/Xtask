import { useParams, useLocation } from "wouter";
import { useObtenerProyecto } from "../../application/useCases/obtenerProyecto";
import { ProyectoForm } from "../components/ProyectoForm";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Loader2 } from "lucide-react";
import { Card } from "@/components/ui/card";

export function EditarProyecto() {
  const { id } = useParams<{ id: string }>();
  const [, navigate] = useLocation();
  const proyectoId = id ? parseInt(id) : undefined;
  
  // Obtener datos del proyecto
  const { 
    proyecto, 
    isLoading, 
    isError, 
    error 
  } = useObtenerProyecto(proyectoId);

  const handleSuccess = () => {
    navigate(`/admin/proyectos/${proyectoId}`);
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
      <div className="space-y-6">
        <div className="flex items-center">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => navigate("/admin/proyectos")}
            className="mr-4"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-2xl font-bold">Error</h1>
        </div>
        
        <Card className="p-6">
          <p className="text-destructive">No se pudo cargar el proyecto</p>
          <p className="text-sm text-muted-foreground mt-2">{error?.toString()}</p>
          <Button 
            onClick={() => navigate("/admin/proyectos")}
            className="mt-4"
          >
            Volver a proyectos
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center">
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={() => navigate(`/admin/proyectos/${proyectoId}`)}
          className="mr-4"
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-2xl font-bold">Editar Proyecto</h1>
      </div>
      
      <ProyectoForm 
        proyecto={proyecto} 
        onSuccess={handleSuccess} 
      />
    </div>
  );
}