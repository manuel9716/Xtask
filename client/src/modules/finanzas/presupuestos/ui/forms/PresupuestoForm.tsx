import React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { format } from "date-fns";
import { CalendarIcon, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useCrearPresupuesto } from "../../application/useCrearPresupuesto";
import { crearPresupuestoSchema, Presupuesto } from "../../domain/entities/Presupuesto";

interface PresupuestoFormProps {
  presupuesto?: Presupuesto | null;
  areas?: string[];
  onSuccess?: () => void;
}

/**
 * Formulario para crear o editar presupuestos
 */
export function PresupuestoForm({ 
  presupuesto,
  areas = [],
  onSuccess 
}: PresupuestoFormProps) {
  const { crearPresupuesto, isPending } = useCrearPresupuesto();

  // Crear formulario con validación zod
  const form = useForm<z.infer<typeof crearPresupuestoSchema>>({
    resolver: zodResolver(crearPresupuestoSchema),
    defaultValues: {
      nombre: presupuesto?.nombre || "",
      monto: presupuesto?.monto || 0,
      fechaInicio: presupuesto?.fechaInicio || new Date(),
      fechaFin: presupuesto?.fechaFin || new Date(new Date().setMonth(new Date().getMonth() + 3)),
      description: presupuesto?.description || "",
      area: presupuesto?.area || undefined,
    },
  });

  // Manejar el envío del formulario
  const onSubmit = async (data: z.infer<typeof crearPresupuestoSchema>) => {
    try {
      const success = await crearPresupuesto(data);
      if (success && onSuccess) {
        form.reset();
        onSuccess();
      }
    } catch (error) {
      console.error("Error al crear presupuesto:", error);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
        <FormField
          control={form.control}
          name="nombre"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nombre del presupuesto</FormLabel>
              <FormControl>
                <Input 
                  placeholder="Ej. Presupuesto de marketing Q1 2025" 
                  {...field} 
                />
              </FormControl>
              <FormDescription>
                Nombre descriptivo del presupuesto
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="monto"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Monto</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="10000.00"
                  {...field}
                  onChange={(e) => field.onChange(parseFloat(e.target.value))}
                  value={field.value}
                />
              </FormControl>
              <FormDescription>
                Monto total asignado al presupuesto
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="fechaInicio"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Fecha de inicio</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant="outline"
                        className={cn(
                          "pl-3 text-left font-normal",
                          !field.value && "text-muted-foreground"
                        )}
                      >
                        {field.value ? (
                          format(field.value, "PP")
                        ) : (
                          <span>Seleccione fecha</span>
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

          <FormField
            control={form.control}
            name="fechaFin"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Fecha de fin</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant="outline"
                        className={cn(
                          "pl-3 text-left font-normal",
                          !field.value && "text-muted-foreground"
                        )}
                      >
                        {field.value ? (
                          format(field.value, "PP")
                        ) : (
                          <span>Seleccione fecha</span>
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
        </div>

        <FormField
          control={form.control}
          name="area"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Área</FormLabel>
              <Select
                onValueChange={field.onChange}
                defaultValue={field.value}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccione un área" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="General">General</SelectItem>
                  {areas.map((area) => (
                    <SelectItem key={area} value={area}>
                      {area}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormDescription>
                Área o departamento al que pertenece el presupuesto
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Descripción</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Descripción detallada del presupuesto y su propósito"
                  className="resize-none"
                  {...field}
                />
              </FormControl>
              <FormDescription>
                Información adicional sobre el presupuesto
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
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Creando...
            </>
          ) : (
            'Crear Presupuesto'
          )}
        </Button>
      </form>
    </Form>
  );
}