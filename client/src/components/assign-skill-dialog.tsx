import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { User } from "@shared/schema";

const assignSkillSchema = z.object({
  userId: z.number().min(1, "Debe seleccionar un usuario"),
  tipo: z.enum(["herramienta", "habilidad_blanda", "conocimiento", "idioma"], {
    required_error: "Debe seleccionar un tipo",
  }),
  nombre: z.string().min(2, "El nombre debe tener al menos 2 caracteres"),
  nivel: z.enum(["básico", "intermedio", "avanzado", "experto"], {
    required_error: "Debe seleccionar un nivel",
  }),
  observaciones: z.string().optional(),
});

type AssignSkillData = z.infer<typeof assignSkillSchema>;

interface AssignSkillDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AssignSkillDialog({ open, onOpenChange }: AssignSkillDialogProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Obtener usuarios disponibles
  const { data: users } = useQuery<User[]>({
    queryKey: ["/api/users"],
  });

  // Obtener catálogo de habilidades
  const { data: catalogo } = useQuery<Record<string, string[]>>({
    queryKey: ["/api/habilidades", "catalogo"],
    queryFn: async () => {
      const response = await apiRequest("GET", "/api/habilidades/catalogo");
      return response.json();
    },
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch,
  } = useForm<AssignSkillData>({
    resolver: zodResolver(assignSkillSchema),
  });

  const selectedTipo = watch("tipo");
  const selectedUserId = watch("userId");

  const assignSkillMutation = useMutation({
    mutationFn: async (skillData: AssignSkillData) => {
      const response = await apiRequest("POST", "/api/habilidades/asignar", skillData);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/habilidades"] });
      toast({
        title: "Habilidad asignada",
        description: "La habilidad se ha asignado exitosamente al usuario.",
      });
      reset();
      onOpenChange(false);
    },
    onError: (error: any) => {
      toast({
        title: "Error al asignar habilidad",
        description: error.message || "Ocurrió un error inesperado.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: AssignSkillData) => {
    assignSkillMutation.mutate(data);
  };

  const tiposHabilidades = [
    { value: "herramienta", label: "Herramientas" },
    { value: "habilidad_blanda", label: "Habilidades Blandas" },
    { value: "conocimiento", label: "Conocimientos" },
    { value: "idioma", label: "Idiomas" },
  ];

  const nivelesCompetencia = [
    { value: "básico", label: "Básico" },
    { value: "intermedio", label: "Intermedio" },
    { value: "avanzado", label: "Avanzado" },
    { value: "experto", label: "Experto" },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Asignar Habilidad a Usuario</DialogTitle>
          <DialogDescription>
            Selecciona un usuario y define la habilidad que deseas asignarle.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="userId">Usuario</Label>
            <Select onValueChange={(value) => setValue("userId", parseInt(value))}>
              <SelectTrigger className={errors.userId ? "border-red-500" : ""}>
                <SelectValue placeholder="Seleccionar usuario" />
              </SelectTrigger>
              <SelectContent>
                {users?.map((user) => (
                  <SelectItem key={user.id} value={user.id.toString()}>
                    {user.fullName} (@{user.username})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.userId && (
              <p className="text-sm text-red-500">{errors.userId.message}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="tipo">Tipo de Habilidad</Label>
              <Select onValueChange={(value) => setValue("tipo", value as any)}>
                <SelectTrigger className={errors.tipo ? "border-red-500" : ""}>
                  <SelectValue placeholder="Seleccionar tipo" />
                </SelectTrigger>
                <SelectContent>
                  {tiposHabilidades.map((tipo) => (
                    <SelectItem key={tipo.value} value={tipo.value}>
                      {tipo.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.tipo && (
                <p className="text-sm text-red-500">{errors.tipo.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="nivel">Nivel de Competencia</Label>
              <Select onValueChange={(value) => setValue("nivel", value as any)}>
                <SelectTrigger className={errors.nivel ? "border-red-500" : ""}>
                  <SelectValue placeholder="Seleccionar nivel" />
                </SelectTrigger>
                <SelectContent>
                  {nivelesCompetencia.map((nivel) => (
                    <SelectItem key={nivel.value} value={nivel.value}>
                      {nivel.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.nivel && (
                <p className="text-sm text-red-500">{errors.nivel.message}</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="nombre">Nombre de la Habilidad</Label>
            <div className="flex gap-2">
              <Input
                id="nombre"
                placeholder="Ej: React, Liderazgo, SQL..."
                {...register("nombre")}
                className={errors.nombre ? "border-red-500" : ""}
              />
              {selectedTipo && catalogo?.[selectedTipo] && (
                <Select onValueChange={(value) => setValue("nombre", value)}>
                  <SelectTrigger className="w-[100px]">
                    <SelectValue placeholder="📋" />
                  </SelectTrigger>
                  <SelectContent>
                    {catalogo[selectedTipo].map((nombre) => (
                      <SelectItem key={nombre} value={nombre}>
                        {nombre}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>
            {errors.nombre && (
              <p className="text-sm text-red-500">{errors.nombre.message}</p>
            )}
            {selectedTipo && catalogo?.[selectedTipo] && (
              <p className="text-xs text-gray-500">
                Puedes escribir una nueva habilidad o seleccionar una existente del menú 📋
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="observaciones">Observaciones (Opcional)</Label>
            <Textarea
              id="observaciones"
              placeholder="Certificaciones, experiencia específica, proyectos relacionados..."
              {...register("observaciones")}
              rows={3}
            />
          </div>

          {selectedUserId && (
            <div className="bg-blue-50 p-3 rounded-lg">
              <p className="text-sm font-medium text-blue-700 mb-1">
                Asignando a: {users?.find(u => u.id === selectedUserId)?.fullName}
              </p>
              <p className="text-xs text-blue-600">
                Esta habilidad se agregará al perfil del usuario seleccionado
              </p>
            </div>
          )}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={assignSkillMutation.isPending}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={assignSkillMutation.isPending}
            >
              {assignSkillMutation.isPending ? "Asignando..." : "Asignar Habilidad"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}