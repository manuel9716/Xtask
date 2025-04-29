import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { EmpleadoConCalculos } from '../ui/components/NominaFormModal';

/**
 * Interfaz para los datos de creación de nómina
 */
export interface CrearNominaParams {
  periodoInicio: Date;
  periodoFin: Date;
  fechaPago: Date;
  metodoPago: string;
  empleadosIds: number[];
  empleadosCalculados: EmpleadoConCalculos[];
  comentarios?: string;
}

/**
 * Hook para crear nóminas
 */
export function useCrearNomina() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Mutación para crear nómina
  const { mutate, isPending } = useMutation({
    mutationFn: async (params: CrearNominaParams) => {
      // Transformar datos para la API
      const payload = {
        periodoInicio: params.periodoInicio,
        periodoFin: params.periodoFin,
        fechaPago: params.fechaPago,
        metodoPago: params.metodoPago,
        empleados: params.empleadosCalculados.map(emp => ({
          empleadoId: emp.id,
          salarioBase: emp.calculosNomina.salarioBase,
          salarioBruto: emp.calculosNomina.salarioBruto,
          retencionFiscal: emp.calculosNomina.retencionFiscal,
          seguridadSocial: emp.calculosNomina.seguridadSocial,
          otrasDeduciones: emp.calculosNomina.otrasDeduciones,
          salarioNeto: emp.calculosNomina.salarioNeto
        })),
        comentarios: params.comentarios || ''
      };
      
      const response = await apiRequest(
        'POST',
        '/api/nomina/crear',
        payload
      );
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Error al crear la nómina');
      }
      
      return response.json();
    },
    onSuccess: (data) => {
      // Invalidar queries para forzar recarga de datos
      queryClient.invalidateQueries({ queryKey: ['/api/nomina'] });
      
      toast({
        title: "Nómina creada con éxito",
        description: `Se ha creado una nueva nómina con ${data.empleados?.length || 'varios'} empleados.`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error al crear la nómina",
        description: error.message || "No se pudo crear la nómina. Intente nuevamente.",
        variant: "destructive",
      });
    },
  });

  return {
    crearNomina: mutate,
    isPending
  };
}