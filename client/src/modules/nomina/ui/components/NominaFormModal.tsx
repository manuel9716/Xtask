import React, { useEffect, useState } from 'react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { CalendarIcon, CreditCard, Loader2, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
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
import { Textarea } from '@/components/ui/textarea';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useToast } from '@/hooks/use-toast';

import { useEmpleadosNomina } from '@/modules/nomina/application/useEmpleadosNomina';
import { Employee } from '@shared/schema';
import { EmpleadoSelector } from './EmpleadoSelector';
import { ResumenNomina } from './ResumenNomina';
import { calcularTotalesNomina, ResultadoCalculoNomina } from '../../domain/services/calculadoraNomina';
import { CrearNominaParams } from '@/modules/nomina/application/useCrearNomina';

// Tipo para empleado con cálculos de nómina
export interface EmpleadoConCalculos extends Employee {
  calculosNomina: ResultadoCalculoNomina;
}

// Schema para validación del formulario
const nominaFormSchema = z.object({
  periodoInicio: z.date({
    required_error: "La fecha de inicio del periodo es requerida",
  }),
  periodoFin: z.date({
    required_error: "La fecha de fin del periodo es requerida",
  }).refine(
    (fecha, ctx) => {
      const { periodoInicio } = ctx.parent;
      return fecha > periodoInicio;
    },
    {
      message: "La fecha de fin debe ser posterior a la fecha de inicio",
    }
  ),
  fechaPago: z.date({
    required_error: "La fecha de pago es requerida",
  }).refine(
    (fecha, ctx) => {
      const { periodoFin } = ctx.parent;
      return fecha >= periodoFin;
    },
    {
      message: "La fecha de pago debe ser igual o posterior a la fecha de fin",
    }
  ),
  metodoPago: z.string({
    required_error: "El método de pago es requerido",
  }),
  comentarios: z.string().optional(),
});

// Tipo para props del componente
interface NominaFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CrearNominaParams) => void;
  isPending?: boolean;
}

