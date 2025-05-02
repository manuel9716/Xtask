import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Textarea } from "@/components/ui/textarea";

// Esquema de validación para el formulario
const kpiFormSchema = z.object({
  descripcion: z.string().min(5, {
    message: "La descripción debe tener al menos 5 caracteres.",
  }),
  formula: z.string().min(3, {
    message: "La fórmula debe tener al menos 3 caracteres.",
  }),
  valorEsperado: z.coerce.number().positive({
    message: "El valor esperado debe ser un número positivo.",
  }),
  porcentajePeso: z.coerce.number().min(1).max(100, {
    message: "El porcentaje de peso debe estar entre 1 y 100.",
  }),
  mes: z.string().regex(/^\d{4}-\d{2}$/, {
    message: "El mes debe tener el formato YYYY-MM.",
  }),
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
  const form = useForm<KpiFormValues>({
    resolver: zodResolver(kpiFormSchema),
    defaultValues: {
      descripcion: "",
      formula: "",
      valorEsperado: 0,
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

  // Manejador de envío
  function handleSubmit(values: KpiFormValues) {
    onSubmit(values);
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

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="valorEsperado"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Valor esperado</FormLabel>
                <FormControl>
                  <Input type="number" step="0.01" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

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