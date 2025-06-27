import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { DollarSign, Receipt, Upload } from 'lucide-react';

const pagoSchema = z.object({
  fecha: z.string().min(1, 'La fecha es requerida'),
  monto: z.number().min(1, 'El monto debe ser mayor a 0'),
  concepto: z.string().min(3, 'El concepto debe tener al menos 3 caracteres'),
  area: z.string().min(1, 'El área es requerida'),
  metodoPago: z.string().min(1, 'El método de pago es requerido'),
  descripcion: z.string().optional(),
  comprobante: z.any().optional(),
});

type PagoFormData = z.infer<typeof pagoSchema>;

interface RegistroPagoModalProps {
  isOpen: boolean;
  onClose: () => void;
  presupuestoId: number;
}

const areas = [
  'Desarrollo',
  'Marketing',
  'Administración',
  'Recursos Humanos',
  'Finanzas',
  'Operaciones',
  'General'
];

const metodosPago = [
  'Transferencia Bancaria',
  'Cheque',
  'Efectivo',
  'Tarjeta de Crédito',
  'PSE',
  'Nequi',
  'Daviplata'
];

export function RegistroPagoModal({ isOpen, onClose, presupuestoId }: RegistroPagoModalProps) {
  const form = useForm<PagoFormData>({
    resolver: zodResolver(pagoSchema),
    defaultValues: {
      fecha: new Date().toISOString().split('T')[0],
      monto: 0,
      concepto: '',
      area: '',
      metodoPago: '',
      descripcion: '',
    },
  });

  const formatCurrency = (value: string) => {
    const number = value.replace(/[^\d]/g, '');
    if (!number) return '';
    return new Intl.NumberFormat('es-CO').format(parseInt(number));
  };

  const handleSubmit = async (data: PagoFormData) => {
    try {
      console.log('Registrando pago:', { ...data, presupuestoId });
      // Aquí iría la llamada a la API
      // await fetch(`/api/finanzas/presupuestos/${presupuestoId}/pagos`, {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(data)
      // });
      
      alert('Pago registrado exitosamente');
      form.reset();
      onClose();
    } catch (error) {
      console.error('Error al registrar pago:', error);
      alert('Error al registrar el pago');
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Receipt className="h-5 w-5 text-[#02BDEA]" />
            Registrar Nuevo Pago
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Fecha */}
              <FormField
                control={form.control}
                name="fecha"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Fecha del Pago</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Monto */}
              <FormField
                control={form.control}
                name="monto"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Monto (COP)</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input
                          type="text"
                          placeholder="0"
                          className="pl-10"
                          value={field.value ? formatCurrency(field.value.toString()) : ''}
                          onChange={(e) => {
                            const value = e.target.value.replace(/[^\d]/g, '');
                            field.onChange(value ? parseInt(value) : 0);
                          }}
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Concepto */}
              <FormField
                control={form.control}
                name="concepto"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Concepto</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Ej: Compra de materiales de oficina"
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Área */}
              <FormField
                control={form.control}
                name="area"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Área</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccionar área" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {areas.map((area) => (
                          <SelectItem key={area} value={area}>
                            {area}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Método de Pago */}
              <FormField
                control={form.control}
                name="metodoPago"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Método de Pago</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccionar método" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {metodosPago.map((metodo) => (
                          <SelectItem key={metodo} value={metodo}>
                            {metodo}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Comprobante */}
              <FormField
                control={form.control}
                name="comprobante"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Comprobante de Pago</FormLabel>
                    <FormControl>
                      <div className="flex items-center gap-2">
                        <Input
                          type="file"
                          accept=".pdf,.jpg,.jpeg,.png"
                          onChange={(e) => field.onChange(e.target.files?.[0])}
                          className="hidden"
                          id="comprobante-upload"
                        />
                        <label
                          htmlFor="comprobante-upload"
                          className="flex-1 flex items-center justify-center gap-2 h-10 px-3 border border-input bg-background rounded-md cursor-pointer hover:bg-accent hover:text-accent-foreground"
                        >
                          <Upload className="h-4 w-4" />
                          <span className="text-sm">
                            {field.value?.name || 'Seleccionar archivo'}
                          </span>
                        </label>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Descripción */}
            <FormField
              control={form.control}
              name="descripcion"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descripción Adicional (Opcional)</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Detalles adicionales sobre el pago..."
                      className="min-h-[100px]"
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Botones */}
            <div className="flex justify-end gap-2 pt-4">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancelar
              </Button>
              <Button 
                type="submit" 
                className="bg-[#02BDEA] hover:bg-[#02BDEA]/90"
              >
                Registrar Pago
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}