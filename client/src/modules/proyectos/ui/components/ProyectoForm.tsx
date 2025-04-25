import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ActualizarProyectoDTO, CrearProyectoDTO, EstadoProyecto, Proyecto } from "../../domain/entities/Proyecto";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { CalendarIcon, Loader2 } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { useCrearProyecto } from "../../application/useCases/crearProyecto";
import { useActualizarProyecto } from "../../application/useCases/actualizarProyecto";
import { Badge } from "@/components/ui/badge";
import { X } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

// Schema para validación del formulario
const proyectoSchema = z.object({
  nombre: z
    .string()
    .min(3, { message: "El nombre debe tener al menos 3 caracteres" })
    .max(100, { message: "El nombre debe tener menos de 100 caracteres" }),
  descripcion: z
    .string()
    .min(10, { message: "La descripción debe tener al menos 10 caracteres" })
    .max(1000, { message: "La descripción debe tener menos de 1000 caracteres" }),
  fechaInicio: z
    .date({ required_error: "La fecha de inicio es requerida" }),
  fechaFinPrevista: z
    .date()
    .nullable()
    .optional(),
  fechaFinReal: z
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
      required_error: "El ID del responsable es requerido",
      invalid_type_error: "El ID del responsable debe ser un número", 
    })
    .int({ message: "El ID del responsable debe ser un número entero" })
    .positive({ message: "El ID del responsable debe ser positivo" }),
  clienteId: z
    .number({ invalid_type_error: "El ID del cliente debe ser un número" })
    .int({ message: "El ID del cliente debe ser un número entero" })
    .positive({ message: "El ID del cliente debe ser positivo" })
    .nullable()
    .optional(),
  tags: z
    .array(z.string())
    .optional(),
  estado: z
    .nativeEnum(EstadoProyecto)
    .optional(),
});

// Tipo inferido del schema
type ProyectoFormValues = z.infer<typeof proyectoSchema>;

interface ProyectoFormProps {
  proyecto?: Proyecto;
  onSuccess: () => void;
}

