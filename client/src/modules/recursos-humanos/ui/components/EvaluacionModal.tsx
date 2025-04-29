/**
 * Componente EvaluacionModal
 * Modal para crear o editar una evaluación de desempeño
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
import { Slider } from "@/components/ui/slider";
import { useToast } from "@/hooks/use-toast";
import { Empleado } from "../../domain/entities/Empleado";
import { Evaluacion, CrearEvaluacionDTO, ActualizarEvaluacionDTO } from "../../domain/entities/Evaluacion";
import { TipoEvaluacion } from "@shared/schema";
import { EmpleadosApi } from "../../infrastructure/api/empleadosApi";
import * as evaluacionesApi from "../../infrastructure/api/evaluacionesApi";
import { ListarEmpleadosUseCase } from "../../application/useCases/empleados/listarEmpleados";
import { CrearEvaluacionUseCase } from "../../application/useCases/evaluaciones/crearEvaluacion";
import { EditarEvaluacionUseCase } from "../../application/useCases/evaluaciones/editarEvaluacion";
import { RefreshCw } from "lucide-react";

// Esquema de validación con zod
const evaluacionSchema = z.object({
  empleadoId: z.coerce.number().min(1, "Debe seleccionar un empleado"),
  evaluadorId: z.coerce.number().min(1, "Debe seleccionar un evaluador"),
  tipo: z.string().min(1, "Debe seleccionar un tipo de evaluación"),
  titulo: z.string().min(3, "El título debe tener al menos 3 caracteres"),
  fecha: z.string().min(1, "La fecha es obligatoria"),
  fechaFinalizacion: z.string().optional(),
  desempenoGeneral: z.coerce.number().min(1).max(5, "La calificación debe estar entre 1 y 5"),
  comentarios: z.string().optional(),
  fortalezas: z.string().optional(),
  areasAMejorar: z.string().optional(),
  objetivosSiguientePeriodo: z.string().optional(),
});

// Criterios de evaluación por defecto
const criteriosDefault = [
  { id: 1, nombre: "Calidad del trabajo", valor: 0 },
  { id: 2, nombre: "Cumplimiento de plazos", valor: 0 },
  { id: 3, nombre: "Trabajo en equipo", valor: 0 },
  { id: 4, nombre: "Comunicación", valor: 0 },
  { id: 5, nombre: "Iniciativa", valor: 0 },
  { id: 6, nombre: "Adaptabilidad", valor: 0 },
  { id: 7, nombre: "Conocimientos técnicos", valor: 0 },
  { id: 8, nombre: "Resolución de problemas", valor: 0 },
];

interface EvaluacionModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  evaluacion?: Evaluacion; // Si se proporciona, es modo edición
  onSuccess?: () => void;
}

export const EvaluacionModal: React.FC<EvaluacionModalProps> = ({
  open,
  onOpenChange,
  evaluacion,
  onSuccess,
}) => {
  const { toast } = useToast();
  const empleadosApi = new EmpleadosApi();
  // Ya no necesitamos instanciar la API ya que importamos las funciones directamente
  const listarEmpleadosUseCase = new ListarEmpleadosUseCase(empleadosApi);
  const crearEvaluacionUseCase = new CrearEvaluacionUseCase(evaluacionesApi);
  const editarEvaluacionUseCase = new EditarEvaluacionUseCase(evaluacionesApi);
  
  const esEdicion = !!evaluacion;
  
  // Estado para criterios de evaluación
  const [criterios, setCriterios] = useState<any[]>(criteriosDefault);
  
  // Cargar criterios del evaluacion si estamos en modo edición
  useEffect(() => {
    if (esEdicion && evaluacion.criterios) {
      try {
        const criteriosGuardados = typeof evaluacion.criterios === 'string' 
          ? JSON.parse(evaluacion.criterios) 
          : evaluacion.criterios;
        setCriterios(criteriosGuardados);
      } catch (e) {
        console.error("Error al parsear criterios:", e);
        setCriterios(criteriosDefault);
      }
    } else {
      setCriterios(criteriosDefault);
    }
  }, [evaluacion, esEdicion]);
  
  // Consulta para obtener la lista de empleados
  const { data: empleados } = useQuery({
    queryKey: ['/api/recursos-humanos/empleados/activos'],
    queryFn: () => listarEmpleadosUseCase.execute({ estado: 'ACTIVO' }),
    enabled: open,
  });
  
  // Form con valores por defecto basados en si es edición o creación
  const form = useForm<z.infer<typeof evaluacionSchema>>({
    resolver: zodResolver(evaluacionSchema),
    defaultValues: esEdicion
      ? {
          empleadoId: evaluacion.empleadoId,
          evaluadorId: evaluacion.evaluadorId,
          tipo: evaluacion.tipo,
          titulo: evaluacion.titulo,
          fecha: evaluacion.fecha.toISOString().split('T')[0],
          fechaFinalizacion: evaluacion.fechaFinalizacion 
            ? evaluacion.fechaFinalizacion.toISOString().split('T')[0] 
            : undefined,
          desempenoGeneral: evaluacion.desempenoGeneral,
          comentarios: evaluacion.comentarios || "",
          fortalezas: evaluacion.fortalezas || "",
          areasAMejorar: evaluacion.areasAMejorar || "",
          objetivosSiguientePeriodo: evaluacion.objetivosSiguientePeriodo || "",
        }
      : {
          empleadoId: 0,
          evaluadorId: 0,
          tipo: TipoEvaluacion.RENDIMIENTO,
          titulo: "",
          fecha: new Date().toISOString().split('T')[0],
          desempenoGeneral: 3,
          comentarios: "",
          fortalezas: "",
          areasAMejorar: "",
          objetivosSiguientePeriodo: "",
        }
  });
  
  // Función para actualizar la valoración de criterios
  const actualizarValorCriterio = (id: number, valor: number) => {
    setCriterios(prev => 
      prev.map(criterio => 
        criterio.id === id ? { ...criterio, valor } : criterio
      )
    );
  };
  
  // Calcular promedio de los criterios
  const calcularPromedioCriterios = () => {
    const sum = criterios.reduce((acc, curr) => acc + curr.valor, 0);
    return criterios.length > 0 ? sum / criterios.length : 0;
  };
  
  // Actualizar desempeño general cuando cambian los criterios
  useEffect(() => {
    const promedio = calcularPromedioCriterios();
    form.setValue("desempenoGeneral", promedio);
  }, [criterios]);
  
  // Mutación para crear evaluación
  const crearEvaluacionMutation = useMutation({
    mutationFn: (data: CrearEvaluacionDTO) => crearEvaluacionUseCase.execute(data),
    onSuccess: () => {
      toast({
        title: "Evaluación creada",
        description: "La evaluación ha sido creada correctamente",
      });
      form.reset();
      onOpenChange(false);
      if (onSuccess) onSuccess();
    },
    onError: (error) => {
      toast({
        title: "Error al crear evaluación",
        description: error instanceof Error ? error.message : "Ha ocurrido un error",
        variant: "destructive",
      });
    },
  });
  
  // Mutación para editar evaluación
  const editarEvaluacionMutation = useMutation({
    mutationFn: (data: ActualizarEvaluacionDTO) => editarEvaluacionUseCase.execute(data),
    onSuccess: () => {
      toast({
        title: "Evaluación actualizada",
        description: "La evaluación ha sido actualizada correctamente",
      });
      onOpenChange(false);
      if (onSuccess) onSuccess();
    },
    onError: (error) => {
      toast({
        title: "Error al actualizar evaluación",
        description: error instanceof Error ? error.message : "Ha ocurrido un error",
        variant: "destructive",
      });
    },
  });
  
  // Manejar envío del formulario
  const onSubmit = (data: z.infer<typeof evaluacionSchema>) => {
    // Incluir criterios y convertir fechas a objetos Date
    const evaluacionData = {
      ...data,
      fecha: new Date(data.fecha),
      fechaFinalizacion: data.fechaFinalizacion ? new Date(data.fechaFinalizacion) : undefined,
      criterios: JSON.stringify(criterios),
    };
    
    if (esEdicion) {
      editarEvaluacionMutation.mutate({
        ...evaluacionData,
        id: evaluacion.id,
      });
    } else {
      crearEvaluacionMutation.mutate(evaluacionData as CrearEvaluacionDTO);
    }
  };
  
  const isPending = crearEvaluacionMutation.isPending || editarEvaluacionMutation.isPending;
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[750px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{esEdicion ? "Editar Evaluación" : "Nueva Evaluación de Desempeño"}</DialogTitle>
          <DialogDescription>
            {esEdicion
              ? "Actualice la información de la evaluación de desempeño."
              : "Complete el formulario para crear una nueva evaluación de desempeño."}
          </DialogDescription>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Datos principales */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Información General</h3>
                <FormField
                  control={form.control}
                  name="empleadoId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Empleado</FormLabel>
                      <Select 
                        onValueChange={(value) => field.onChange(Number(value))} 
                        defaultValue={field.value.toString()}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Seleccione un empleado" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {empleados?.data.map((empleado) => (
                            <SelectItem 
                              key={empleado.id} 
                              value={empleado.id.toString()}
                            >
                              {empleado.nombreCompleto}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="evaluadorId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Evaluador</FormLabel>
                      <Select 
                        onValueChange={(value) => field.onChange(Number(value))} 
                        defaultValue={field.value.toString()}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Seleccione un evaluador" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {empleados?.data.map((empleado) => (
                            <SelectItem 
                              key={empleado.id} 
                              value={empleado.id.toString()}
                            >
                              {empleado.nombreCompleto}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="tipo"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tipo de Evaluación</FormLabel>
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
                          <SelectItem value={TipoEvaluacion.RENDIMIENTO}>Rendimiento</SelectItem>
                          <SelectItem value={TipoEvaluacion.OBJETIVOS}>Cumplimiento de Objetivos</SelectItem>
                          <SelectItem value={TipoEvaluacion.COMPETENCIAS}>Competencias</SelectItem>
                          <SelectItem value={TipoEvaluacion.PERIODO_PRUEBA}>Período de Prueba</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="titulo"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Título de la Evaluación</FormLabel>
                      <FormControl>
                        <Input placeholder="Ej: Evaluación anual 2023" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              {/* Fechas y calificación */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Período y Calificación</h3>
                <FormField
                  control={form.control}
                  name="fecha"
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
                  name="fechaFinalizacion"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Fecha de Finalización</FormLabel>
                      <FormControl>
                        <Input 
                          type="date" 
                          {...field} 
                          value={field.value || ""} 
                          onChange={(e) => field.onChange(e.target.value || undefined)}
                        />
                      </FormControl>
                      <FormDescription>
                        Dejar en blanco si la evaluación está en curso
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="desempenoGeneral"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Desempeño General</FormLabel>
                      <div className="flex items-center space-x-4">
                        <FormControl>
                          <Slider
                            min={1}
                            max={5}
                            step={0.1}
                            defaultValue={[field.value]}
                            onValueChange={(value) => field.onChange(value[0])}
                          />
                        </FormControl>
                        <span className="font-medium w-12 text-right">
                          {field.value.toFixed(1)}
                        </span>
                      </div>
                      <FormDescription>
                        Este valor se actualiza automáticamente con el promedio de los criterios
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>
            
            {/* Criterios de evaluación */}
            <div className="border-t pt-4">
              <h3 className="text-lg font-medium mb-4">Criterios de Evaluación</h3>
              <div className="space-y-4">
                {criterios.map((criterio) => (
                  <div key={criterio.id} className="flex items-center space-x-4">
                    <div className="flex-grow">
                      <p className="font-medium">{criterio.nombre}</p>
                    </div>
                    <div className="flex items-center space-x-2 w-56">
                      <Slider
                        min={1}
                        max={5}
                        step={0.5}
                        value={[criterio.valor]}
                        onValueChange={(value) => actualizarValorCriterio(criterio.id, value[0])}
                      />
                      <span className="font-medium w-10 text-right">
                        {criterio.valor.toFixed(1)}
                      </span>
                    </div>
                  </div>
                ))}
                <div className="flex justify-between items-center border-t pt-2">
                  <p className="font-medium">Promedio de criterios</p>
                  <p className="font-bold">{calcularPromedioCriterios().toFixed(1)}</p>
                </div>
              </div>
            </div>
            
            {/* Comentarios y observaciones */}
            <div className="border-t pt-4">
              <h3 className="text-lg font-medium mb-4">Comentarios y Observaciones</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="fortalezas"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Fortalezas</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Fortalezas destacadas del empleado" 
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
                  name="areasAMejorar"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Áreas a Mejorar</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Áreas que requieren desarrollo" 
                          className="min-h-[100px]"
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <div className="mt-4 space-y-4">
                <FormField
                  control={form.control}
                  name="objetivosSiguientePeriodo"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Objetivos para el Siguiente Período</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Objetivos y metas para el próximo período" 
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
                  name="comentarios"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Comentarios Adicionales</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Comentarios adicionales sobre la evaluación" 
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
                  esEdicion ? "Actualizar Evaluación" : "Crear Evaluación"
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};