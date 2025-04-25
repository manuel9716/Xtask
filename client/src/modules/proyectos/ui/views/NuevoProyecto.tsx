import { useNavigate } from "wouter";
import { ProyectoForm } from "../components/ProyectoForm";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { Card } from "@/components/ui/card";

export function NuevoProyecto() {
  const [, navigate] = useNavigate();

  const handleSuccess = () => {
    navigate("/admin/proyectos");
  };

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
        <h1 className="text-2xl font-bold">Crear Nuevo Proyecto</h1>
      </div>
      
      <ProyectoForm onSuccess={handleSuccess} />
    </div>
  );
}