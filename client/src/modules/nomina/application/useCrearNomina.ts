import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { Employee } from '@shared/schema';
import { ResultadoCalculoNomina } from '../domain/services/calculadoraNomina';

export interface EmpleadoConCalculos {
  empleado: Employee;
  calculo: ResultadoCalculoNomina;
}

export interface CrearNominaParams {
  empleadosIds: number[];
  empleadosCalculados: EmpleadoConCalculos[];
  periodoInicio: Date;
  periodoFin: Date;
  fechaPago: Date;
  metodoPago: string;
  comentarios?: string;
}

export function useCrearNomina() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: async (params: CrearNominaParams) => {
      // Formatear fechas para enviarlas a la API
      const payload = {
        periodoInicio: params.periodoInicio.toISOString(),
        periodoFin: params.periodoFin.toISOString(),
        fechaPago: params.fechaPago.toISOString(),
        metodoPago: params.metodoPago,
        comentarios: params.comentarios,
        empleados: params.empleadosCalculados.map(({ empleado, calculo }) => ({
          id: empleado.id,
          nombre: `${empleado.firstName} ${empleado.lastName}`,
          departamento: empleado.department,
          cargo: empleado.position,
          salarioBase: calculo.salarioBase,
          salarioBruto: calculo.salarioBruto,
          retencionFiscal: calculo.retencionFiscal,
          seguridadSocial: calculo.seguridadSocial,
          otrasDeduciones: calculo.otrasDeduciones,
          salarioNeto: calculo.salarioNeto
        }))
      };
      
      const response = await fetch('/api/nomina/crear', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Error al crear la nómina');
      }
      
      return await response.json();
    },
    onSuccess: () => {
      // Invalidar consultas relacionadas para actualizar datos
      queryClient.invalidateQueries({ queryKey: ['/api/nomina'] });
      
      toast({
        title: 'Nómina creada',
        description: 'La nómina ha sido creada correctamente',
        variant: 'default',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message || 'Ocurrió un error al crear la nómina',
        variant: 'destructive',
      });
    }
  });
}