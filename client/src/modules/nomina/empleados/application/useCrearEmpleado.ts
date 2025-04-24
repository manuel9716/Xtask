import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { CrearEmpleadoDTO, CrearEmpleadoParams } from '../domain/entities/Empleado';
import { crearEmpleado, obtenerUsuarios } from '../api/empleadosApi';
import { useToast } from '@/hooks/use-toast';

/**
 * Hook para obtener la lista de usuarios para el selector de empleados
 * @returns Función que devuelve la lista de usuarios
 */
export const useObtenerUsuarios = () => {
  const { data, isLoading, error } = useQuery({
    queryKey: ['/api/users'],
    queryFn: obtenerUsuarios,
    staleTime: 5 * 60 * 1000, // 5 minutos para reducir llamadas repetidas
    retry: 2, // Intentar 2 veces más en caso de fallo
  });
  
  // Asegurarse de que siempre devolvemos un array, incluso si hay un error
  return {
    usuarios: data || [],
    isLoading,
    error
  };
};

/**
 * Hook para la creación de empleados
 */
export const useCrearEmpleado = (onSuccess?: () => void) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async (datosEmpleado: CrearEmpleadoParams) => {
      // Validar los datos del empleado con Zod
      const validacion = CrearEmpleadoDTO.safeParse(datosEmpleado);
      
      if (!validacion.success) {
        // Formatear los errores de validación
        const errores = validacion.error.format();
        throw new Error(JSON.stringify(errores));
      }
      
      // Si los datos son válidos, enviar la petición
      return await crearEmpleado(validacion.data);
    },
    onSuccess: () => {
      toast({
        title: 'Empleado creado',
        description: 'El empleado ha sido creado exitosamente.',
        variant: 'default',
      });
      
      // Invalidar consultas para recargar la lista de empleados
      queryClient.invalidateQueries({ queryKey: ['/api/finanzas/nomina/empleados'] });
      
      // Llamar al callback de éxito si existe
      if (onSuccess) {
        onSuccess();
      }
    },
    onError: (error: Error) => {
      try {
        // Intentar parsear los errores de validación
        const errores = JSON.parse(error.message);
        
        // Crear un mensaje de error legible
        const mensajesError = Object.entries(errores)
          .filter(([_, value]) => value && typeof value === 'object' && '_errors' in value)
          .map(([campo, value]) => {
            // @ts-ignore
            const errores = value._errors.join(', ');
            return `${campo}: ${errores}`;
          });
        
        toast({
          title: 'Error de validación',
          description: mensajesError.join('\n'),
          variant: 'destructive',
        });
      } catch {
        // Si no es un error de validación, mostrar el mensaje original
        toast({
          title: 'Error',
          description: error.message || 'Ha ocurrido un error al crear el empleado',
          variant: 'destructive',
        });
      }
    }
  });

  return mutation;
};