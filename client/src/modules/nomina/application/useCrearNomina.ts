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
      
      // Usamos un servicio de mock para probar la funcionalidad
      // Simulamos la respuesta del servidor
      console.log('Simulando creación de nómina con:', payload);
      
      // Simulamos el procesamiento en el servidor
      const nuevaNomina = {
        id: Date.now(),
        titulo: `Nómina ${new Date(payload.periodoInicio).toLocaleDateString()} a ${new Date(payload.periodoFin).toLocaleDateString()}`,
        periodoInicio: payload.periodoInicio,
        periodoFin: payload.periodoFin,
        fechaPago: payload.fechaPago,
        metodoPago: payload.metodoPago,
        estado: 'PENDIENTE',
        comentarios: payload.comentarios || '',
        fechaCreacion: new Date().toISOString(),
        fechaActualizacion: new Date().toISOString(),
        montoTotal: payload.empleados.reduce((total, emp) => {
          return total + parseFloat(emp.salarioNeto.toString());
        }, 0).toString(),
        empleados: payload.empleados.map(emp => ({
          id: Date.now() + emp.id,
          nominaId: Date.now(),
          empleadoId: emp.id,
          salarioBase: emp.salarioBase,
          totalIngresos: emp.totalIngresos,
          totalDeducciones: emp.totalDeducciones,
          salarioNeto: emp.salarioNeto,
          detalleIngresos: JSON.stringify(emp.ingresos),
          detalleDeducciones: JSON.stringify(emp.deducciones),
          estado: 'PENDIENTE',
          fechaGeneracion: new Date().toISOString()
        }))
      };
      
      // Simular una respuesta HTTP
      const response = {
        ok: true,
        json: async () => nuevaNomina
      } as Response;
      
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