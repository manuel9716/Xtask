import { UseMutationResult, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { Employee } from '@shared/schema';
import { CrearEmpleadoParams, CrearEmpleadoDTO } from '../domain/entities/Empleado';
import { useToast } from '@/hooks/use-toast';

/**
 * Hook para crear un nuevo empleado
 */
export function useCrearEmpleado(): {
  mutacion: UseMutationResult<Employee, Error, CrearEmpleadoParams>;
  validarDatos: (datos: unknown) => {
    success: boolean;
    data?: CrearEmpleadoParams;
    error?: string;
  };
} {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const mutacion = useMutation<Employee, Error, CrearEmpleadoParams>({
    mutationFn: async (datos: CrearEmpleadoParams) => {
      const res = await apiRequest(
        'POST',
        '/api/finanzas/nomina/empleados',
        datos
      );
      
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Error al crear el empleado');
      }
      
      return res.json();
    },
    onSuccess: () => {
      // Invalidar consultas
      queryClient.invalidateQueries({ queryKey: ['/api/finanzas/nomina/empleados'] });
      
      toast({
        title: 'Empleado creado',
        description: 'El empleado ha sido creado exitosamente',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: error.message || 'Error al crear el empleado',
        variant: 'destructive',
      });
    },
  });
  
  /**
   * Validar los datos del formulario mediante Zod
   */
  const validarDatos = (datos: unknown) => {
    const resultado = CrearEmpleadoDTO.safeParse(datos);
    
    if (!resultado.success) {
      const errorMessages = resultado.error.errors.map(err => 
        `${err.path.join('.')}: ${err.message}`
      ).join(', ');
      
      return {
        success: false,
        error: errorMessages
      };
    }
    
    return {
      success: true,
      data: resultado.data
    };
  };
  
  return {
    mutacion,
    validarDatos
  };
}

/**
 * Hook para obtener todos los usuarios (para seleccionar al crear empleado)
 */
export function useObtenerUsuarios() {
  const queryClient = useQueryClient();
  
  return queryClient.fetchQuery({
    queryKey: ['/api/users'],
    queryFn: async () => {
      const res = await apiRequest('GET', '/api/users');
      if (!res.ok) {
        throw new Error('Error al obtener los usuarios');
      }
      return res.json();
    },
  });
}