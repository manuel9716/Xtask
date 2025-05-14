import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from '@/components/ui/button';
import { Loader2, Calendar, DollarSign, Clock, CheckCircleIcon, Users } from 'lucide-react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { EstadoProyectoBadge } from './EstadoProyectoBadge';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { apiRequest } from '@/lib/queryClient';
import TareasProyecto from './TareasProyecto';
import ResponsablesProyecto from './ResponsablesProyecto';

// Funciones de formateo
const formatCurrency = (amount: number | string | null | undefined): string => {
  if (amount === null || amount === undefined) return '$0.00';
  const numericAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
  return new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'MXN',
  }).format(numericAmount);
};

const formatDate = (date: string | Date | null | undefined): string => {
  if (!date) return 'N/A';
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return new Intl.DateTimeFormat('es-ES', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  }).format(dateObj);
};

interface ModalDetalleProyectoProps {
  proyectoId: number;
  trigger: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function ModalDetalleProyecto({ 
  proyectoId, 
  trigger, 
  open, 
  onOpenChange
}: ModalDetalleProyectoProps) {
  const [activeTab, setActiveTab] = useState("general");
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Consulta del proyecto
  const { 
    data: proyecto, 
    isLoading, 
    isError 
  } = useQuery({
    queryKey: ['/api/proyectos', proyectoId],
    queryFn: async () => {
      const res = await apiRequest('GET', `/api/proyectos/${proyectoId}`);
      return res.json();
    },
    enabled: proyectoId > 0 && open === true
  });
  
  // Manejo de errores
  useEffect(() => {
    if (isError && open) {
      toast({
        title: "Error al cargar el proyecto",
        description: "No se pudo cargar la información del proyecto. Inténtalo de nuevo.",
        variant: "destructive",
      });
      if (onOpenChange) onOpenChange(false);
    }
  }, [isError, toast, onOpenChange, open]);
  
  // Contenido del diálogo
  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
        </div>
      );
    }
    
    if (!proyecto) {
      return (
        <div className="text-center py-8">
          <p className="text-muted-foreground">No se pudo cargar la información del proyecto.</p>
        </div>
      );
    }
    
    // Cálculos y datos adicionales
    const avancePresupuesto = Math.min(100, ((proyecto.costoActual || 0) / (proyecto.presupuesto || 1)) * 100);
    const diasRestantes = proyecto.fechaFin 
      ? Math.ceil((new Date(proyecto.fechaFin).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
      : null;
    
    return (
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-3">
          <TabsTrigger value="general">Información General</TabsTrigger>
          <TabsTrigger value="tareas">Tareas</TabsTrigger>
          <TabsTrigger value="equipo">Equipo</TabsTrigger>
        </TabsList>
        
        {/* Pestaña de información general */}
        <TabsContent value="general" className="space-y-4 py-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Detalles generales */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg font-semibold">Detalles del proyecto</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">Estado</p>
                  <EstadoProyectoBadge estado={proyecto.estado} />
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">Descripción</p>
                  <p className="text-sm">{proyecto.descripcion || 'Sin descripción'}</p>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-1">Inicio</p>
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <p className="text-sm">{formatDate(proyecto.fechaInicio)}</p>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-1">Fin</p>
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <p className="text-sm">{proyecto.fechaFin ? formatDate(proyecto.fechaFin) : 'No definido'}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            {/* Avance financiero */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg font-semibold">Avance financiero</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">Presupuesto</p>
                  <div className="flex items-center gap-1">
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                    <p className="text-sm font-semibold">{formatCurrency(proyecto.presupuesto || 0)}</p>
                  </div>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">Costo actual</p>
                  <div className="flex items-center gap-1">
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                    <p className="text-sm font-semibold">{formatCurrency(proyecto.costoActual || 0)}</p>
                  </div>
                </div>
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-sm font-medium text-muted-foreground">Avance presupuestario</p>
                    <p className="text-sm font-medium">{avancePresupuesto.toFixed(0)}%</p>
                  </div>
                  <Progress value={avancePresupuesto} className="h-2" />
                </div>
              </CardContent>
            </Card>
          </div>
          
          {/* Información adicional */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-semibold">Información adicional</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">Cliente</p>
                <p className="text-sm">{proyecto.cliente || 'No especificado'}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">Categoría</p>
                <p className="text-sm">{proyecto.categoria || 'No especificada'}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">Prioridad</p>
                <p className="text-sm">{proyecto.prioridad || 'Normal'}</p>
              </div>
              {diasRestantes !== null && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">Días restantes</p>
                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <p className="text-sm">{diasRestantes} días</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Pestaña de tareas */}
        <TabsContent value="tareas">
          <TareasProyecto proyectoId={proyectoId} />
        </TabsContent>
        
        {/* Pestaña de equipo */}
        <TabsContent value="equipo">
          <ResponsablesProyecto proyectoId={proyectoId} />
        </TabsContent>
      </Tabs>
    );
  };
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        {trigger}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl">
            {proyecto?.nombre || 'Detalle del proyecto'}
          </DialogTitle>
          <DialogDescription>
            Información detallada del proyecto, tareas y equipo asignado.
          </DialogDescription>
        </DialogHeader>
        
        {renderContent()}
      </DialogContent>
    </Dialog>
  );
}