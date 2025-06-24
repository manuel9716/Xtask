import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { NominaConDetalles, calculosNomina } from '../../domain/entities/Nomina';
import { 
  DollarSign, 
  Calendar, 
  User, 
  Building2,
  Clock,
  TrendingUp,
  AlertCircle,
  CreditCard
} from 'lucide-react';

const registrarPagoSchema = z.object({
  mes: z.string().min(7, 'Mes requerido'),
  bonificacion: z.number().min(0, 'La bonificación debe ser mayor o igual a 0').optional(),
  fechaPago: z.string().min(1, 'Fecha de pago requerida'),
  estado: z.enum(['pendiente', 'pagado', 'aprobado']),
});

type RegistrarPagoForm = z.infer<typeof registrarPagoSchema>;

interface DetallePagoModalProps {
  isOpen: boolean;
  onClose: () => void;
  nomina: NominaConDetalles | null;
  onConfirmar: (data: RegistrarPagoForm) => void;
  isLoading?: boolean;
}

export function DetallePagoModal({ 
  isOpen, 
  onClose, 
  nomina, 
  onConfirmar, 
  isLoading = false 
}: DetallePagoModalProps) {
  
  const form = useForm<RegistrarPagoForm>({
    resolver: zodResolver(registrarPagoSchema),
    defaultValues: {
      mes: nomina?.mes || new Date().toISOString().slice(0, 7),
      bonificacion: nomina?.bonificacion || 0,
      fechaPago: nomina?.fechaPago || new Date().toISOString().split('T')[0],
      estado: nomina?.estado || 'pendiente',
    },
  });

  const watchedValues = form.watch();
  
  // Función para formatear números en pesos colombianos
  const formatCOP = (amount: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const totalCalculado = nomina ? 
    calculosNomina.calcularTotalPagar(nomina.recurso.salarioMensual, watchedValues.bonificacion || 0) : 0;

  const handleSubmit = (data: RegistrarPagoForm) => {
    const pagoData = {
      ...data,
      metodoPago: 'transferencia'
    };
    onConfirmar(pagoData);
  };

  const handlePSEPayment = () => {
    const formData = form.getValues();
    const totalPagar = totalCalculado;
    
    // Simular proceso de pago PSE
    const pagoData = {
      ...formData,
      metodoPago: 'pse',
      estado: 'procesando' as const,
      referenciaPSE: `PSE-${Date.now()}`
    };
    
    // Mostrar mensaje de confirmación PSE
    if (window.confirm(`¿Confirmar pago PSE por ${formatCOP(totalPagar)}?\n\nSe abrirá el portal bancario para completar la transacción.`)) {
      // Simular redirección a PSE
      window.open(`https://www.pse.com.co/pago?ref=${pagoData.referenciaPSE}&amount=${totalPagar}`, '_blank');
      
      // Confirmar el pago como procesando
      onConfirmar(pagoData);
    }
  };

  if (!nomina) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5 text-[#02BDEA]" />
            Registrar Pago de Nómina
          </DialogTitle>
          <DialogDescription>
            Configure los detalles del pago para {nomina.recurso.perfil}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Información del recurso */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <User className="h-4 w-4" />
                Información del Recurso
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Perfil</p>
                  <p className="font-semibold">{nomina.recurso.perfil}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Proyecto</p>
                  <p className="font-semibold">{nomina.proyecto.nombre}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Salario Base</p>
                  <p className="font-semibold text-[#251948]">
                    {formatCOP(nomina.recurso.salarioMensual)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Estado Actual</p>
                  <Badge className={calculosNomina.colorEstado(nomina.estado)}>
                    {nomina.estado.toUpperCase()}
                  </Badge>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4 pt-2">
                <div className="text-center">
                  <div className="flex items-center justify-center gap-1 mb-1">
                    <Clock className="h-4 w-4 text-gray-500" />
                    <span className="text-xs text-gray-500">Horas/Mes</span>
                  </div>
                  <p className="font-semibold">{nomina.horasTotales}h</p>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center gap-1 mb-1">
                    <TrendingUp className="h-4 w-4 text-gray-500" />
                    <span className="text-xs text-gray-500">Dedicación</span>
                  </div>
                  <p className="font-semibold">{nomina.dedicacion}%</p>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center gap-1 mb-1">
                    <DollarSign className="h-4 w-4 text-gray-500" />
                    <span className="text-xs text-gray-500">Valor/Hora</span>
                  </div>
                  <p className="font-semibold">{formatCOP(nomina.recurso.valorHora)}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Formulario de pago */}
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="mes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Mes de Pago</FormLabel>
                      <FormControl>
                        <Input type="month" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="fechaPago"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Fecha de Pago</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="bonificacion"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Bonificación (COP)</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                          <Input
                            type="number"
                            placeholder="0"
                            className="pl-10"
                            value={field.value || ''}
                            onChange={(e) => {
                              const value = e.target.value === '' ? 0 : Number(e.target.value);
                              field.onChange(value);
                            }}
                          />
                        </div>
                      </FormControl>
                      <FormDescription>
                        Bonificaciones adicionales al salario base
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="estado"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Estado del Pago</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Seleccionar estado" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="pendiente">Pendiente</SelectItem>
                          <SelectItem value="aprobado">Aprobado</SelectItem>
                          <SelectItem value="pagado">Pagado</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <Separator />

              {/* Resumen del pago */}
              <div className="bg-gray-50 p-4 rounded-lg space-y-3">
                <h4 className="font-semibold text-[#251948] flex items-center gap-2">
                  <AlertCircle className="h-4 w-4" />
                  Resumen del Pago
                </h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Salario base:</span>
                    <span className="font-medium">{formatCOP(nomina.recurso.salarioMensual)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Bonificación:</span>
                    <span className="font-medium">{formatCOP(watchedValues.bonificacion || 0)}</span>
                  </div>
                </div>
                <Separator />
                <div className="flex justify-between items-center">
                  <span className="font-semibold text-[#251948]">Total a pagar:</span>
                  <span className="text-xl font-bold text-[#02BDEA]">
                    {formatCOP(totalCalculado)}
                  </span>
                </div>
              </div>

              {/* Información sobre métodos de pago */}
              <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                <div className="flex items-center gap-2 mb-2">
                  <CreditCard className="h-4 w-4 text-blue-600" />
                  <span className="text-sm font-medium text-blue-800">Opciones de Pago</span>
                </div>
                <p className="text-xs text-blue-700">
                  • <strong>Confirmar Pago:</strong> Registro manual del pago
                </p>
                <p className="text-xs text-blue-700">
                  • <strong>Pagar con PSE:</strong> Pago inmediato vía transferencia bancaria
                </p>
              </div>

              {/* Botones de acción */}
              <div className="flex justify-end gap-2 pt-4">
                <Button type="button" variant="outline" onClick={onClose}>
                  Cancelar
                </Button>
                <Button 
                  type="button"
                  onClick={handlePSEPayment}
                  className="bg-[#FFA41B] hover:bg-[#FFA41B]/90 text-white"
                  disabled={isLoading}
                >
                  {isLoading ? 'Procesando...' : 'Pagar con PSE'}
                </Button>
                <Button 
                  type="submit" 
                  disabled={isLoading}
                  className="bg-[#02BDEA] hover:bg-[#02BDEA]/90 text-white"
                >
                  {isLoading ? 'Procesando...' : 'Confirmar Pago'}
                </Button>
              </div>
            </form>
          </Form>
        </div>
      </DialogContent>
    </Dialog>
  );
}