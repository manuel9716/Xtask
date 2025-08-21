import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useAuth } from "@/modules/auth/ui/context/AuthContext";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle 
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { Upload, User, DollarSign, FileText } from "lucide-react";
import { NewEmpleado, newEmpleadoSchema } from "../schemas/empleado.schemas";
import { EmpleadosApi } from "../services/empleados.api";
import { useNominaStore } from "../state/nomina.store";

interface NewEmployeeModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onEmployeeCreated?: () => void;
}

export function NewEmployeeModal({ open, onOpenChange, onEmployeeCreated }: NewEmployeeModalProps) {
  const [currentTab, setCurrentTab] = useState("personal");
  const [contratoFile, setContratoFile] = useState<File | null>(null);
  const { toast } = useToast();
  const { reloadDashboard } = useNominaStore();
  const { user } = useAuth();

  const form = useForm<NewEmpleado>({
    resolver: zodResolver(newEmpleadoSchema),
    defaultValues: {
      empleado: {
        nombre: "",
        apellido: "",
        identificacion: "",
        depto: "",
        cargo: "",
        fecha_ingreso: "",
        estado_contrato: "activo",
        tipo_contrato: "indefinido",
        telefono: "",
        direccion: "",
        contacto_emergencia: "",
      },
      nomina: {
        sueldo_base: 0,
        bonificacion: 0,
        tasa_impuestos: 0.19,
        base_deduccion: 0,
        beneficios_base: 0,
        metodo_pago: "transferencia",
        cuenta_bancaria: "",
        seguro_salud: "",
        dias_vacaciones: 15,
        frecuencia_pago: "mensual",
        fecha_inicio_nomina: "",
      },
      proyecto: {
        proyecto_id: 0,
      },
    },
  });

  const { data: proyectos } = useQuery({
    queryKey: ['/api/projects'],
    queryFn: async () => {
      const response = await fetch('/api/projects');
      if (!response.ok) {
        throw new Error('Error al obtener proyectos');
      }
      return response.json();
    },
  });

  const createEmpleadoMutation = useMutation({
    mutationFn: (data: any) => EmpleadosApi.createEmpleado(data),
    onSuccess: async (empleado) => {
      toast({
        title: "Empleado creado exitosamente",
        description: `${empleado.nombre} ${empleado.apellido} ha sido agregado al sistema.`,
      });

      // Si hay contrato, subirlo
      if (contratoFile) {
        try {
          await EmpleadosApi.uploadContrato(empleado.id, contratoFile);
          toast({
            title: "Contrato subido",
            description: "El contrato se ha guardado correctamente.",
          });
        } catch (error) {
          toast({
            title: "Error al subir contrato",
            description: "El empleado se creó pero no se pudo subir el contrato.",
            variant: "destructive",
          });
        }
      }

      reloadDashboard();
      onEmployeeCreated?.(); // Callback para notificar al dashboard
      onOpenChange(false);
      form.reset();
      setContratoFile(null);
      setCurrentTab("personal");
    },
    onError: (error: any) => {
      toast({
        title: "Error al crear empleado",
        description: error.message || "Ocurrió un error inesperado.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: NewEmpleado) => {
    // Simplificar los datos - usar endpoint básico
    const empleadoData = {
      firstName: data.empleado.nombre,
      lastName: data.empleado.apellido,
      identification: data.empleado.identificacion,
      position: data.empleado.cargo,
      department: data.empleado.depto,
      tipoContrato: data.empleado.tipo_contrato,
      claseRiesgoARL: "1",
      phoneNumber: data.empleado.telefono,
      auxilioTransporte: false
    };

    console.log("Enviando datos del empleado:", empleadoData);
    createEmpleadoMutation.mutate(empleadoData);
  };

  const nextTab = () => {
    const tabs = ["personal", "nomina", "proyecto"];
    const currentIndex = tabs.indexOf(currentTab);
    if (currentIndex < tabs.length - 1) {
      setCurrentTab(tabs[currentIndex + 1]);
    }
  };

  const prevTab = () => {
    const tabs = ["personal", "nomina", "proyecto"];
    const currentIndex = tabs.indexOf(currentTab);
    if (currentIndex > 0) {
      setCurrentTab(tabs[currentIndex - 1]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validar tipo de archivo
      const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
      if (!allowedTypes.includes(file.type)) {
        toast({
          title: "Tipo de archivo no válido",
          description: "Solo se permiten archivos PDF, DOC y DOCX.",
          variant: "destructive",
        });
        return;
      }

      // Validar tamaño (5MB max)
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: "Archivo muy grande",
          description: "El archivo no puede exceder 5MB.",
          variant: "destructive",
        });
        return;
      }

      setContratoFile(file);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Nuevo Empleado</DialogTitle>
          <DialogDescription>
            Complete la información del nuevo empleado en el sistema de nómina.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <Tabs value={currentTab} onValueChange={setCurrentTab} className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="personal">
                <User className="mr-2 h-4 w-4" />
                Información Personal
              </TabsTrigger>
              <TabsTrigger value="nomina">
                <DollarSign className="mr-2 h-4 w-4" />
                Datos de Nómina
              </TabsTrigger>
              <TabsTrigger value="proyecto">
                <FileText className="mr-2 h-4 w-4" />
                Proyecto y Contrato
              </TabsTrigger>
            </TabsList>

            <TabsContent value="personal">
              <Card>
                <CardHeader>
                  <CardTitle>Información Personal</CardTitle>
                  <CardDescription>Datos básicos del empleado</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="nombre">Nombre *</Label>
                      <Input
                        id="nombre"
                        {...form.register("empleado.nombre")}
                        placeholder="Nombre del empleado"
                      />
                      {form.formState.errors.empleado?.nombre && (
                        <p className="text-sm text-red-500 mt-1">
                          {form.formState.errors.empleado.nombre.message}
                        </p>
                      )}
                    </div>
                    <div>
                      <Label htmlFor="apellido">Apellido *</Label>
                      <Input
                        id="apellido"
                        {...form.register("empleado.apellido")}
                        placeholder="Apellido del empleado"
                      />
                      {form.formState.errors.empleado?.apellido && (
                        <p className="text-sm text-red-500 mt-1">
                          {form.formState.errors.empleado.apellido.message}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="identificacion">Identificación *</Label>
                      <Input
                        id="identificacion"
                        {...form.register("empleado.identificacion")}
                        placeholder="Número de identificación"
                      />
                      {form.formState.errors.empleado?.identificacion && (
                        <p className="text-sm text-red-500 mt-1">
                          {form.formState.errors.empleado.identificacion.message}
                        </p>
                      )}
                    </div>
                    <div>
                      <Label htmlFor="telefono">Teléfono</Label>
                      <Input
                        id="telefono"
                        {...form.register("empleado.telefono")}
                        placeholder="+57 300 123 4567"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="direccion">Dirección</Label>
                    <Input
                      id="direccion"
                      {...form.register("empleado.direccion")}
                      placeholder="Dirección de residencia"
                    />
                  </div>

                  <div>
                    <Label htmlFor="contacto_emergencia">Contacto de Emergencia</Label>
                    <Input
                      id="contacto_emergencia"
                      {...form.register("empleado.contacto_emergencia")}
                      placeholder="Nombre y teléfono de contacto"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="depto">Departamento *</Label>
                      <Input
                        id="depto"
                        {...form.register("empleado.depto")}
                        placeholder="Departamento"
                      />
                      {form.formState.errors.empleado?.depto && (
                        <p className="text-sm text-red-500 mt-1">
                          {form.formState.errors.empleado.depto.message}
                        </p>
                      )}
                    </div>
                    <div>
                      <Label htmlFor="cargo">Cargo *</Label>
                      <Input
                        id="cargo"
                        {...form.register("empleado.cargo")}
                        placeholder="Cargo o posición"
                      />
                      {form.formState.errors.empleado?.cargo && (
                        <p className="text-sm text-red-500 mt-1">
                          {form.formState.errors.empleado.cargo.message}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="fecha_ingreso">Fecha de Ingreso *</Label>
                      <Input
                        id="fecha_ingreso"
                        type="date"
                        {...form.register("empleado.fecha_ingreso")}
                      />
                      {form.formState.errors.empleado?.fecha_ingreso && (
                        <p className="text-sm text-red-500 mt-1">
                          {form.formState.errors.empleado.fecha_ingreso.message}
                        </p>
                      )}
                    </div>
                    <div>
                      <Label htmlFor="estado_contrato">Estado del Contrato</Label>
                      <Select 
                        value={form.watch("empleado.estado_contrato")} 
                        onValueChange={(value: any) => form.setValue("empleado.estado_contrato", value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccionar estado" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="activo">Activo</SelectItem>
                          <SelectItem value="inactivo">Inactivo</SelectItem>
                          <SelectItem value="suspendido">Suspendido</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="tipo_contrato">Tipo de Contrato</Label>
                      <Select 
                        value={form.watch("empleado.tipo_contrato")} 
                        onValueChange={(value: any) => form.setValue("empleado.tipo_contrato", value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Tipo de contrato" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="indefinido">Indefinido</SelectItem>
                          <SelectItem value="fijo">Término Fijo</SelectItem>
                          <SelectItem value="obra_labor">Obra o Labor</SelectItem>
                          <SelectItem value="prestacion_servicios">Prestación de Servicios</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="nomina">
              <Card>
                <CardHeader>
                  <CardTitle>Datos de Nómina</CardTitle>
                  <CardDescription>Configuración salarial y beneficios</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="sueldo_base">Sueldo Base *</Label>
                      <Input
                        id="sueldo_base"
                        type="number"
                        {...form.register("nomina.sueldo_base", { valueAsNumber: true })}
                        placeholder="Sueldo base mensual"
                      />
                      {form.formState.errors.nomina?.sueldo_base && (
                        <p className="text-sm text-red-500 mt-1">
                          {form.formState.errors.nomina.sueldo_base.message}
                        </p>
                      )}
                    </div>
                    <div>
                      <Label htmlFor="bonificacion">Bonificación</Label>
                      <Input
                        id="bonificacion"
                        type="number"
                        {...form.register("nomina.bonificacion", { valueAsNumber: true })}
                        placeholder="Bonificación mensual"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="tasa_impuestos">Tasa de Impuestos</Label>
                      <Input
                        id="tasa_impuestos"
                        type="number"
                        step="0.01"
                        max="1"
                        min="0"
                        {...form.register("nomina.tasa_impuestos", { valueAsNumber: true })}
                        placeholder="0.19"
                      />
                    </div>
                    <div>
                      <Label htmlFor="base_deduccion">Base Deducción</Label>
                      <Input
                        id="base_deduccion"
                        type="number"
                        {...form.register("nomina.base_deduccion", { valueAsNumber: true })}
                        placeholder="Deducciones fijas"
                      />
                    </div>
                    <div>
                      <Label htmlFor="beneficios_base">Beneficios Base</Label>
                      <Input
                        id="beneficios_base"
                        type="number"
                        {...form.register("nomina.beneficios_base", { valueAsNumber: true })}
                        placeholder="Beneficios adicionales"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="metodo_pago">Método de Pago</Label>
                      <Select 
                        value={form.watch("nomina.metodo_pago")} 
                        onValueChange={(value: any) => form.setValue("nomina.metodo_pago", value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Método de pago" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="transferencia">Transferencia Bancaria</SelectItem>
                          <SelectItem value="efectivo">Efectivo</SelectItem>
                          <SelectItem value="cheque">Cheque</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="cuenta_bancaria">Cuenta Bancaria</Label>
                      <Input
                        id="cuenta_bancaria"
                        {...form.register("nomina.cuenta_bancaria")}
                        placeholder="Número de cuenta"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="seguro_salud">Seguro de Salud</Label>
                      <Input
                        id="seguro_salud"
                        {...form.register("nomina.seguro_salud")}
                        placeholder="EPS/Seguro médico"
                      />
                    </div>
                    <div>
                      <Label htmlFor="dias_vacaciones">Días de Vacaciones</Label>
                      <Input
                        id="dias_vacaciones"
                        type="number"
                        {...form.register("nomina.dias_vacaciones", { valueAsNumber: true })}
                        placeholder="15"
                      />
                    </div>
                    <div>
                      <Label htmlFor="frecuencia_pago">Frecuencia de Pago</Label>
                      <Select 
                        value={form.watch("nomina.frecuencia_pago")} 
                        onValueChange={(value: any) => form.setValue("nomina.frecuencia_pago", value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Frecuencia" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="quincenal">Quincenal</SelectItem>
                          <SelectItem value="mensual">Mensual</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="fecha_inicio_nomina">Fecha de Inicio en Nómina *</Label>
                    <Input
                      id="fecha_inicio_nomina"
                      type="date"
                      {...form.register("nomina.fecha_inicio_nomina")}
                    />
                    {form.formState.errors.nomina?.fecha_inicio_nomina && (
                      <p className="text-sm text-red-500 mt-1">
                        {form.formState.errors.nomina.fecha_inicio_nomina.message}
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="proyecto">
              <Card>
                <CardHeader>
                  <CardTitle>Proyecto y Contrato</CardTitle>
                  <CardDescription>Asignación de proyecto y documentación</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="proyecto_id">Proyecto Asignado *</Label>
                    <Select 
                      value={form.watch("proyecto.proyecto_id")?.toString()} 
                      onValueChange={(value) => form.setValue("proyecto.proyecto_id", parseInt(value))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar proyecto" />
                      </SelectTrigger>
                      <SelectContent>
                        {proyectos?.map((proyecto) => (
                          <SelectItem key={proyecto.id} value={proyecto.id.toString()}>
                            {proyecto.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {form.formState.errors.proyecto?.proyecto_id && (
                      <p className="text-sm text-red-500 mt-1">
                        {form.formState.errors.proyecto.proyecto_id.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="contrato">Contrato (Opcional)</Label>
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                      <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                      <div className="space-y-2">
                        <Label htmlFor="contrato-upload" className="cursor-pointer text-blue-600 hover:text-blue-500">
                          Subir contrato
                        </Label>
                        <Input
                          id="contrato-upload"
                          type="file"
                          accept=".pdf,.doc,.docx"
                          onChange={handleFileChange}
                          className="hidden"
                        />
                        <p className="text-sm text-gray-500">
                          PDF, DOC, DOCX hasta 5MB
                        </p>
                        {contratoFile && (
                          <p className="text-sm text-green-600">
                            Archivo seleccionado: {contratoFile.name}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          <div className="flex justify-between pt-4">
            <div className="flex gap-2">
              {currentTab !== "personal" && (
                <Button type="button" variant="outline" onClick={prevTab}>
                  Anterior
                </Button>
              )}
            </div>
            <div className="flex gap-2">
              {currentTab !== "proyecto" ? (
                <Button type="button" onClick={nextTab}>
                  Siguiente
                </Button>
              ) : (
                <Button 
                  type="submit" 
                  disabled={createEmpleadoMutation.isPending}
                >
                  {createEmpleadoMutation.isPending ? "Creando..." : "Crear Empleado"}
                </Button>
              )}
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => onOpenChange(false)}
              >
                Cancelar
              </Button>
            </div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}