import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { empleadosApi } from '../services/empleados.api';
import { useToast } from '@/hooks/use-toast';

const editEmpleadoSchema = z.object({
  nombre: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
  apellido: z.string().min(2, 'El apellido debe tener al menos 2 caracteres'),
  identificacion: z.string().min(5, 'La identificación debe tener al menos 5 caracteres'),
  depto: z.string().min(1, 'El departamento es obligatorio'),
  cargo: z.string().min(1, 'El cargo es obligatorio'),
  fecha_ingreso: z.string().min(1, 'La fecha de ingreso es obligatoria'),
  estado_contrato: z.enum(['activo', 'inactivo', 'suspendido']),
  tipo_contrato: z.enum(['indefinido', 'fijo', 'obra_labor', 'prestacion_servicios']),
  telefono: z.string().optional(),
  direccion: z.string().optional(),
  contacto_emergencia: z.string().optional(),
  // Datos de nómina
  sueldo_base: z.number().min(0, 'El sueldo debe ser mayor a 0'),
  bonificacion: z.number().min(0).default(0),
  tasa_impuestos: z.number().min(0).max(1).default(0.19),
  base_deduccion: z.number().min(0).default(0),
  beneficios_base: z.number().min(0).default(0),
  metodo_pago: z.enum(['transferencia', 'efectivo', 'cheque']),
  cuenta_bancaria: z.string().optional(),
  seguro_salud: z.string().optional(),
  dias_vacaciones: z.number().min(0).default(15),
  frecuencia_pago: z.enum(['quincenal', 'mensual']),
});

type EditEmpleadoForm = z.infer<typeof editEmpleadoSchema>;

interface EmployeeEditModalProps {
  empleado: any;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function EmployeeEditModal({
  empleado,
  open,
  onOpenChange,
  onSuccess,
}: EmployeeEditModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const form = useForm<EditEmpleadoForm>({
    resolver: zodResolver(editEmpleadoSchema),
    defaultValues: {
      nombre: empleado?.nombre || '',
      apellido: empleado?.apellido || '',
      identificacion: empleado?.identificacion || '',
      depto: empleado?.depto || '',
      cargo: empleado?.cargo || '',
      fecha_ingreso: empleado?.fecha_ingreso || '',
      estado_contrato: empleado?.estado_contrato || 'activo',
      tipo_contrato: empleado?.tipo_contrato || 'indefinido',
      telefono: empleado?.telefono || '',
      direccion: empleado?.direccion || '',
      contacto_emergencia: empleado?.contacto_emergencia || '',
      sueldo_base: Number(empleado?.nomina?.sueldo_base || 0),
      bonificacion: Number(empleado?.nomina?.bonificacion || 0),
      tasa_impuestos: Number(empleado?.nomina?.tasa_impuestos || 0.19),
      base_deduccion: Number(empleado?.nomina?.base_deduccion || 0),
      beneficios_base: Number(empleado?.nomina?.beneficios_base || 0),
      metodo_pago: empleado?.nomina?.metodo_pago || 'transferencia',
      cuenta_bancaria: empleado?.nomina?.cuenta_bancaria || '',
      seguro_salud: empleado?.nomina?.seguro_salud || '',
      dias_vacaciones: Number(empleado?.nomina?.dias_vacaciones || 15),
      frecuencia_pago: empleado?.nomina?.frecuencia_pago || 'mensual',
    },
  });

  const onSubmit = async (data: EditEmpleadoForm) => {
    try {
      setIsLoading(true);
      
      const empleadoData = {
        nombre: data.nombre,
        apellido: data.apellido,
        identificacion: data.identificacion,
        depto: data.depto,
        cargo: data.cargo,
        fecha_ingreso: data.fecha_ingreso,
        estado_contrato: data.estado_contrato,
        tipo_contrato: data.tipo_contrato,
        telefono: data.telefono,
        direccion: data.direccion,
        contacto_emergencia: data.contacto_emergencia,
      };

      const nominaData = {
        sueldo_base: data.sueldo_base,
        bonificacion: data.bonificacion,
        tasa_impuestos: data.tasa_impuestos,
        base_deduccion: data.base_deduccion,
        beneficios_base: data.beneficios_base,
        metodo_pago: data.metodo_pago,
        cuenta_bancaria: data.cuenta_bancaria,
        seguro_salud: data.seguro_salud,
        dias_vacaciones: data.dias_vacaciones,
        frecuencia_pago: data.frecuencia_pago,
      };

      await empleadosApi.updateEmpleado(empleado.id, {
        empleado: empleadoData,
        nomina: nominaData,
      });

      toast({
        title: 'Empleado actualizado',
        description: 'Los datos del empleado han sido actualizados correctamente',
      });

      onSuccess();
    } catch (error: any) {
      toast({
        title: 'Error al actualizar',
        description: error.message || 'Error al actualizar el empleado',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Editar Empleado</DialogTitle>
          <DialogDescription>
            Actualiza la información personal y de nómina del empleado
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Información Personal */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Información Personal</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="nombre"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nombre *</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="apellido"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Apellido *</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="identificacion"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Identificación *</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="telefono"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Teléfono</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="direccion"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Dirección</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="contacto_emergencia"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Contacto de Emergencia</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Información Laboral */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Información Laboral</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="depto"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Departamento *</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="cargo"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Cargo *</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="fecha_ingreso"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Fecha de Ingreso *</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="estado_contrato"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Estado del Contrato *</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Seleccionar estado" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="activo">Activo</SelectItem>
                          <SelectItem value="inactivo">Inactivo</SelectItem>
                          <SelectItem value="suspendido">Suspendido</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="tipo_contrato"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tipo de Contrato *</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Seleccionar tipo" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="indefinido">Indefinido</SelectItem>
                          <SelectItem value="fijo">Término Fijo</SelectItem>
                          <SelectItem value="obra_labor">Obra o Labor</SelectItem>
                          <SelectItem value="prestacion_servicios">Prestación de Servicios</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Información de Nómina */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Información de Nómina</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="sueldo_base"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Sueldo Base *</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.01"
                          {...field}
                          onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="bonificacion"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Bonificación</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.01"
                          {...field}
                          onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="tasa_impuestos"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tasa de Impuestos (0-1)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.01"
                          min="0"
                          max="1"
                          {...field}
                          onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="base_deduccion"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Base de Deducción</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.01"
                          {...field}
                          onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="metodo_pago"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Método de Pago *</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Seleccionar método" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="transferencia">Transferencia</SelectItem>
                          <SelectItem value="efectivo">Efectivo</SelectItem>
                          <SelectItem value="cheque">Cheque</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="frecuencia_pago"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Frecuencia de Pago *</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Seleccionar frecuencia" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="quincenal">Quincenal</SelectItem>
                          <SelectItem value="mensual">Mensual</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="cuenta_bancaria"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Cuenta Bancaria</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="dias_vacaciones"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Días de Vacaciones</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          {...field}
                          onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancelar
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? 'Guardando...' : 'Guardar Cambios'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}