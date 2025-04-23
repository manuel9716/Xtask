import { useMutation } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { 
  MarcarComoPagadaParams, 
  CambiarEstadoParams 
} from '../domain/entities/Nomina';

/**
 * Hook para gestionar acciones relacionadas con el cambio de estado de nóminas
 */
export function useGestionarNomina() {
  const { toast } = useToast();

  // Mutación para marcar una nómina como pagada
  const marcarComoPagada = useMutation({
    mutationFn: async (params: MarcarComoPagadaParams) => {
      const response = await fetch(`/api/nomina/marcar-pagado/${params.nominaId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(params),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Error al marcar la nómina como pagada');
      }
      
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Operación exitosa",
        description: "La nómina ha sido marcada como pagada correctamente",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "No se pudo marcar la nómina como pagada",
        variant: "destructive",
      });
    },
  });

  // Mutación para cambiar el estado de una nómina
  const cambiarEstado = useMutation({
    mutationFn: async (params: CambiarEstadoParams) => {
      const response = await fetch(`/api/nomina/cambiar-estado/${params.nominaId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(params),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Error al cambiar el estado de la nómina');
      }
      
      return response.json();
    },
    onSuccess: (_, variables) => {
      const mensajes = {
        'APROBADO': 'La nómina ha sido aprobada correctamente',
        'RECHAZADO': 'La nómina ha sido rechazada',
        'CANCELADO': 'La nómina ha sido cancelada',
        'PENDIENTE': 'La nómina ha sido marcada como pendiente',
      };
      
      const mensaje = mensajes[variables.nuevoEstado as keyof typeof mensajes] || 
                     'El estado de la nómina ha sido actualizado';
      
      toast({
        title: "Operación exitosa",
        description: mensaje,
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "No se pudo cambiar el estado de la nómina",
        variant: "destructive",
      });
    },
  });

  return {
    marcarComoPagada,
    cambiarEstado,
  };
}