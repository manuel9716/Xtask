/**
 * Componente CapacitacionModal
 * Modal para crear o editar una capacitación
 */

import React, { useState, useEffect } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
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
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { Capacitacion, CrearCapacitacionDTO, ActualizarCapacitacionDTO } from "../../domain/entities/Capacitacion";
import { EstadoCapacitacion, TipoCapacitacion, ModalidadCapacitacion } from "@shared/schema";
import { Empleado, EstadoEmpleado } from "../../domain/entities/Empleado";
import * as empleadosApi from "../../infrastructure/api/empleadosApi";
import * as capacitacionesApi from "../../infrastructure/api/capacitacionesApi";
import { ESTADOS_CAPACITACION_LABELS, TIPOS_CAPACITACION_LABELS, MODALIDADES_CAPACITACION_LABELS } from "../../domain/entities/Capacitacion";
import { useQueryClient } from "@tanstack/react-query";
import { RefreshCw } from "lucide-react";

// Esquema de validación con zod
const capacitacionSchema = z.object({
  titulo: z.string().min(3, "El título debe tener al menos 3 caracteres"),
  tipo: z.string().min(1, "Debe seleccionar un tipo de capacitación"),
  descripcion: z.string().min(10, "La descripción debe tener al menos 10 caracteres"),
  fechaInicio: z.string().min(1, "La fecha de inicio es obligatoria"),
  fechaFin: z.string().min(1, "La fecha de finalización es obligatoria"),
  estado: z.string().min(1, "Debe seleccionar un estado"),
  duracionHoras: z.coerce.number().min(1, "La duración debe ser mayor a 0"),
  instructor: z.string().min(1, "El nombre del instructor es obligatorio"),
  ubicacion: z.string().optional(),
  modalidad: z.string().min(1, "Debe seleccionar una modalidad"),
  costo: z.coerce.number().min(0, "El costo no puede ser negativo"),
  materialUrl: z.string().optional(),
  requisitosObligatorios: z.boolean().default(false),
  departamentoObjetivo: z.string().optional(),
  cupoMaximo: z.coerce.number().optional(),
  empleadosIds: z.array(z.string()).optional(),
  notas: z.string().optional(),
});

interface CapacitacionModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  capacitacion?: Capacitacion; // Si se proporciona, es modo edición
  onSuccess?: () => void;
}

