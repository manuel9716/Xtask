import React, { useMemo } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatCurrency } from '@/lib/utils';
import { EmpleadoConCalculos } from './NominaFormModal';

interface ResumenNominaProps {
  empleados: EmpleadoConCalculos[];
}

export function ResumenNomina({ empleados }: ResumenNominaProps) {
  // Cálculo de totales generales
  const totales = useMemo(() => {
    if (empleados.length === 0) return null;
    
    return empleados.reduce(
      (acc, empleado) => {
        acc.salarioBase += empleado.calculosNomina.salarioBase;
        acc.salarioBruto += empleado.calculosNomina.salarioBruto;
        acc.retencionFiscal += empleado.calculosNomina.retencionFiscal;
        acc.seguridadSocial += empleado.calculosNomina.seguridadSocial;
        acc.otrasDeduciones += empleado.calculosNomina.otrasDeduciones;
        acc.salarioNeto += empleado.calculosNomina.salarioNeto;
        return acc;
      },
      {
        salarioBase: 0,
        salarioBruto: 0,
        retencionFiscal: 0,
        seguridadSocial: 0,
        otrasDeduciones: 0,
        salarioNeto: 0,
      }
    );
  }, [empleados]);

  if (!totales) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Resumen de nómina</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Empleado</TableHead>
              <TableHead className="text-right">Salario Base</TableHead>
              <TableHead className="text-right">Salario Bruto</TableHead>
              <TableHead className="text-right">Retención</TableHead>
              <TableHead className="text-right">Seg. Social</TableHead>
              <TableHead className="text-right">Otras Deduc.</TableHead>
              <TableHead className="text-right">Salario Neto</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {empleados.map((empleado) => (
              <TableRow key={empleado.id}>
                <TableCell className="font-medium">
                  {empleado.firstName} {empleado.lastName}
                </TableCell>
                <TableCell className="text-right">
                  {formatCurrency(empleado.calculosNomina.salarioBase)}
                </TableCell>
                <TableCell className="text-right">
                  {formatCurrency(empleado.calculosNomina.salarioBruto)}
                </TableCell>
                <TableCell className="text-right">
                  {formatCurrency(empleado.calculosNomina.retencionFiscal)}
                </TableCell>
                <TableCell className="text-right">
                  {formatCurrency(empleado.calculosNomina.seguridadSocial)}
                </TableCell>
                <TableCell className="text-right">
                  {formatCurrency(empleado.calculosNomina.otrasDeduciones)}
                </TableCell>
                <TableCell className="text-right font-medium">
                  {formatCurrency(empleado.calculosNomina.salarioNeto)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
          <TableFooter>
            <TableRow>
              <TableCell className="font-medium">TOTAL</TableCell>
              <TableCell className="text-right">
                {formatCurrency(totales.salarioBase)}
              </TableCell>
              <TableCell className="text-right">
                {formatCurrency(totales.salarioBruto)}
              </TableCell>
              <TableCell className="text-right">
                {formatCurrency(totales.retencionFiscal)}
              </TableCell>
              <TableCell className="text-right">
                {formatCurrency(totales.seguridadSocial)}
              </TableCell>
              <TableCell className="text-right">
                {formatCurrency(totales.otrasDeduciones)}
              </TableCell>
              <TableCell className="text-right font-medium">
                {formatCurrency(totales.salarioNeto)}
              </TableCell>
            </TableRow>
          </TableFooter>
        </Table>
      </CardContent>
    </Card>
  );
}