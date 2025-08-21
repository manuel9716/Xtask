import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertEmployeeSchema, type InsertEmployee, TipoContrato, ClaseRiesgoARL } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle, Calculator, FileText, User } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { EmpleadosColombiaApi } from "../services/empleados.api";
import { useQuery } from "@tanstack/react-query";

interface EmpleadoColombiaFormProps {
  empleado?: InsertEmployee;
  onSubmit: (data: InsertEmployee) => void;
  onCancel: () => void;
  isEditing?: boolean;
}

export function EmpleadoColombiaForm({ empleado, onSubmit, onCancel, isEditing = false }: EmpleadoColombiaFormProps) {
  const [validacionSalario, setValidacionSalario] = useState<any>(null);
  const [calculandoValidacion, setCalculandoValidacion] = useState(false);

  // Obtener parámetros legales vigentes
  const { data: parametrosLegales } = useQuery({
    queryKey: ["/api/parametros-legales"],
    enabled: true
  });

  const form = useForm<InsertEmployee>({
    resolver: zodResolver(insertEmployeeSchema),
    defaultValues: {
      tipoContrato: "indefinido",
      claseRiesgoARL: "1",
      auxilioTransporte: false,
      activo: true,
      ...empleado
    }
  });

  const tipoContrato = form.watch("tipoContrato");
  const salario = form.watch("salary");
  const salarioPorHora = form.watch("salarioPorHora");
  const horasPorSemana = form.watch("horasPorSemana");
  const honorarios = form.watch("honorarios");

  // Validar salario en tiempo real
  useEffect(() => {
    const validarSalario = async () => {
      if (!tipoContrato) return;
      
      let valor = 0;
      switch (tipoContrato) {
        case "indefinido":
        case "fijo":
          valor = Number(salario || 0);
          break;
        case "por_horas":
          valor = Number(salarioPorHora || 0);
          break;
        case "prestacion_servicios":
          valor = Number(honorarios || 0);
          break;
      }

      if (valor > 0) {
        setCalculandoValidacion(true);
        try {
          const resultado = await EmpleadosColombiaApi.validarSalarioMinimo(
            tipoContrato, 
            valor, 
            horasPorSemana
          );
          setValidacionSalario(resultado);
        } catch (error) {
          console.error("Error validando salario:", error);
        } finally {
          setCalculandoValidacion(false);
        }
      }
    };

    const timeoutId = setTimeout(validarSalario, 500);
    return () => clearTimeout(timeoutId);
  }, [tipoContrato, salario, salarioPorHora, horasPorSemana, honorarios]);

  const handleSubmit = (data: InsertEmployee) => {
    onSubmit(data);
  };

  const renderCamposDinamicos = () => {
    switch (tipoContrato) {
      case "indefinido":
      case "fijo":
        return (
          <>
            <FormField
              control={form.control}
              name="salary"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Salario Base *</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="Ej: 1300000"
                      {...field}
                      onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : undefined)}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="baseBenefits"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Bonificaciones</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="Ej: 100000"
                      {...field}
                      onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : undefined)}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="auxilioTransporte"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">Auxilio de Transporte</FormLabel>
                    <div className="text-sm text-muted-foreground">
                      {parametrosLegales?.auxilioTransporte ? 
                        `$${Number(parametrosLegales.auxilioTransporte).toLocaleString('es-CO')}` : 
                        'Según parámetros legales'
                      }
                    </div>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
          </>
        );

      case "por_horas":
        return (
          <>
            <FormField
              control={form.control}
              name="salarioPorHora"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Salario por Hora *</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="Ej: 5500"
                      {...field}
                      onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : undefined)}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="horasPorSemana"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Horas por Semana *</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="Ej: 40"
                      max={48}
                      {...field}
                      onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : undefined)}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="baseBenefits"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Bonificaciones Proporcionales</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="Ej: 50000"
                      {...field}
                      onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : undefined)}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </>
        );

      case "prestacion_servicios":
        return (
          <>
            <FormField
              control={form.control}
              name="honorarios"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Honorarios *</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="Ej: 2000000"
                      {...field}
                      onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : undefined)}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="retencionFuente"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Retención en la Fuente (%)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="Ej: 10"
                      step="0.1"
                      max="100"
                      {...field}
                      onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : undefined)}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </>
        );

      default:
        return null;
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        {/* Información Personal */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Información Personal
            </CardTitle>
            <CardDescription>
              Datos básicos del empleado
            </CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="firstName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nombre *</FormLabel>
                  <FormControl>
                    <Input placeholder="Juan" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="lastName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Apellido *</FormLabel>
                  <FormControl>
                    <Input placeholder="Pérez" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="identification"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Identificación *</FormLabel>
                  <FormControl>
                    <Input placeholder="12345678" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="phoneNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Teléfono</FormLabel>
                  <FormControl>
                    <Input placeholder="3001234567" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="position"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Cargo *</FormLabel>
                  <FormControl>
                    <Input placeholder="Desarrollador" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="department"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Departamento *</FormLabel>
                  <FormControl>
                    <Input placeholder="Desarrollo" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        {/* Información Contractual */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Información Contractual
            </CardTitle>
            <CardDescription>
              Tipo de contrato y configuración salarial
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="tipoContrato"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tipo de Contrato *</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecciona el tipo de contrato" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="indefinido">Indefinido</SelectItem>
                      <SelectItem value="fijo">Fijo por obra o labor</SelectItem>
                      <SelectItem value="prestacion_servicios">Prestación de servicios</SelectItem>
                      <SelectItem value="por_horas">Por horas</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {renderCamposDinamicos()}

            <FormField
              control={form.control}
              name="claseRiesgoARL"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Clase de Riesgo ARL *</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecciona la clase de riesgo" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="1">Clase I - Riesgo Mínimo</SelectItem>
                      <SelectItem value="2">Clase II - Riesgo Bajo</SelectItem>
                      <SelectItem value="3">Clase III - Riesgo Medio</SelectItem>
                      <SelectItem value="4">Clase IV - Riesgo Alto</SelectItem>
                      <SelectItem value="5">Clase V - Riesgo Máximo</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        {/* Seguridad Social */}
        <Card>
          <CardHeader>
            <CardTitle>Seguridad Social</CardTitle>
            <CardDescription>
              Información de EPS, fondo de pensiones y ARL
            </CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <FormField
              control={form.control}
              name="eps"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>EPS</FormLabel>
                  <FormControl>
                    <Input placeholder="Sura EPS" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="pensiones"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Fondo de Pensiones</FormLabel>
                  <FormControl>
                    <Input placeholder="Porvenir" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="arl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>ARL</FormLabel>
                  <FormControl>
                    <Input placeholder="Sura ARL" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="cajaCompensacion"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Caja de Compensación</FormLabel>
                  <FormControl>
                    <Input placeholder="Compensar" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        {/* Validación de Salario */}
        {validacionSalario && (
          <Alert className={validacionSalario.valido ? "border-green-200" : "border-red-200"}>
            <Calculator className="h-4 w-4" />
            <AlertDescription className="space-y-2">
              <div className="font-medium">
                {validacionSalario.valido ? "✅ Salario válido" : "⚠️ Validación de salario"}
              </div>
              <div>{validacionSalario.mensaje}</div>
              {!validacionSalario.valido && parametrosLegales && (
                <div className="text-sm text-muted-foreground">
                  Salario mínimo legal: ${Number(parametrosLegales.salarioMinimo).toLocaleString('es-CO')}
                </div>
              )}
            </AlertDescription>
          </Alert>
        )}

        {/* Botones de Acción */}
        <div className="flex justify-end space-x-4">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancelar
          </Button>
          <Button type="submit" disabled={calculandoValidacion}>
            {isEditing ? "Actualizar Empleado" : "Crear Empleado"}
          </Button>
        </div>
      </form>
    </Form>
  );
}