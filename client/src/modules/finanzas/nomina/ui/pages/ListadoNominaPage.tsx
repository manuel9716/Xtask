import React, { useState } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { Separator } from "@/components/ui/separator";
import { useListarNominas } from '../../application/useListarNominas';
import { useGestionarNomina } from '../../application/useGestionarNomina';
import { useDetalleNomina } from '../../application/useDetalleNomina';
import { NominasTable } from '../components/NominasTable';
import { NominasPagination } from '../components/NominasPagination';
import { FiltrosNomina } from '../components/FiltrosNomina';
import { MarcarPagadaForm } from '../forms/MarcarPagadaForm';
import { ProcesarNominaForm } from '../forms/ProcesarNominaForm';
import { useProcesarNomina } from '../../application/useProcesarNomina';
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
  Dialog, 
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { FileText, FilePlus, PlusCircle } from 'lucide-react';
import { EstadoNomina } from '../../domain/entities/Nomina';

export function ListadoNominaPage() {
  const { toast } = useToast();
  
  // Estados para formularios y diálogos
  const [selectedNominaId, setSelectedNominaId] = useState<number | null>(null);
  const [showProcesarForm, setShowProcesarForm] = useState(false);
  const [showMarcarPagadaForm, setShowMarcarPagadaForm] = useState(false);
  const [showCambiarEstadoDialog, setShowCambiarEstadoDialog] = useState(false);
  const [nuevoEstado, setNuevoEstado] = useState<string>('');
  
  // Hooks de aplicación
  const { 
    nominas, 
    isLoading, 
    isError, 
    filtros, 
    cambiarFiltros, 
    pagination, 
    irAPagina, 
    refetch 
  } = useListarNominas();
  
  const { marcarComoPagada, cambiarEstado } = useGestionarNomina();
  const { procesarNomina, isPending: procesandoNomina } = useProcesarNomina();
  
  // Descargar desprendible
  const handleDescargarDesprendible = async (nominaId: number) => {
    try {
      const response = await fetch(`/api/nomina/${nominaId}/desprendible`);
      
      if (!response.ok) {
        throw new Error('Error al descargar el desprendible');
      }
      
      // Crear un blob y descargarlo
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = `desprendible_${nominaId}.pdf`;
      document.body.appendChild(a);
      a.click();
      
      // Limpiar
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      toast({
        title: "Descarga iniciada",
        description: "El desprendible se está descargando",
      });
    } catch (error) {
      console.error("Error al descargar:", error);
      toast({
        title: "Error al descargar",
        description: "No se pudo descargar el desprendible de nómina",
        variant: "destructive",
      });
    }
  };
  
  // Abrir formulario de marcar como pagada
  const handleOpenMarcarPagada = (nominaId: number) => {
    setSelectedNominaId(nominaId);
    setShowMarcarPagadaForm(true);
  };
  
  // Abrir diálogo de cambio de estado
  const handleOpenCambiarEstado = (nominaId: number, estado: string) => {
    setSelectedNominaId(nominaId);
    setNuevoEstado(estado);
    setShowCambiarEstadoDialog(true);
  };
  
  // Ejecutar cambio de estado
  const handleCambiarEstado = () => {
    if (selectedNominaId && nuevoEstado) {
      cambiarEstado.mutate(
        {
          nominaId: selectedNominaId,
          nuevoEstado,
          usuarioId: 1,
          motivo: "Cambio de estado manual"
        },
        {
          onSuccess: () => {
            setShowCambiarEstadoDialog(false);
            refetch();
          }
        }
      );
    }
  };
  
  // Mostrar mensaje si hay error al cargar
  if (isError) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Error</CardTitle>
          <CardDescription>
            Ocurrió un error al cargar las nóminas
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-destructive">
            No se pudieron cargar los datos. Intente nuevamente más tarde.
          </p>
          <Button onClick={() => refetch()} className="mt-4">
            Reintentar
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Gestión de Nómina</h2>
          <p className="text-muted-foreground">
            Administre las nóminas de los empleados de la empresa
          </p>
        </div>
        <Button onClick={() => setShowProcesarForm(true)}>
          <PlusCircle className="mr-2 h-4 w-4" />
          Procesar Nómina
        </Button>
      </div>
      
      <Separator />
      
      <Tabs defaultValue="listado" className="w-full">
        <TabsList className="grid w-full md:w-auto grid-cols-2 md:grid-cols-3">
          <TabsTrigger value="listado">Listado de Nóminas</TabsTrigger>
          <TabsTrigger value="historial">Historial de Pagos</TabsTrigger>
          <TabsTrigger value="reportes">Reportes</TabsTrigger>
        </TabsList>
        
        <TabsContent value="listado" className="space-y-4 mt-6">
          {/* Filtros */}
          <FiltrosNomina 
            onFiltrar={cambiarFiltros}
            filtrosActuales={filtros}
          />
          
          {/* Tabla de nóminas */}
          <NominasTable 
            nominas={nominas}
            isLoading={isLoading}
            onMarcarPagada={handleOpenMarcarPagada}
            onAprobar={(nominaId) => handleOpenCambiarEstado(nominaId, EstadoNomina.APROBADO)}
            onRechazar={(nominaId) => handleOpenCambiarEstado(nominaId, EstadoNomina.RECHAZADO)}
            onDescargarDesprendible={handleDescargarDesprendible}
          />
          
          {/* Paginación */}
          <div className="flex justify-end mt-4">
            <NominasPagination 
              currentPage={pagination.page}
              totalPages={pagination.totalPages}
              onPageChange={irAPagina}
            />
          </div>
        </TabsContent>
        
        <TabsContent value="historial" className="space-y-4 mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Historial de pagos</CardTitle>
              <CardDescription>
                Consulte el historial completo de pagos de nómina por empleado
              </CardDescription>
            </CardHeader>
            <CardContent className="flex items-center justify-center py-8">
              <div className="text-center">
                <FileText className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium">Funcionalidad en desarrollo</h3>
                <p className="text-sm text-muted-foreground mt-2">
                  Esta funcionalidad estará disponible próximamente.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="reportes" className="space-y-4 mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Reportes de nómina</CardTitle>
              <CardDescription>
                Genere reportes y estadísticas sobre los pagos de nómina
              </CardDescription>
            </CardHeader>
            <CardContent className="flex items-center justify-center py-8">
              <div className="text-center">
                <FilePlus className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium">Funcionalidad en desarrollo</h3>
                <p className="text-sm text-muted-foreground mt-2">
                  Esta funcionalidad estará disponible próximamente.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      
      {/* Formulario de procesar nómina */}
      <Dialog
        open={showProcesarForm}
        onOpenChange={setShowProcesarForm}
      >
        <DialogContent className="sm:max-w-[800px]">
          <DialogHeader>
            <DialogTitle>Procesar Nómina</DialogTitle>
            <DialogDescription>
              Complete el formulario para procesar la nómina del periodo
            </DialogDescription>
          </DialogHeader>
          
          <ProcesarNominaForm 
            onSubmit={(datos) => {
              procesarNomina(datos, {
                onSuccess: () => {
                  setShowProcesarForm(false);
                  refetch();
                }
              });
            }}
            isPending={procesandoNomina}
          />
        </DialogContent>
      </Dialog>
      
      {/* Formulario marcar como pagada */}
      {selectedNominaId && (
        <MarcarPagadaForm 
          nominaId={selectedNominaId}
          isOpen={showMarcarPagadaForm}
          onClose={() => setShowMarcarPagadaForm(false)}
          onSubmit={(datos) => {
            marcarComoPagada.mutate(datos, {
              onSuccess: () => {
                setShowMarcarPagadaForm(false);
                refetch();
              }
            });
          }}
          isPending={marcarComoPagada.isPending}
        />
      )}
      
      {/* Diálogo de confirmación para cambiar estado */}
      <AlertDialog 
        open={showCambiarEstadoDialog} 
        onOpenChange={setShowCambiarEstadoDialog}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar cambio de estado</AlertDialogTitle>
            <AlertDialogDescription>
              {nuevoEstado === EstadoNomina.APROBADO ? (
                "¿Está seguro de que desea aprobar esta nómina? Una vez aprobada, podrá proceder con el pago."
              ) : nuevoEstado === EstadoNomina.RECHAZADO ? (
                "¿Está seguro de que desea rechazar esta nómina? Esto indicará que hay un problema con la nómina."
              ) : (
                `¿Está seguro de que desea cambiar el estado de esta nómina a ${nuevoEstado}?`
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleCambiarEstado}
              disabled={cambiarEstado.isPending}
            >
              {cambiarEstado.isPending ? (
                <>
                  <div className="animate-spin w-4 h-4 mr-2 border-2 border-white border-t-transparent rounded-full"></div>
                  Procesando...
                </>
              ) : (
                "Confirmar"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}