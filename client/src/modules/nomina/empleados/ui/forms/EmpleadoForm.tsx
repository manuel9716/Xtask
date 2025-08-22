import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect, useState } from 'react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Calendar as CalendarIcon, AlertCircle, Briefcase, Clock, FileText, Calculator } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Checkbox } from '@/components/ui/checkbox';
import { cn } from '@/lib/utils';

import { CrearEmpleadoParams, CrearEmpleadoDTO } from '../../domain/entities/Empleado';
import { useCrearEmpleado, useObtenerUsuarios } from '../../application/useCrearEmpleado';
import { useEditarEmpleado } from '../../application/useEditarEmpleado';
import { insertEmpleadoNuevoSchema } from '@shared/schema';

interface EmpleadoFormProps {
  onSuccess: () => void;
  empleadoData?: any; // Datos del empleado para edición
  isEditing?: boolean; // Indica si estamos en modo edición
}

// Opciones para tipos de contrato según ley colombiana
const TIPOS_CONTRATO = [
  { value: "indefinido", label: "Contrato a término indefinido" },
  { value: "fijo", label: "Contrato a término fijo" },
  { value: "obra_o_labor", label: "Contrato de obra o labor" },
  { value: "prestacion_servicios", label: "Contrato de prestación de servicios" },
  { value: "por_horas", label: "Contrato por horas" },
];

const CLASES_RIESGO_ARL = [
  { value: "I", label: "Clase I - Riesgo mínimo" },
  { value: "II", label: "Clase II - Riesgo bajo" },
  { value: "III", label: "Clase III - Riesgo medio" },
  { value: "IV", label: "Clase IV - Riesgo alto" },
  { value: "V", label: "Clase V - Riesgo máximo" },
];

const DEPARTAMENTOS = [
  "Administración",
  "Recursos Humanos", 
  "Finanzas",
  "Tecnología",
  "Ventas",
  "Marketing",
  "Operaciones",
  "Legal",
  "Compras",
  "Otro"
];

