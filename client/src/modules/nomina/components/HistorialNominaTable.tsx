import React, { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Eye, Calendar, Trash2, Download, DollarSign, CreditCard, Calendar as CalendarIcon, Edit, MoreHorizontal } from 'lucide-react';
import { EstadoNomina } from '../domain/entities/Nomina';

interface HistorialNominaItem {
  id: number;
  fecha: string;
  periodo_inicio: string;
  periodo_fin: string;
  estado: string;
  valor_bruto: number;
  valor_neto: number;
  bonificaciones: number;
  deducciones: number;
  impuestos: number;
  proyecto_nombre: string;
  fecha_pago?: string;
  metodo_pago: string;
}

interface HistorialNominaTableProps {
  historial: HistorialNominaItem[];
  isLoading: boolean;
  onChangeEstado: (nominaId: number, nuevoEstado: string) => void;
  onEliminar?: (nominaId: number) => void;
  onExportar?: (nominaId: number) => void;
  onEditar?: (nominaId: number) => void;
}

export function HistorialNominaTable({
  historial,
  isLoading,
  onChangeEstado,
  onEliminar,
  onExportar,
  onEditar
}: HistorialNominaTableProps) {
  const [selectedNomina, setSelectedNomina] = useState<HistorialNominaItem | null>(null);
  
  const renderEstado = (item: HistorialNominaItem) => {
    return (
      <Select
        value={item.estado}
        onValueChange={(nuevoEstado) => onChangeEstado(item.id, nuevoEstado)}
      >
        <SelectTrigger className="w-32">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="pendiente">Pendiente</SelectItem>
          <SelectItem value="pagado">Pagado</SelectItem>
          <SelectItem value="aprobado">Aprobado</SelectItem>
          <SelectItem value="rechazado">Rechazado</SelectItem>
        </SelectContent>
      </Select>
    );
  };

  const formatFecha = (fechaStr: string) => {
    const fecha = new Date(fechaStr);
    return fecha.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
  };

  const formatMonto = (monto: number | string) => {
    const valor = typeof monto === 'string' ? parseFloat(monto) : monto;
    return valor.toLocaleString('es-ES', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    });
  };

  const formatPeriodo = (inicio: string, fin: string) => {
    return `${formatFecha(inicio)} - ${formatFecha(fin)}`;
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Historial de Nóminas
          </CardTitle>
          <CardDescription>
            Registro histórico de pagos de nómina del empleado
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center items-center min-h-[200px]">
            <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          Historial de Nóminas
        </CardTitle>
        <CardDescription>
          Registro histórico de pagos de nómina del empleado ({historial.length} registros)
        </CardDescription>
      </CardHeader>
      <CardContent>
        {historial.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No hay registros de nómina para este empleado</p>
          </div>
        ) : (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Período</TableHead>
                  <TableHead>Proyecto</TableHead>
                  <TableHead>Valor Neto</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Fecha Pago</TableHead>
                  <TableHead className="text-center">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {historial.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>
                      <div className="font-medium">
                        {formatPeriodo(item.periodo_inicio, item.periodo_fin)}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm text-muted-foreground">
                        {item.proyecto_nombre || 'Sin proyecto'}
                      </div>
                    </TableCell>
                    <TableCell className="font-bold text-green-600">
                      {formatMonto(item.valor_neto)}
                    </TableCell>
                    <TableCell>
                      {renderEstado(item)}
                    </TableCell>
                    <TableCell>
                      {item.fecha_pago ? formatFecha(item.fecha_pago) : '-'}
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="flex items-center justify-center gap-1">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button 
                              variant="ghost" 
                              size="sm"
                              className="h-8 w-8 p-0"
                              onClick={() => setSelectedNomina(item)}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                          </DialogTrigger>
                        <DialogContent className="max-w-md">
                          <DialogHeader>
                            <DialogTitle className="flex items-center gap-2">
                              <DollarSign className="h-5 w-5" />
                              Detalle de Nómina
                            </DialogTitle>
                            <DialogDescription>
                              Información completa del pago de nómina
                            </DialogDescription>
                          </DialogHeader>
                          
                          {selectedNomina && (
                            <div className="space-y-4">
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <label className="text-sm font-medium text-muted-foreground">Período</label>
                                  <p className="text-sm">{formatPeriodo(selectedNomina.periodo_inicio, selectedNomina.periodo_fin)}</p>
                                </div>
                                <div>
                                  <label className="text-sm font-medium text-muted-foreground">Proyecto</label>
                                  <p className="text-sm">{selectedNomina.proyecto_nombre || 'Sin proyecto'}</p>
                                </div>
                              </div>
                              
                              <Separator />
                              
                              <div className="space-y-3">
                                <div className="flex justify-between items-center">
                                  <span className="text-sm font-medium">Sueldo Base:</span>
                                  <span className="text-sm">{formatMonto(selectedNomina.valor_bruto)}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                  <span className="text-sm font-medium text-green-600">Bonificaciones:</span>
                                  <span className="text-sm text-green-600">+{formatMonto(selectedNomina.bonificaciones)}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                  <span className="text-sm font-medium text-red-600">Deducciones:</span>
                                  <span className="text-sm text-red-600">-{formatMonto(selectedNomina.deducciones)}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                  <span className="text-sm font-medium text-red-600">Impuestos:</span>
                                  <span className="text-sm text-red-600">-{formatMonto(selectedNomina.impuestos)}</span>
                                </div>
                                
                                <Separator />
                                
                                <div className="flex justify-between items-center">
                                  <span className="text-lg font-bold">Total:</span>
                                  <span className="text-lg font-bold text-green-600">{formatMonto(selectedNomina.valor_neto)}</span>
                                </div>
                              </div>
                              
                              <Separator />
                              
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <label className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                                    <CalendarIcon className="h-3 w-3" />
                                    Fecha de Pago
                                  </label>
                                  <p className="text-sm">{selectedNomina.fecha_pago ? formatFecha(selectedNomina.fecha_pago) : 'Sin fecha'}</p>
                                </div>
                                <div>
                                  <label className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                                    <CreditCard className="h-3 w-3" />
                                    Método de Pago
                                  </label>
                                  <p className="text-sm capitalize">{selectedNomina.metodo_pago}</p>
                                </div>
                              </div>
                              
                              <div>
                                <label className="text-sm font-medium text-muted-foreground">Estado</label>
                                <div className="mt-1">
                                  <Badge variant="outline" className={
                                    selectedNomina.estado === 'pagada' ? 'bg-green-50 text-green-700' :
                                    selectedNomina.estado === 'pendiente' ? 'bg-yellow-50 text-yellow-700' :
                                    'bg-red-50 text-red-700'
                                  }>
                                    {selectedNomina.estado}
                                  </Badge>
                                </div>
                              </div>
                            </div>
                          )}
                          
                          <DialogFooter className="flex gap-2">
                            {onEliminar && (
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button variant="destructive" size="sm">
                                    <Trash2 className="h-4 w-4 mr-1" />
                                    Eliminar
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>¿Eliminar nómina?</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      Esta acción no se puede deshacer. Se eliminará permanentemente esta nómina y todos los datos relacionados.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                    <AlertDialogAction
                                      onClick={() => selectedNomina && onEliminar(selectedNomina.id)}
                                      className="bg-red-600 hover:bg-red-700"
                                    >
                                      Eliminar
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            )}
                            {onExportar && (
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => selectedNomina && onExportar(selectedNomina.id)}
                              >
                                <Download className="h-4 w-4 mr-1" />
                                Exportar PDF
                              </Button>
                            )}
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                      
                      {onEditar && (
                        <Button 
                          variant="ghost" 
                          size="sm"
                          className="h-8 w-8 p-0"
                          onClick={() => onEditar(item.id)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                      )}
                      
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          {onExportar && (
                            <DropdownMenuItem onClick={() => onExportar(item.id)}>
                              <Download className="mr-2 h-4 w-4" />
                              Exportar PDF
                            </DropdownMenuItem>
                          )}
                          {onEliminar && (
                            <DropdownMenuItem 
                              onClick={() => onEliminar(item.id)}
                              className="text-red-600"
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Eliminar
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}