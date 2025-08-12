import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, DollarSign, CreditCard, Clock, CheckCircle, XCircle } from 'lucide-react';
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
}

export function HistorialNominaTable({
  historial,
  isLoading,
  onChangeEstado
}: HistorialNominaTableProps) {
  
  const renderEstado = (estado: string) => {
    switch (estado) {
      case EstadoNomina.PENDIENTE:
        return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 hover:bg-yellow-100">Pendiente</Badge>;
      case EstadoNomina.APROBADO:
        return <Badge variant="outline" className="bg-blue-50 text-blue-700 hover:bg-blue-100">Aprobado</Badge>;
      case EstadoNomina.PAGADO:
        return <Badge variant="outline" className="bg-green-50 text-green-700 hover:bg-green-100">Pagado</Badge>;
      case EstadoNomina.RECHAZADO:
        return <Badge variant="outline" className="bg-red-50 text-red-700 hover:bg-red-100">Rechazado</Badge>;
      default:
        return <Badge variant="outline">{estado}</Badge>;
    }
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

  const puedeMarcarPagado = (estado: string) => estado === EstadoNomina.APROBADO;

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
                  <TableHead>Valor Bruto</TableHead>
                  <TableHead>Deducciones</TableHead>
                  <TableHead>Valor Neto</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Fecha Pago</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
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
                    <TableCell>
                      <div className="font-medium text-green-600">
                        {formatMonto(item.valor_bruto)}
                      </div>
                      {item.bonificaciones > 0 && (
                        <div className="text-xs text-green-500">
                          +{formatMonto(item.bonificaciones)} bonos
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="text-red-600">
                        -{formatMonto(item.deducciones + item.impuestos)}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Deduc: {formatMonto(item.deducciones)} | Imp: {formatMonto(item.impuestos)}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="font-bold text-lg">
                        {formatMonto(item.valor_neto)}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {item.metodo_pago}
                      </div>
                    </TableCell>
                    <TableCell>
                      {renderEstado(item.estado)}
                    </TableCell>
                    <TableCell>
                      {item.fecha_pago ? (
                        <div className="text-sm">
                          {formatFecha(item.fecha_pago)}
                        </div>
                      ) : (
                        <div className="text-sm text-muted-foreground">
                          Sin fecha
                        </div>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      {puedeMarcarPagado(item.estado) && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => onChangeEstado(item.id, EstadoNomina.PAGADO)}
                          className="text-green-600 hover:text-green-700 hover:bg-green-50"
                        >
                          <CreditCard className="h-4 w-4 mr-1" />
                          Marcar Pagado
                        </Button>
                      )}
                      {item.estado === EstadoNomina.PENDIENTE && (
                        <div className="flex gap-1">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => onChangeEstado(item.id, EstadoNomina.APROBADO)}
                            className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                          >
                            <CheckCircle className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => onChangeEstado(item.id, EstadoNomina.RECHAZADO)}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            <XCircle className="h-4 w-4" />
                          </Button>
                        </div>
                      )}
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