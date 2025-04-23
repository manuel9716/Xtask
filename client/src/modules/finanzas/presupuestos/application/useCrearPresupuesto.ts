import { useMutation, useQueryClient } from '@tanstack/react-query';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { toast } from '@/hooks/use-toast';
import { CreatePresupuestoDto, PeriodoBudget, Presupuesto } from '../domain/entities/Presupuesto';
import { PresupuestoRepository } from '../infrastructure/repositories/presupuesto.repository';

/**
 * Esquema de validación para el formulario de creación de presupuesto
 */
export const crearPresupuestoSchema = z.object({
  nombre: z.string().min(3, 'El nombre debe tener al menos 3 caracteres'),
  monto: z.number().positive('El monto debe ser mayor a cero'),
  area: z.string().optional(),
  periodo: z.nativeEnum(PeriodoBudget, {
    errorMap: () => ({ message: 'Seleccione un período válido' })
  }),
  fechaInicio: z.date({
    required_error: 'La fecha de inicio es requerida',
    invalid_type_error: 'Fecha inválida'
  }),
  fechaFin: z.date({
    required_error: 'La fecha de fin es requerida',
    invalid_type_error: 'Fecha inválida'
  }),
  organizationId: z.number().default(1),
}).refine(data => data.fechaFin > data.fechaInicio, {
  message: 'La fecha de fin debe ser posterior a la fecha de inicio',
  path: ['fechaFin']
});

/**
 * Tipo para los datos del formulario de creación de presupuesto
 */
export type CrearPresupuestoFormData = z.infer<typeof crearPresupuestoSchema>;

/**
 * Hook para manejar la creación de presupuestos
 */
export function useCrearPresupuesto() {
  const presupuestoRepository = new PresupuestoRepository();
  const queryClient = useQueryClient();
  
  // Configuración del formulario con React Hook Form y validación Zod
  const form = useForm<CrearPresupuestoFormData>({
    resolver: zodResolver(crearPresupuestoSchema),
    defaultValues: {
      nombre: '',
      monto: 0,
      area: '',
      periodo: undefined,
      fechaInicio: new Date(),
      fechaFin: new Date(new Date().setMonth(new Date().getMonth() + 3)), // 3 meses después por defecto
      organizationId: 1
    }
  });
  
  // Mutación para crear un nuevo presupuesto
  const crearPresupuestoMutation = useMutation({
    mutationFn: async (data: CreatePresupuestoDto) => {
      return await presupuestoRepository.create(data);
    },
    onSuccess: () => {
      // Invalidar la caché para refrescar la lista de presupuestos
      queryClient.invalidateQueries({ queryKey: ['/api/presupuestos'] });
      
      // Mostrar mensaje de éxito
      toast({
        title: 'Presupuesto creado',
        description: 'El presupuesto ha sido creado exitosamente.',
        variant: 'success',
      });
      
      // Resetear el formulario
      form.reset();
    },
    onError: (error: Error) => {
      // Mostrar mensaje de error
      toast({
        title: 'Error al crear presupuesto',
        description: error.message || 'Ha ocurrido un error al crear el presupuesto.',
        variant: 'destructive',
      });
    }
  });
  
  // Función para manejar el envío del formulario
  const onSubmit = (data: CrearPresupuestoFormData) => {
    crearPresupuestoMutation.mutate(data);
  };
  
  return {
    form,
    onSubmit,
    isPending: crearPresupuestoMutation.isPending,
    isSuccess: crearPresupuestoMutation.isSuccess,
    error: crearPresupuestoMutation.error
  };
}