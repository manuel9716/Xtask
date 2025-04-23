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
import { Payroll } from '@shared/schema';
import { 
  Eye, 
  FileDown, 
  MoreHorizontal, 
  CheckCircle, 
  XCircle, 
  CreditCard 
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useNavigate } from 'wouter';
import { EstadoNomina } from '../../domain/entities/Nomina';

interface NominasTableProps {
  nominas: (Payroll & { nombreEmpleado?: string })[];
  isLoading: boolean;
  onMarcarPagada: (nominaId: number) => void;
  onAprobar: (nominaId: number) => void;
  onRechazar: (nominaId: number) => void;
  onDescargarDesprendible: (nominaId: number) => void;
}

export function NominasTable({
  nominas,
  isLoading,
  onMarcarPagada,
  onAprobar,
  onRechazar,
  onDescargarDesprendible
}: NominasTableProps) {
  const navigate = useNavigate();

  // Renderizar estado con un badge de color apropiado
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
      case EstadoNomina.CANCELADO:
        return <Badge variant="outline" className="bg-gray-50 text-gray-700 hover:bg-gray-100">Cancelado</Badge>;
      default:
        return <Badge variant="outline">{estado}</Badge>;
    }
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
    navigate(`/finanzas/nomina/${nominaId}`);
  };

  // Manejo de acciones según el estado
  const puedeAprobar = (estado: string) => estado === EstadoNomina.PENDIENTE;
  const puedeRechazar = (estado: string) => estado === EstadoNomina.PENDIENTE;
  const puedePagar = (estado: string) => estado === EstadoNomina.APROBADO;

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
            <TableHead>ID</TableHead>
            <TableHead>Empleado</TableHead>
            <TableHead>Período</TableHead>
            <TableHead>Sueldo Bruto</TableHead>
            <TableHead>Deducciones</TableHead>
            <TableHead>Sueldo Neto</TableHead>
            <TableHead>Estado</TableHead>
            <TableHead className="text-right">Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {nominas.length === 0 ? (
            <TableRow>
              <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                No hay nóminas disponibles
              </TableCell>
            </TableRow>
          ) : (
            nominas.map((nomina) => (
              <TableRow key={nomina.id}>
                <TableCell className="font-medium">#{nomina.id}</TableCell>
                <TableCell>{nomina.nombreEmpleado || `Empleado #${nomina.employeeId}`}</TableCell>
                <TableCell>
                  {formatFecha(nomina.periodStart)} - {formatFecha(nomina.periodEnd)}
                </TableCell>
                <TableCell>{formatMonto(nomina.grossSalary)}</TableCell>
                <TableCell>{formatMonto(nomina.deductions)}</TableCell>
                <TableCell>{formatMonto(nomina.netSalary)}</TableCell>
                <TableCell>{renderEstado(nomina.status)}</TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0">
                        <span className="sr-only">Abrir menú</span>
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Acciones</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => verDetalle(nomina.id)}>
                        <Eye className="mr-2 h-4 w-4" />
                        Ver detalles
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => onDescargarDesprendible(nomina.id)}>
                        <FileDown className="mr-2 h-4 w-4" />
                        Descargar desprendible
                      </DropdownMenuItem>
                      {puedeAprobar(nomina.status) && (
                        <DropdownMenuItem onClick={() => onAprobar(nomina.id)}>
                          <CheckCircle className="mr-2 h-4 w-4" />
                          Aprobar
                        </DropdownMenuItem>
                      )}
                      {puedeRechazar(nomina.status) && (
                        <DropdownMenuItem onClick={() => onRechazar(nomina.id)}>
                          <XCircle className="mr-2 h-4 w-4" />
                          Rechazar
                        </DropdownMenuItem>
                      )}
                      {puedePagar(nomina.status) && (
                        <DropdownMenuItem onClick={() => onMarcarPagada(nomina.id)}>
                          <CreditCard className="mr-2 h-4 w-4" />
                          Marcar como pagada
                        </DropdownMenuItem>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}