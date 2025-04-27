/**
 * Componente EmpleadoModal
 * Modal para crear o editar un empleado
 */

import React, { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Empleado, CrearEmpleadoDTO, ActualizarEmpleadoDTO, EstadoEmpleado } from "../../domain/entities/Empleado";
import { EmpleadosApi } from "../../infrastructure/api/empleadosApi";
import { CrearEmpleadoUseCase } from "../../application/useCases/empleados/crearEmpleado";
import { EditarEmpleadoUseCase } from "../../application/useCases/empleados/editarEmpleado";
import { RefreshCw } from "lucide-react";

// Esquema de validación con zod
const empleadoSchema = z.object({
  nombres: z.string().min(1, "El nombre es obligatorio"),
  apellidos: z.string().min(1, "Los apellidos son obligatorios"),
  cargo: z.string().min(1, "El cargo es obligatorio"),
  departamento: z.string().min(1, "El departamento es obligatorio"),
  fechaContratacion: z.string().min(1, "La fecha de contratación es obligatoria"),
  estado: z.string().min(1, "El estado es obligatorio"),
  salario: z.coerce.number().positive("El salario debe ser mayor que cero"),
  direccion: z.string().optional(),
  telefono: z.string().optional(),
  correo: z.string().email("Formato de correo inválido").optional().or(z.literal("")),
  fechaNacimiento: z.string().optional(),
  numeroIdentificacion: z.string().optional(),
  seguridadSocial: z.string().optional(),
  cuentaBancaria: z.string().optional(),
  contactoEmergencia: z.string().optional(),
  telefonoEmergencia: z.string().optional(),
  notas: z.string().optional(),
  fotoUrl: z.string().optional(),
  proyectoPrincipalId: z.coerce.number().optional(),
});

interface EmpleadoModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  empleado?: Empleado; // Si se proporciona, es modo edición
  onSuccess?: () => void;
}

