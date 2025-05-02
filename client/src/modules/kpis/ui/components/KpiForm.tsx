import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Indicador } from "../../domain/entities/Indicador";

// Esquema de validación para crear o editar un KPI
const kpiFormSchema = z.object({
  descripcion: z.string().min(3, {
    message: "La descripción debe tener al menos 3 caracteres."
  }),
  formula: z.string().min(1, {
    message: "Debes proporcionar una fórmula de cálculo."
  }),
  valorEsperado: z.coerce.number()
    .min(0.01, { message: "El valor esperado debe ser mayor que cero." }),
  porcentajePeso: z.coerce.number()
    .min(1, { message: "El peso mínimo es 1%" })
    .max(100, { message: "El peso máximo es 100%" }),
  mes: z.string().regex(/^\d{4}-\d{2}$/, {
    message: "El formato debe ser YYYY-MM (ej: 2025-05)"
  })
});

// Tipo para los datos del formulario
type KpiFormValues = z.infer<typeof kpiFormSchema>;

interface KpiFormProps {
  defaultValues?: Partial<KpiFormValues>;
  onSubmit: (values: KpiFormValues) => void;
  onCancel: () => void;
  isLoading?: boolean;
  isEditing?: boolean;
}

/**
 * Componente de formulario para crear o editar un KPI
 */
export const KpiForm: React.FC<KpiFormProps> = ({
  defaultValues,
  onSubmit,
  onCancel,
  isLoading = false,
  isEditing = false
}) => {
  // Obtener el mes actual en formato YYYY-MM
  const getCurrentMonth = () => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  };

  // Configuración del formulario con react-hook-form
  const form = useForm<KpiFormValues>({
    resolver: zodResolver(kpiFormSchema),
    defaultValues: {
      descripcion: "",
      formula: "",
      valorEsperado: 0,
      porcentajePeso: 0,
      mes: getCurrentMonth(),
      ...defaultValues
    }
  });

  // Manejar el envío del formulario
  const handleSubmit = (values: KpiFormValues) => {
    onSubmit(values);
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>{isEditing ? "Editar Indicador" : "Nuevo Indicador"}</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="descripcion"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descripción</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="Describe el objetivo de este KPI" 
                      {...field} 
                    />
                  </FormControl>
                  <FormDescription>
                    Nombre descriptivo del indicador que quieres medir
                  </FormDescription>
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
                      placeholder="Ej: Ventas mensuales / Meta de ventas * 100" 
                      {...field} 
                    />
                  </FormControl>
                  <FormDescription>
                    Describe cómo se calcula este indicador para referencia
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="valorEsperado"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Valor esperado</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min="0"
                        step="0.01"
                        placeholder="100"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Meta a alcanzar
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="porcentajePeso"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Peso (%)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min="1"
                        max="100"
                        placeholder="20"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Impacto en la bonificación
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="mes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Mes</FormLabel>
                    <FormControl>
                      <Input
                        type="month"
                        placeholder="YYYY-MM"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Período de evaluación
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="flex justify-end space-x-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                disabled={isLoading}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={isLoading}
              >
                {isLoading ? 'Guardando...' : isEditing ? 'Actualizar' : 'Crear'}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

export default KpiForm;