export function NominaFormModal({
  isOpen,
  onClose,
  onSubmit,
  isPending = false,
}: NominaFormModalProps) {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("empleados");
  const [selectedEmpleadosIds, setSelectedEmpleadosIds] = useState<number[]>([]);
  const [empleadosConCalculos, setEmpleadosConCalculos] = useState<EmpleadoConCalculos[]>([]);
  
  // Obtener empleados
  const { empleados, isLoading, error } = useEmpleadosNomina();
  
  // Formulario
  const form = useForm<z.infer<typeof nominaFormSchema>>({
    resolver: zodResolver(nominaFormSchema),
    defaultValues: {
      periodoInicio: new Date(),
      periodoFin: new Date(new Date().setDate(new Date().getDate() + 15)), // 15 días después
      fechaPago: new Date(new Date().setDate(new Date().getDate() + 15)), // 15 días después
      metodoPago: "TRANSFERENCIA",
      comentarios: "",
    },
  });
  
  // Calcular nóminas de empleados seleccionados
  useEffect(() => {
    if (!empleados) return;
    
    const empleadosCalculados = empleados
      .filter(empleado => selectedEmpleadosIds.includes(empleado.id))
      .map(empleado => {
        const salarioBase = empleado.salary ? parseFloat(empleado.salary) : 0;
        
        return {
          ...empleado,
          calculosNomina: calcularTotalesNomina(salarioBase)
        };
      });
    
    setEmpleadosConCalculos(empleadosCalculados);
  }, [selectedEmpleadosIds, empleados]);
  
  // Método de envío del formulario
  const handleSubmit = form.handleSubmit((data) => {
    // Verificar que hay empleados seleccionados
    if (selectedEmpleadosIds.length === 0) {
      toast({
        title: "Error en el formulario",
        description: "Debe seleccionar al menos un empleado para crear la nómina",
        variant: "destructive",
      });
      setActiveTab("empleados");
      return;
    }
    
    // Preparar datos para enviar
    const submitData: CrearNominaParams = {
      ...data,
      empleadosIds: selectedEmpleadosIds,
      empleadosCalculados: empleadosConCalculos,
    };
    
    onSubmit(submitData);
  });
  
  // Manejar errores en la carga de empleados
  useEffect(() => {
    if (error) {
      toast({
        title: "Error al cargar empleados",
        description: error.message,
        variant: "destructive",
      });
    }
  }, [error, toast]);
  
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[900px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Crear Nueva Nómina</DialogTitle>
          <DialogDescription>
            Complete el formulario para crear una nueva nómina para los empleados seleccionados.
          </DialogDescription>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={handleSubmit} className="space-y-8">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="empleados">
                  <Users className="mr-2 h-4 w-4" />
                  Seleccionar Empleados
                </TabsTrigger>
                <TabsTrigger value="periodo">
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  Periodo y Pago
                </TabsTrigger>
                <TabsTrigger value="resumen">
                  <CreditCard className="mr-2 h-4 w-4" />
                  Resumen de Nómina
                </TabsTrigger>
              </TabsList>
              
              {/* Tab de selección de empleados */}
              <TabsContent value="empleados" className="space-y-4 py-4">
                <Card>
                  <CardContent className="pt-6">
                    <p className="text-sm text-muted-foreground mb-4">
                      Seleccione los empleados a incluir en esta nómina. Solo se muestran empleados activos.
                    </p>
                    
                    <EmpleadoSelector
                      empleados={empleados || []}
                      selectedIds={selectedEmpleadosIds}
                      onChange={setSelectedEmpleadosIds}
                      isLoading={isLoading}
                    />
                  </CardContent>
                </Card>
                
                <div className="flex justify-end">
                  <Button 
                    type="button" 
                    onClick={() => setActiveTab("periodo")}
                    disabled={selectedEmpleadosIds.length === 0}
                  >
                    Continuar
                  </Button>
                </div>
              </TabsContent>
              
              {/* Tab de configuración de periodo */}
              <TabsContent value="periodo" className="space-y-4 py-4">
                <div className="grid gap-6 grid-cols-1 md:grid-cols-2">
                  {/* Periodo de nómina */}
                  <div className="space-y-4">
                    <FormField
                      control={form.control}
                      name="periodoInicio"
                      render={({ field }) => (
                        <FormItem className="flex flex-col">
                          <FormLabel>Fecha Inicio del Periodo</FormLabel>
                          <Popover>
                            <PopoverTrigger asChild>
                              <FormControl>
                                <Button
                                  variant={"outline"}
                                  className={cn(
                                    "w-full pl-3 text-left font-normal",
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
                                  date < new Date(new Date().setDate(new Date().getDate() - 60))
                                }
                                initialFocus
                              />
                            </PopoverContent>
                          </Popover>
                          <FormDescription>
                            Fecha de inicio del periodo de nómina
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="periodoFin"
                      render={({ field }) => (
                        <FormItem className="flex flex-col">
                          <FormLabel>Fecha Fin del Periodo</FormLabel>
                          <Popover>
                            <PopoverTrigger asChild>
                              <FormControl>
                                <Button
                                  variant={"outline"}
                                  className={cn(
                                    "w-full pl-3 text-left font-normal",
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
                                  date < form.getValues("periodoInicio")
                                }
                                initialFocus
                              />
                            </PopoverContent>
                          </Popover>
                          <FormDescription>
                            Fecha de fin del periodo de nómina
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  {/* Información de pago */}
                  <div className="space-y-4">
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
                                  variant={"outline"}
                                  className={cn(
                                    "w-full pl-3 text-left font-normal",
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
                                  date < form.getValues("periodoFin")
                                }
                                initialFocus
                              />
                            </PopoverContent>
                          </Popover>
                          <FormDescription>
                            Fecha en que se realizará el pago
                          </FormDescription>
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
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
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
                          <FormDescription>
                            Método de pago para esta nómina
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
                
                <FormField
                  control={form.control}
                  name="comentarios"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Comentarios (Opcional)</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Información adicional sobre esta nómina..."
                          className="resize-none h-20"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        Comentarios internos sobre el proceso de nómina
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="flex justify-between">
                  <Button type="button" variant="outline" onClick={() => setActiveTab("empleados")}>
                    Volver
                  </Button>
                  <Button type="button" onClick={() => setActiveTab("resumen")}>
                    Continuar
                  </Button>
                </div>
              </TabsContent>
              
              {/* Tab de resumen */}
              <TabsContent value="resumen" className="space-y-4 py-4">
                <Card>
                  <CardContent className="pt-6 space-y-6">
                    <h3 className="text-lg font-medium">Resumen de la Nómina</h3>
                    
                    <div className="space-y-2">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">Periodo:</p>
                          <p className="font-medium">
                            {form.getValues("periodoInicio") && form.getValues("periodoFin")
                              ? `${format(form.getValues("periodoInicio"), "dd/MM/yyyy")} - ${format(form.getValues("periodoFin"), "dd/MM/yyyy")}`
                              : "No especificado"}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">Fecha de Pago:</p>
                          <p className="font-medium">
                            {form.getValues("fechaPago")
                              ? format(form.getValues("fechaPago"), "dd/MM/yyyy")
                              : "No especificada"}
                          </p>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">Método de Pago:</p>
                          <p className="font-medium">
                            {form.getValues("metodoPago") === "TRANSFERENCIA" && "Transferencia Bancaria"}
                            {form.getValues("metodoPago") === "CHEQUE" && "Cheque"}
                            {form.getValues("metodoPago") === "EFECTIVO" && "Efectivo"}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">Empleados Incluidos:</p>
                          <p className="font-medium">{selectedEmpleadosIds.length}</p>
                        </div>
                      </div>
                    </div>
                    
                    <Separator />
                    
                    <ResumenNomina empleados={empleadosConCalculos} />
                  </CardContent>
                </Card>
                
                <div className="flex justify-between">
                  <Button type="button" variant="outline" onClick={() => setActiveTab("periodo")}>
                    Volver
                  </Button>
                  <Button type="submit" disabled={isPending}>
                    {isPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Creando...
                      </>
                    ) : (
                      "Crear Nómina"
                    )}
                  </Button>
                </div>
              </TabsContent>
            </Tabs>
          </form>
        </Form>
        
        <DialogFooter className="flex sm:justify-between justify-end">
          <Button
            type="button"
            variant="ghost"
            onClick={onClose}
            className="hidden sm:inline-flex"
          >
            Cancelar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}