export const CapacitacionModal: React.FC<CapacitacionModalProps> = ({
  open,
  onOpenChange,
  capacitacion,
  onSuccess,
}) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const esEdicion = !!capacitacion;
  
  // Estado para empleados seleccionados
  const [empleadosSeleccionados, setEmpleadosSeleccionados] = useState<string[]>([]);
  
  // Consulta para obtener la lista de empleados
  const { data: empleados, isLoading: empleadosLoading } = useQuery({
    queryKey: ['/api/nomina/empleados/listar'],
    queryFn: async () => {
      const response = await fetch('/api/nomina/empleados/listar');
      if (!response.ok) {
        throw new Error('Error al cargar empleados');
      }
      return response.json();
    },
    enabled: open,
  });
  
  // Form con valores por defecto basados en si es edición o creación
  const form = useForm<z.infer<typeof capacitacionSchema>>({
    resolver: zodResolver(capacitacionSchema),
    defaultValues: esEdicion
      ? {
          titulo: capacitacion.titulo,
          tipo: capacitacion.tipo,
          descripcion: capacitacion.descripcion,
          fechaInicio: capacitacion.fechaInicio.toISOString().split('T')[0],
          fechaFin: capacitacion.fechaFin.toISOString().split('T')[0],
          estado: capacitacion.estado,
          duracionHoras: capacitacion.duracionHoras,
          instructor: capacitacion.instructor,
          ubicacion: capacitacion.ubicacion || "",
          modalidad: capacitacion.modalidad,
          costo: capacitacion.costo,
          materialUrl: capacitacion.materialUrl || "",
          requisitosObligatorios: capacitacion.requisitosObligatorios,
          departamentoObjetivo: capacitacion.departamentoObjetivo || "",
          cupoMaximo: capacitacion.cupoMaximo || 0,
          empleadosIds: capacitacion.empleadosIds || [],
          notas: capacitacion.notas || "",
        }
      : {
          titulo: "",
          tipo: TipoCapacitacion.TECNICA,
          descripcion: "",
          fechaInicio: new Date().toISOString().split('T')[0],
          fechaFin: new Date(new Date().setDate(new Date().getDate() + 7)).toISOString().split('T')[0],
          estado: EstadoCapacitacion.PROGRAMADA,
          duracionHoras: 8,
          instructor: "",
          ubicacion: "",
          modalidad: "Presencial",
          costo: 0,
          materialUrl: "",
          requisitosObligatorios: false,
          departamentoObjetivo: "",
          cupoMaximo: 0,
          empleadosIds: [],
          notas: "",
        }
  });
  
  // Inicializar empleados seleccionados cuando se carga el formulario
  useEffect(() => {
    if (esEdicion && capacitacion.empleadosIds) {
      setEmpleadosSeleccionados(capacitacion.empleadosIds.map(id => id.toString()));
      form.setValue("empleadosIds", capacitacion.empleadosIds.map(id => id.toString()));
    } else {
      setEmpleadosSeleccionados([]);
      form.setValue("empleadosIds", []);
    }
  }, [capacitacion, esEdicion, form]);
  
  // Manejar cambios en la selección de empleados
  const handleEmpleadoChange = (empleadoId: string, checked: boolean) => {
    let nuevosEmpleados: string[];
    
    if (checked) {
      nuevosEmpleados = [...empleadosSeleccionados, empleadoId];
    } else {
      nuevosEmpleados = empleadosSeleccionados.filter(id => id !== empleadoId);
    }
    
    setEmpleadosSeleccionados(nuevosEmpleados);
    form.setValue("empleadosIds", nuevosEmpleados);
  };
  
  // Mutación para crear capacitación
  const crearCapacitacionMutation = useMutation({
    mutationFn: async (data: CrearCapacitacionDTO) => {
      try {
        // Es importante asegurarnos que fechaInicio y fechaFin sean objetos Date
        // Las fechas vienen en formato YYYY-MM-DD del input type="date"
        
        // Es crucial asegurarnos que las fechas son válidas SIEMPRE
        if (!data.fechaInicio || !data.fechaFin) {
          throw new Error("Las fechas de inicio y fin son obligatorias");
        }
        
        // Garantizar que las fechas se convierten correctamente a Date
        let fechaInicio = new Date(data.fechaInicio);
        let fechaFin = new Date(data.fechaFin);
        
        // Verificar que son fechas válidas
        if (isNaN(fechaInicio.getTime()) || isNaN(fechaFin.getTime())) {
          throw new Error("Las fechas proporcionadas no son válidas");
        }
        
        // Preparamos el objeto para la API con las fechas correctas
        const apiData = {
          ...data,
          fechaInicio,
          fechaFin,
          // Otros campos que deben ser strings específicos
          duracionHoras: String(data.duracionHoras),
          costo: String(data.costo || 0)
        };
        
        console.log("Datos enviados a la API:", JSON.stringify(apiData));
        
        const response = await fetch('/api/capacitaciones', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(apiData),
        });
        
        if (!response.ok) {
          const errorData = await response.json();
          console.error("Error de la API:", errorData);
          throw new Error(errorData.error ? JSON.stringify(errorData.error) : 'Error al crear capacitación');
        }
        
        return response.json();
      } catch (error) {
        console.error("Error al enviar datos de capacitación:", error);
        throw error;
      }
    },
    onSuccess: () => {
      toast({
        title: "Capacitación creada",
        description: "La capacitación ha sido creada correctamente",
      });
      form.reset();
      onOpenChange(false);
      queryClient.invalidateQueries({ queryKey: ['/api/capacitaciones'] });
      if (onSuccess) onSuccess();
    },
    onError: (error) => {
      toast({
        title: "Error al crear capacitación",
        description: error instanceof Error ? error.message : "Ha ocurrido un error",
        variant: "destructive",
      });
    },
  });
  
  // Mutación para editar capacitación
  const editarCapacitacionMutation = useMutation({
    mutationFn: async (data: ActualizarCapacitacionDTO) => {
      try {
        // Garantizar que las fechas son fechas válidas - manejando tipos correctamente
        let fechaInicio: Date | undefined = undefined;
        let fechaFin: Date | undefined = undefined;
        
        // Solo convertir si las fechas existen y son strings
        if (data.fechaInicio && typeof data.fechaInicio === 'string') {
          fechaInicio = new Date(data.fechaInicio);
        }
        
        if (data.fechaFin && typeof data.fechaFin === 'string') {
          fechaFin = new Date(data.fechaFin);
        }
        
        // Convertir fechas de string a Date para la API
        const apiData = {
          ...data,
          // Solo incluir las fechas si están definidas
          ...(fechaInicio && { fechaInicio }),
          ...(fechaFin && { fechaFin }),
          // Asegurar formato correcto para estos campos
          ...(data.duracionHoras !== undefined && { duracionHoras: String(data.duracionHoras) }),
          ...(data.costo !== undefined && { costo: String(data.costo || 0) })
        };
        
        const response = await fetch(`/api/capacitaciones/${data.id}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(apiData),
        });
        
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error ? JSON.stringify(errorData.error) : 'Error al actualizar capacitación');
        }
        
        return response.json();
      } catch (error) {
        console.error("Error al actualizar capacitación:", error);
        throw error;
      }
    },
    onSuccess: () => {
      toast({
        title: "Capacitación actualizada",
        description: "La capacitación ha sido actualizada correctamente",
      });
      onOpenChange(false);
      queryClient.invalidateQueries({ queryKey: ['/api/capacitaciones'] });
      if (onSuccess) onSuccess();
    },
    onError: (error) => {
      toast({
        title: "Error al actualizar capacitación",
        description: error instanceof Error ? error.message : "Ha ocurrido un error",
        variant: "destructive",
      });
    },
  });
  
  // Manejar envío del formulario
  const onSubmit = (data: z.infer<typeof capacitacionSchema>) => {
    // Convertir empleadosIds a números y ajustar formatos de datos
    const capacitacionData = {
      ...data,
      empleadosIds: data.empleadosIds?.map(id => Number(id)) || [],
      // Convertir a objeto Date para asegurar formato correcto para PostgreSQL
      fechaInicio: new Date(data.fechaInicio),
      fechaFin: new Date(data.fechaFin),
      responsableId: 1, // Usando el ID 1 como default (admin)
      tipo: data.tipo as TipoCapacitacion,
      modalidad: data.modalidad as ModalidadCapacitacion,
      estado: data.estado as EstadoCapacitacion,
      duracionHoras: String(data.duracionHoras), // Convertir a string
      costo: String(data.costo) // Convertir a string
    };
    
    // Debug para verificar el formato de las fechas
    console.log("Datos enviados a la API:", JSON.stringify(capacitacionData));
    
    if (esEdicion) {
      editarCapacitacionMutation.mutate({
        ...capacitacionData,
        id: capacitacion.id,
      } as ActualizarCapacitacionDTO);
    } else {
      crearCapacitacionMutation.mutate(capacitacionData as CrearCapacitacionDTO);
    }
  };
  
  const isPending = crearCapacitacionMutation.isPending || editarCapacitacionMutation.isPending;
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[750px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{esEdicion ? "Editar Capacitación" : "Nueva Capacitación"}</DialogTitle>
          <DialogDescription>
            {esEdicion
              ? "Actualice la información de la capacitación."
              : "Complete el formulario para crear una nueva capacitación."}
          </DialogDescription>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Información General */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Información General</h3>
                <FormField
                  control={form.control}
                  name="titulo"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Título</FormLabel>
                      <FormControl>
                        <Input placeholder="Título de la capacitación" {...field} />
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
                      <Select 
                        onValueChange={field.onChange} 
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Seleccione tipo" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value={TipoCapacitacion.TECNICA}>Técnica</SelectItem>
                          <SelectItem value={TipoCapacitacion.HABILIDADES_BLANDAS}>Habilidades Blandas</SelectItem>
                          <SelectItem value={TipoCapacitacion.INDUCCION}>Inducción</SelectItem>
                          <SelectItem value={TipoCapacitacion.SEGURIDAD}>Seguridad</SelectItem>
                          <SelectItem value={TipoCapacitacion.NORMATIVA}>Normativa/Compliance</SelectItem>
                          <SelectItem value={TipoCapacitacion.LIDERAZGO}>Liderazgo</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="descripcion"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Descripción</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Descripción detallada" 
                          className="min-h-[100px]"
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="estado"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Estado</FormLabel>
                      <Select 
                        onValueChange={field.onChange} 
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Seleccione estado" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value={EstadoCapacitacion.PROGRAMADA}>Programada</SelectItem>
                          <SelectItem value={EstadoCapacitacion.EN_CURSO}>En Curso</SelectItem>
                          <SelectItem value={EstadoCapacitacion.COMPLETADA}>Completada</SelectItem>
                          <SelectItem value={EstadoCapacitacion.CANCELADA}>Cancelada</SelectItem>
                          <SelectItem value={EstadoCapacitacion.POSPUESTA}>Pospuesta</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              {/* Detalles de Programación */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Detalles de Programación</h3>
                <FormField
                  control={form.control}
                  name="fechaInicio"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Fecha de Inicio</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="fechaFin"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Fecha de Finalización</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="duracionHoras"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Duración (horas)</FormLabel>
                      <FormControl>
                        <Input type="number" min="1" step="0.5" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="modalidad"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Modalidad</FormLabel>
                      <Select 
                        onValueChange={field.onChange} 
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Seleccione modalidad" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value={ModalidadCapacitacion.PRESENCIAL}>Presencial</SelectItem>
                          <SelectItem value={ModalidadCapacitacion.VIRTUAL}>Virtual</SelectItem>
                          <SelectItem value={ModalidadCapacitacion.MIXTA}>Mixta/Híbrida</SelectItem>
                          <SelectItem value={ModalidadCapacitacion.AUTOESTUDIO}>Autoestudio</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>
            
            {/* Información adicional */}
            <div className="border-t pt-4">
              <h3 className="text-lg font-medium mb-4">Información Adicional</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="instructor"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Instructor / Proveedor</FormLabel>
                      <FormControl>
                        <Input placeholder="Nombre del instructor o proveedor" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="ubicacion"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Ubicación</FormLabel>
                      <FormControl>
                        <Input placeholder="Ubicación física o plataforma virtual" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="costo"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Costo</FormLabel>
                      <FormControl>
                        <Input type="number" min="0" step="0.01" placeholder="0.00" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="materialUrl"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>URL de Materiales</FormLabel>
                      <FormControl>
                        <Input placeholder="Enlace a materiales o recursos" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="departamentoObjetivo"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Departamento Objetivo</FormLabel>
                      <Select 
                        onValueChange={field.onChange} 
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Seleccione departamento (opcional)" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="TODOS">Todos los departamentos</SelectItem>
                          <SelectItem value="Tecnología">Tecnología</SelectItem>
                          <SelectItem value="Ventas">Ventas</SelectItem>
                          <SelectItem value="Marketing">Marketing</SelectItem>
                          <SelectItem value="Finanzas">Finanzas</SelectItem>
                          <SelectItem value="Recursos Humanos">Recursos Humanos</SelectItem>
                          <SelectItem value="Operaciones">Operaciones</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="cupoMaximo"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Cupo Máximo</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          min="0" 
                          placeholder="Deje en blanco si no hay límite" 
                          {...field}
                          value={field.value || ""}
                          onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : undefined)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="requisitosObligatorios"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>
                          Asistencia Obligatoria
                        </FormLabel>
                        <FormDescription>
                          Marque si la capacitación es obligatoria para los empleados seleccionados
                        </FormDescription>
                      </div>
                    </FormItem>
                  )}
                />
              </div>
              
              <div className="mt-4">
                <FormField
                  control={form.control}
                  name="notas"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Notas Adicionales</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Notas o comentarios adicionales" 
                          className="min-h-[100px]"
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>
            
            {/* Selección de empleados */}
            <div className="border-t pt-4">
              <h3 className="text-lg font-medium mb-4">Empleados Participantes</h3>
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground mb-2">
                  Seleccione los empleados que participarán en la capacitación:
                </p>
                <div className="h-[200px] overflow-y-auto border rounded-md p-4">
                  {empleadosLoading ? (
                    <p className="text-muted-foreground text-center">Cargando empleados...</p>
                  ) : !empleados || empleados.length === 0 ? (
                    <p className="text-muted-foreground text-center">No hay empleados disponibles</p>
                  ) : (
                    <div className="space-y-2">
                      {empleados.map((empleado) => (
                        <div key={empleado.id} className="flex items-center space-x-2">
                          <Checkbox 
                            id={`empleado-${empleado.id}`} 
                            checked={empleadosSeleccionados.includes(empleado.id.toString())}
                            onCheckedChange={(checked) => 
                              handleEmpleadoChange(empleado.id.toString(), !!checked)
                            }
                          />
                          <label 
                            htmlFor={`empleado-${empleado.id}`}
                            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                          >
                            {empleado.firstName} {empleado.lastName} - {empleado.position}
                          </label>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <p className="text-sm text-muted-foreground mt-2">
                  {empleadosSeleccionados.length} empleados seleccionados
                </p>
              </div>
            </div>
            
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancelar
              </Button>
              <Button type="submit" disabled={isPending}>
                {isPending ? (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                    {esEdicion ? "Actualizando..." : "Creando..."}
                  </>
                ) : (
                  esEdicion ? "Actualizar Capacitación" : "Crear Capacitación"
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};