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
      console.log('Creando nómina con datos:', params);
      
      // Formatear fechas para enviarlas a la API y convertir números a strings
      const payload = {
        periodoInicio: params.periodoInicio.toISOString(),
        periodoFin: params.periodoFin.toISOString(),
        fechaPago: params.fechaPago.toISOString(),
        metodoPago: params.metodoPago,
        comentarios: params.comentarios,
        empleados: params.empleadosCalculados.map(({ empleado, calculo }) => {
          // Calcular deducciones como array para enviar al backend
          const deducciones = [
            { 
              concepto: 'Retención Fiscal', 
              valor: calculo.retencionFiscal,
              tipo: 'DEDUCCION'
            },
            { 
              concepto: 'Seguridad Social', 
              valor: calculo.seguridadSocial,
              tipo: 'DEDUCCION'
            }
          ];
          
          // Calcular ingresos como array
          const ingresos = [
            { 
              concepto: 'Salario Base', 
              valor: calculo.salarioBase,
              tipo: 'INGRESO'
            }
          ];
          
          return {
            id: empleado.id,
            // Datos que espera el backend
            salarioBase: calculo.salarioBase.toString(),
            totalIngresos: calculo.salarioBruto.toString(),
            totalDeducciones: (calculo.retencionFiscal + calculo.seguridadSocial + calculo.otrasDeduciones).toString(),
            salarioNeto: calculo.salarioNeto.toString(),
            ingresos: ingresos,
            deducciones: deducciones
          };
        })
      };
      
      console.log('Enviando payload:', payload);
      
      const response = await fetch('/api/nomina/crear', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });
      
      if (!response.ok) {
        let errorMessage = 'Error al crear la nómina';
        try {
          const errorData = await response.json();
          errorMessage = errorData.error || errorMessage;
          console.error('Error en respuesta:', errorData);
        } catch (e) {
          // Si no podemos parsear el JSON, intentamos obtener el texto
          const errorText = await response.text();
          console.error('Error en respuesta (texto):', errorText);
        }
        throw new Error(errorMessage);
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