export const EmpleadoModal: React.FC<EmpleadoModalProps> = ({
  open,
  onOpenChange,
  empleado,
  onSuccess,
}) => {
  const { toast } = useToast();
  const empleadosApi = new EmpleadosApi();
  const crearEmpleadoUseCase = new CrearEmpleadoUseCase(empleadosApi);
  const editarEmpleadoUseCase = new EditarEmpleadoUseCase(empleadosApi);
  
  const esEdicion = !!empleado;
  
  // Form con valores por defecto basados en si es edición o creación
  const form = useForm<z.infer<typeof empleadoSchema>>({
    resolver: zodResolver(empleadoSchema),
    defaultValues: esEdicion
      ? {
          nombres: empleado.nombres,
          apellidos: empleado.apellidos,
          cargo: empleado.cargo,
          departamento: empleado.departamento,
          fechaContratacion: empleado.fechaContratacion.toISOString().split('T')[0],
          estado: empleado.estado,
          salario: empleado.salario,
          direccion: empleado.direccion || "",
          telefono: empleado.telefono || "",
          correo: empleado.correo || "",
          fechaNacimiento: empleado.fechaNacimiento 
            ? empleado.fechaNacimiento.toISOString().split('T')[0] 
            : "",
          numeroIdentificacion: empleado.numeroIdentificacion || "",
          seguridadSocial: empleado.seguridadSocial || "",
          cuentaBancaria: empleado.cuentaBancaria || "",
          contactoEmergencia: empleado.contactoEmergencia || "",
          telefonoEmergencia: empleado.telefonoEmergencia || "",
          notas: empleado.notas || "",
          fotoUrl: empleado.fotoUrl || "",
          proyectoPrincipalId: empleado.proyectoPrincipalId,
        }
      : {
          nombres: "",
          apellidos: "",
          cargo: "",
          departamento: "",
          fechaContratacion: new Date().toISOString().split('T')[0],
          estado: EstadoEmpleado.ACTIVO,
          salario: 0,
          direccion: "",
          telefono: "",
          correo: "",
          fechaNacimiento: "",
          numeroIdentificacion: "",
          seguridadSocial: "",
          cuentaBancaria: "",
          contactoEmergencia: "",
          telefonoEmergencia: "",
          notas: "",
          fotoUrl: "",
        }
  });
  
  // Mutación para crear empleado
  const crearEmpleadoMutation = useMutation({
    mutationFn: (data: CrearEmpleadoDTO) => crearEmpleadoUseCase.execute(data),
    onSuccess: () => {
      toast({
        title: "Empleado creado",
        description: "El empleado ha sido creado correctamente",
      });
      form.reset();
      onOpenChange(false);
      if (onSuccess) onSuccess();
    },
    onError: (error) => {
      toast({
        title: "Error al crear empleado",
        description: error instanceof Error ? error.message : "Ha ocurrido un error",
        variant: "destructive",
      });
    },
  });
  
  // Mutación para editar empleado
  const editarEmpleadoMutation = useMutation({
    mutationFn: (data: ActualizarEmpleadoDTO) => editarEmpleadoUseCase.execute(data),
    onSuccess: () => {
      toast({
        title: "Empleado actualizado",
        description: "Los datos del empleado han sido actualizados correctamente",
      });
      onOpenChange(false);
      if (onSuccess) onSuccess();
    },
    onError: (error) => {
      toast({
        title: "Error al actualizar empleado",
        description: error instanceof Error ? error.message : "Ha ocurrido un error",
        variant: "destructive",
      });
    },
  });
  
  // Manejar envío del formulario
  const onSubmit = (data: z.infer<typeof empleadoSchema>) => {
    // Convertir fechas a objetos Date
    const empleadoData = {
      ...data,
      fechaContratacion: new Date(data.fechaContratacion),
      fechaNacimiento: data.fechaNacimiento ? new Date(data.fechaNacimiento) : undefined,
    };
    
    if (esEdicion) {
      editarEmpleadoMutation.mutate({
        ...empleadoData,
        id: empleado.id,
      });
    } else {
      crearEmpleadoMutation.mutate(empleadoData as CrearEmpleadoDTO);
    }
  };
  
  const isPending = crearEmpleadoMutation.isPending || editarEmpleadoMutation.isPending;
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[750px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{esEdicion ? "Editar Empleado" : "Crear Nuevo Empleado"}</DialogTitle>
          <DialogDescription>
            {esEdicion
              ? "Actualice la información del empleado en el formulario a continuación."
              : "Complete el formulario para registrar un nuevo empleado en el sistema."}
          </DialogDescription>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Datos personales */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Datos Personales</h3>
                <FormField
                  control={form.control}
                  name="nombres"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nombres</FormLabel>
                      <FormControl>
                        <Input placeholder="Nombres" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="apellidos"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Apellidos</FormLabel>
                      <FormControl>
                        <Input placeholder="Apellidos" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="fechaNacimiento"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Fecha de Nacimiento</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="numeroIdentificacion"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Número de Identificación</FormLabel>
                      <FormControl>
                        <Input placeholder="DNI/NIE" {...field} />
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
                        <Textarea placeholder="Dirección completa" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              {/* Datos laborales */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Datos Laborales</h3>
                <FormField
                  control={form.control}
                  name="cargo"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Cargo</FormLabel>
                      <FormControl>
                        <Input placeholder="Cargo" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="departamento"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Departamento</FormLabel>
                      <Select 
                        onValueChange={field.onChange} 
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Seleccione departamento" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Tecnología">Tecnología</SelectItem>
                          <SelectItem value="Ventas">Ventas</SelectItem>
                          <SelectItem value="Marketing">Marketing</SelectItem>
                          <SelectItem value="Finanzas">Finanzas</SelectItem>
                          <SelectItem value="Recursos Humanos">Recursos Humanos</SelectItem>
                          <SelectItem value="Operaciones">Operaciones</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="fechaContratacion"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Fecha de Contratación</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="estado"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Estado</FormLabel>
                      <Select 
                        onValueChange={field.onChange} 
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Seleccione estado" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value={EstadoEmpleado.ACTIVO}>Activo</SelectItem>
                          <SelectItem value={EstadoEmpleado.INACTIVO}>Inactivo</SelectItem>
                          <SelectItem value={EstadoEmpleado.VACACIONES}>Vacaciones</SelectItem>
                          <SelectItem value={EstadoEmpleado.PERMISO}>Permiso</SelectItem>
                          <SelectItem value={EstadoEmpleado.BAJA_MEDICA}>Baja Médica</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="salario"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Salario</FormLabel>
                      <FormControl>
                        <Input type="number" min="0" step="0.01" placeholder="0.00" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>
            
            {/* Contacto y otros datos */}
            <div className="border-t pt-4">
              <h3 className="text-lg font-medium mb-4">Contacto y Otros Datos</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="telefono"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Teléfono</FormLabel>
                      <FormControl>
                        <Input placeholder="Teléfono" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="correo"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Correo Electrónico</FormLabel>
                      <FormControl>
                        <Input type="email" placeholder="correo@ejemplo.com" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="seguridadSocial"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Número Seguridad Social</FormLabel>
                      <FormControl>
                        <Input placeholder="Número Seguridad Social" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="cuentaBancaria"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Cuenta Bancaria</FormLabel>
                      <FormControl>
                        <Input placeholder="IBAN" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="contactoEmergencia"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Contacto de Emergencia</FormLabel>
                      <FormControl>
                        <Input placeholder="Nombre del contacto" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="telefonoEmergencia"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Teléfono de Emergencia</FormLabel>
                      <FormControl>
                        <Input placeholder="Teléfono de emergencia" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>
            
            {/* Notas adicionales */}
            <div>
              <FormField
                control={form.control}
                name="notas"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Notas Adicionales</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Información adicional relevante" 
                        className="min-h-[100px]"
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancelar
              </Button>
              <Button type="submit" disabled={isPending}>
                {isPending ? (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                    {esEdicion ? "Actualizando..." : "Creando..."}
                  </>
                ) : (
                  esEdicion ? "Actualizar Empleado" : "Crear Empleado"
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};