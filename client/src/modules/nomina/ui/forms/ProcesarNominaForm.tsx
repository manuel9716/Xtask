import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
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
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { CalendarIcon, CalculatorIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Calendar } from '@/components/ui/calendar';
import { Checkbox } from '@/components/ui/checkbox';
import { ProcesarNominaParams } from '../../domain/entities/Nomina';
import { useEmpleadosNomina } from '../../application/useEmpleadosNomina';
import { Separator } from '@/components/ui/separator';

// Validación del formulario con zod
const formSchema = z.object({
  periodoInicio: z.date({
    required_error: "La fecha de inicio es requerida",
  }),
  periodoFin: z.date({
    required_error: "La fecha de fin es requerida",
  }),
  empleadoIds: z.array(z.number()).optional(),
  todosLosEmpleados: z.boolean().default(true),
  descripcion: z.string().optional(),
  usuarioId: z.number().default(1), // Por ahora, usar ID fijo
}).refine(data => data.periodoFin >= data.periodoInicio, {
  message: "La fecha de fin debe ser posterior o igual a la fecha de inicio",
  path: ["periodoFin"],
}).refine(
  data => data.todosLosEmpleados || (data.empleadoIds && data.empleadoIds.length > 0),
  {
    message: "Debe seleccionar al menos un empleado si no elige todos",
    path: ["empleadoIds"],
  }
);

interface ProcesarNominaFormProps {
  onSubmit: (data: ProcesarNominaParams) => void;
  isPending: boolean;
}

export function ProcesarNominaForm({ onSubmit, isPending }: ProcesarNominaFormProps) {
  const { empleados, empleadosParaSelect, isLoading: cargandoEmpleados } = useEmpleadosNomina();
  
  // Inicializar el formulario
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      periodoInicio: new Date(),
      periodoFin: new Date(),
      todosLosEmpleados: true,
      empleadoIds: [],
      descripcion: '',
      usuarioId: 1,
    },
  });

  // Manejar el envío del formulario
  const handleSubmit = (values: z.infer<typeof formSchema>) => {
    // Construir el objeto de parámetros
    const params: ProcesarNominaParams = {
      periodoInicio: values.periodoInicio,
      periodoFin: values.periodoFin,
      usuarioId: values.usuarioId,
      descripcion: values.descripcion,
    };

    // Si no son todos los empleados, añadir los IDs seleccionados
    if (!values.todosLosEmpleados) {
      params.empleadoIds = values.empleadoIds;
    }

    onSubmit(params);
  };

  // Observar cambio en "todos los empleados"
  const todosLosEmpleados = form.watch('todosLosEmpleados');

  return (
    <Card>
      <CardHeader>
        <CardTitle>Procesar Nómina</CardTitle>
        <CardDescription>
          Complete los detalles para generar las nóminas del período seleccionado.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Fecha de inicio */}
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
                          disabled={(date) =>
                            date > new Date() || date < new Date("2000-01-01")
                          }
                          initialFocus
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

              {/* Fecha de fin */}
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
                          disabled={(date) =>
                            date > new Date() || date < new Date("2000-01-01")
                          }
                          initialFocus
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
            </div>

            <Separator />

            {/* Selección de empleados */}
            <div className="space-y-4">
              <FormField
                control={form.control}
                name="todosLosEmpleados"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>Procesar para todos los empleados</FormLabel>
                      <FormDescription>
                        Se procesará la nómina para todos los empleados activos en el sistema
                      </FormDescription>
                    </div>
                  </FormItem>
                )}
              />

              {!todosLosEmpleados && (
                <FormField
                  control={form.control}
                  name="empleadoIds"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Seleccionar empleados</FormLabel>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                        {cargandoEmpleados ? (
                          <div className="col-span-full flex justify-center py-4">
                            <div className="animate-spin w-6 h-6 border-2 border-primary border-t-transparent rounded-full"></div>
                          </div>
                        ) : (
                          empleados.map((empleado) => (
                            <FormField
                              key={empleado.id}
                              control={form.control}
                              name="empleadoIds"
                              render={({ field }) => (
                                <FormItem
                                  key={empleado.id}
                                  className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-2"
                                >
                                  <FormControl>
                                    <Checkbox
                                      checked={field.value?.includes(empleado.id)}
                                      onCheckedChange={(checked) => {
                                        const currentValue = field.value || [];
                                        return checked
                                          ? field.onChange([...currentValue, empleado.id])
                                          : field.onChange(
                                              currentValue.filter(
                                                (value) => value !== empleado.id
                                              )
                                            );
                                      }}
                                    />
                                  </FormControl>
                                  <FormLabel className="font-normal">
                                    {empleado.nombre || `Empleado #${empleado.id}`}
                                  </FormLabel>
                                </FormItem>
                              )}
                            />
                          ))
                        )}
                      </div>
                      <FormDescription>
                        Seleccione los empleados para los que desea procesar la nómina
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
            </div>

            {/* Descripción */}
            <FormField
              control={form.control}
              name="descripcion"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descripción (opcional)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Ingrese una descripción para esta nómina"
                      className="resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Una nota o descripción para identificar este proceso de nómina
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button 
              type="submit" 
              className="w-full"
              disabled={isPending}
            >
              {isPending ? (
                <>
                  <div className="animate-spin w-4 h-4 mr-2 border-2 border-white border-t-transparent rounded-full"></div>
                  Procesando...
                </>
              ) : (
                <>
                  <CalculatorIcon className="mr-2 h-4 w-4" />
                  Procesar Nómina
                </>
              )}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}