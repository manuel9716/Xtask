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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Eye, Calendar } from 'lucide-react';
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
          <SelectItem value="pagada">Pagada</SelectItem>
          <SelectItem value="cancelada">Cancelada</SelectItem>
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
                  <TableHead>Valor Bruto</TableHead>
                  <TableHead>Valor Neto</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Fecha Pago</TableHead>
                  <TableHead className="text-center">Vista</TableHead>
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
                    <TableCell className="font-medium">
                      {formatMonto(item.valor_bruto)}
                      {item.bonificaciones > 0 && (
                        <div className="text-xs text-green-500">
                          +{formatMonto(item.bonificaciones)} bonos
                        </div>
                      )}
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
                      <Button 
                        variant="ghost" 
                        size="sm"
                        className="h-8 w-8 p-0"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
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