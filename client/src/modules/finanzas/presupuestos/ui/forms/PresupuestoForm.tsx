import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { cn } from '@/lib/utils';
import { useCrearPresupuesto, CrearPresupuestoDTO } from '../../application/useCrearPresupuesto';

// Schema para validación del formulario
const formSchema = z.object({
    name: z.string()
      .min(3, "El nombre debe tener al menos 3 caracteres")
      .max(100, "El nombre no puede exceder los 100 caracteres"),
    amount: z.string()
      .min(1, "El monto es requerido")
      .refine(val => !isNaN(Number(val)) && Number(val) > 0, {
        message: "El monto debe ser un número mayor que cero"
      }),
    startDate: z.date()
      .refine(date => date instanceof Date && !isNaN(date.getTime()), 
        { message: "Fecha de inicio inválida" }),
    endDate: z.date()
      .refine(date => date instanceof Date && !isNaN(date.getTime()), 
        { message: "Fecha de fin inválida" }),
    description: z.string().optional(),
    area: z.string().optional(),
    porcentajeEjecucion: z.string()
      .optional()
      .refine(val => val === "" || (!isNaN(Number(val)) && Number(val) >= 0 && Number(val) <= 100), {
        message: "El porcentaje debe estar entre 0 y 100"
      }),
    porcentajeGarantia: z.string()
      .optional()
      .refine(val => val === "" || (!isNaN(Number(val)) && Number(val) >= 0 && Number(val) <= 100), {
        message: "El porcentaje debe estar entre 0 y 100"
      }),
    reservasFinancieras: z.string()
      .optional()
      .refine(val => val === "" || (!isNaN(Number(val)) && Number(val) >= 0), {
        message: "Las reservas deben ser un número positivo"
      }),
})
.refine(
  data => data.endDate > data.startDate,
  {
    message: "La fecha de fin debe ser posterior a la fecha de inicio",
    path: ["endDate"]
  }
);

export type PresupuestoFormValues = z.infer<typeof formSchema>;

interface PresupuestoFormProps {
  onSuccess: () => void;
  onCancel: () => void;
}

