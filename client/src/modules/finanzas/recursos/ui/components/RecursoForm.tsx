import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { 
  CrearRecursoDTO, 
  crearRecursoSchema, 
  PerfilTecnico, 
  OrigenRecurso,
  calcularRecurso 
} from '../../domain/entities/Recurso';
import { DollarSign, Calculator, Clock, Users } from 'lucide-react';

interface RecursoFormProps {
  presupuestoId: number;
  onSubmit: (data: CrearRecursoDTO) => void;
  onCancel: () => void;
  isLoading?: boolean;
  initialData?: Partial<CrearRecursoDTO>;
}

const PERFILES_TECNICOS: { value: PerfilTecnico; label: string }[] = [
  { value: 'ARQUITECTO', label: 'Arquitecto de Software' },
  { value: 'DESARROLLADOR_SENIOR', label: 'Desarrollador Senior' },
  { value: 'DESARROLLADOR_JUNIOR', label: 'Desarrollador Junior' },
  { value: 'QA_SENIOR', label: 'QA Senior' },
  { value: 'QA_JUNIOR', label: 'QA Junior' },
  { value: 'DEVOPS', label: 'DevOps Engineer' },
  { value: 'SCRUM_MASTER', label: 'Scrum Master' },
  { value: 'PRODUCT_OWNER', label: 'Product Owner' },
  { value: 'DISEÑADOR_UX', label: 'Diseñador UX/UI' },
  { value: 'ANALISTA_DATOS', label: 'Analista de Datos' },
  { value: 'CONSULTOR', label: 'Consultor' },
  { value: 'OTRO', label: 'Otro' },
];

const ORIGENES: { value: OrigenRecurso; label: string }[] = [
  { value: 'INTERNO', label: 'Interno' },
  { value: 'EXTERNO', label: 'Externo' },
];

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount);
}

export function RecursoForm({ 
  presupuestoId, 
  onSubmit, 
  onCancel, 
  isLoading = false,
  initialData 
}: RecursoFormProps) {
  const form = useForm<CrearRecursoDTO>({
    resolver: zodResolver(crearRecursoSchema),
    defaultValues: {
      presupuestoId,
      perfil: 'DESARROLLADOR_SENIOR',
      salarioMensual: initialData?.salarioMensual || 0,
      valorHora: initialData?.valorHora || undefined,
      meses: 1,
      diasAlMes: 22,
      horasPorDia: 8,
      dedicacionPorcentaje: 100,
      origen: 'INTERNO',
      creadoPor: 1,
      ...initialData,
    },
  });

  const watchedValues = form.watch();

  // Cálculo automático del salario mensual basado en todos los parámetros
  const salarioMensualCalculado = (watchedValues.valorHora || 0) * 
    (watchedValues.diasAlMes || 0) * 
    (watchedValues.horasPorDia || 0) * 
    ((watchedValues.dedicacionPorcentaje || 0) / 100);

  // Actualizar el salario mensual automáticamente cuando cambien los parámetros de cálculo
  useEffect(() => {
    form.setValue('salarioMensual', salarioMensualCalculado);
  }, [watchedValues.valorHora, watchedValues.diasAlMes, watchedValues.horasPorDia, watchedValues.dedicacionPorcentaje, form, salarioMensualCalculado]);

  // Cálculos en tiempo real
  const horasTotales = calcularRecurso.horasTotales(
    watchedValues.diasAlMes,
    watchedValues.horasPorDia,
    watchedValues.meses
  );

  const horasProyecto = calcularRecurso.horasProyecto(
    horasTotales,
    watchedValues.dedicacionPorcentaje
  );

  const totalEstimado = calcularRecurso.valorEstimado(
    watchedValues.valorHora,
    horasProyecto
  );

  // Función para formatear números en pesos colombianos
  const formatCOP = (amount: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const handleSubmit = (data: CrearRecursoDTO) => {
    onSubmit(data);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Información básica */}
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Información del Recurso
              </CardTitle>
              <CardDescription>
                Datos básicos del perfil técnico
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="perfil"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Perfil Técnico</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccionar perfil" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {PERFILES_TECNICOS.map((perfil) => (
                          <SelectItem key={perfil.value} value={perfil.value}>
                            {perfil.label}
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
                name="origen"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Origen</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccionar origen" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {ORIGENES.map((origen) => (
                          <SelectItem key={origen.value} value={origen.value}>
                            {origen.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Información económica */}
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                Información Económica
              </CardTitle>
              <CardDescription>
                Salarios y costos por hora
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Campo de solo lectura para mostrar el salario calculado */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Salario Mensual (COP)</label>
                <div className="flex items-center p-3 bg-gray-50 border rounded-md">
                  <DollarSign className="h-4 w-4 text-gray-500 mr-2" />
                  <span className="font-semibold text-lg">
                    {formatCOP(salarioMensualCalculado)}
                  </span>
                </div>
                <p className="text-xs text-gray-500">
                  Calculado: {watchedValues.valorHora ? formatCOP(watchedValues.valorHora) : '$0'} × {watchedValues.diasAlMes || 0} días × {watchedValues.horasPorDia || 0} h × {watchedValues.dedicacionPorcentaje || 0}%
                </p>
              </div>

              <FormField
                control={form.control}
                name="valorHora"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Valor por Hora (COP)</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input
                          type="number"
                          placeholder="25000"
                          className="pl-10"
                          value={field.value || ''}
                          onChange={(e) => {
                            const value = e.target.value === '' ? undefined : Number(e.target.value);
                            field.onChange(value);
                          }}
                        />
                      </div>
                    </FormControl>
                    <FormDescription>
                      Ingrese el valor por hora en pesos colombianos
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Tiempo y dedicación */}
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Tiempo y Dedicación
              </CardTitle>
              <CardDescription>
                Configuración de horas y duración
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <FormField
                  control={form.control}
                  name="meses"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Meses</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min="1"
                          max="36"
                          {...field}
                          onChange={(e) => field.onChange(Number(e.target.value))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="diasAlMes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Días/Mes</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min="1"
                          max="31"
                          {...field}
                          onChange={(e) => field.onChange(Number(e.target.value))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <FormField
                  control={form.control}
                  name="horasPorDia"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Horas/Día</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min="1"
                          max="24"
                          {...field}
                          onChange={(e) => field.onChange(Number(e.target.value))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="dedicacionPorcentaje"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Dedicación %</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min="1"
                          max="100"
                          {...field}
                          onChange={(e) => field.onChange(Number(e.target.value))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>

          {/* Cálculos en tiempo real */}
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2">
                <Calculator className="h-5 w-5" />
                Cálculos Automáticos
              </CardTitle>
              <CardDescription>
                Estimación de costos y horas
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-1 gap-3">
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <span className="text-sm font-medium text-gray-600">Horas Totales:</span>
                  <span className="font-bold">{horasTotales.toLocaleString()} hrs</span>
                </div>
                
                <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                  <span className="text-sm font-medium text-blue-600">Horas Proyecto:</span>
                  <span className="font-bold text-blue-700">{horasProyecto.toLocaleString()} hrs</span>
                </div>
                
                <Separator />
                
                <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                  <span className="text-sm font-medium text-green-600">Total Estimado:</span>
                  <span className="font-bold text-green-700 text-lg">
                    {formatCOP(totalEstimado)}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Botones de acción */}
        <div className="flex justify-end gap-3">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancelar
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? 'Guardando...' : 'Guardar Recurso'}
          </Button>
        </div>
      </form>
    </Form>
  );
}