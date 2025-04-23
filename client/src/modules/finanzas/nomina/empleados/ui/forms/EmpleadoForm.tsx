import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { CalendarIcon, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Form,
  FormControl,
  FormDescription,
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
  SelectValue 
} from '@/components/ui/select';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';

import { CrearEmpleadoDTO } from '../../domain/entities/Empleado';
import { useCrearEmpleado } from '../../application/useCrearEmpleado';

// Extender el schema de Zod para adaptarlo al formulario
const formSchema = CrearEmpleadoDTO.extend({
  // Convertir algunos campos para facilitar el manejo en el formulario
  salary: z.string().min(1, { message: 'El salario es obligatorio' }),
  baseBenefits: z.string().optional(),
  baseDeductions: z.string().optional(),
  taxRate: z.string().optional(),
  // Para el caso donde emergencyContact es un JSON string
  emergencyContactName: z.string().optional(),
  emergencyContactPhone: z.string().optional(),
  emergencyContactRelationship: z.string().optional(),
});

// Tipo para los datos del formulario
type FormValues = z.infer<typeof formSchema>;

interface EmpleadoFormProps {
  onSuccess?: () => void;
}

export function EmpleadoForm({ onSuccess }: EmpleadoFormProps) {
  const { mutacion, validarDatos } = useCrearEmpleado();
  const [usuarios, setUsuarios] = useState<any[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(true);

  // Inicializar el formulario con valores por defecto
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      userId: undefined,
      position: '',
      department: '',
      hireDate: new Date(),
      salary: '',
      phoneNumber: '',
      address: '',
      contractStatus: 'active',
      contractType: 'fulltime',
      identification: '',
      baseBenefits: '0',
      baseDeductions: '0',
      taxRate: '0',
      emergencyContactName: '',
      emergencyContactPhone: '',
      emergencyContactRelationship: '',
    },
  });

  // Cargar usuarios
  useEffect(() => {
    const fetchUsuarios = async () => {
      try {
        const response = await fetch('/api/users');
        if (response.ok) {
          const data = await response.json();
          setUsuarios(data);
        } else {
          console.error('Error al cargar usuarios');
        }
      } catch (error) {
        console.error('Error al cargar usuarios:', error);
      } finally {
        setLoadingUsers(false);
      }
    };

    fetchUsuarios();
  }, []);

  // Manejar el envío del formulario
  const onSubmit = async (data: FormValues) => {
    try {
      // Preparar los datos para enviar al servidor
      const emergencyContact = data.emergencyContactName || data.emergencyContactPhone
        ? JSON.stringify({
            name: data.emergencyContactName,
            phone: data.emergencyContactPhone,
            relationship: data.emergencyContactRelationship,
          })
        : undefined;

      // Eliminar campos que no están en el DTO original
      const { 
        emergencyContactName, 
        emergencyContactPhone, 
        emergencyContactRelationship, 
        ...restData 
      } = data;

      // Enviar los datos al servidor
      await mutacion.mutateAsync({
        ...restData,
        emergencyContact,
      });

      // Resetear el formulario después del éxito
      form.reset();
      
      // Llamar a la función onSuccess si existe
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error('Error al crear empleado:', error);
    }
  };

  return (
    <div className="w-full max-w-3xl mx-auto p-4 bg-white rounded-lg shadow">
      <h2 className="text-2xl font-bold mb-6 text-primary">Registrar Nuevo Empleado</h2>
      
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Usuario asociado */}
            <FormField
              control={form.control}
              name="userId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Usuario *</FormLabel>
                  <Select
                    disabled={loadingUsers}
                    onValueChange={(value) => field.onChange(parseInt(value))}
                    value={field.value?.toString()}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar Usuario" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {loadingUsers ? (
                        <div className="flex items-center justify-center p-2">
                          <Loader2 className="h-4 w-4 animate-spin mr-2" />
                          <span>Cargando usuarios...</span>
                        </div>
                      ) : (
                        usuarios.map((usuario) => (
                          <SelectItem key={usuario.id} value={usuario.id.toString()}>
                            {usuario.fullName || usuario.username}
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Número de identificación */}
            <FormField
              control={form.control}
              name="identification"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Identificación *</FormLabel>
                  <FormControl>
                    <Input placeholder="Número de identificación" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Cargo */}
            <FormField
              control={form.control}
              name="position"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Cargo *</FormLabel>
                  <FormControl>
                    <Input placeholder="Cargo del empleado" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Departamento */}
            <FormField
              control={form.control}
              name="department"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Departamento *</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar Departamento" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="Administración">Administración</SelectItem>
                      <SelectItem value="Finanzas">Finanzas</SelectItem>
                      <SelectItem value="Recursos Humanos">Recursos Humanos</SelectItem>
                      <SelectItem value="Tecnología">Tecnología</SelectItem>
                      <SelectItem value="Ventas">Ventas</SelectItem>
                      <SelectItem value="Operaciones">Operaciones</SelectItem>
                      <SelectItem value="Marketing">Marketing</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Fecha de Contratación */}
            <FormField
              control={form.control}
              name="hireDate"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Fecha de Contratación *</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant={"outline"}
                          className={cn(
                            "w-full pl-3 text-left font-normal",
                            !field.value && "text-muted-foreground"
                          )}
                        >
                          {field.value ? (
                            format(field.value, "PPP", { locale: es })
                          ) : (
                            <span>Seleccionar fecha</span>
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
                          date > new Date() || date < new Date("1900-01-01")
                        }
                        locale={es}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Tipo de Contrato */}
            <FormField
              control={form.control}
              name="contractType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tipo de Contrato *</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar Tipo de Contrato" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="fulltime">Tiempo Completo</SelectItem>
                      <SelectItem value="parttime">Medio Tiempo</SelectItem>
                      <SelectItem value="contractor">Contratista</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Salario */}
            <FormField
              control={form.control}
              name="salary"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Salario Base *</FormLabel>
                  <FormControl>
                    <Input 
                      type="text" 
                      placeholder="Ej: 5000.00" 
                      {...field} 
                      onChange={(e) => {
                        // Permitir solo números y punto decimal
                        const value = e.target.value.replace(/[^0-9.]/g, '');
                        field.onChange(value);
                      }}
                    />
                  </FormControl>
                  <FormDescription>
                    Ingrese el monto sin símbolos de moneda
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Teléfono */}
            <FormField
              control={form.control}
              name="phoneNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Teléfono</FormLabel>
                  <FormControl>
                    <Input placeholder="Número de teléfono" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Beneficios Base */}
            <FormField
              control={form.control}
              name="baseBenefits"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Beneficios Base</FormLabel>
                  <FormControl>
                    <Input 
                      type="text" 
                      placeholder="Ej: 500.00" 
                      {...field} 
                      onChange={(e) => {
                        const value = e.target.value.replace(/[^0-9.]/g, '');
                        field.onChange(value);
                      }}
                    />
                  </FormControl>
                  <FormDescription>
                    Beneficios fijos mensuales
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Deducciones Base */}
            <FormField
              control={form.control}
              name="baseDeductions"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Deducciones Base</FormLabel>
                  <FormControl>
                    <Input 
                      type="text" 
                      placeholder="Ej: 200.00" 
                      {...field} 
                      onChange={(e) => {
                        const value = e.target.value.replace(/[^0-9.]/g, '');
                        field.onChange(value);
                      }}
                    />
                  </FormControl>
                  <FormDescription>
                    Deducciones fijas mensuales
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Tasa de Impuestos */}
            <FormField
              control={form.control}
              name="taxRate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tasa de Impuestos (%)</FormLabel>
                  <FormControl>
                    <Input 
                      type="text" 
                      placeholder="Ej: 19.0" 
                      {...field} 
                      onChange={(e) => {
                        const value = e.target.value.replace(/[^0-9.]/g, '');
                        field.onChange(value);
                      }}
                    />
                  </FormControl>
                  <FormDescription>
                    Tasa de retención de impuestos
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Dirección */}
          <FormField
            control={form.control}
            name="address"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Dirección</FormLabel>
                <FormControl>
                  <Textarea 
                    placeholder="Dirección completa del empleado" 
                    className="resize-none" 
                    {...field} 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Contacto de Emergencia */}
          <div>
            <h3 className="text-md font-medium mb-2">Contacto de Emergencia</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="emergencyContactName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nombre</FormLabel>
                    <FormControl>
                      <Input placeholder="Nombre del contacto" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="emergencyContactPhone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Teléfono</FormLabel>
                    <FormControl>
                      <Input placeholder="Teléfono del contacto" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="emergencyContactRelationship"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Parentesco</FormLabel>
                    <FormControl>
                      <Input placeholder="Parentesco/Relación" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => form.reset()}
            >
              Cancelar
            </Button>
            <Button 
              type="submit" 
              disabled={mutacion.isPending}
            >
              {mutacion.isPending && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Guardar Empleado
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}