export function PresupuestoForm({ onSuccess, onCancel }: PresupuestoFormProps) {
  const { crearPresupuesto, isSubmitting } = useCrearPresupuesto();

  // Inicializar el formulario
  const form = useForm<PresupuestoFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      amount: '',
      startDate: new Date(),
      endDate: new Date(new Date().setMonth(new Date().getMonth() + 1)), 
      area: 'General',
      description: '',
      porcentajeEjecucion: '',
      porcentajeGarantia: '',
      reservasFinancieras: ''
    }
  });

  // Areas/departamentos disponibles para el presupuesto
  const areas = ['General', 'Marketing', 'Ventas', 'Tecnología', 'Recursos Humanos', 'Finanzas', 'Operaciones'];

  // Manejar envío del formulario
  const onSubmit = async (data: PresupuestoFormValues) => {
    try {
      // Transformar datos del formulario a formato esperado por el API
      const presupuestoData: CrearPresupuestoDTO = {
        name: data.name,
        amount: Number(data.amount),
        startDate: data.startDate,
        endDate: data.endDate,
        area: data.area,
        description: data.description,
        // Agregar metadata con los nuevos campos financieros
        metadata: {
          porcentajeEjecucion: data.porcentajeEjecucion ? Number(data.porcentajeEjecucion) : undefined,
          porcentajeGarantia: data.porcentajeGarantia ? Number(data.porcentajeGarantia) : undefined,
          reservasFinancieras: data.reservasFinancieras ? Number(data.reservasFinancieras) : undefined,
        }
      };
      
      await crearPresupuesto(presupuestoData);
      onSuccess();
    } catch (error) {
      console.error('Error al crear presupuesto:', error);
    }
  };

  // Función auxiliar para formatear números con separadores de miles
  const formatNumber = (value: string): string => {
    const numericValue = value.replace(/[^\d]/g, '');
    return numericValue.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  };

  // Función auxiliar para obtener valor numérico
  const getNumericValue = (value: string): number => {
    return Number(value.replace(/[^\d]/g, ''));
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nombre del presupuesto</FormLabel>
              <FormControl>
                <Input {...field} placeholder="Ej: Proyecto Marketing Q1 2024" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="amount"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Monto total asignado al presupuesto</FormLabel>
              <FormControl>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 font-medium">
                    $
                  </span>
                  <Input 
                    value={field.value ? formatNumber(field.value) : ''}
                    type="text" 
                    placeholder="6,000,000" 
                    className="pl-8 pr-12"
                    onChange={(e) => {
                      const numericValue = e.target.value.replace(/[^\d]/g, '');
                      field.onChange(numericValue);
                    }}
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">
                    COP
                  </span>
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="startDate"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Fecha de inicio</FormLabel>
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
                          format(field.value, "PPP")
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
                        date < new Date("1900-01-01")
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
            name="endDate"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Fecha de fin</FormLabel>
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
                          format(field.value, "PPP")
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
                        date < new Date("1900-01-01")
                      }
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
          name="area"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Área o departamento al que pertenece el presupuesto</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar área" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {areas.map(area => (
                    <SelectItem key={area} value={area}>{area}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Descripción</FormLabel>
              <FormControl>
                <Textarea 
                  {...field} 
                  placeholder="Información adicional sobre el presupuesto" 
                  className="resize-none" 
                  rows={4} 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Nuevos campos financieros */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="porcentajeEjecucion"
            render={({ field }) => {
              const montoTotal = getNumericValue(form.watch('amount') || '0');
              const porcentaje = Number(field.value) || 0;
              const montoCalculado = (montoTotal * porcentaje) / 100;
              
              return (
                <FormItem>
                  <FormLabel>Porcentaje de Ejecución (%)</FormLabel>
                  <FormControl>
                    <Input 
                      {...field} 
                      type="number" 
                      placeholder="Ej: 75" 
                      min="0" 
                      max="100" 
                      step="0.1" 
                    />
                  </FormControl>
                  {montoTotal > 0 && porcentaje > 0 && (
                    <div className="text-sm text-gray-600 mt-1 p-2 bg-gray-50 rounded">
                      <span className="font-medium">Monto de ejecución: </span>
                      <span className="text-green-600 font-semibold">
                        ${montoCalculado.toLocaleString('es-CO')} COP
                      </span>
                    </div>
                  )}
                  <FormMessage />
                </FormItem>
              );
            }}
          />
          
          <FormField
            control={form.control}
            name="porcentajeGarantia"
            render={({ field }) => {
              const montoTotal = getNumericValue(form.watch('amount') || '0');
              const porcentaje = Number(field.value) || 0;
              const montoCalculado = (montoTotal * porcentaje) / 100;
              
              return (
                <FormItem>
                  <FormLabel>Porcentaje de Garantía (%)</FormLabel>
                  <FormControl>
                    <Input 
                      {...field} 
                      type="number" 
                      placeholder="Ej: 10" 
                      min="0" 
                      max="100" 
                      step="0.1" 
                    />
                  </FormControl>
                  {montoTotal > 0 && porcentaje > 0 && (
                    <div className="text-sm text-gray-600 mt-1 p-2 bg-gray-50 rounded">
                      <span className="font-medium">Monto de garantía: </span>
                      <span className="text-blue-600 font-semibold">
                        ${montoCalculado.toLocaleString('es-CO')} COP
                      </span>
                    </div>
                  )}
                  <FormMessage />
                </FormItem>
              );
            }}
          />
        </div>

        <FormField
          control={form.control}
          name="reservasFinancieras"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Reservas Financieras</FormLabel>
              <FormControl>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 font-medium">
                    $
                  </span>
                  <Input 
                    value={field.value ? formatNumber(field.value) : ''}
                    type="text" 
                    placeholder="300,000" 
                    className="pl-8 pr-12"
                    onChange={(e) => {
                      const numericValue = e.target.value.replace(/[^\d]/g, '');
                      field.onChange(numericValue);
                    }}
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">
                    COP
                  </span>
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <div className="flex justify-end space-x-2 pt-4">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancelar
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Creando...' : 'Crear Presupuesto'}
          </Button>
        </div>
      </form>
    </Form>
  );
}