import { useQuery } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';

export interface DetalleNominaEmpleado {
  id: number;
  nominaId: number;
  empleadoId: number;
  salarioBase: string;
  totalIngresos: string;
  totalDeducciones: string;
  salarioNeto: string;
  detalleIngresos: Array<{
    concepto: string;
    valor: number;
    tipo: string;
  }>;
  detalleDeducciones: Array<{
    concepto: string;
    valor: number;
    tipo: string;
  }>;
  estado: string;
  pdfUrl: string | null;
  fechaGeneracion: string;
  empleado: {
    id: number;
    nombre: string;
    puesto: string;
    departamento: string;
  } | null;
}

export interface DetalleNominaResponse {
  cabecera: {
    id: number;
    titulo: string;
    periodoInicio: string;
    periodoFin: string;
    fechaPago: string;
    metodoPago: string;
    estado: string;
    comentarios: string;
    fechaCreacion: string;
    fechaActualizacion: string;
    creadoPor: number;
    actualizadoPor: number | null;
    montoTotal: string;
  };
  detalles: DetalleNominaEmpleado[];
  resumen: {
    totalEmpleados: number;
    montoTotal: string;
  };
}

export function useDetalleNomina(nominaId: number | null) {
  const { toast } = useToast();
  
  return useQuery<DetalleNominaResponse>({
    queryKey: [`/api/nomina/v1/detalle/${nominaId}`],
    queryFn: async ({ queryKey }) => {
      if (!nominaId) throw new Error('ID de nómina no proporcionado');
      
      const response = await fetch(queryKey[0] as string);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage = errorData.error || 'Error al obtener detalle de nómina';
        throw new Error(errorMessage);
      }
      
      return response.json();
    },
    enabled: nominaId !== null,
    staleTime: 60000, // 1 minuto
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
}