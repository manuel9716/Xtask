import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { CalendarIcon, CreditCard } from 'lucide-react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Calendar } from '@/components/ui/calendar';
import { MarcarComoPagadaParams, MetodoPago } from '../../domain/entities/Nomina';

// Validación del formulario con zod
const formSchema = z.object({
  nominaId: z.number({
    required_error: "El ID de nómina es requerido",
  }),
  fechaPago: z.date({
    required_error: "La fecha de pago es requerida",
  }),
  metodoPago: z.string({
    required_error: "El método de pago es requerido",
  }),
  referenciaPago: z.string().optional(),
  comentarios: z.string().optional(),
  usuarioId: z.number().default(1), // Por ahora, usar ID fijo
});

interface MarcarPagadaFormProps {
  nominaId: number;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: MarcarComoPagadaParams) => void;
  isPending: boolean;
}

export function MarcarPagadaForm({
  nominaId,
  isOpen,
  onClose,
  onSubmit,
  isPending
}: MarcarPagadaFormProps) {
  // Inicializar el formulario
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      nominaId,
      fechaPago: new Date(),
      metodoPago: MetodoPago.TRANSFERENCIA,
      referenciaPago: '',
      comentarios: '',
      usuarioId: 1,
    },
  });

  // Manejar el envío del formulario
  const handleSubmit = (values: z.infer<typeof formSchema>) => {
    onSubmit(values as MarcarComoPagadaParams);
  };

  // Resetear formulario al abrir el diálogo
  React.useEffect(() => {
    if (isOpen) {
      form.reset({
        nominaId,
        fechaPago: new Date(),
        metodoPago: MetodoPago.TRANSFERENCIA,
        referenciaPago: '',
        comentarios: '',
        usuarioId: 1,
      });
    }
  }, [isOpen, nominaId, form]);

  // Opciones de métodos de pago
  const metodosPago = [
    { value: MetodoPago.TRANSFERENCIA, label: 'Transferencia Bancaria' },
    { value: MetodoPago.CHEQUE, label: 'Cheque' },
    { value: MetodoPago.EFECTIVO, label: 'Efectivo' },
    { value: MetodoPago.ELECTRONICO, label: 'Pago Electrónico' },
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Marcar Nómina como Pagada</DialogTitle>
          <DialogDescription>
            Indique los detalles del pago para registrar esta nómina como pagada.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            {/* Fecha de Pago */}
            <FormField
              control={form.control}
              name="fechaPago"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Fecha de Pago</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant={"outline"}
                          className={cn(
                            "pl-3 text-left font-normal",
                            !field.value && "text-muted-foreground"
                          )}
                        >
                          {field.value ? (
                            format(field.value, "PPP", { locale: es })
                          ) : (
                            <span>Seleccione una fecha</span>
                          )}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        disabled={(date) =>
                          date > new Date() || date < new Date("2000-01-01")
                        }
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <FormDescription>
                    Fecha en que se realizó el pago
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Método de Pago */}
            <FormField
              control={form.control}
              name="metodoPago"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Método de Pago</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccione el método de pago" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {metodosPago.map((metodo) => (
                        <SelectItem key={metodo.value} value={metodo.value}>
                          {metodo.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    Método utilizado para realizar el pago
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Referencia de Pago */}
            <FormField
              control={form.control}
              name="referenciaPago"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Referencia de Pago (opcional)</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Ej. Número de transferencia, cheque, etc."
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Número o referencia de la transacción
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Comentarios */}
            <FormField
              control={form.control}
              name="comentarios"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Comentarios (opcional)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Comentarios adicionales sobre el pago"
                      className="resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button 
                type="button" 
                variant="outline" 
                onClick={onClose}
                disabled={isPending}
              >
                Cancelar
              </Button>
              <Button 
                type="submit"
                disabled={isPending}
              >
                {isPending ? (
                  <>
                    <div className="animate-spin w-4 h-4 mr-2 border-2 border-white border-t-transparent rounded-full"></div>
                    Procesando...
                  </>
                ) : (
                  <>
                    <CreditCard className="mr-2 h-4 w-4" />
                    Marcar como Pagada
                  </>
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}