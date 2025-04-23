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
      endDate: new Date(new Date().setMonth(new Date().getMonth() + 1)), // Un mes en el futuro
      area: 'General',
      description: ''
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
        createdBy: 1,  // Usuario por defecto
        organizationId: 1 // Organización por defecto
      };
      
      await crearPresupuesto(presupuestoData);
      onSuccess();
    } catch (error) {
      console.error('Error al crear presupuesto:', error);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nombre del presupuesto</FormLabel>
              <FormControl>
                <Input {...field} placeholder="Ej: Presupuesto Q2 Marketing 2025" />
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
                <Input {...field} type="number" placeholder="Ej: 10000" min="1" step="0.01" />
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
                        className={cn("w-full pl-3 text-left font-normal", !field.value && "text-muted-foreground")}
                      >
                        {field.value ? format(field.value, "PP") : <span>Seleccionar fecha</span>}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={field.value}
                      onSelect={field.onChange}
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
                        className={cn("w-full pl-3 text-left font-normal", !field.value && "text-muted-foreground")}
                      >
                        {field.value ? format(field.value, "PP") : <span>Seleccionar fecha</span>}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={field.value}
                      onSelect={field.onChange}
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
                    <SelectValue placeholder="Selecciona un área" />
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