import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect, useState } from 'react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Calendar as CalendarIcon } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';

import { CrearEmpleadoParams, CrearEmpleadoDTO } from '../../domain/entities/Empleado';
import { useCrearEmpleado, useObtenerUsuarios } from '../../application/useCrearEmpleado';

interface EmpleadoFormProps {
  onSuccess: () => void;
}

export function EmpleadoForm({ onSuccess }: EmpleadoFormProps) {
  const mutation = useCrearEmpleado();
  const { toast } = useToast();
  const [usuarios, setUsuarios] = useState<any[]>([]);
  const [cargandoUsuarios, setCargandoUsuarios] = useState(true);
  
  const form = useForm<CrearEmpleadoParams>({
    resolver: zodResolver(CrearEmpleadoDTO),
    defaultValues: {
      department: '',
      position: '',
      contractStatus: 'active',
      contractType: 'fulltime',
      identification: '',
      salary: '',
      hireDate: new Date(),
      phoneNumber: '',
      address: '',
      emergencyContact: '',
      baseBenefits: '0',
      baseDeductions: '0',
      taxRate: '0',
    },
  });
  
  // Cargar los usuarios para el selector usando el hook useObtenerUsuarios
  const { usuarios: usuariosData, isLoading: cargandoUsuariosData, error: errorUsuarios } = useObtenerUsuarios();
  
  // Actualizar el estado local cuando los datos del hook cambian
  useEffect(() => {
    setUsuarios(usuariosData);
    setCargandoUsuarios(cargandoUsuariosData);
    
    if (errorUsuarios instanceof Error) {
      console.error("Error al cargar usuarios:", errorUsuarios);
      toast({
        title: "Error",
        description: "No se pudieron cargar los usuarios. Por favor, inténtelo de nuevo.",
        variant: "destructive",
      });
    }
  }, [usuariosData, cargandoUsuariosData, errorUsuarios, toast]);
  
  const onSubmit = async (datos: CrearEmpleadoParams) => {
    try {
      await mutation.mutateAsync(datos);
      form.reset();
      onSuccess();
    } catch (error) {
      console.error("Error al crear empleado:", error);
    }
  };
  
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Usuario Asociado */}
          <FormField
            control={form.control}
            name="userId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Usuario <span className="text-destructive">*</span></FormLabel>
                <Select 
                  disabled={cargandoUsuarios} 
                  onValueChange={(value) => field.onChange(parseInt(value))}
                  value={field.value?.toString()}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue 
                        placeholder={cargandoUsuarios ? "Cargando usuarios..." : "Seleccione un usuario"} 
                      />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {usuarios.map((usuario) => (
                      <SelectItem key={usuario.id} value={usuario.id.toString()}>
                        {usuario.fullName} ({usuario.email})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormDescription>
                  Asocie este empleado con un usuario de la plataforma
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          
          {/* Identificación */}
          <FormField
            control={form.control}
            name="identification"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Identificación <span className="text-destructive">*</span></FormLabel>
                <FormControl>
                  <Input placeholder="Ej. 12345678-9" {...field} />
                </FormControl>
                <FormDescription>
                  Número de identificación nacional/fiscal
                </FormDescription>
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
                <FormLabel>Cargo <span className="text-destructive">*</span></FormLabel>
                <FormControl>
                  <Input placeholder="Ej. Desarrollador Senior" {...field} />
                </FormControl>
                <FormDescription>
                  Cargo o puesto que ocupa en la empresa
                </FormDescription>
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
                <FormLabel>Departamento <span className="text-destructive">*</span></FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccione un departamento" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="Administración">Administración</SelectItem>
                    <SelectItem value="Finanzas">Finanzas</SelectItem>
                    <SelectItem value="Recursos Humanos">Recursos Humanos</SelectItem>
                    <SelectItem value="Tecnología">Tecnología</SelectItem>
                    <SelectItem value="Ventas">Ventas</SelectItem>
                    <SelectItem value="Marketing">Marketing</SelectItem>
                    <SelectItem value="Operaciones">Operaciones</SelectItem>
                    <SelectItem value="Logística">Logística</SelectItem>
                    <SelectItem value="Producción">Producción</SelectItem>
                    <SelectItem value="Legal">Legal</SelectItem>
                  </SelectContent>
                </Select>
                <FormDescription>
                  Departamento al que pertenece
                </FormDescription>
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
                <FormLabel>Fecha de Ingreso <span className="text-destructive">*</span></FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant={"outline"}
                        className="w-full pl-3 text-left font-normal"
                      >
                        {field.value ? (
                          format(field.value, "dd/MM/yyyy", { locale: es })
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
                      selected={new Date(field.value)}
                      onSelect={(date) => field.onChange(date || new Date())}
                      locale={es}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                <FormDescription>
                  Fecha en que comenzó a trabajar
                </FormDescription>
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
                <FormLabel>Salario Base <span className="text-destructive">*</span></FormLabel>
                <FormControl>
                  <Input type="text" placeholder="Ej. 3500.00" {...field} />
                </FormControl>
                <FormDescription>
                  Salario mensual base en la moneda local
                </FormDescription>
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
                <FormLabel>Tipo de Contrato <span className="text-destructive">*</span></FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccione un tipo" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="fulltime">Tiempo Completo</SelectItem>
                    <SelectItem value="parttime">Tiempo Parcial</SelectItem>
                    <SelectItem value="contractor">Contratista</SelectItem>
                    <SelectItem value="temporary">Temporal</SelectItem>
                    <SelectItem value="internship">Práctica/Pasantía</SelectItem>
                  </SelectContent>
                </Select>
                <FormDescription>
                  Tipo de contrato laboral
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          
          {/* Estado del Contrato */}
          <FormField
            control={form.control}
            name="contractStatus"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Estado del Contrato <span className="text-destructive">*</span></FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccione un estado" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="active">Activo</SelectItem>
                    <SelectItem value="inactive">Inactivo</SelectItem>
                    <SelectItem value="on_leave">Permiso</SelectItem>
                    <SelectItem value="terminated">Terminado</SelectItem>
                  </SelectContent>
                </Select>
                <FormDescription>
                  Estado actual del contrato
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
                  <Input placeholder="Ej. +1234567890" {...field} />
                </FormControl>
                <FormDescription>
                  Número de contacto del empleado
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          
          {/* Dirección */}
          <FormField
            control={form.control}
            name="address"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Dirección</FormLabel>
                <FormControl>
                  <Input placeholder="Dirección completa" {...field} />
                </FormControl>
                <FormDescription>
                  Dirección residencial
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          
          {/* Contacto de Emergencia */}
          <FormField
            control={form.control}
            name="emergencyContact"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Contacto de Emergencia</FormLabel>
                <FormControl>
                  <Input placeholder="Nombre y teléfono" {...field} />
                </FormControl>
                <FormDescription>
                  Persona a contactar en caso de emergencia
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
                  <Input type="text" placeholder="Ej. 20" {...field} />
                </FormControl>
                <FormDescription>
                  Porcentaje para cálculo de impuestos
                </FormDescription>
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
                  <Input type="text" placeholder="Ej. 100.00" {...field} />
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
                  <Input type="text" placeholder="Ej. 50.00" {...field} />
                </FormControl>
                <FormDescription>
                  Deducciones fijas mensuales
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        
        <div className="flex justify-end">
          <Button type="submit" disabled={mutation.isPending}>
            {mutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Guardar Empleado
          </Button>
        </div>
      </form>
    </Form>
  );
}