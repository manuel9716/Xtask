import { useMutation, useQueryClient } from '@tanstack/react-query';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { toast } from '@/hooks/use-toast';
import { Presupuesto, UpdatePresupuestoDto } from '../domain/entities/Presupuesto';
import { PresupuestoRepository } from '../infrastructure/repositories/presupuesto.repository';

/**
 * Esquema de validación para la actualización de un presupuesto existente
 */
export const updatePresupuestoSchema = z.object({
  nombre: z.string().min(3, 'El nombre debe tener al menos 3 caracteres').optional(),
  monto: z.number().positive('El monto debe ser mayor a cero').optional(),
  area: z.string().optional(),
  fechaInicio: z.date().optional(),
  fechaFin: z.date().optional(),
}).refine(data => {
  if (data.fechaInicio && data.fechaFin) {
    return data.fechaFin > data.fechaInicio;
  }
  return true;
}, {
  message: 'La fecha de fin debe ser posterior a la fecha de inicio',
  path: ['fechaFin']
});

/**
 * Tipo para los datos del formulario de actualización de presupuesto
 */
export type ActualizarPresupuestoFormData = z.infer<typeof updatePresupuestoSchema>;

/**
 * Hook para manejar la actualización de presupuestos
 */
export function useActualizarEstadoPresupuesto(presupuesto: Presupuesto | null) {
  const presupuestoRepository = new PresupuestoRepository();
  const queryClient = useQueryClient();
  
  // Configuración del formulario con React Hook Form y validación Zod
  const form = useForm<ActualizarPresupuestoFormData>({
    resolver: zodResolver(updatePresupuestoSchema),
    defaultValues: presupuesto ? {
      nombre: presupuesto.nombre,
      monto: presupuesto.monto,
      area: presupuesto.area,
      fechaInicio: presupuesto.fechaInicio,
      fechaFin: presupuesto.fechaFin,
    } : {}
  });
  
  // Mutación para actualizar un presupuesto
  const actualizarPresupuestoMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: UpdatePresupuestoDto }) => {
      return await presupuestoRepository.update(id, data);
    },
    onSuccess: () => {
      // Invalidar la caché para refrescar la lista de presupuestos
      queryClient.invalidateQueries({ queryKey: ['/api/presupuestos'] });
      
      // Mostrar mensaje de éxito
      toast({
        title: 'Presupuesto actualizado',
        description: 'El presupuesto ha sido actualizado exitosamente.',
        variant: 'success',
      });
    },
    onError: (error: Error) => {
      // Mostrar mensaje de error
      toast({
        title: 'Error al actualizar presupuesto',
        description: error.message || 'Ha ocurrido un error al actualizar el presupuesto.',
        variant: 'destructive',
      });
    }
  });
  
  // Función para manejar el envío del formulario
  const onSubmit = (data: ActualizarPresupuestoFormData) => {
    if (!presupuesto) {
      toast({
        title: 'Error',
        description: 'No se ha seleccionado un presupuesto para actualizar.',
        variant: 'destructive',
      });
      return;
    }
    
    actualizarPresupuestoMutation.mutate({ id: presupuesto.id, data });
  };
  
  // Resetear el formulario cuando cambia el presupuesto seleccionado
  const resetForm = () => {
    if (presupuesto) {
      form.reset({
        nombre: presupuesto.nombre,
        monto: presupuesto.monto,
        area: presupuesto.area,
        fechaInicio: presupuesto.fechaInicio,
        fechaFin: presupuesto.fechaFin,
      });
    } else {
      form.reset({});
    }
  };
  
  return {
    form,
    onSubmit,
    resetForm,
    isPending: actualizarPresupuestoMutation.isPending,
    isSuccess: actualizarPresupuestoMutation.isSuccess,
    error: actualizarPresupuestoMutation.error
  };
}