export function ProyectoForm({ proyecto, onSuccess }: ProyectoFormProps) {
  const [tagInput, setTagInput] = useState("");
  const [isEditing] = useState(!!proyecto);
  
  // Hooks para crear/actualizar proyectos
  const crearProyectoMutation = useCrearProyecto();
  const actualizarProyectoMutation = useActualizarProyecto(proyecto?.id || 0);
  
  const isCreating = crearProyectoMutation.isPending;
  const isUpdating = actualizarProyectoMutation.isPending;
  const createError = crearProyectoMutation.error;
  const updateError = actualizarProyectoMutation.error;
  
  // Inicializar el formulario
  const form = useForm<ProyectoFormValues>({
    resolver: zodResolver(proyectoSchema),
    defaultValues: {
      nombre: "",
      descripcion: "",
      fechaInicio: new Date(),
      fechaFinPrevista: null,
      fechaFinReal: null,
      presupuesto: 0,
      responsableId: 0,
      clienteId: null,
      tags: [],
      estado: EstadoProyecto.ACTIVO,
    },
  });
  
  // Llenar el formulario con datos del proyecto si estamos editando
  useEffect(() => {
    if (proyecto) {
      const values: ProyectoFormValues = {
        nombre: proyecto.nombre,
        descripcion: proyecto.descripcion,
        fechaInicio: new Date(proyecto.fechaInicio),
        fechaFinPrevista: proyecto.fechaFinPrevista ? new Date(proyecto.fechaFinPrevista) : null,
        fechaFinReal: proyecto.fechaFinReal ? new Date(proyecto.fechaFinReal) : null,
        presupuesto: proyecto.presupuesto,
        responsableId: proyecto.responsableId,
        clienteId: proyecto.clienteId || null,
        tags: proyecto.tags || [],
        estado: proyecto.estado,
      };
      
      form.reset(values);
    }
  }, [proyecto, form]);
  
  // Enviar el formulario
  const onSubmit = (values: ProyectoFormValues) => {
    if (isEditing && proyecto) {
      // Actualizar proyecto existente
      const updateData: ActualizarProyectoDTO = {
        nombre: values.nombre,
        descripcion: values.descripcion,
        fechaInicio: values.fechaInicio,
        fechaFinPrevista: values.fechaFinPrevista,
        fechaFinReal: values.fechaFinReal,
        presupuesto: values.presupuesto,
        responsableId: values.responsableId,
        clienteId: values.clienteId,
        tags: values.tags,
      };
      
      actualizarProyectoMutation.mutate(updateData, {
        onSuccess: () => {
          onSuccess();
        },
      });
    } else {
      // Crear nuevo proyecto
      const createData: CrearProyectoDTO = {
        nombre: values.nombre,
        descripcion: values.descripcion,
        fechaInicio: values.fechaInicio,
        fechaFinPrevista: values.fechaFinPrevista || undefined,
        presupuesto: values.presupuesto,
        responsableId: values.responsableId,
        clienteId: values.clienteId || undefined,
        tags: values.tags,
      };
      
      crearProyectoMutation.mutate(createData, {
        onSuccess: () => {
          onSuccess();
        },
      });
    }
  };
  
  // Agregar etiqueta
  const addTag = () => {
    if (tagInput.trim() === "") return;
    
    const currentTags = form.getValues("tags") || [];
    if (!currentTags.includes(tagInput.trim())) {
      form.setValue("tags", [...currentTags, tagInput.trim()]);
    }
    
    setTagInput("");
  };
  
  // Remover etiqueta
  const removeTag = (tag: string) => {
    const currentTags = form.getValues("tags") || [];
    form.setValue("tags", currentTags.filter(t => t !== tag));
  };
  
  const isLoading = isCreating || isUpdating;
  const error = createError || updateError;

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Información básica */}
        <Card className="p-6">
          <h3 className="text-lg font-medium mb-4">Información básica</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Nombre */}
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
                      onChange={(e) => field.onChange(parseFloat(e.target.value))}
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
                  <FormLabel>ID del responsable *</FormLabel>
                  <FormControl>
                    <Input 
                      type="number" 
                      placeholder="ID del responsable" 
                      {...field} 
                      onChange={(e) => field.onChange(parseInt(e.target.value))}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            {/* Cliente */}
            <FormField
              control={form.control}
              name="clienteId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>ID del cliente (opcional)</FormLabel>
                  <FormControl>
                    <Input 
                      type="number" 
                      placeholder="ID del cliente" 
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
          <div className="mt-6">
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
          </div>
        </Card>
        
        {/* Fechas */}
        <Card className="p-6">
          <h3 className="text-lg font-medium mb-4">Fechas</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Fecha de inicio */}
            <FormField
              control={form.control}
              name="fechaInicio"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Fecha de inicio *</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant="outline"
                          className="pl-3 text-left font-normal"
                        >
                          {field.value ? (
                            format(field.value, "dd MMMM yyyy", { locale: es })
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
                        disabled={(date) => date < new Date("2000-01-01")}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            {/* Fecha de fin prevista */}
            <FormField
              control={form.control}
              name="fechaFinPrevista"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Fecha de fin prevista</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant="outline"
                          className="pl-3 text-left font-normal"
                        >
                          {field.value ? (
                            format(field.value, "dd MMMM yyyy", { locale: es })
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
                        disabled={(date) => 
                          date < form.getValues("fechaInicio") || 
                          date < new Date("2000-01-01")
                        }
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <FormDescription>
                    Fecha estimada para finalizar el proyecto
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            {/* Fecha de fin real (solo en edición) */}
            {isEditing && (
              <FormField
                control={form.control}
                name="fechaFinReal"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Fecha de fin real</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            className="pl-3 text-left font-normal"
                          >
                            {field.value ? (
                              format(field.value, "dd MMMM yyyy", { locale: es })
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
                          disabled={(date) => 
                            date < form.getValues("fechaInicio") || 
                            date < new Date("2000-01-01")
                          }
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormDescription>
                      Fecha real de finalización (si ya terminó)
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
          </div>
        </Card>
        
        {/* Estado (solo en edición) */}
        {isEditing && (
          <Card className="p-6">
            <h3 className="text-lg font-medium mb-4">Estado</h3>
            
            <FormField
              control={form.control}
              name="estado"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Estado del proyecto</FormLabel>
                  <Select
                    value={field.value}
                    onValueChange={(value) => field.onChange(value as EstadoProyecto)}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar estado" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {Object.values(EstadoProyecto).map((estado) => (
                        <SelectItem key={estado} value={estado}>
                          {estado.charAt(0).toUpperCase() + estado.slice(1)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    El estado actual del proyecto
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </Card>
        )}
        
        {/* Etiquetas */}
        <Card className="p-6">
          <h3 className="text-lg font-medium mb-4">Etiquetas</h3>
          
          <div className="space-y-4">
            <div className="flex gap-2">
              <Input
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                placeholder="Agregar etiqueta"
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addTag();
                  }
                }}
              />
              <Button 
                type="button" 
                onClick={addTag}
                variant="secondary"
              >
                Añadir
              </Button>
            </div>
            
            <div className="flex flex-wrap gap-2">
              {form.watch("tags")?.map((tag) => (
                <Badge 
                  key={tag} 
                  variant="secondary"
                  className="flex items-center gap-1 px-3 py-1"
                >
                  {tag}
                  <X 
                    className="h-3 w-3 cursor-pointer" 
                    onClick={() => removeTag(tag)} 
                  />
                </Badge>
              ))}
              
              {(!form.watch("tags") || form.watch("tags").length === 0) && (
                <p className="text-sm text-muted-foreground">
                  No hay etiquetas añadidas
                </p>
              )}
            </div>
          </div>
        </Card>
        
        {/* Mensajes de error */}
        {error && (
          <div className="text-destructive text-sm">
            {error}
          </div>
        )}
        
        {/* Botones de acción */}
        <div className="flex justify-end gap-4">
          <Button 
            type="button" 
            variant="outline"
            onClick={onSuccess}
            disabled={isLoading}
          >
            Cancelar
          </Button>
          <Button 
            type="submit"
            disabled={isLoading}
          >
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isEditing ? "Actualizar proyecto" : "Crear proyecto"}
          </Button>
        </div>
      </form>
    </Form>
  );
}