import { useMutation, useQueryClient } from '@tanstack/react-query';
import { FacturacionApi } from '../../infrastructure/api/facturacionApi';
import { InsertFacturaProyecto } from '@shared/schema';
import { useToast } from '@/hooks/use-toast';

export function useRegistrarFactura() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (factura: InsertFacturaProyecto) => 
      FacturacionApi.registrarFactura(factura),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['/api/facturacion'] });
      toast({
        title: "Factura registrada",
        description: `Factura ${data.numeroFactura} registrada exitosamente.`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error al registrar factura",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}