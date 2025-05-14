import { useState } from "react";
import { useLocation, useRoute, Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { 
  Tabs, TabsContent, TabsList, TabsTrigger 
} from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { 
  Card, CardContent, CardHeader, CardTitle, CardDescription 
} from "@/components/ui/card";
import { 
  ArrowLeft, Edit, Calendar, DollarSign, BarChart2, 
  Clock, Loader2, ClipboardList, Users
} from "lucide-react";
import { Proyecto } from "../../domain/entities/Proyecto";
import TareasProyecto from "../components/TareasProyecto";
import ResponsablesProyecto from "../components/ResponsablesProyecto";

// Función para obtener el color por estado
const getEstadoColor = (estado: string): string => {
  switch (estado) {
    case 'ACTIVO': return 'bg-green-100 text-green-800 hover:bg-green-100';
    case 'PAUSADO': return 'bg-amber-100 text-amber-800 hover:bg-amber-100';
    case 'RETRASADO': return 'bg-red-100 text-red-800 hover:bg-red-100';
    case 'FINALIZADO': return 'bg-blue-100 text-blue-800 hover:bg-blue-100';
    case 'CANCELADO': return 'bg-gray-100 text-gray-800 hover:bg-gray-100';
    case 'ARCHIVADO': return 'bg-purple-100 text-purple-800 hover:bg-purple-100';
    default: return 'bg-gray-100 text-gray-800 hover:bg-gray-100';
  }
};

// Función para formatear fechas
const formatearFecha = (fecha: string | Date | null): string => {
  if (!fecha) return 'No definida';
  return new Date(fecha).toLocaleDateString('es-ES', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
};

// Función para formatear moneda
const formatearMoneda = (valor: number): string => {
  return new Intl.NumberFormat('es-ES', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 2
  }).format(valor);
};

export default function DetalleProyecto() {
  const [, params] = useRoute<{ id: string }>("/proyectos/:id");
  const [, setLocation] = useLocation();
  const [activeTab, setActiveTab] = useState("general");
  const { toast } = useToast();
  
  const id = params?.id ? parseInt(params.id) : 0;
  
  // Consulta del proyecto
  const { 
    data: proyecto, 
    isLoading, 
    isError 
  } = useQuery({
    queryKey: ['/api/proyectos', id],
    queryFn: async () => {
      const res = await apiRequest('GET', `/api/proyectos/${id}`);
      return res.json();
    },
    enabled: id > 0
  });
  
  // Si el id no es válido o no viene en la URL
  if (id <= 0) {
    setLocation("/proyectos");
    return null;
  }
  
  // Si está cargando
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[70vh]">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }
  
  // Si hay error
  if (isError || !proyecto) {
    toast({
      title: "Error al cargar el proyecto",
      description: "No se pudo cargar la información del proyecto. Inténtalo de nuevo.",
      variant: "destructive",
    });
    
    setLocation("/proyectos");
    return null;
  }
  
  // Cálculos y datos adicionales
  const avancePresupuesto = Math.min(100, (proyecto.costoActual / proyecto.presupuesto) * 100);
  const diasRestantes = proyecto.fechaFin 
    ? Math.ceil((new Date(proyecto.fechaFin).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
    : null;
  
  return (
    <div className="container mx-auto py-6">
      {/* Cabecera y navegación */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setLocation("/proyectos")}
            >
              <ArrowLeft className="h-4 w-4 mr-1" />
              Volver
            </Button>
            <h1 className="text-2xl font-bold">{proyecto.nombre}</h1>
            <Badge className={getEstadoColor(proyecto.estado)}>
              {proyecto.estado}
            </Badge>
          </div>
          <Button 
            variant="outline"
            onClick={() => setLocation(`/proyectos/${id}/editar`)}
          >
            <Edit className="h-4 w-4 mr-2" />
            Editar proyecto
          </Button>
        </div>
        
        <Separator className="my-4" />
      </div>
      
      {/* Tabs de navegación */}
      <Tabs 
        defaultValue="general" 
        value={activeTab}
        onValueChange={setActiveTab}
        className="w-full"
      >
        <TabsList className="mb-6 grid w-full grid-cols-4">
          <TabsTrigger value="general">
            <BarChart2 className="h-4 w-4 mr-2" />
            General
          </TabsTrigger>
          <TabsTrigger value="tareas">
            <ClipboardList className="h-4 w-4 mr-2" />
            Tareas
          </TabsTrigger>
          <TabsTrigger value="equipo">
            <Users className="h-4 w-4 mr-2" />
            Equipo
          </TabsTrigger>
          <TabsTrigger value="presupuesto">
            <DollarSign className="h-4 w-4 mr-2" />
            Presupuesto
          </TabsTrigger>
        </TabsList>
        
        {/* Contenido de la tab General */}
        <TabsContent value="general">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle>Detalles del proyecto</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-2">Descripción</h3>
                  <p className="text-base">
                    {proyecto.descripcion || "Sin descripción"}
                  </p>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground mb-2">Fecha inicio</h3>
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                      <span>{formatearFecha(proyecto.fechaInicio)}</span>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground mb-2">Fecha fin prevista</h3>
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                      <span>{formatearFecha(proyecto.fechaFin)}</span>
                    </div>
                  </div>
                </div>
                
                {proyecto.departamentoId && (
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground mb-2">Departamento</h3>
                    <Badge variant="outline">
                      {proyecto.departamentoId ? "Departamento #" + proyecto.departamentoId : "Sin departamento asignado"}
                    </Badge>
                  </div>
                )}
              </CardContent>
            </Card>
            
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Presupuesto</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm text-muted-foreground">Total</span>
                      <span className="font-medium">{formatearMoneda(proyecto.presupuesto)}</span>
                    </div>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm text-muted-foreground">Utilizado</span>
                      <span className="font-medium">{formatearMoneda(proyecto.costoActual)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Restante</span>
                      <span className="font-medium">{formatearMoneda(proyecto.presupuesto - proyecto.costoActual)}</span>
                    </div>
                  </div>
                  
                  <div className="w-full bg-secondary h-2 rounded-full overflow-hidden">
                    <div 
                      className={`h-full ${avancePresupuesto > 90 ? 'bg-destructive' : 'bg-primary'}`}
                      style={{ width: `${avancePresupuesto}%` }}
                    ></div>
                  </div>
                  
                  <div className="text-right text-sm">
                    {avancePresupuesto > 100 ? (
                      <span className="text-destructive">Presupuesto excedido</span>
                    ) : (
                      <span>{Math.round(avancePresupuesto)}% utilizado</span>
                    )}
                  </div>
                </CardContent>
              </Card>
              
              {proyecto.estado !== 'FINALIZADO' && proyecto.estado !== 'CANCELADO' && diasRestantes !== null && (
                <Card>
                  <CardHeader>
                    <CardTitle>Tiempo restante</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-center p-4">
                      <Clock className="h-5 w-5 mr-2 text-muted-foreground" />
                      <span className="text-xl font-bold">
                        {diasRestantes <= 0 ? (
                          <span className="text-destructive">Vencido hace {Math.abs(diasRestantes)} días</span>
                        ) : (
                          <span>{diasRestantes} días restantes</span>
                        )}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </TabsContent>
        
        {/* Contenido de la tab Tareas */}
        <TabsContent value="tareas">
          <TareasProyecto proyecto={proyecto} />
        </TabsContent>
        
        {/* Contenido de la tab Equipo */}
        <TabsContent value="equipo">
          <ResponsablesProyecto proyecto={proyecto} />
        </TabsContent>
        
        {/* Contenido de la tab Presupuesto */}
        <TabsContent value="presupuesto">
          <div className="grid grid-cols-1 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Distribución del presupuesto</CardTitle>
                <CardDescription>
                  Visión general del presupuesto del proyecto y su distribución por categorías
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80 flex items-center justify-center border rounded-md bg-muted/20">
                  <p className="text-muted-foreground">
                    Próximamente: Gráfico de distribución de presupuesto
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}