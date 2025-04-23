import { useMutation, useQueryClient } from '@tanstack/react-query';
import { CrearEmpleadoParams, CrearEmpleadoDTO } from '../domain/entities/Empleado';
import { crearEmpleado } from '../../api/empleadosApi';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';

/**
 * Hook para crear un nuevo empleado
 */
export function useCrearEmpleado() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  const mutacion = useMutation({
    mutationFn: async (datos: CrearEmpleadoParams) => {
      // Validar datos antes de enviar al API
      const validacion = validarDatos(datos);
      
      if (!validacion.success) {
        throw new Error(validacion.error);
      }
      
      return crearEmpleado(validacion.data as CrearEmpleadoParams);
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