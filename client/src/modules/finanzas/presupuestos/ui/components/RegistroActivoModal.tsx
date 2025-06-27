import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { DollarSign, Package, User, MapPin } from 'lucide-react';

const activoSchema = z.object({
  descripcion: z.string().min(3, 'La descripción debe tener al menos 3 caracteres'),
  valor: z.number().min(1, 'El valor debe ser mayor a 0'),
  responsable: z.string().min(3, 'El responsable debe tener al menos 3 caracteres'),
  ubicacion: z.string().min(3, 'La ubicación debe tener al menos 3 caracteres'),
  estado: z.string().min(1, 'El estado es requerido'),
  categoria: z.string().min(1, 'La categoría es requerida'),
  fechaAdquisicion: z.string().min(1, 'La fecha de adquisición es requerida'),
  numeroSerie: z.string().optional(),
  observaciones: z.string().optional(),
});

type ActivoFormData = z.infer<typeof activoSchema>;

interface RegistroActivoModalProps {
  isOpen: boolean;
  onClose: () => void;
  presupuestoId: number;
}

const estados = [
  'Operativo',
  'En mantenimiento',
  'Dañado',
  'En préstamo',
  'Fuera de servicio',
  'En garantía'
];

const categorias = [
  'Equipos de cómputo',
  'Mobiliario',
  'Software',
  'Herramientas',
  'Vehículos',
  'Equipos de oficina',
  'Otros'
];

export function RegistroActivoModal({ isOpen, onClose, presupuestoId }: RegistroActivoModalProps) {
  const form = useForm<ActivoFormData>({
    resolver: zodResolver(activoSchema),
    defaultValues: {
      descripcion: '',
      valor: 0,
      responsable: '',
      ubicacion: '',
      estado: '',
      categoria: '',
      fechaAdquisicion: new Date().toISOString().split('T')[0],
      numeroSerie: '',
      observaciones: '',
    },
  });

  const formatCurrency = (value: string) => {
    const number = value.replace(/[^\d]/g, '');
    if (!number) return '';
    return new Intl.NumberFormat('es-CO').format(parseInt(number));
  };

  const handleSubmit = async (data: ActivoFormData) => {
    try {
      console.log('Registrando activo:', { ...data, presupuestoId });
      // Aquí iría la llamada a la API
      // await fetch(`/api/finanzas/presupuestos/${presupuestoId}/activos`, {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(data)
      // });
      
      alert('Activo registrado exitosamente');
      form.reset();
      onClose();
    } catch (error) {
      console.error('Error al registrar activo:', error);
      alert('Error al registrar el activo');
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Package className="h-5 w-5 text-[#02BDEA]" />
            Registrar Nuevo Activo
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Descripción */}
              <FormField
                control={form.control}
                name="descripcion"
                render={({ field }) => (
                  <FormItem className="md:col-span-2">
                    <FormLabel>Descripción del Activo</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Ej: Laptop Dell XPS 15, Monitor Samsung 4K..."
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Valor */}
              <FormField
                control={form.control}
                name="valor"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Valor (COP)</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input
                          type="text"
                          placeholder="0"
                          className="pl-10"
                          value={field.value ? formatCurrency(field.value.toString()) : ''}
                          onChange={(e) => {
                            const value = e.target.value.replace(/[^\d]/g, '');
                            field.onChange(value ? parseInt(value) : 0);
                          }}
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Fecha de Adquisición */}
              <FormField
                control={form.control}
                name="fechaAdquisicion"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Fecha de Adquisición</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Responsable */}
              <FormField
                control={form.control}
                name="responsable"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Responsable</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input 
                          placeholder="Nombre del responsable"
                          className="pl-10"
                          {...field} 
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Ubicación */}
              <FormField
                control={form.control}
                name="ubicacion"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Ubicación</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input 
                          placeholder="Ej: Oficina Principal, Sala de Juntas..."
                          className="pl-10"
                          {...field} 
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Categoría */}
              <FormField
                control={form.control}
                name="categoria"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Categoría</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccionar categoría" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {categorias.map((categoria) => (
                          <SelectItem key={categoria} value={categoria}>
                            {categoria}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Estado */}
              <FormField
                control={form.control}
                name="estado"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Estado</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccionar estado" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {estados.map((estado) => (
                          <SelectItem key={estado} value={estado}>
                            {estado}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Número de Serie */}
              <FormField
                control={form.control}
                name="numeroSerie"
                render={({ field }) => (
                  <FormItem className="md:col-span-2">
                    <FormLabel>Número de Serie (Opcional)</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Número de serie o código de inventario"
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Observaciones */}
            <FormField
              control={form.control}
              name="observaciones"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Observaciones (Opcional)</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Información adicional sobre el activo..."
                      className="min-h-[100px]"
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Botones */}
            <div className="flex justify-end gap-2 pt-4">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancelar
              </Button>
              <Button 
                type="submit" 
                className="bg-[#02BDEA] hover:bg-[#02BDEA]/90"
              >
                Registrar Activo
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}