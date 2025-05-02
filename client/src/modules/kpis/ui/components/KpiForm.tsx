import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Textarea } from "@/components/ui/textarea";
import { Empleado } from "@/modules/kpis/domain/repositories/KpiRepository";
import { useQuery } from "@tanstack/react-query";

// Esquema de validación para el formulario
const kpiFormSchema = z.object({
  descripcion: z.string().min(5, {
    message: "La descripción debe tener al menos 5 caracteres.",
  }),
  formula: z.string().min(3, {
    message: "La fórmula debe tener al menos 3 caracteres.",
  }),
  // Eliminamos la validación valorEsperado para usar el valor por defecto
  porcentajePeso: z.coerce.number().min(1).max(100, {
    message: "El porcentaje de peso debe estar entre 1 y 100.",
  }),
  mes: z.string().regex(/^\d{4}-\d{2}$/, {
    message: "El mes debe tener el formato YYYY-MM.",
  }),
  empleadoId: z.coerce.number().optional(),
});

export type KpiFormValues = z.infer<typeof kpiFormSchema>;

interface KpiFormProps {
  onSubmit: (data: KpiFormValues) => void;
  onCancel?: () => void;
  isLoading?: boolean;
  defaultValues?: Partial<KpiFormValues>;
}

export function KpiForm({
  onSubmit,
  onCancel,
  isLoading = false,
  defaultValues = {}
}: KpiFormProps) {
  // Inicializar el formulario con valores por defecto
  // Explícitamente añadimos un tipo para evitar errores de TypeScript
  type FormTypes = z.infer<typeof kpiFormSchema>;
  
  const form = useForm<FormTypes>({
    resolver: zodResolver(kpiFormSchema),
    defaultValues: {
      descripcion: "",
      formula: "",
      porcentajePeso: 10,
      mes: format(new Date(), "yyyy-MM"),
      ...defaultValues
    }
  });

  // Estado para mantener las opciones de meses
  const [monthOptions] = useState(() => {
    const options = [];
    const today = new Date();
    
    // Añadir mes actual y 11 meses anteriores
    for (let i = 0; i < 12; i++) {
      const date = new Date(today.getFullYear(), today.getMonth() - i, 1);
      const value = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      const label = format(date, 'MMMM yyyy', { locale: es });
      
      options.push({ value, label });
    }
    
    return options;
  });

  // Consulta para obtener la lista de empleados
  const { 
    data: empleados = [], 
    isLoading: loadingEmpleados 
  } = useQuery<Empleado[]>({
    queryKey: ['/api/kpis/empleados'],
    staleTime: 60 * 1000 // 1 minuto
  });

  // Manejador de envío
  function handleSubmit(values: FormTypes) {
    console.log("Formulario enviado con valores:", values);
    onSubmit(values as KpiFormValues);
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="descripcion"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Descripción del KPI</FormLabel>
              <FormControl>
                <Input placeholder="Ej: Ventas mensuales" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="formula"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Fórmula de cálculo</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Ej: Número de ventas realizadas / Número total de contactos" 
                  className="h-20"
                  {...field} 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 gap-6">
          {/* Eliminamos el campo oculto para valorEsperado, ya que es manejado por el servidor */}
          
          <FormField
            control={form.control}
            name="porcentajePeso"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Peso del KPI (%)</FormLabel>
                <FormControl>
                  <Input type="number" min="1" max="100" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="mes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Periodo (mes)</FormLabel>
              <Select
                onValueChange={field.onChange}
                defaultValue={field.value}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar mes" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {monthOptions.map(option => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
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
          name="empleadoId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Asignar a empleado (opcional)</FormLabel>
              <Select
                onValueChange={(value) => field.onChange(parseInt(value))}
                defaultValue={field.value?.toString()}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar empleado" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="0">Mi KPI personal</SelectItem>
                  {empleados.map(empleado => (
                    <SelectItem key={empleado.id} value={empleado.id.toString()}>
                      {empleado.nombreCompleto} - {empleado.position}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end space-x-2 pt-4">
          {onCancel && (
            <Button 
              type="button" 
              variant="outline" 
              onClick={onCancel}
              disabled={isLoading}
            >
              Cancelar
            </Button>
          )}
          <Button type="submit" disabled={isLoading}>
            {isLoading ? "Guardando..." : "Guardar KPI"}
          </Button>
        </div>
      </form>
    </Form>
  );
}