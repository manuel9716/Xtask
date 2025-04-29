import React from 'react';
import { ResultadoCalculoNomina } from '../../domain/services/calculadoraNomina';
import { formatCurrency } from '@/lib/utils';
import { 
  Card, 
  CardContent,
  CardHeader,
  CardTitle 
} from '@/components/ui/card';
import { DollarSign, AlertCircle, Minus, Plus } from 'lucide-react';

interface ResumenNominaProps {
  totales: ResultadoCalculoNomina;
  cantidadEmpleados: number;
}

export function ResumenNomina({ totales, cantidadEmpleados }: ResumenNominaProps) {
  return (
    <div className="space-y-4">
      <h3 className="text-xl font-semibold mb-2">Resumen de Nómina</h3>
      
      {/* Tarjeta principal con el total a pagar */}
      <Card className="bg-primary/5 border-primary/20">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg flex items-center">
            <DollarSign className="h-5 w-5 mr-1" />
            Total a Pagar
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col">
            <div className="text-3xl font-bold mb-1">
              {formatCurrency(totales.salarioNeto)}
            </div>
            <div className="text-sm text-muted-foreground">
              {cantidadEmpleados} {cantidadEmpleados === 1 ? 'empleado' : 'empleados'} incluidos
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Desglose de valores */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {/* Salario Base */}
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between mb-2">
              <div className="text-sm font-medium flex items-center">
                <Plus className="h-4 w-4 mr-1 text-green-500" /> 
                Salario Base
              </div>
              <div className="font-semibold">{formatCurrency(totales.salarioBase)}</div>
            </div>
          </CardContent>
        </Card>
        
        {/* Retención Fiscal */}
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between mb-2">
              <div className="text-sm font-medium flex items-center">
                <Minus className="h-4 w-4 mr-1 text-destructive" /> 
                Retención Fiscal
              </div>
              <div className="font-semibold">-{formatCurrency(totales.retencionFiscal)}</div>
            </div>
          </CardContent>
        </Card>
        
        {/* Seguridad Social */}
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between mb-2">
              <div className="text-sm font-medium flex items-center">
                <Minus className="h-4 w-4 mr-1 text-destructive" /> 
                Seguridad Social
              </div>
              <div className="font-semibold">-{formatCurrency(totales.seguridadSocial)}</div>
            </div>
          </CardContent>
        </Card>
        
        {/* Otras Deducciones */}
        {totales.otrasDeduciones > 0 && (
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center justify-between mb-2">
                <div className="text-sm font-medium flex items-center">
                  <Minus className="h-4 w-4 mr-1 text-destructive" /> 
                  Otras Deducciones
                </div>
                <div className="font-semibold">-{formatCurrency(totales.otrasDeduciones)}</div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
      
      {/* Mensaje informativo */}
      {totales.salarioNeto === 0 && (
        <div className="flex items-center p-4 bg-amber-50 text-amber-700 rounded-md border border-amber-200">
          <AlertCircle className="h-5 w-5 mr-2 text-amber-600" />
          <span>Seleccione al menos un empleado para ver el cálculo de la nómina.</span>
        </div>
      )}
    </div>
  );
}