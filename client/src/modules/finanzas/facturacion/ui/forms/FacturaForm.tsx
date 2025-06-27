import React, { useState, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { CalendarIcon, Upload, X } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { TipoFactura, EstadoFactura } from '@shared/schema';
import { useRegistrarFactura } from '../../application/useCases/registrarFactura';

const facturaSchema = z.object({
  proyectoId: z.number(),
  numeroFactura: z.string().min(1, 'Número de factura requerido'),
  tipo: z.nativeEnum(TipoFactura),
  cliente: z.string().min(1, 'Cliente requerido'),
  concepto: z.string().min(1, 'Concepto requerido'),
  valorSubtotal: z.number().min(0, 'Valor subtotal debe ser mayor a 0'),
  valorTotal: z.number().min(0, 'Valor total debe ser mayor a 0'),
  fechaEmision: z.date(),
  fechaVencimiento: z.date(),
  estado: z.nativeEnum(EstadoFactura).default(EstadoFactura.PENDIENTE),
  medioPago: z.string().optional(),
  soporteUrl: z.string().optional(),
  creadoPor: z.number()
});

type FacturaFormData = z.infer<typeof facturaSchema>;

interface FacturaFormProps {
  proyectoId: number;
  userId: number;
  onSuccess: () => void;
  onCancel: () => void;
}

export function FacturaForm({ proyectoId, userId, onSuccess, onCancel }: FacturaFormProps) {
  const registrarMutation = useRegistrarFactura();
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  
  const form = useForm<FacturaFormData>({
    resolver: zodResolver(facturaSchema),
    defaultValues: {
      proyectoId,
      tipo: TipoFactura.INGRESO,
      estado: EstadoFactura.PENDIENTE,
      fechaEmision: new Date(),
      fechaVencimiento: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 días desde hoy
      creadoPor: userId,
      valorSubtotal: 0,
      valorTotal: 0
    }
  });

  // Formatear número como moneda colombiana
  const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(value);
  };

  // Convertir string de moneda a número
  const parseCurrency = (value: string): number => {
    return parseFloat(value.replace(/[^\d.-]/g, '')) || 0;
  };

  // Manejar archivos arrastrados
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const files = Array.from(e.dataTransfer.files);
    const file = files[0];
    
    if (file && (file.type.includes('pdf') || file.type.includes('doc') || file.type.includes('image'))) {
      setUploadedFile(file);
    }
  }, []);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploadedFile(file);
    }
  }, []);

  const removeFile = () => {
    setUploadedFile(null);
  };

  const onSubmit = async (data: FacturaFormData) => {
    try {
      const formData = new FormData();
      
      // Agregar datos del formulario
      Object.entries(data).forEach(([key, value]) => {
        if (key === 'fechaEmision' || key === 'fechaVencimiento') {
          formData.append(key, format(value as Date, 'yyyy-MM-dd'));
        } else if (key === 'valorSubtotal' || key === 'valorTotal') {
          formData.append(key, value.toString());
        } else if (value !== undefined && value !== null) {
          formData.append(key, value.toString());
        }
      });

      // Agregar archivo si existe
      if (uploadedFile) {
        formData.append('soporte', uploadedFile);
      }

      await registrarMutation.mutateAsync(formData);
      onSuccess();
    } catch (error) {
      console.error('Error al registrar factura:', error);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="numeroFactura"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Número de Factura</FormLabel>
                <FormControl>
                  <Input placeholder="FAC-001" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="tipo"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Tipo</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar tipo" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value={TipoFactura.INGRESO}>Ingreso</SelectItem>
                    <SelectItem value={TipoFactura.EGRESO}>Egreso</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="cliente"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Cliente/Proveedor</FormLabel>
              <FormControl>
                <Input placeholder="Nombre del cliente o proveedor" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="concepto"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Concepto</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Descripción del servicio o producto" 
                  {...field} 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="valorSubtotal"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Valor Subtotal</FormLabel>
                <FormControl>
                  <Input
                    type="text"
                    placeholder="$ 0"
                    value={field.value ? formatCurrency(field.value) : ''}
                    onChange={(e) => {
                      const numericValue = parseCurrency(e.target.value);
                      field.onChange(numericValue);
                    }}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="valorTotal"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Valor Total</FormLabel>
                <FormControl>
                  <Input
                    type="text"
                    placeholder="$ 0"
                    value={field.value ? formatCurrency(field.value) : ''}
                    onChange={(e) => {
                      const numericValue = parseCurrency(e.target.value);
                      field.onChange(numericValue);
                    }}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="fechaEmision"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Fecha de Emisión</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full pl-3 text-left font-normal",
                          !field.value && "text-muted-foreground"
                        )}
                      >
                        {field.value ? (
                          format(field.value, "PPP", { locale: es })
                        ) : (
                          <span>Seleccionar fecha</span>
                        )}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={field.value}
                      onSelect={field.onChange}
                      disabled={(date) =>
                        date > new Date() || date < new Date("1900-01-01")
                      }
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="fechaVencimiento"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Fecha de Vencimiento</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full pl-3 text-left font-normal",
                          !field.value && "text-muted-foreground"
                        )}
                      >
                        {field.value ? (
                          format(field.value, "PPP", { locale: es })
                        ) : (
                          <span>Seleccionar fecha</span>
                        )}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={field.value}
                      onSelect={field.onChange}
                      disabled={(date) => date < new Date()}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="medioPago"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Medio de Pago (Opcional)</FormLabel>
              <FormControl>
                <Input placeholder="Transferencia, Cheque, etc." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="space-y-2">
          <label className="text-sm font-medium">Archivo de Soporte (Opcional)</label>
          <div 
            className={cn(
              "border-2 border-dashed rounded-lg p-6 transition-colors cursor-pointer",
              isDragOver ? "border-blue-500 bg-blue-50" : "border-gray-300 hover:border-gray-400",
              uploadedFile && "border-green-500 bg-green-50"
            )}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => document.getElementById('file-upload')?.click()}
          >
            <input
              id="file-upload"
              type="file"
              accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
              onChange={handleFileSelect}
              className="hidden"
            />
            
            {uploadedFile ? (
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Upload className="h-5 w-5 text-green-600" />
                  <span className="text-sm text-green-700">{uploadedFile.name}</span>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    removeFile();
                  }}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center space-y-2">
                <Upload className="h-6 w-6 text-gray-400" />
                <p className="text-sm text-gray-500">Arrastrar archivo de soporte o hacer clic para seleccionar</p>
                <p className="text-xs text-gray-400">PDF, DOC, DOCX (máx. 10MB)</p>
              </div>
            )}
          </div>
        </div>

        <div className="flex justify-end space-x-2 pt-6">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancelar
          </Button>
          <Button type="submit" disabled={registrarMutation.isPending}>
            {registrarMutation.isPending ? 'Registrando...' : 'Registrar Factura'}
          </Button>
        </div>
      </form>
    </Form>
  );
}