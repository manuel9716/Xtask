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
import { DollarSign, FileText, Upload, Building2 } from 'lucide-react';

const facturaSchema = z.object({
  proveedor: z.string().min(3, 'El proveedor debe tener al menos 3 caracteres'),
  numeroFactura: z.string().min(1, 'El número de factura es requerido'),
  valor: z.number().min(1, 'El valor debe ser mayor a 0'),
  concepto: z.string().min(3, 'El concepto debe tener al menos 3 caracteres'),
  fecha: z.string().min(1, 'La fecha es requerida'),
  nit: z.string().optional(),
  descripcion: z.string().optional(),
  archivo: z.any().optional(),
});

type FacturaFormData = z.infer<typeof facturaSchema>;

interface RegistroFacturaModalProps {
  isOpen: boolean;
  onClose: () => void;
  presupuestoId: number;
}

export function RegistroFacturaModal({ isOpen, onClose, presupuestoId }: RegistroFacturaModalProps) {
  const form = useForm<FacturaFormData>({
    resolver: zodResolver(facturaSchema),
    defaultValues: {
      proveedor: '',
      numeroFactura: '',
      valor: 0,
      concepto: '',
      fecha: new Date().toISOString().split('T')[0],
      nit: '',
      descripcion: '',
    },
  });

  const formatCurrency = (value: string) => {
    const number = value.replace(/[^\d]/g, '');
    if (!number) return '';
    return new Intl.NumberFormat('es-CO').format(parseInt(number));
  };

  const handleSubmit = async (data: FacturaFormData) => {
    try {
      console.log('Registrando factura:', { ...data, presupuestoId });
      // Aquí iría la llamada a la API
      // await fetch(`/api/finanzas/presupuestos/${presupuestoId}/facturas`, {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(data)
      // });
      
      alert('Factura registrada exitosamente');
      form.reset();
      onClose();
    } catch (error) {
      console.error('Error al registrar factura:', error);
      alert('Error al registrar la factura');
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-[#02BDEA]" />
            Registrar Nueva Factura
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Proveedor */}
              <FormField
                control={form.control}
                name="proveedor"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Proveedor</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Building2 className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input 
                          placeholder="Nombre del proveedor"
                          className="pl-10"
                          {...field} 
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* NIT */}
              <FormField
                control={form.control}
                name="nit"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>NIT (Opcional)</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="123456789-0"
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Número de Factura */}
              <FormField
                control={form.control}
                name="numeroFactura"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Número de Factura</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="FC-2024-001"
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Fecha */}
              <FormField
                control={form.control}
                name="fecha"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Fecha de la Factura</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Valor */}
              <FormField
                control={form.control}
                name="valor"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Valor (COP)</FormLabel>
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

              {/* Archivo PDF */}
              <FormField
                control={form.control}
                name="archivo"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Archivo de la Factura</FormLabel>
                    <FormControl>
                      <div className="flex items-center gap-2">
                        <Input
                          type="file"
                          accept=".pdf,.jpg,.jpeg,.png"
                          onChange={(e) => field.onChange(e.target.files?.[0])}
                          className="hidden"
                          id="factura-upload"
                        />
                        <label
                          htmlFor="factura-upload"
                          className="flex-1 flex items-center justify-center gap-2 h-10 px-3 border border-input bg-background rounded-md cursor-pointer hover:bg-accent hover:text-accent-foreground"
                        >
                          <Upload className="h-4 w-4" />
                          <span className="text-sm">
                            {field.value?.name || 'Seleccionar PDF/imagen'}
                          </span>
                        </label>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Concepto */}
            <FormField
              control={form.control}
              name="concepto"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Concepto</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="Ej: Licencias de software, servicios de consultoría..."
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Descripción */}
            <FormField
              control={form.control}
              name="descripcion"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descripción Adicional (Opcional)</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Detalles adicionales sobre la factura..."
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
                Registrar Factura
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}