export function EmpleadoForm({ onSuccess, empleadoData, isEditing = false }: EmpleadoFormProps) {
  const crearEmpleadoMutation = useCrearEmpleado();
  const editarEmpleadoMutation = useEditarEmpleado();
  const { toast } = useToast();
  const [usuarios, setUsuarios] = useState<any[]>([]);
  const [cargandoUsuarios, setCargandoUsuarios] = useState(true);
  const [tipoContratoSeleccionado, setTipoContratoSeleccionado] = useState<string>(
    empleadoData?.tipo_contrato || "indefinido"
  );

  // Cargar usuarios para el selector
  const { usuarios: usuariosData, isLoading: cargandoUsuariosData, error: errorUsuarios } = useObtenerUsuarios();

  // Crear defaultValues basado en si estamos en modo edición o no
  const getDefaultValues = (): CrearEmpleadoParams => {
    if (isEditing && empleadoData) {
      return {
        user_id: empleadoData.user_id,
        nombre: empleadoData.nombre || '',
        apellido: empleadoData.apellido || '',
        identificacion: empleadoData.identificacion || '',
        depto: empleadoData.depto || '',
        cargo: empleadoData.cargo || '',
        fecha_ingreso: empleadoData.fecha_ingreso ? new Date(empleadoData.fecha_ingreso) : new Date(),
        estado_contrato: empleadoData.estado_contrato || 'activo',
        tipo_contrato: empleadoData.tipo_contrato || 'indefinido',
        telefono: empleadoData.telefono || '',
        direccion: empleadoData.direccion || '',
        contacto_emergencia: empleadoData.contacto_emergencia || '',
        // Campos condicionales
        fecha_fin_contrato: empleadoData.fecha_fin_contrato ? new Date(empleadoData.fecha_fin_contrato) : undefined,
        clase_riesgo_arl: empleadoData.clase_riesgo_arl || undefined,
        horas_por_semana: empleadoData.horas_por_semana || undefined,
        salario_por_hora: empleadoData.salario_por_hora || undefined,
        salario_base: empleadoData.salario_base || undefined,
        honorarios: empleadoData.honorarios || undefined,
        bonificaciones: empleadoData.bonificaciones || 0,
        auxilio_transporte: empleadoData.auxilio_transporte || true,
        requiere_seguridad_social: empleadoData.requiere_seguridad_social !== undefined ? empleadoData.requiere_seguridad_social : true,
      };
    } else {
      return {
        user_id: undefined,
        nombre: '',
        apellido: '',
        identificacion: '',
        depto: '',
        cargo: '',
        fecha_ingreso: new Date(),
        estado_contrato: 'activo',
        tipo_contrato: 'indefinido',
        telefono: '',
        direccion: '',
        contacto_emergencia: '',
        auxilio_transporte: true,
        bonificaciones: 0,
        requiere_seguridad_social: true,
      };
    }
  };
  
  const form = useForm<CrearEmpleadoParams>({
    resolver: zodResolver(CrearEmpleadoDTO),
    defaultValues: getDefaultValues(),
    mode: 'onChange',
  });

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
    
    // Si tenemos usuarios y no hay uno seleccionado, establecer el primer usuario como valor por defecto
    if (usuariosData.length > 0 && !form.getValues('user_id')) {
      form.setValue('user_id', usuariosData[0].id);
    }
  }, [usuariosData, cargandoUsuariosData, errorUsuarios, toast, form]);

  // Observar cambios en el tipo de contrato
  const tipoContrato = form.watch('tipo_contrato');
  useEffect(() => {
    setTipoContratoSeleccionado(tipoContrato);
    
    // Limpiar campos que no aplican al tipo de contrato seleccionado
    if (!['fijo', 'obra_o_labor'].includes(tipoContrato)) {
      form.setValue('fecha_fin_contrato', undefined);
    }
    if (!['indefinido', 'fijo', 'obra_o_labor'].includes(tipoContrato)) {
      form.setValue('clase_riesgo_arl', undefined);
      form.setValue('salario_base', undefined);
      form.setValue('auxilio_transporte', false);
    }
    if (tipoContrato !== 'por_horas') {
      form.setValue('horas_por_semana', undefined);
      form.setValue('salario_por_hora', undefined);
    }
    if (tipoContrato !== 'prestacion_servicios') {
      form.setValue('honorarios', undefined);
    }
    
    // Configurar valores por defecto según tipo de contrato
    if (['indefinido', 'fijo', 'obra_o_labor'].includes(tipoContrato)) {
      form.setValue('requiere_seguridad_social', true);
      form.setValue('auxilio_transporte', true);
    } else if (tipoContrato === 'prestacion_servicios') {
      form.setValue('requiere_seguridad_social', false);
      form.setValue('auxilio_transporte', false);
    }
  }, [tipoContrato, form]);

  const onSubmit = async (datos: CrearEmpleadoParams) => {
    try {
      // Verificar que user_id tenga un valor válido
      if (!datos.user_id) {
        if (usuarios.length > 0) {
          datos.user_id = usuarios[0].id;
        } else {
          toast({
            title: "Error",
            description: "Debe seleccionar un usuario para asociar al empleado",
            variant: "destructive",
          });
          return;
        }
      }
      
      if (isEditing && empleadoData) {
        await editarEmpleadoMutation.mutateAsync({
          id: empleadoData.id,
          data: datos
        });
        
        toast({
          title: "Empleado actualizado",
          description: "Los datos del empleado han sido actualizados exitosamente",
        });
      } else {
        await crearEmpleadoMutation.mutateAsync(datos);
        
        toast({
          title: "Empleado creado",
          description: "El empleado ha sido creado exitosamente",
        });
      }
      
      form.reset();
      onSuccess();
    } catch (error) {
      console.error(`Error al ${isEditing ? 'actualizar' : 'crear'} empleado:`, error);
      toast({
        title: "Error",
        description: error instanceof Error 
          ? error.message 
          : `Error al ${isEditing ? 'actualizar' : 'crear'} el empleado`,
        variant: "destructive",
      });
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Usuario Asociado */}
          <FormField
            control={form.control}
            name="user_id"
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
                      <SelectValue placeholder="Seleccionar usuario..." />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {usuarios.map((usuario) => (
                      <SelectItem key={usuario.id} value={usuario.id.toString()}>
                        {usuario.name} ({usuario.email})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Nombre */}
          <FormField
            control={form.control}
            name="nombre"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nombre <span className="text-destructive">*</span></FormLabel>
                <FormControl>
                  <Input placeholder="Nombre del empleado" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Apellido */}
          <FormField
            control={form.control}
            name="apellido"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Apellido <span className="text-destructive">*</span></FormLabel>
                <FormControl>
                  <Input placeholder="Apellido del empleado" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Identificación */}
          <FormField
            control={form.control}
            name="identificacion"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Identificación <span className="text-destructive">*</span></FormLabel>
                <FormControl>
                  <Input placeholder="Número de cédula o documento" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Departamento */}
          <FormField
            control={form.control}
            name="depto"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Departamento <span className="text-destructive">*</span></FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar departamento" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {DEPARTAMENTOS.map((dept) => (
                      <SelectItem key={dept} value={dept}>
                        {dept}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Cargo */}
          <FormField
            control={form.control}
            name="cargo"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Cargo <span className="text-destructive">*</span></FormLabel>
                <FormControl>
                  <Input placeholder="Cargo o posición" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Fecha de Ingreso */}
          <FormField
            control={form.control}
            name="fecha_ingreso"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Fecha de Ingreso <span className="text-destructive">*</span></FormLabel>
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
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Teléfono */}
          <FormField
            control={form.control}
            name="telefono"
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
        </div>

        <Separator />

        {/* Sección de Tipo de Contrato */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Briefcase className="h-5 w-5" />
              Información del Contrato
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Tipo de Contrato */}
              <FormField
                control={form.control}
                name="tipo_contrato"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tipo de Contrato <span className="text-destructive">*</span></FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccionar tipo de contrato" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {TIPOS_CONTRATO.map((tipo) => (
                          <SelectItem key={tipo.value} value={tipo.value}>
                            {tipo.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Estado del Contrato */}
              <FormField
                control={form.control}
                name="estado_contrato"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Estado del Contrato <span className="text-destructive">*</span></FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
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
            </div>

            {/* Campos específicos según tipo de contrato */}
            {tipoContratoSeleccionado === 'fijo' && (
              <>
                <Alert>
                  <FileText className="h-4 w-4" />
                  <AlertTitle>Contrato a Término Fijo</AlertTitle>
                  <AlertDescription>
                    Complete la fecha de finalización y la clase de riesgo ARL para este tipo de contrato.
                  </AlertDescription>
                </Alert>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="fecha_fin_contrato"
                    render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <FormLabel>Fecha de Finalización <span className="text-destructive">*</span></FormLabel>
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
                              disabled={(date) => date <= new Date()}
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="clase_riesgo_arl"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Clase de Riesgo ARL <span className="text-destructive">*</span></FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Seleccionar clase de riesgo" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {CLASES_RIESGO_ARL.map((clase) => (
                              <SelectItem key={clase.value} value={clase.value}>
                                {clase.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </>
            )}

            {tipoContratoSeleccionado === 'fijo' && (
              <>
                <Alert>
                  <Briefcase className="h-4 w-4" />
                  <AlertTitle>Contrato a Término Fijo</AlertTitle>
                  <AlertDescription>
                    Complete el salario base, fecha de finalización y clase de riesgo ARL.
                  </AlertDescription>
                </Alert>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="salario_base"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Salario Base <span className="text-destructive">*</span></FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            min="1300000" 
                            placeholder="Salario base mensual" 
                            value={field.value || ""}
                            onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : undefined)}
                          />
                        </FormControl>
                        <FormDescription>
                          Mínimo: $1,300,000 (SMLV 2025)
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="fecha_fin_contrato"
                    render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <FormLabel>Fecha Fin del Contrato <span className="text-destructive">*</span></FormLabel>
                        <Popover>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant="outline"
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
                              disabled={(date) => date < new Date()}
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                        <FormDescription>
                          Fecha cuando termina el contrato
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="clase_riesgo_arl"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Clase de Riesgo ARL <span className="text-destructive">*</span></FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Seleccionar clase de riesgo" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {CLASES_RIESGO_ARL.map((clase) => (
                              <SelectItem key={clase.value} value={clase.value}>
                                {clase.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="bonificaciones"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Bonificaciones Mensuales</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            min="0" 
                            placeholder="Bonificaciones adicionales" 
                            value={field.value || ""}
                            onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : 0)}
                          />
                        </FormControl>
                        <FormDescription>
                          Bonificaciones fijas mensuales (opcional)
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="auxilio_transporte"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                        <FormControl>
                          <Checkbox
                            checked={field.value || false}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel>
                            Auxilio de Transporte
                          </FormLabel>
                          <FormDescription>
                            $162,000 mensuales (solo para salarios ≤ $2,600,000)
                          </FormDescription>
                        </div>
                      </FormItem>
                    )}
                  />
                </div>
              </>
            )}

            {['indefinido', 'obra_o_labor'].includes(tipoContratoSeleccionado) && (
              <>
                <Alert>
                  <Briefcase className="h-4 w-4" />
                  <AlertTitle>
                    {tipoContratoSeleccionado === 'indefinido' ? 'Contrato a Término Indefinido' : 'Contrato de Obra o Labor'}
                  </AlertTitle>
                  <AlertDescription>
                    Complete el salario base, clase de riesgo ARL y configure las bonificaciones.
                  </AlertDescription>
                </Alert>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="salario_base"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Salario Base <span className="text-destructive">*</span></FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            min="1300000" 
                            placeholder="Salario base mensual" 
                            value={field.value || ""}
                            onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : undefined)}
                          />
                        </FormControl>
                        <FormDescription>
                          Mínimo: $1,300,000 (SMLV 2025)
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="clase_riesgo_arl"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Clase de Riesgo ARL <span className="text-destructive">*</span></FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Seleccionar clase de riesgo" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {CLASES_RIESGO_ARL.map((clase) => (
                              <SelectItem key={clase.value} value={clase.value}>
                                {clase.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="bonificaciones"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Bonificaciones Mensuales</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            min="0" 
                            placeholder="Bonificaciones adicionales" 
                            value={field.value || ""}
                            onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : 0)}
                          />
                        </FormControl>
                        <FormDescription>
                          Bonificaciones fijas mensuales (opcional)
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="auxilio_transporte"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel>
                            Auxilio de Transporte
                          </FormLabel>
                          <FormDescription>
                            $162,000 mensuales (solo para salarios ≤ $2,600,000)
                          </FormDescription>
                        </div>
                      </FormItem>
                    )}
                  />
                </div>
              </>
            )}

            {tipoContratoSeleccionado === 'por_horas' && (
              <>
                <Alert>
                  <Clock className="h-4 w-4" />
                  <AlertTitle>Contrato por Horas</AlertTitle>
                  <AlertDescription>
                    Complete las horas semanales y el salario por hora. El salario por hora debe ser proporcional al salario mínimo legal.
                  </AlertDescription>
                </Alert>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="horas_por_semana"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Horas por Semana <span className="text-destructive">*</span></FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            min="1" 
                            max="48" 
                            placeholder="Máximo 48 horas" 
                            {...field}
                            onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                          />
                        </FormControl>
                        <FormDescription>
                          Máximo 48 horas semanales según ley colombiana
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="salario_por_hora"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Salario por Hora <span className="text-destructive">*</span></FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            step="0.01" 
                            min="0" 
                            placeholder="Valor por hora" 
                            {...field}
                            onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                          />
                        </FormControl>
                        <FormDescription>
                          Debe ser proporcional al salario mínimo legal vigente
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </>
            )}

            {tipoContratoSeleccionado === 'prestacion_servicios' && (
              <>
                <Alert>
                  <FileText className="h-4 w-4" />
                  <AlertTitle>Contrato de Prestación de Servicios</AlertTitle>
                  <AlertDescription>
                    Complete los honorarios. La retención en la fuente se calculará automáticamente según tablas UVT.
                  </AlertDescription>
                </Alert>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="honorarios"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Honorarios Mensuales <span className="text-destructive">*</span></FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            min="0" 
                            placeholder="Valor de honorarios mensuales" 
                            value={field.value || ""}
                            onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : undefined)}
                          />
                        </FormControl>
                        <FormDescription>
                          Valor total de honorarios según contrato
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="requiere_seguridad_social"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0 p-4 border rounded-lg">
                        <FormControl>
                          <Checkbox
                            checked={field.value || false}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel>
                            Requiere Seguridad Social
                          </FormLabel>
                          <FormDescription>
                            El contratista debe pagar salud (12.5%) y pensión (16%) como independiente.
                          </FormDescription>
                        </div>
                      </FormItem>
                    )}
                  />
                </div>
                
                <Alert className="bg-blue-50 border-blue-200">
                  <Calculator className="h-4 w-4" />
                  <AlertTitle>Información Fiscal</AlertTitle>
                  <AlertDescription>
                    • Retención en la fuente: 10-11% según valor UVT<br/>
                    • Seguridad social independiente: 28.5% (si aplica)<br/>
                    • No aplican prestaciones sociales ni parafiscales
                  </AlertDescription>
                </Alert>
              </>
            )}
          </CardContent>
        </Card>

        <Separator />

        {/* Información de Contacto */}
        <Card>
          <CardHeader>
            <CardTitle>Información de Contacto</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="direccion"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Dirección</FormLabel>
                    <FormControl>
                      <Input placeholder="Dirección de residencia" {...field} />
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
                      <Input placeholder="Nombre y teléfono de contacto" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </CardContent>
        </Card>

        {/* Botones de acción */}
        <div className="flex justify-end space-x-4">
          <Button 
            type="button" 
            variant="outline" 
            onClick={() => form.reset()}
          >
            Cancelar
          </Button>
          <Button 
            type="submit" 
            disabled={crearEmpleadoMutation.isPending || editarEmpleadoMutation.isPending}
          >
            {crearEmpleadoMutation.isPending || editarEmpleadoMutation.isPending && (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            )}
            {isEditing ? 'Actualizar Empleado' : 'Crear Empleado'}
          </Button>
        </div>
      </form>
    </Form>
  );
}