import { useState } from "react";
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
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { 
  TipoHabilidad, 
  NivelHabilidad, 
  Habilidad,
  CreateHabilidadRequest,
  UpdateHabilidadRequest
} from "../../domain/entities/Habilidad";
import { habilidadApi } from "../../infrastructure/api/habilidadApi";

const habilidadSchema = z.object({
  tipo: z.nativeEnum(TipoHabilidad),
  nombre: z.string().min(1, "El nombre es requerido").max(100, "Máximo 100 caracteres"),
  nivel: z.nativeEnum(NivelHabilidad),
  observaciones: z.string().max(500, "Máximo 500 caracteres").optional(),
});

type HabilidadFormData = z.infer<typeof habilidadSchema>;

interface HabilidadFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  habilidad?: Habilidad;
  userId: number;
}

export function HabilidadForm({ open, onOpenChange, habilidad, userId }: HabilidadFormProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<HabilidadFormData>({
    resolver: zodResolver(habilidadSchema),
    defaultValues: {
      tipo: habilidad?.tipo || TipoHabilidad.HERRAMIENTA,
      nombre: habilidad?.nombre || "",
      nivel: habilidad?.nivel || NivelHabilidad.BASICO,
      observaciones: habilidad?.observaciones || "",
    },
  });

  const createMutation = useMutation({
    mutationFn: (data: CreateHabilidadRequest) => habilidadApi.createHabilidad(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/habilidades', 'mis-habilidades'] });
      toast({
        title: "Habilidad creada",
        description: "La habilidad se ha agregado correctamente.",
      });
      onOpenChange(false);
      form.reset();
    },
    onError: (error: any) => {
      toast({
        title: "Error al crear habilidad",
        description: error.message || "Ocurrió un error inesperado.",
        variant: "destructive",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateHabilidadRequest }) => 
      habilidadApi.updateHabilidad(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/habilidades', 'mis-habilidades'] });
      toast({
        title: "Habilidad actualizada",
        description: "La habilidad se ha actualizado correctamente.",
      });
      onOpenChange(false);
    },
    onError: (error: any) => {
      toast({
        title: "Error al actualizar habilidad",
        description: error.message || "Ocurrió un error inesperado.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: HabilidadFormData) => {
    if (habilidad) {
      updateMutation.mutate({ 
        id: habilidad.id, 
        data 
      });
    } else {
      createMutation.mutate({ 
        ...data, 
        userId 
      });
    }
  };

  const isPending = createMutation.isPending || updateMutation.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {habilidad ? "Editar Habilidad" : "Agregar Nueva Habilidad"}
          </DialogTitle>
          <DialogDescription>
            {habilidad 
              ? "Modifica los datos de la habilidad." 
              : "Completa los campos para agregar una nueva habilidad."
            }
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="tipo"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tipo de Habilidad</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecciona el tipo" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value={TipoHabilidad.HERRAMIENTA}>
                        🔧 Herramientas
                      </SelectItem>
                      <SelectItem value={TipoHabilidad.HABILIDAD_BLANDA}>
                        💡 Habilidades Blandas
                      </SelectItem>
                      <SelectItem value={TipoHabilidad.CONOCIMIENTO}>
                        📚 Conocimientos
                      </SelectItem>
                      <SelectItem value={TipoHabilidad.IDIOMA}>
                        🌍 Idiomas
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="nombre"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nombre de la Habilidad</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="Ej: React, Liderazgo, Marketing Digital..." 
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="nivel"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nivel de Competencia</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecciona el nivel" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value={NivelHabilidad.BASICO}>
                        🔴 Básico
                      </SelectItem>
                      <SelectItem value={NivelHabilidad.INTERMEDIO}>
                        🟡 Intermedio
                      </SelectItem>
                      <SelectItem value={NivelHabilidad.AVANZADO}>
                        🔵 Avanzado
                      </SelectItem>
                      <SelectItem value={NivelHabilidad.EXPERTO}>
                        🟢 Experto
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="observaciones"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Observaciones (Opcional)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Detalles adicionales, certificaciones, años de experiencia..."
                      rows={3}
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Información adicional sobre esta habilidad
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isPending}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={isPending}>
                {isPending ? "Guardando..." : habilidad ? "Actualizar" : "Agregar"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}