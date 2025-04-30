import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useDetalleNomina } from '../../application/useDetalleNomina';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2, FileDown, FileCheck, Users, CreditCard, Calendar } from 'lucide-react';

interface DetalleNominaModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  nominaId: number | null;
}

export function DetalleNominaModal({ open, onOpenChange, nominaId }: DetalleNominaModalProps) {
  const { data, isLoading, isError, error } = useDetalleNomina(nominaId);

  // Función para formatear fecha
  const formatFecha = (fechaStr: string) => {
    try {
      return format(new Date(fechaStr), 'dd/MM/yyyy', { locale: es });
    } catch (error) {
      return 'Fecha inválida';
    }
  };

  // Función para formatear montos
  const formatMonto = (monto: string | number) => {
    const valor = typeof monto === 'string' ? parseFloat(monto) : monto;
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 2,
    }).format(valor);
  };

  // Renderizar estado con un badge de color apropiado
  const renderEstado = (estado: string) => {
    switch (estado.toUpperCase()) {
      case 'PENDIENTE':
        return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 hover:bg-yellow-100">Pendiente</Badge>;
      case 'APROBADO':
        return <Badge variant="outline" className="bg-blue-50 text-blue-700 hover:bg-blue-100">Aprobado</Badge>;
      case 'PAGADO':
        return <Badge variant="outline" className="bg-green-50 text-green-700 hover:bg-green-100">Pagado</Badge>;
      case 'RECHAZADO':
        return <Badge variant="outline" className="bg-red-50 text-red-700 hover:bg-red-100">Rechazado</Badge>;
      case 'CANCELADO':
        return <Badge variant="outline" className="bg-gray-50 text-gray-700 hover:bg-gray-100">Cancelado</Badge>;
      default:
        return <Badge variant="outline">{estado}</Badge>;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Detalle de Nómina</DialogTitle>
          <DialogDescription>
            Información detallada de la nómina y sus empleados asociados
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <span className="ml-2">Cargando detalles...</span>
          </div>
        ) : isError ? (
          <div className="py-8 text-center text-red-500">
            <p>Error al cargar los detalles: {error?.message || 'Error desconocido'}</p>
            <Button variant="outline" className="mt-4" onClick={() => onOpenChange(false)}>
              Cerrar
            </Button>
          </div>
        ) : data ? (
          <>
            {/* Información de la cabecera */}
            <div className="grid grid-cols-2 gap-4 mb-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Información General</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Título:</span>
                      <span className="font-medium">{data.cabecera.titulo}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Estado:</span>
                      <span>{renderEstado(data.cabecera.estado)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Método de Pago:</span>
                      <span>{data.cabecera.metodoPago}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Total Empleados:</span>
                      <span>{data.resumen.totalEmpleados}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Monto Total:</span>
                      <span className="font-medium">{formatMonto(data.resumen.montoTotal)}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Fechas</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Período:</span>
                      <span className="flex items-center">
                        <Calendar className="h-4 w-4 mr-1" />
                        {formatFecha(data.cabecera.periodoInicio)} - {formatFecha(data.cabecera.periodoFin)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Fecha de Pago:</span>
                      <span className="flex items-center">
                        <CreditCard className="h-4 w-4 mr-1" />
                        {formatFecha(data.cabecera.fechaPago)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Creada:</span>
                      <span>{formatFecha(data.cabecera.fechaCreacion)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Actualizada:</span>
                      <span>{formatFecha(data.cabecera.fechaActualizacion)}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Detalles por empleado */}
            <div className="mt-6">
              <h3 className="text-lg font-medium mb-2 flex items-center">
                <Users className="h-5 w-5 mr-2" />
                Detalle por Empleado
              </h3>
              <Separator className="mb-4" />

              <Tabs defaultValue="tabla" className="w-full">
                <TabsList className="mb-4">
                  <TabsTrigger value="tabla">Vista de Tabla</TabsTrigger>
                  <TabsTrigger value="tarjetas">Vista de Tarjetas</TabsTrigger>
                </TabsList>

                <TabsContent value="tabla">
                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Empleado</TableHead>
                          <TableHead>Departamento</TableHead>
                          <TableHead>Salario Base</TableHead>
                          <TableHead>Ingresos</TableHead>
                          <TableHead>Deducciones</TableHead>
                          <TableHead>Salario Neto</TableHead>
                          <TableHead>Estado</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {data.detalles.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                              No hay detalles de empleados disponibles
                            </TableCell>
                          </TableRow>
                        ) : (
                          data.detalles.map((detalle) => (
                            <TableRow key={detalle.id}>
                              <TableCell className="font-medium">
                                {detalle.empleado?.nombre || `Empleado #${detalle.empleadoId}`}
                              </TableCell>
                              <TableCell>{detalle.empleado?.departamento || 'No especificado'}</TableCell>
                              <TableCell>{formatMonto(detalle.salarioBase)}</TableCell>
                              <TableCell>{formatMonto(detalle.totalIngresos)}</TableCell>
                              <TableCell>{formatMonto(detalle.totalDeducciones)}</TableCell>
                              <TableCell className="font-medium">{formatMonto(detalle.salarioNeto)}</TableCell>
                              <TableCell>{renderEstado(detalle.estado)}</TableCell>
                            </TableRow>
                          ))
                        )}
                      </TableBody>
                    </Table>
                  </div>
                </TabsContent>

                <TabsContent value="tarjetas">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {data.detalles.length === 0 ? (
                      <div className="col-span-2 text-center py-8 text-muted-foreground">
                        No hay detalles de empleados disponibles
                      </div>
                    ) : (
                      data.detalles.map((detalle) => (
                        <Card key={detalle.id}>
                          <CardHeader className="pb-2">
                            <CardTitle className="text-lg">
                              {detalle.empleado?.nombre || `Empleado #${detalle.empleadoId}`}
                            </CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="space-y-2">
                              <div className="flex justify-between">
                                <span className="text-sm text-muted-foreground">Puesto:</span>
                                <span>{detalle.empleado?.puesto || 'No especificado'}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-sm text-muted-foreground">Departamento:</span>
                                <span>{detalle.empleado?.departamento || 'No especificado'}</span>
                              </div>
                              <Separator className="my-2" />
                              <div className="flex justify-between">
                                <span className="text-sm text-muted-foreground">Salario Base:</span>
                                <span>{formatMonto(detalle.salarioBase)}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-sm text-muted-foreground">Total Ingresos:</span>
                                <span className="text-green-600">{formatMonto(detalle.totalIngresos)}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-sm text-muted-foreground">Total Deducciones:</span>
                                <span className="text-red-600">{formatMonto(detalle.totalDeducciones)}</span>
                              </div>
                              <div className="flex justify-between font-medium">
                                <span>Salario Neto:</span>
                                <span>{formatMonto(detalle.salarioNeto)}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-sm text-muted-foreground">Estado:</span>
                                <span>{renderEstado(detalle.estado)}</span>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))
                    )}
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          </>
        ) : null}

        <DialogFooter className="flex justify-between">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cerrar
          </Button>
          {data && (
            <div className="flex space-x-2">
              <Button variant="outline" className="flex items-center">
                <FileDown className="mr-2 h-4 w-4" />
                Exportar
              </Button>
              <Button variant="default" className="flex items-center">
                <FileCheck className="mr-2 h-4 w-4" />
                Descargar Desprendibles
              </Button>
            </div>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}