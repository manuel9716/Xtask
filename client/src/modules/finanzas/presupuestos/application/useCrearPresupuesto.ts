import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { z } from 'zod';
import { presupuestoRepository } from '../infrastructure/repositories/presupuesto.pg.repository';
import { queryClient } from '@/lib/queryClient';
import { 
  CrearPresupuestoDTO, 
  crearPresupuestoSchema 
} from '../domain/entities/Presupuesto';

export type CrearPresupuestoFormData = z.infer<typeof crearPresupuestoSchema>;

/**
 * Hook de aplicación para crear presupuestos
 */
export function useCrearPresupuesto() {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const mutation = useMutation({
    mutationFn: async (data: CrearPresupuestoDTO) => {
      return presupuestoRepository.crearPresupuesto(data);
    },
    onSuccess: () => {
      // Invalidar las consultas relacionadas con presupuestos
      queryClient.invalidateQueries({ queryKey: ['/api/presupuestos'] });
      
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
      setIsSubmitting(true);
      await mutation.mutateAsync(data);
      return true;
    } catch (error) {
      console.error('Error al crear presupuesto:', error);
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    crearPresupuesto,
    isSubmitting,
    isPending: mutation.isPending,
  };
}