import { useMutation, useQueryClient } from '@tanstack/react-query';
import { FacturacionApi } from '../../infrastructure/api/facturacionApi';
import { useToast } from '@/hooks/use-toast';

export function useActualizarEstadoFactura() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({ facturaId, estado }: { facturaId: number; estado: string }) => 
      FacturacionApi.actualizarEstadoFactura(facturaId, estado),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['/api/facturacion'] });
      toast({
        title: "Estado actualizado",
        description: `Estado de factura ${data.numeroFactura} actualizado exitosamente.`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error al actualizar estado",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}