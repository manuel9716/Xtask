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
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Payroll } from '@shared/schema';
import { Eye } from 'lucide-react';
import { useLocation } from 'wouter';
import { EstadoNomina } from '../../domain/entities/Nomina';

interface NominasTableProps {
  nominas: (Payroll & { nombreEmpleado?: string; empleadoId?: number })[];
  isLoading: boolean;
  onCambiarEstado: (nominaId: number, nuevoEstado: string) => void;
}

export function NominasTable({
  nominas,
  isLoading,
  onCambiarEstado
}: NominasTableProps) {
  const [_, navigate] = useLocation();

  // Renderizar estado editable con select
  const renderEstado = (nomina: any) => {
    return (
      <Select
        value={nomina.status}
        onValueChange={(nuevoEstado) => onCambiarEstado(nomina.id, nuevoEstado)}
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

  // Formatear fecha
  const formatFecha = (fechaStr: string | Date) => {
    const fecha = fechaStr instanceof Date ? fechaStr : new Date(fechaStr);
    return fecha.toLocaleDateString();
  };

  // Formatear montos
  const formatMonto = (monto: string | number) => {
    const valor = typeof monto === 'string' ? parseFloat(monto) : monto;
    return valor.toLocaleString('es-ES', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    });
  };

  // Ver detalles de la nómina
  const verDetalle = (nominaId: number) => {
    navigate(`/nominas/${nominaId}`);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[200px]">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
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
          {nominas.length === 0 ? (
            <TableRow>
              <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                No hay nóminas disponibles
              </TableCell>
            </TableRow>
          ) : (
            nominas.map((nomina) => (
              <TableRow key={nomina.id}>
                <TableCell>
                  {formatFecha(nomina.periodStart)} - {formatFecha(nomina.periodEnd)}
                </TableCell>
                <TableCell>
                  {nomina.projectName || 'Sin proyecto'}
                </TableCell>
                <TableCell className="font-medium">
                  {formatMonto(nomina.grossSalary)}
                </TableCell>
                <TableCell className="font-bold text-green-600">
                  {formatMonto(nomina.netSalary)}
                </TableCell>
                <TableCell>
                  {renderEstado(nomina)}
                </TableCell>
                <TableCell>
                  {nomina.paymentDate ? formatFecha(nomina.paymentDate) : '-'}
                </TableCell>
                <TableCell className="text-center">
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => verDetalle(nomina.id)}
                    className="h-8 w-8 p-0"
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}