import { useState } from "react";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle,
  DialogClose
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useCrearProyecto } from "../../application/useCases/crearProyecto";
import { CrearProyectoDTO, EstadoProyecto } from "../../domain/entities/Proyecto";
import { Loader2 } from "lucide-react";
import { 
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";

// Schema de validación para el formulario
const crearProyectoSchema = z.object({
  nombre: z
    .string()
    .min(3, { message: "El nombre debe tener al menos 3 caracteres" })
    .max(100, { message: "El nombre debe tener menos de 100 caracteres" }),
  descripcion: z
    .string()
    .min(10, { message: "La descripción debe tener al menos 10 caracteres" })
    .max(1000, { message: "La descripción debe tener menos de 1000 caracteres" }),
  estado: z
    .nativeEnum(EstadoProyecto, { 
      required_error: "El estado es requerido",
      invalid_type_error: "Estado no válido" 
    }),
  fechaInicio: z
    .date({ required_error: "La fecha de inicio es requerida" }),
  fechaFin: z
    .date()
    .nullable()
    .optional(),
  presupuesto: z
    .number({ 
      required_error: "El presupuesto es requerido",
      invalid_type_error: "El presupuesto debe ser un número", 
    })
    .min(0, { message: "El presupuesto no puede ser negativo" }),
  responsableId: z
    .number({ 
      invalid_type_error: "El ID del responsable debe ser un número", 
    })
    .int({ message: "El ID del responsable debe ser un número entero" })
    .positive({ message: "El ID del responsable debe ser positivo" })
    .optional()
    .nullable(),
  departamentoId: z
    .number({ invalid_type_error: "El ID del departamento debe ser un número" })
    .int({ message: "El ID del departamento debe ser un número entero" })
    .positive({ message: "El ID del departamento debe ser positivo" })
    .optional()
    .nullable(),
});

// Tipo inferido del schema
type CrearProyectoFormValues = z.infer<typeof crearProyectoSchema>;

interface ModalCrearProyectoProps {
  abierto: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ModalCrearProyecto({ abierto, onOpenChange }: ModalCrearProyectoProps) {
  const { toast } = useToast();
  const crearProyectoMutation = useCrearProyecto();
  
  // Inicializar el formulario
  const form = useForm<CrearProyectoFormValues>({
    resolver: zodResolver(crearProyectoSchema),
    defaultValues: {
      nombre: "",
      descripcion: "",
      estado: EstadoProyecto.ACTIVO,
      fechaInicio: new Date(),
      fechaFin: null,
      presupuesto: 0,
      responsableId: null,
      departamentoId: null,
    },
  });
  
  const onSubmit = (values: CrearProyectoFormValues) => {
    // Mapear los valores del formulario al DTO
    const proyectoDTO: CrearProyectoDTO = {
      nombre: values.nombre,
      descripcion: values.descripcion,
      presupuesto: values.presupuesto,
      fechaInicio: values.fechaInicio,
      fechaFin: values.fechaFin || undefined,
      responsableId: values.responsableId || undefined,
      departamentoId: values.departamentoId || undefined,
    };
    
    crearProyectoMutation.mutate(proyectoDTO, {
      onSuccess: () => {
        toast({
          title: "Proyecto creado",
          description: "El proyecto ha sido creado exitosamente",
        });
        form.reset(); // Resetear el formulario
        onOpenChange(false); // Cerrar el modal
      },
      onError: (error) => {
        toast({
          title: "Error al crear el proyecto",
          description: error.message,
          variant: "destructive",
        });
      },
    });
  };
  
  return (
    <Dialog open={abierto} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Crear Nuevo Proyecto</DialogTitle>
          <DialogDescription>
            Complete los detalles para el nuevo proyecto. Los campos marcados con * son obligatorios.
          </DialogDescription>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Nombre del proyecto */}
              <FormField
                control={form.control}
                name="nombre"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nombre del proyecto *</FormLabel>
                    <FormControl>
                      <Input placeholder="Nombre del proyecto" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              {/* Estado inicial */}
              <FormField
                control={form.control}
                name="estado"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Estado inicial *</FormLabel>
                    <Select 
                      onValueChange={value => field.onChange(value as EstadoProyecto)}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccionar estado" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value={EstadoProyecto.ACTIVO}>Activo</SelectItem>
                        <SelectItem value={EstadoProyecto.PAUSADO}>Pausado</SelectItem>
                        <SelectItem value={EstadoProyecto.RETRASADO}>Retrasado</SelectItem>
                        <SelectItem value={EstadoProyecto.FINALIZADO}>Finalizado</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              {/* Fecha de inicio */}
              <FormField
                control={form.control}
                name="fechaInicio"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Fecha de inicio *</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            className="w-full pl-3 text-left font-normal"
                          >
                            {field.value ? (
                              format(field.value, "dd/MM/yyyy", { locale: es })
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
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              {/* Fecha estimada de fin */}
              <FormField
                control={form.control}
                name="fechaFin"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Fecha estimada de fin</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            className="w-full pl-3 text-left font-normal"
                          >
                            {field.value ? (
                              format(field.value, "dd/MM/yyyy", { locale: es })
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
                          selected={field.value || undefined}
                          onSelect={field.onChange}
                          disabled={(date) => date < form.getValues("fechaInicio")}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              {/* Presupuesto */}
              <FormField
                control={form.control}
                name="presupuesto"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Presupuesto *</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        placeholder="0.00" 
                        {...field} 
                        onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              {/* Responsable */}
              <FormField
                control={form.control}
                name="responsableId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>ID del responsable</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        placeholder="ID del responsable" 
                        {...field} 
                        value={field.value || ""}
                        onChange={(e) => {
                          const value = e.target.value;
                          field.onChange(value ? parseInt(value) : null);
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              {/* Departamento */}
              <FormField
                control={form.control}
                name="departamentoId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>ID del departamento</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        placeholder="ID del departamento" 
                        {...field} 
                        value={field.value || ""}
                        onChange={(e) => {
                          const value = e.target.value;
                          field.onChange(value ? parseInt(value) : null);
                        }}
                      />
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
                  <FormLabel>Descripción *</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Descripción detallada del proyecto" 
                      className="resize-none" 
                      rows={4}
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <DialogFooter className="gap-2 sm:gap-0">
              <DialogClose asChild>
                <Button type="button" variant="outline">
                  Cancelar
                </Button>
              </DialogClose>
              <Button type="submit" disabled={crearProyectoMutation.isPending}>
                {crearProyectoMutation.isPending && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Guardar proyecto
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}