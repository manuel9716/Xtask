import { useState } from "react";
import { useProyectos } from "../../application/useCases/listarProyectos";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { proyectosApi } from "../../infrastructure/api/proyectosApi";
import { EstadoProyecto } from "../../domain/entities/Proyecto";
import { Loader2, RefreshCw, CheckCircle2, Clock, PauseCircle } from "lucide-react";
import { EstadoProyectoBadge } from "../components/EstadoProyectoBadge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { formatCurrency } from '@/lib/utils';

export function GestionEstadosProyectos() {
  const [actualizando, setActualizando] = useState<number | null>(null);
  const { toast } = useToast();
  
  // Obtener listado de proyectos
  const { data: proyectos = [], isLoading, refetch } = useProyectos({});
  
  // Cambiar estado de un proyecto
  const cambiarEstado = async (proyectoId: number, estado: string, mensaje: string) => {
    if (actualizando) return;
    
    setActualizando(proyectoId);
    
    try {
      await proyectosApi.cambiarEstado(proyectoId, estado);
      toast({
        title: "Estado actualizado",
        description: mensaje,
      });
      refetch();
    } catch (error) {
      console.error("Error al cambiar estado:", error);
      toast({
        title: "Error",
        description: "No se pudo cambiar el estado del proyecto",
        variant: "destructive",
      });
    } finally {
      setActualizando(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Gestión de Estados</h1>
          <p className="text-muted-foreground">
            Administra los estados de tus proyectos de forma centralizada
          </p>
        </div>
        <Button onClick={() => refetch()}>
          <RefreshCw className="mr-2 h-4 w-4" />
          Actualizar
        </Button>
      </div>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle>Proyectos Activos</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nombre</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Inicio</TableHead>
                  <TableHead>Fin Previsto</TableHead>
                  <TableHead>Presupuesto</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {proyectos.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8">
                      No hay proyectos disponibles
                    </TableCell>
                  </TableRow>
                ) : (
                  proyectos.map((proyecto) => (
                    <TableRow key={proyecto.id}>
                      <TableCell className="font-medium">{proyecto.nombre}</TableCell>
                      <TableCell>
                        <EstadoProyectoBadge estado={proyecto.estado} />
                      </TableCell>
                      <TableCell>
                        {format(new Date(proyecto.fechaInicio), 'dd MMM yyyy', { locale: es })}
                      </TableCell>
                      <TableCell>
                        {proyecto.fechaFin 
                          ? format(new Date(proyecto.fechaFin), 'dd MMM yyyy', { locale: es })
                          : 'No definida'}
                      </TableCell>
                      <TableCell>{formatCurrency(proyecto.presupuesto)}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end space-x-2">
                          {/* Botones de acción rápida según estado actual */}
                          {proyecto.estado !== EstadoProyecto.ACTIVO && (
                            <Button 
                              variant="outline" 
                              size="sm"
                              className="text-primary"
                              onClick={() => cambiarEstado(
                                proyecto.id, 
                                "ACTIVO", 
                                "El proyecto ha sido activado"
                              )}
                              disabled={actualizando === proyecto.id}
                            >
                              {actualizando === proyecto.id ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <RefreshCw className="h-4 w-4" />
                              )}
                            </Button>
                          )}
                          
                          {proyecto.estado !== EstadoProyecto.FINALIZADO && (
                            <Button 
                              variant="outline" 
                              size="sm"
                              className="text-green-600"
                              onClick={() => cambiarEstado(
                                proyecto.id, 
                                "FINALIZADO", 
                                "El proyecto ha sido finalizado"
                              )}
                              disabled={actualizando === proyecto.id}
                            >
                              {actualizando === proyecto.id ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <CheckCircle2 className="h-4 w-4" />
                              )}
                            </Button>
                          )}
                          
                          {proyecto.estado !== EstadoProyecto.RETRASADO && (
                            <Button 
                              variant="outline" 
                              size="sm"
                              className="text-amber-600"
                              onClick={() => cambiarEstado(
                                proyecto.id, 
                                "RETRASADO", 
                                "El proyecto ha sido marcado como retrasado"
                              )}
                              disabled={actualizando === proyecto.id}
                            >
                              {actualizando === proyecto.id ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <Clock className="h-4 w-4" />
                              )}
                            </Button>
                          )}
                          
                          {proyecto.estado !== EstadoProyecto.PAUSADO && (
                            <Button 
                              variant="outline" 
                              size="sm"
                              className="text-blue-600"
                              onClick={() => cambiarEstado(
                                proyecto.id, 
                                "PAUSADO", 
                                "El proyecto ha sido pausado"
                              )}
                              disabled={actualizando === proyecto.id}
                            >
                              {actualizando === proyecto.id ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <PauseCircle className="h-4 w-4" />
                              )}
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}