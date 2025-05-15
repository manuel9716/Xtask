import { useState } from "react";
import { ProjectsTable } from "@/components/projects-table";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useQuery } from "@tanstack/react-query";
import { Project } from "@shared/schema";

// Definición de tipo extendida para aceptar propiedades en español e inglés
type ProyectoExtendido = Project & {
  nombre?: string;
  descripcion?: string;
  fechaInicio?: Date;
  fechaFinPrevista?: Date;
  presupuesto?: string | number;
  presupuestoRestante?: string | number;
  responsableId?: number;
  estado?: string;
  categoria?: string;
};
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ModalCrearProyecto } from "@/modules/proyectos/ui/components/ModalCrearProyecto";

export default function Projects() {
  const [activeTab, setActiveTab] = useState("all");
  const [modalAbierto, setModalAbierto] = useState(false);
  
  const { data: proyectosResponse } = useQuery<{data: ProyectoExtendido[]}>({
    queryKey: ["/api/proyectos"],
  });
  
  // Extraer los proyectos de la respuesta paginada
  const projects = proyectosResponse?.data || [] as ProyectoExtendido[];
  
  // Calculate project metrics
  const totalProjects = projects.length || 0;
  const activeProjects = projects.filter(p => p.status === "active" || p.estado === "ACTIVO").length || 0;
  const delayedProjects = projects.filter(p => p.status === "delayed" || p.estado === "RETRASADO").length || 0;
  const completedProjects = projects.filter(p => p.status === "completed" || p.estado === "FINALIZADO").length || 0;
  
  // Calculate total budget
  const totalBudget = projects.reduce((acc, project) => {
    // Usar presupuesto o budget, dependiendo de cuál esté disponible
    const presupuesto = project.presupuesto || project.budget || 0;
    return acc + parseFloat(presupuesto.toString());
  }, 0) || 0;
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-heading font-bold text-gray-900">Proyectos</h1>
          <p className="text-gray-500">Administra y supervisa todos los proyectos de tu empresa</p>
        </div>
        <Button className="md:self-start" size="sm" onClick={() => setModalAbierto(true)}>
          <Plus className="mr-2 h-4 w-4" /> Nuevo Proyecto
        </Button>
      </div>
      
      {/* Modal para crear proyecto */}
      <ModalCrearProyecto 
        abierto={modalAbierto} 
        onOpenChange={setModalAbierto} 
      />
      
      {/* Project Overview Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total Proyectos</CardDescription>
            <CardTitle className="text-3xl">{totalProjects}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-sm text-gray-500">
              De todos los departamentos
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Proyectos Activos</CardDescription>
            <CardTitle className="text-3xl">{activeProjects}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-sm text-gray-500">
              Actualmente en progreso
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Proyectos Retrasados</CardDescription>
            <CardTitle className="text-3xl text-red-600">{delayedProjects}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-sm text-gray-500">
              Requieren atención
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Presupuesto Total</CardDescription>
            <CardTitle className="text-3xl">${totalBudget.toLocaleString()}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-sm text-gray-500">
              Todos los proyectos combinados
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Projects Tabs */}
      <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="all">Todos los Proyectos</TabsTrigger>
          <TabsTrigger value="active">Activos</TabsTrigger>
          <TabsTrigger value="delayed">Retrasados</TabsTrigger>
          <TabsTrigger value="completed">Completados</TabsTrigger>
        </TabsList>
        
        <TabsContent value="all" className="mt-6">
          <ProjectsTable />
        </TabsContent>
        
        <TabsContent value="active" className="mt-6">
          <ProjectsTable />
        </TabsContent>
        
        <TabsContent value="delayed" className="mt-6">
          <ProjectsTable />
        </TabsContent>
        
        <TabsContent value="completed" className="mt-6">
          <ProjectsTable />
        </TabsContent>
      </Tabs>
    </div>
  );
}
