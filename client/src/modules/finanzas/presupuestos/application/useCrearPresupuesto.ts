import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { z } from 'zod';
import { useToast } from "@/hooks/use-toast";
import { CrearPresupuestoDTO } from '../domain/entities/Presupuesto';
import { presupuestoRepository } from '../infrastructure/repositories/presupuesto.pg.repository';

// Schema de validación para crear presupuestos
export const crearPresupuestoSchema = z.object({
  nombre: z.string().min(3, 'El nombre debe tener al menos 3 caracteres'),
  monto: z.number().min(1, 'El monto debe ser mayor a 0'),
  area: z.string().optional(),
  fechaInicio: z.date({
    required_error: 'La fecha de inicio es requerida',
    invalid_type_error: 'Fecha de inicio inválida',
  }),
  fechaFin: z.date({
    required_error: 'La fecha de fin es requerida',
    invalid_type_error: 'Fecha de fin inválida',
  }).refine(fechaFin => fechaFin > new Date(), {
    message: 'La fecha de fin debe ser posterior a hoy',
  }),
  description: z.string().optional(),
}).refine(data => data.fechaFin > data.fechaInicio, {
  message: 'La fecha de fin debe ser posterior a la fecha de inicio',
  path: ['fechaFin'],
});

export type CrearPresupuestoFormData = z.infer<typeof crearPresupuestoSchema>;

/**
 * Hook de aplicación para crear presupuestos
 */
export function useCrearPresupuesto() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Mutation para crear presupuesto
  const crearPresupuestoMutation = useMutation({
    mutationFn: async (data: CrearPresupuestoDTO) => {
      try {
        setIsSubmitting(true);
        return await presupuestoRepository.crearPresupuesto(data);
      } finally {
        setIsSubmitting(false);
      }
    },
    onSuccess: () => {
      // Invalidar la consulta para refrescar la lista de presupuestos
      queryClient.invalidateQueries({ queryKey: ['presupuestos'] });
      
      toast({
        title: "Presupuesto creado",
        description: "El presupuesto ha sido creado exitosamente",
        variant: "default",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error al crear presupuesto",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  /**
   * Función para crear un nuevo presupuesto
   */
  const crearPresupuesto = async (data: CrearPresupuestoFormData) => {
    try {
      await crearPresupuestoMutation.mutateAsync(data);
      return true;
    } catch (error) {
      return false;
    }
  };

  return {
    crearPresupuesto,
    isSubmitting,
    isPending: crearPresupuestoMutation.isPending
  };
}