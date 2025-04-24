import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect, useState, useRef } from 'react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Calendar as CalendarIcon, CheckSquare, Upload, AlertCircle, FileText } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';

import { Button } from '@/components/ui/button';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

import { CrearEmpleadoParams, CrearEmpleadoDTO } from '../../domain/entities/Empleado';
import { useCrearEmpleado, useObtenerUsuarios } from '../../application/useCrearEmpleado';
import { validarFormatoContrato, validarTamanoContrato, subirContrato } from '../../infrastructure/storage/contratoUploader';

interface EmpleadoFormProps {
  onSuccess: () => void;
}

interface Proyecto {
  id: number;
  name: string;
  description: string;
}

export function EmpleadoForm({ onSuccess }: EmpleadoFormProps) {
  const mutation = useCrearEmpleado();
  const { toast } = useToast();
  const [usuarios, setUsuarios] = useState<any[]>([]);
  const [cargandoUsuarios, setCargandoUsuarios] = useState(true);
  const [selectedProjects, setSelectedProjects] = useState<number[]>([]);
  const [contrato, setContrato] = useState<File | null>(null);
  const [contratoError, setContratoError] = useState<string | null>(null);
  const [contratoUrl, setContratoUrl] = useState<string | null>(null);
  const [subiendoContrato, setSubiendoContrato] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Cargar proyectos
  const { data: proyectos = [], isLoading: cargandoProyectos } = useQuery<Proyecto[]>({
    queryKey: ['/api/projects'],
    queryFn: async () => {
      const res = await fetch('/api/projects');
      if (!res.ok) throw new Error('Error al cargar proyectos');
      return res.json();
    }
  });
  
  const form = useForm<CrearEmpleadoParams>({
    resolver: zodResolver(CrearEmpleadoDTO),
    defaultValues: {
      userId: undefined, // Esto debe ser seleccionado por el usuario
      firstName: '',     // Nombre del empleado
      lastName: '',      // Apellido del empleado
      skills: '',        // Habilidades del empleado
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
      bankAccount: '',
      paymentMethod: 'transferencia',
      healthInsurance: '',
      vacationDays: 15,
      projectIds: [],
      tipoPago: 'mensual',
      fechaInicioNomina: new Date(),
    },
    mode: 'onChange', // Validar al cambiar los campos
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
    
    // Si tenemos usuarios y no hay uno seleccionado, establecer el primer usuario como valor por defecto
    if (usuariosData.length > 0 && !form.getValues('userId')) {
      form.setValue('userId', usuariosData[0].id);
    }
  }, [usuariosData, cargandoUsuariosData, errorUsuarios, toast, form]);
  
  // Gestionar cambios en proyectos seleccionados
  const toggleProjectSelection = (projectId: number) => {
    setSelectedProjects(prev => {
      const isSelected = prev.includes(projectId);
      const newSelection = isSelected
        ? prev.filter(id => id !== projectId)
        : [...prev, projectId];
      
      // Actualizar el formulario
      form.setValue('projectIds', newSelection);
      return newSelection;
    });
  };
  
  // Manejar selección de archivo de contrato
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setContrato(file);
    setContratoError(null);
    
    if (file) {
      // Validar formato
      if (!validarFormatoContrato(file)) {
        setContratoError('Formato de archivo no válido. Solo se permiten PDF o DOCX.');
        return;
      }
      
      // Validar tamaño
      if (!validarTamanoContrato(file)) {
        setContratoError('El tamaño del archivo excede los 5MB permitidos.');
        return;
      }
      
      // Actualizar el formulario con el archivo seleccionado
      form.setValue('contratoFile', file);
    }
  };
  
  // Función para subir el contrato
  const handleUploadContrato = async () => {
    if (!contrato) {
      setContratoError('Seleccione un archivo para subir.');
      return;
    }
    
    try {
      setSubiendoContrato(true);
      const url = await subirContrato(contrato);
      setContratoUrl(url);
      form.setValue('contratoUrl', url);
      
      toast({
        title: "Contrato subido",
        description: "El contrato ha sido subido exitosamente",
      });
    } catch (error) {
      setContratoError(error instanceof Error ? error.message : 'Error al subir el contrato');
      toast({
        title: "Error",
        description: "No se pudo subir el contrato",
        variant: "destructive",
      });
    } finally {
      setSubiendoContrato(false);
    }
  };
  
  const onSubmit = async (datos: CrearEmpleadoParams) => {
    try {
      // Verificar explícitamente que userId tenga un valor válido
      if (!datos.userId) {
        // Si no hay usuarios disponibles pero tenemos al menos uno en la lista, usar el primero
        if (usuarios.length > 0) {
          datos.userId = usuarios[0].id;
        } else {
          toast({
            title: "Error",
            description: "Debe seleccionar un usuario para asociar al empleado",
            variant: "destructive",
          });
          return;
        }
      }
      
      // Asegurar que los projectIds estén incluidos
      datos.projectIds = selectedProjects;
      
      // Si hay un contrato seleccionado pero no se ha subido aún, subirlo
      if (contrato && !contratoUrl) {
        try {
          const url = await subirContrato(contrato);
          datos.contratoUrl = url;
        } catch (error) {
          toast({
            title: "Error",
            description: "No se pudo subir el contrato. Verifique el archivo e intente nuevamente.",
            variant: "destructive",
          });
          return;
        }
      }
      
      // Si el contrato ya se subió, asignar la URL
      if (contratoUrl) {
        datos.contratoUrl = contratoUrl;
      }
      
      console.log("Enviando datos:", datos); // Debugging
      
      await mutation.mutateAsync(datos);
      
      // Éxito: limpiar y resetear el formulario
      form.reset();
      setSelectedProjects([]);
      setContrato(null);
      setContratoUrl(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      onSuccess();
    } catch (error) {
      console.error("Error al crear empleado:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Error al guardar los datos del empleado",
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
            name="userId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Usuario <span className="text-destructive">*</span></FormLabel>
                <Select 
                  disabled={cargandoUsuarios} 
                  onValueChange={(value) => field.onChange(parseInt(value))}
                  value={field.value?.toString() || (usuarios[0]?.id.toString() || "")}
                  defaultValue={usuarios[0]?.id.toString()}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue 
                        placeholder={cargandoUsuarios ? "Cargando usuarios..." : "Seleccione un usuario"} 
                      />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {usuarios.length > 0 ? (
                      usuarios.map((usuario) => (
                        <SelectItem key={usuario.id} value={usuario.id.toString()}>
                          {usuario.fullName} ({usuario.email})
                        </SelectItem>
                      ))
                    ) : (
                      <SelectItem value="no-users">No hay usuarios disponibles</SelectItem>
                    )}
                  </SelectContent>
                </Select>
                <FormDescription>
                  Asocie este empleado con un usuario de la plataforma
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          
          {/* Nombre */}
          <FormField
            control={form.control}
            name="firstName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nombre</FormLabel>
                <FormControl>
                  <Input placeholder="Ej. Juan Carlos" {...field} />
                </FormControl>
                <FormDescription>
                  Nombre del empleado
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          
          {/* Apellido */}
          <FormField
            control={form.control}
            name="lastName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Apellido</FormLabel>
                <FormControl>
                  <Input placeholder="Ej. Pérez González" {...field} />
                </FormControl>
                <FormDescription>
                  Apellido del empleado
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          
          {/* Habilidades */}
          <FormField
            control={form.control}
            name="skills"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Habilidades</FormLabel>
                <FormControl>
                  <Textarea 
                    placeholder="Ej. React, TypeScript, Node.js, SQL, Gestión de Proyectos" 
                    className="min-h-[80px]"
                    {...field} 
                  />
                </FormControl>
                <FormDescription>
                  Habilidades, tecnologías y competencias del empleado
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
                      selected={field.value ? new Date(field.value) : undefined}
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
                <Select 
                  onValueChange={field.onChange} 
                  defaultValue={field.value || "fulltime"} // Valor por defecto para evitar valor vacío
                >
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
                <Select 
                  onValueChange={field.onChange} 
                  defaultValue={field.value || "active"} // Valor por defecto para evitar valor vacío
                >
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
        </div>
        
        <Separator className="my-6" />
        
        <h3 className="text-lg font-semibold mb-4">Documento de Contrato</h3>
        
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="space-y-4">
              <div className="flex flex-col space-y-2">
                <FormLabel htmlFor="contrato">Documento de Contrato (PDF o DOCX)</FormLabel>
                <Input
                  id="contrato"
                  type="file"
                  accept=".pdf,.docx"
                  onChange={handleFileChange}
                  ref={fileInputRef}
                  className="cursor-pointer"
                />
                <FormDescription>
                  Suba el contrato laboral del empleado (máximo 5MB)
                </FormDescription>
              </div>
              
              {contratoError && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Error</AlertTitle>
                  <AlertDescription>{contratoError}</AlertDescription>
                </Alert>
              )}
              
              {contrato && !contratoError && (
                <div className="flex items-center justify-between border p-3 rounded-md">
                  <div className="flex items-center">
                    <FileText className="h-5 w-5 mr-2 text-primary" />
                    <span className="text-sm font-medium">{contrato.name}</span>
                  </div>
                  
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleUploadContrato}
                    disabled={subiendoContrato || !!contratoUrl}
                  >
                    {subiendoContrato ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Subiendo...
                      </>
                    ) : contratoUrl ? (
                      <>
                        <CheckSquare className="mr-2 h-4 w-4" />
                        Archivo Subido
                      </>
                    ) : (
                      <>
                        <Upload className="mr-2 h-4 w-4" />
                        Subir Contrato
                      </>
                    )}
                  </Button>
                </div>
              )}
              
              {contratoUrl && (
                <Alert className="bg-green-50 border-green-200">
                  <CheckSquare className="h-4 w-4 text-green-600" />
                  <AlertTitle className="text-green-800">Contrato Subido Exitosamente</AlertTitle>
                  <AlertDescription className="text-green-700">
                    El contrato ha sido subido correctamente y será asociado al empleado.
                  </AlertDescription>
                </Alert>
              )}
            </div>
          </CardContent>
        </Card>
        
        <Separator className="my-6" />
        
        <h3 className="text-lg font-semibold mb-4">Información de Nómina</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Tipo de Pago */}
          <FormField
            control={form.control}
            name="tipoPago"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Tipo de Pago</FormLabel>
                <Select 
                  onValueChange={field.onChange} 
                  defaultValue={field.value || "mensual"} // Valor por defecto para evitar valor vacío
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccione un tipo de pago" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="mensual">Mensual</SelectItem>
                    <SelectItem value="quincenal">Quincenal</SelectItem>
                    <SelectItem value="semanal">Semanal</SelectItem>
                    <SelectItem value="por_hora">Por Hora</SelectItem>
                  </SelectContent>
                </Select>
                <FormDescription>
                  Frecuencia con la que se procesa la nómina
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          
          {/* Fecha de Inicio de Nómina */}
          <FormField
            control={form.control}
            name="fechaInicioNomina"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Fecha de Inicio de Nómina</FormLabel>
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
                      selected={field.value ? new Date(field.value) : undefined}
                      onSelect={(date) => field.onChange(date || new Date())}
                      locale={es}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                <FormDescription>
                  Fecha en que empieza a recibir pagos de nómina
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
          
          {/* Cuenta Bancaria */}
          <FormField
            control={form.control}
            name="bankAccount"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Cuenta Bancaria</FormLabel>
                <FormControl>
                  <Input placeholder="Ej. 123456789" {...field} />
                </FormControl>
                <FormDescription>
                  Cuenta para depósitos y transferencias
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          
          {/* Método de Pago */}
          <FormField
            control={form.control}
            name="paymentMethod"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Método de Pago</FormLabel>
                <Select 
                  onValueChange={field.onChange} 
                  defaultValue={field.value || "transferencia"} // Valor por defecto para evitar valor vacío
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccione un método" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="transferencia">Transferencia Bancaria</SelectItem>
                    <SelectItem value="cheque">Cheque</SelectItem>
                    <SelectItem value="efectivo">Efectivo</SelectItem>
                    <SelectItem value="otro">Otro</SelectItem>
                  </SelectContent>
                </Select>
                <FormDescription>
                  Método utilizado para pagar la nómina
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          
          {/* Seguro de Salud */}
          <FormField
            control={form.control}
            name="healthInsurance"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Seguro de Salud</FormLabel>
                <FormControl>
                  <Input placeholder="Ej. Plan Corporativo Premium" {...field} />
                </FormControl>
                <FormDescription>
                  Plan de seguro médico asignado
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          
          {/* Días de Vacaciones */}
          <FormField
            control={form.control}
            name="vacationDays"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Días de Vacaciones Anuales</FormLabel>
                <FormControl>
                  <Input 
                    type="number" 
                    placeholder="Ej. 15" 
                    {...field}
                    onChange={(e) => field.onChange(parseInt(e.target.value) || 0)} 
                  />
                </FormControl>
                <FormDescription>
                  Días de vacaciones por año
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        
        <Separator className="my-6" />
        
        <Card>
          <CardHeader>
            <CardTitle>Asignación a Proyectos</CardTitle>
          </CardHeader>
          <CardContent>
            {cargandoProyectos ? (
              <div className="flex items-center justify-center p-4">
                <Loader2 className="h-5 w-5 animate-spin mr-2" />
                <span>Cargando proyectos...</span>
              </div>
            ) : proyectos.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {proyectos.map((proyecto) => (
                  <div key={proyecto.id} className="flex items-start space-x-2">
                    <Checkbox 
                      id={`project-${proyecto.id}`} 
                      checked={selectedProjects.includes(proyecto.id)}
                      onCheckedChange={() => toggleProjectSelection(proyecto.id)}
                    />
                    <div className="grid gap-1.5">
                      <label
                        htmlFor={`project-${proyecto.id}`}
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        {proyecto.name}
                      </label>
                      <p className="text-sm text-muted-foreground">
                        {proyecto.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-muted-foreground">No hay proyectos disponibles para asignar</p>
            )}
          </CardContent>
        </Card>
        
        <div className="flex justify-end mt-6">
          <Button type="submit" disabled={mutation.isPending}>
            {mutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Guardar Empleado
          </Button>
        </div>
      </form>
    </Form>
  );
}