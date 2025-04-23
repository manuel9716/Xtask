import React, { useState } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useDetalleNomina } from '../../application/useDetalleNomina';
import { useGestionarNomina } from '../../application/useGestionarNomina';
import { MarcarPagadaForm } from '../forms/MarcarPagadaForm';
import { EstadoNomina } from '../../domain/entities/Nomina';
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
  ArrowLeft, 
  FileDown, 
  CreditCard, 
  CheckCircle, 
  XCircle,
  CalendarRange,
  DollarSign,
  Briefcase,
  User,
  Clock,
  AlertCircle
} from 'lucide-react';
import { useLocation } from 'wouter';

interface DetalleNominaPageProps {
  nominaId: string;
}

export function DetalleNominaPage({ nominaId }: DetalleNominaPageProps) {
  const [_, navigate] = useLocation();
  const { toast } = useToast();
  
  // Estados para diálogos
  const [showMarcarPagadaForm, setShowMarcarPagadaForm] = useState(false);
  const [showCambiarEstadoDialog, setShowCambiarEstadoDialog] = useState(false);
  const [nuevoEstado, setNuevoEstado] = useState<string>('');
  
  // Hooks de aplicación
  const { 
    nomina, 
    empleado, 
    nombreEmpleado, 
    detallesFormateados, 
    isLoading, 
    isError, 
    descargarDesprendible,
    refetch 
  } = useDetalleNomina(parseInt(nominaId, 10));
  
  const { marcarComoPagada, cambiarEstado } = useGestionarNomina();
  
  // Abrir diálogo de marcar como pagada
  const handleOpenMarcarPagada = () => {
    setShowMarcarPagadaForm(true);
  };
  
  // Abrir diálogo de cambio de estado
  const handleOpenCambiarEstado = (estado: string) => {
    setNuevoEstado(estado);
    setShowCambiarEstadoDialog(true);
  };
  
  // Ejecutar cambio de estado
  const handleCambiarEstado = () => {
    if (nomina && nuevoEstado) {
      cambiarEstado.mutate(
        {
          nominaId: nomina.id,
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
  
  // Manejar descarga de desprendible
  const handleDescargarDesprendible = async () => {
    try {
      await descargarDesprendible();
      toast({
        title: "Descarga iniciada",
        description: "El desprendible se está descargando",
      });
    } catch (error) {
      toast({
        title: "Error al descargar",
        description: "No se pudo descargar el desprendible de nómina",
        variant: "destructive",
      });
    }
  };
  
  // Renderizar estado con un badge de color apropiado
  const renderEstado = (estado?: string) => {
    if (!estado) return null;
    
    switch (estado) {
      case EstadoNomina.PENDIENTE:
        return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 hover:bg-yellow-100">Pendiente</Badge>;
      case EstadoNomina.APROBADO:
        return <Badge variant="outline" className="bg-blue-50 text-blue-700 hover:bg-blue-100">Aprobado</Badge>;
      case EstadoNomina.PAGADO:
        return <Badge variant="outline" className="bg-green-50 text-green-700 hover:bg-green-100">Pagado</Badge>;
      case EstadoNomina.RECHAZADO:
        return <Badge variant="outline" className="bg-red-50 text-red-700 hover:bg-red-100">Rechazado</Badge>;
      case EstadoNomina.CANCELADO:
        return <Badge variant="outline" className="bg-gray-50 text-gray-700 hover:bg-gray-100">Cancelado</Badge>;
      default:
        return <Badge variant="outline">{estado}</Badge>;
    }
  };
  
  // Comprobar si se pueden realizar acciones según el estado
  const puedeAprobar = nomina?.status === EstadoNomina.PENDIENTE;
  const puedeRechazar = nomina?.status === EstadoNomina.PENDIENTE;
  const puedePagar = nomina?.status === EstadoNomina.APROBADO;
  
  // Mostrar loader mientras carga
  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }
  
  // Mostrar mensaje de error
  if (isError || !nomina) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Error</CardTitle>
          <CardDescription>
            No se pudo cargar la información de la nómina
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center text-destructive mb-4">
            <AlertCircle className="h-5 w-5 mr-2" />
            <p>Ocurrió un error al obtener los detalles de la nómina solicitada.</p>
          </div>
          <Button onClick={() => navigate('/finanzas/nomina')}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Volver al listado
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
        <div className="flex items-center">
          <Button 
            variant="outline" 
            size="icon" 
            className="mr-4"
            onClick={() => navigate('/finanzas/nomina')}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Detalle de Nómina #{nomina.id}</h2>
            <p className="text-muted-foreground">
              {nombreEmpleado} - {detallesFormateados?.periodo.inicio} al {detallesFormateados?.periodo.fin}
            </p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          {puedeAprobar && (
            <Button 
              variant="outline" 
              onClick={() => handleOpenCambiarEstado(EstadoNomina.APROBADO)}
            >
              <CheckCircle className="mr-2 h-4 w-4" />
              Aprobar
            </Button>
          )}
          {puedeRechazar && (
            <Button 
              variant="outline" 
              className="text-destructive hover:text-destructive"
              onClick={() => handleOpenCambiarEstado(EstadoNomina.RECHAZADO)}
            >
              <XCircle className="mr-2 h-4 w-4" />
              Rechazar
            </Button>
          )}
          {puedePagar && (
            <Button 
              onClick={handleOpenMarcarPagada}
            >
              <CreditCard className="mr-2 h-4 w-4" />
              Marcar como Pagada
            </Button>
          )}
          <Button 
            variant="secondary"
            onClick={handleDescargarDesprendible}
          >
            <FileDown className="mr-2 h-4 w-4" />
            Descargar Desprendible
          </Button>
        </div>
      </div>
      
      <Separator />
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Información general */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <User className="mr-2 h-5 w-5" />
              Información General
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Empleado</p>
              <p className="text-base">{nombreEmpleado}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Posición</p>
              <p className="text-base">{empleado?.position || 'N/A'}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Departamento</p>
              <p className="text-base">{empleado?.department || 'N/A'}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Estado</p>
              <div className="mt-1">{renderEstado(nomina.status)}</div>
            </div>
          </CardContent>
        </Card>
        
        {/* Detalles del período */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <CalendarRange className="mr-2 h-5 w-5" />
              Detalles del Período
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Período</p>
              <p className="text-base">
                {detallesFormateados?.periodo.inicio} al {detallesFormateados?.periodo.fin}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Fecha de creación</p>
              <p className="text-base">{detallesFormateados?.fechaCreacion}</p>
            </div>
            {detallesFormateados?.pago && (
              <>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Fecha de pago</p>
                  <p className="text-base">{detallesFormateados.pago.fecha}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Método de pago</p>
                  <p className="text-base">{detallesFormateados.pago.metodo}</p>
                </div>
                {detallesFormateados.pago.referencia && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Referencia</p>
                    <p className="text-base">{detallesFormateados.pago.referencia}</p>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>
        
        {/* Detalles financieros */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <DollarSign className="mr-2 h-5 w-5" />
              Detalles Financieros
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Sueldo bruto</p>
              <p className="text-base font-semibold">
                {detallesFormateados?.montos.sueldoBruto.toLocaleString('es-ES', { 
                  style: 'currency', 
                  currency: 'USD' 
                })}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Deducciones</p>
              <p className="text-base text-destructive">
                {detallesFormateados?.montos.deducciones.toLocaleString('es-ES', { 
                  style: 'currency', 
                  currency: 'USD' 
                })}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Impuestos</p>
              <p className="text-base text-destructive">
                {detallesFormateados?.montos.impuestos.toLocaleString('es-ES', { 
                  style: 'currency', 
                  currency: 'USD' 
                })}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Beneficios</p>
              <p className="text-base text-green-600">
                {detallesFormateados?.montos.beneficios.toLocaleString('es-ES', { 
                  style: 'currency', 
                  currency: 'USD' 
                })}
              </p>
            </div>
            <Separator />
            <div>
              <p className="text-sm font-medium text-muted-foreground">Sueldo neto</p>
              <p className="text-lg font-bold">
                {detallesFormateados?.montos.sueldoNeto.toLocaleString('es-ES', { 
                  style: 'currency', 
                  currency: 'USD' 
                })}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Formulario marcar como pagada */}
      <MarcarPagadaForm 
        nominaId={nomina.id}
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