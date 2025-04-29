import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent } from "@/components/ui/card";
import { CalendarIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { MetodoPago } from '../../domain/entities/Nomina';
import { useEmpleadosNomina } from '../../application/useEmpleadosNomina';
import { EmpleadoSelector } from './EmpleadoSelector';
import { ResumenNomina } from './ResumenNomina';
import { calcularTotalesNomina } from '../../domain/services/calculadoraNomina';
import { Employee } from '@shared/schema';

// Esquema de validación para el formulario
const formSchema = z.object({
  periodoInicio: z.date({
    required_error: "La fecha de inicio es requerida",
  }),
  periodoFin: z.date({
    required_error: "La fecha de fin es requerida",
  }),
  fechaPago: z.date({
    required_error: "La fecha de pago es requerida",
  }),
  metodoPago: z.string({
    required_error: "El método de pago es requerido",
  }),
  empleadosIds: z.array(z.number()).min(1, "Debe seleccionar al menos un empleado"),
  comentarios: z.string().optional(),
}).refine(data => data.periodoFin >= data.periodoInicio, {
  message: "La fecha de fin debe ser posterior o igual a la fecha de inicio",
  path: ["periodoFin"],
}).refine(data => data.fechaPago >= data.periodoFin, {
  message: "La fecha de pago debe ser posterior o igual a la fecha fin del periodo",
  path: ["fechaPago"],
});

// Tipo para la estructura de la nómina calculada
export interface EmpleadoConCalculos extends Employee {
  calculosNomina: {
    salarioBase: number;
    salarioBruto: number;
    retencionFiscal: number;
    seguridadSocial: number;
    otrasDeduciones: number;
    salarioNeto: number;
  };
}

// Tipo para los props del componente
interface NominaFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: z.infer<typeof formSchema> & { empleadosCalculados: EmpleadoConCalculos[] }) => void;
  isPending?: boolean;
}

export function NominaFormModal({ isOpen, onClose, onSubmit, isPending = false }: NominaFormModalProps) {
  // Obtener empleados activos
  const { empleados, isLoading: cargandoEmpleados } = useEmpleadosNomina();
  
  // Estado para empleados seleccionados con cálculos
  const [empleadosCalculados, setEmpleadosCalculados] = useState<EmpleadoConCalculos[]>([]);
  
  // Inicializar formulario con valores por defecto
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      periodoInicio: new Date(),
      periodoFin: new Date(new Date().setDate(new Date().getDate() + 30)), // 30 días después
      fechaPago: new Date(new Date().setDate(new Date().getDate() + 35)), // 35 días después
      metodoPago: MetodoPago.TRANSFERENCIA,
      empleadosIds: [],
      comentarios: '',
    },
  });

  // Escuchar cambios en los empleados seleccionados
  const empleadosIds = form.watch('empleadosIds');
  
  // Actualizar cálculos cuando cambia la selección de empleados
  useEffect(() => {
    if (empleadosIds.length > 0 && empleados.length > 0) {
      // Filtrar empleados seleccionados
      const empleadosSeleccionados = empleados.filter(emp => empleadosIds.includes(emp.id));
      
      // Calcular totales para cada empleado
      const calculados = empleadosSeleccionados.map(empleado => {
        // Usar el salario base del empleado o un valor por defecto
        const salarioBase = parseFloat(empleado.salary || '0');
        const calculos = calcularTotalesNomina(salarioBase);
        
        return {
          ...empleado,
          calculosNomina: calculos
        };
      });
      
      setEmpleadosCalculados(calculados);
    } else {
      setEmpleadosCalculados([]);
    }
  }, [empleadosIds, empleados]);

  // Manejar envío del formulario
  const handleSubmit = (values: z.infer<typeof formSchema>) => {
    onSubmit({
      ...values,
      empleadosCalculados
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Crear Nueva Nómina</DialogTitle>
          <DialogDescription>
            Complete los detalles para generar una nueva nómina para el período seleccionado.
          </DialogDescription>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Período de inicio */}
              <FormField
                control={form.control}
                name="periodoInicio"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Fecha de inicio</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant={"outline"}
                            className={cn(
                              "pl-3 text-left font-normal",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            {field.value ? (
                              format(field.value, "PPP", { locale: es })
                            ) : (
                              <span>Seleccione una fecha</span>
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
                          locale={es}
                        />
                      </PopoverContent>
                    </Popover>
                    <FormDescription>
                      Fecha de inicio del período de nómina
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Período de fin */}
              <FormField
                control={form.control}
                name="periodoFin"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Fecha de fin</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant={"outline"}
                            className={cn(
                              "pl-3 text-left font-normal",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            {field.value ? (
                              format(field.value, "PPP", { locale: es })
                            ) : (
                              <span>Seleccione una fecha</span>
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
                          locale={es}
                        />
                      </PopoverContent>
                    </Popover>
                    <FormDescription>
                      Fecha de fin del período de nómina
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              {/* Fecha de pago */}
              <FormField
                control={form.control}
                name="fechaPago"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Fecha de pago</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant={"outline"}
                            className={cn(
                              "pl-3 text-left font-normal",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            {field.value ? (
                              format(field.value, "PPP", { locale: es })
                            ) : (
                              <span>Seleccione una fecha</span>
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
                          locale={es}
                        />
                      </PopoverContent>
                    </Popover>
                    <FormDescription>
                      Fecha programada para el pago
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            {/* Método de pago */}
            <FormField
              control={form.control}
              name="metodoPago"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Método de pago</FormLabel>
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
                      <SelectItem value={MetodoPago.TRANSFERENCIA}>Transferencia bancaria</SelectItem>
                      <SelectItem value={MetodoPago.CHEQUE}>Cheque</SelectItem>
                      <SelectItem value={MetodoPago.EFECTIVO}>Efectivo</SelectItem>
                      <SelectItem value={MetodoPago.ELECTRONICO}>Pago electrónico</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    Método que se utilizará para realizar los pagos
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <Separator />
            
            {/* Selección de empleados */}
            <Card>
              <CardContent className="pt-6">
                <FormField
                  control={form.control}
                  name="empleadosIds"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Seleccione los empleados a incluir</FormLabel>
                      <FormControl>
                        <EmpleadoSelector 
                          empleados={empleados}
                          selectedIds={field.value}
                          onChange={field.onChange}
                          isLoading={cargandoEmpleados}
                        />
                      </FormControl>
                      <FormDescription>
                        Marque los empleados que desea incluir en esta nómina
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>
            
            {/* Resumen de cálculos */}
            {empleadosCalculados.length > 0 && (
              <ResumenNomina empleados={empleadosCalculados} />
            )}
            
            <DialogFooter>
              <Button 
                type="button" 
                variant="outline" 
                onClick={onClose}
                disabled={isPending}
              >
                Cancelar
              </Button>
              <Button 
                type="submit"
                disabled={isPending}
              >
                {isPending ? (
                  <>
                    <div className="animate-spin w-4 h-4 mr-2 border-2 border-white border-t-transparent rounded-full"></div>
                    Procesando...
                  </>
                ) : (
                  'Crear nómina'
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}