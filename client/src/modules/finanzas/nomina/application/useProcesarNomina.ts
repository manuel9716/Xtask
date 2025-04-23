import { useMutation } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { ProcesarNominaParams } from '../domain/entities/Nomina';

/**
 * Hook para procesar nóminas
 */
export function useProcesarNomina() {
  const { toast } = useToast();
  
  // Mutación para procesar nómina
  const { mutate: procesarNominaMutate, isPending } = useMutation({
    mutationFn: async (params: ProcesarNominaParams) => {
      const response = await fetch('/api/finanzas/nomina/procesar', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(params),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Error al procesar la nómina');
      }
      
      return response.json();
    },
    onSuccess: (data) => {
      // Extraer cantidad de nóminas procesadas si viene en la respuesta
      const cantidad = data?.procesadas || data?.length || 'Las';
      
      toast({
        title: "Nóminas procesadas",
        description: `${cantidad} nóminas han sido procesadas correctamente.`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "No se pudieron procesar las nóminas",
        variant: "destructive",
      });
    },
  });

  // Función para procesar nómina con las mismas opciones que envuelve la mutación
  const procesarNomina = (params: ProcesarNominaParams, options?: { onSuccess?: () => void }) => {
    return procesarNominaMutate(params, options);
  };

  return {
    procesarNomina,
    isPending
  };
}