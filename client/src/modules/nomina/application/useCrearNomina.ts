import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { Employee } from '@shared/schema';
import { ResultadoCalculoNomina } from '../domain/services/calculadoraNomina';
import axios from 'axios';

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
      
      try {
        // Agregar un timestamp para evitar caché
        const timestamp = Date.now();
        const url = `/api/nomina/v1/procesarNomina?t=${timestamp}`;
        
        console.log('Enviando solicitud a:', url);
        
        const axiosResponse = await axios.post(url, payload, {
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'X-Request-ID': `nomina-${timestamp}`
          }
        });
        
        console.log('Respuesta recibida:', axiosResponse);
        
        return axiosResponse.data;
      } catch (error) {
        console.error('Error en la solicitud axios:', error);
        
        if (axios.isAxiosError(error) && error.response) {
          console.error('Detalles de error:', error.response.data);
          throw new Error(error.response.data?.error || 'Error en la solicitud');
        } else {
          throw new Error('Error de conexión al servidor');
        }
      }
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
