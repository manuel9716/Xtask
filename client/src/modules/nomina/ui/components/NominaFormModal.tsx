import React, { useState, useEffect } from 'react';
import { z } from 'zod';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { CalendarIcon, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Employee } from '@shared/schema';
import { Separator } from '@/components/ui/separator';

import { EmpleadoSelector } from './EmpleadoSelector';
import { ResumenNomina } from './ResumenNomina';
import { calcularNominaEmpleado, calcularTotalNomina, ResultadoCalculoNomina } from '../../domain/services/calculadoraNomina';
import { useEmpleadosNomina } from '../../application/useEmpleadosNomina';
import { EmpleadoConCalculos, useCrearNomina } from '../../application/useCrearNomina';

// Esquema de validación para el formulario
const formSchema = z.object({
  periodoInicio: z.date({
    required_error: "La fecha de inicio del periodo es obligatoria",
  }).refine((fecha) => {
    return fecha <= new Date();
  }, "La fecha de inicio del periodo no puede ser futura"),
  
  periodoFin: z.date({
    required_error: "La fecha de fin del periodo es obligatoria",
  }).refine((fecha) => {
    return fecha <= new Date();
  }, "La fecha de fin del periodo no puede ser futura"),
  
  fechaPago: z.date({
    required_error: "La fecha de pago es obligatoria",
  }),
  
  metodoPago: z.string({
    required_error: "El método de pago es obligatorio",
  }),
  
  comentarios: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface NominaFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function NominaFormModal({ open, onOpenChange }: NominaFormModalProps) {
  const [activeTab, setActiveTab] = useState('empleados');
  const [selectedEmpleadosIds, setSelectedEmpleadosIds] = useState<number[]>([]);
  const [empleadosCalculados, setEmpleadosCalculados] = useState<EmpleadoConCalculos[]>([]);
  
  // Consultar empleados
  const empleadosQuery = useEmpleadosNomina();
  
  // Mutación para crear nómina
  const crearNominaMutation = useCrearNomina();
  
  // Configuración del formulario
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      periodoInicio: new Date(new Date().getFullYear(), new Date().getMonth(), 1), // 1ro del mes actual
      periodoFin: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0), // Último día del mes actual
      fechaPago: new Date(new Date().getFullYear(), new Date().getMonth(), 15), // Día 15 del mes actual
      metodoPago: 'TRANSFERENCIA',
      comentarios: '',
    },
  });
  
  // Calcular nóminas cuando cambia la selección de empleados
  useEffect(() => {
    if (empleadosQuery.data?.data) {
      const nuevosCalculos = selectedEmpleadosIds.map(id => {
        const empleado = empleadosQuery.data.data.find(e => e.id === id);
        if (!empleado) return null;
        
        const calculo = calcularNominaEmpleado(empleado);
        return { empleado, calculo };
      }).filter(Boolean) as EmpleadoConCalculos[];
      
      setEmpleadosCalculados(nuevosCalculos);
    }
  }, [selectedEmpleadosIds, empleadosQuery.data]);
  
  // Calcular totales
  const totalesNomina = calcularTotalNomina(empleadosCalculados.map(ec => ec.calculo));
  
  // Función para enviar el formulario
  const onSubmit = (values: FormValues) => {
    if (selectedEmpleadosIds.length === 0) {
      form.setError('root', {
        type: 'manual',
        message: 'Debe seleccionar al menos un empleado'
      });
      setActiveTab('empleados');
      return;
    }
    
    crearNominaMutation.mutate({
      empleadosIds: selectedEmpleadosIds,
      empleadosCalculados,
      periodoInicio: values.periodoInicio,
      periodoFin: values.periodoFin,
      fechaPago: values.fechaPago,
      metodoPago: values.metodoPago,
      comentarios: values.comentarios
    }, {
      onSuccess: () => {
        onOpenChange(false);
        // Limpiar el estado
        setSelectedEmpleadosIds([]);
        setEmpleadosCalculados([]);
        setActiveTab('empleados');
        form.reset();
      }
    });
  };
  
  // Cerrar el modal y resetear estado
  const handleClose = () => {
    if (!crearNominaMutation.isPending) {
      onOpenChange(false);
      // Limpiar el estado
      setSelectedEmpleadosIds([]);
      setEmpleadosCalculados([]);
      setActiveTab('empleados');
      form.reset();
    }
  };
  
  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>Crear Nueva Nómina</DialogTitle>
          <DialogDescription>
            Seleccione empleados y configure los detalles de la nómina a procesar.
          </DialogDescription>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="empleados">1. Seleccionar Empleados</TabsTrigger>
                <TabsTrigger value="detalles" disabled={selectedEmpleadosIds.length === 0}>
                  2. Configurar Detalles
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="empleados" className="space-y-4">
                <EmpleadoSelector 
                  empleados={empleadosQuery.data?.data || []} 
                  selectedIds={selectedEmpleadosIds}
                  onChange={setSelectedEmpleadosIds}
                  isLoading={empleadosQuery.isLoading}
                />
                
                <div className="pt-4">
                  <Button
                    type="button"
                    onClick={() => setActiveTab('detalles')}
                    disabled={selectedEmpleadosIds.length === 0}
                  >
                    Continuar
                  </Button>
                </div>
              </TabsContent>
              
              <TabsContent value="detalles" className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-4">
                    {/* Periodo de Nómina */}
                    <div>
                      <h3 className="font-medium mb-2">Período de Nómina</h3>
                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="periodoInicio"
                          render={({ field }) => (
                            <FormItem className="flex flex-col">
                              <FormLabel>Fecha Inicio</FormLabel>
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
                                        <span>Seleccione fecha</span>
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
                          name="periodoFin"
                          render={({ field }) => (
                            <FormItem className="flex flex-col">
                              <FormLabel>Fecha Fin</FormLabel>
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
                                        <span>Seleccione fecha</span>
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
                                    initialFocus
                                  />
                                </PopoverContent>
                              </Popover>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>
                    
                    {/* Información de Pago */}
                    <div>
                      <h3 className="font-medium mb-2">Información de Pago</h3>
                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="fechaPago"
                          render={({ field }) => (
                            <FormItem className="flex flex-col">
                              <FormLabel>Fecha de Pago</FormLabel>
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
                                        <span>Seleccione fecha</span>
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
                          name="metodoPago"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Método de Pago</FormLabel>
                              <Select
                                onValueChange={field.onChange}
                                defaultValue={field.value}
                              >
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Seleccione un método de pago" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="TRANSFERENCIA">Transferencia Bancaria</SelectItem>
                                  <SelectItem value="CHEQUE">Cheque</SelectItem>
                                  <SelectItem value="EFECTIVO">Efectivo</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>
                    
                    {/* Comentarios */}
                    <FormField
                      control={form.control}
                      name="comentarios"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Comentarios (Opcional)</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Añada comentarios o notas adicionales sobre esta nómina..."
                              {...field}
                              rows={3}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  {/* Resumen de Nómina */}
                  <div>
                    <ResumenNomina 
                      totales={totalesNomina}
                      cantidadEmpleados={selectedEmpleadosIds.length}
                    />
                  </div>
                </div>
                
                <Separator className="my-4" />
                
                {/* Error general */}
                {form.formState.errors.root && (
                  <div className="text-destructive text-sm">
                    {form.formState.errors.root.message}
                  </div>
                )}
                
                <DialogFooter className="flex justify-between">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setActiveTab('empleados')}
                  >
                    Volver
                  </Button>
                  <div className="space-x-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleClose}
                      disabled={crearNominaMutation.isPending}
                    >
                      Cancelar
                    </Button>
                    <Button 
                      type="submit"
                      disabled={crearNominaMutation.isPending || selectedEmpleadosIds.length === 0}
                    >
                      {crearNominaMutation.isPending && (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      )}
                      Crear Nómina
                    </Button>
                  </div>
                </DialogFooter>
              </TabsContent>
            </Tabs>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}