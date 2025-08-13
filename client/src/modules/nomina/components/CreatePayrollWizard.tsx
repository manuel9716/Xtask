import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery } from "@tanstack/react-query";
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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { Calendar, Users, Calculator, CheckCircle, Loader2 } from "lucide-react";
import { NominaPreview, NominaCreate, nominaPreviewSchema, NominaItem } from "../schemas/nomina.schemas";
import { NominaApi, NominaPreviewResponse } from "../services/nomina.api";
import { EmpleadosApi } from "../services/empleados.api";
import { useNominaStore } from "../state/nomina.store";

interface CreatePayrollWizardProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CreatePayrollWizard({ open, onOpenChange }: CreatePayrollWizardProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [previewData, setPreviewData] = useState<NominaPreviewResponse | null>(null);
  const [selectedItems, setSelectedItems] = useState<NominaItem[]>([]);
  const { toast } = useToast();
  const { reloadDashboard } = useNominaStore();

  const form = useForm<NominaPreview>({
    resolver: zodResolver(nominaPreviewSchema),
    defaultValues: {
      rango_inicio: "",
      rango_fin: "",
      proyecto_id: undefined,
      empleados_seleccionados: [],
    },
  });

  const { data: proyectos } = useQuery({
    queryKey: ['/api/proyectos'],
    queryFn: () => fetch('/api/proyectos').then(r => r.json()).then(data => data.data),
  });

  const { data: empleados } = useQuery({
    queryKey: ['/api/nomina-modulo/empleados'],
    queryFn: () => fetch('/api/nomina-modulo/empleados').then(r => r.json()),
  });

  const previewMutation = useMutation({
    mutationFn: NominaApi.previewNomina,
    onSuccess: (data) => {
      setPreviewData(data);
      setSelectedItems(data.items.map((item: any) => ({ ...item, selected: true })));
      setCurrentStep(3);
    },
    onError: (error: any) => {
      toast({
        title: "Error al generar vista previa",
        description: error.message || "Ocurrió un error inesperado.",
        variant: "destructive",
      });
    },
  });

  const createMutation = useMutation({
    mutationFn: NominaApi.createNomina,
    onSuccess: (response) => {
      toast({
        title: "Nómina creada exitosamente",
        description: `La nómina ha sido creada con ID: ${response.id}`,
      });
      reloadDashboard();
      onOpenChange(false);
      resetWizard();
    },
    onError: (error: any) => {
      toast({
        title: "Error al crear nómina",
        description: error.message || "Ocurrió un error inesperado.",
        variant: "destructive",
      });
    },
  });

  const resetWizard = () => {
    setCurrentStep(1);
    setPreviewData(null);
    setSelectedItems([]);
    form.reset();
  };

  const onPreview = (data: NominaPreview) => {
    previewMutation.mutate(data);
  };

  const onConfirm = () => {
    const formData = form.getValues();
    const selectedItemsFiltered = selectedItems.filter(item => item.selected);
    
    if (selectedItemsFiltered.length === 0) {
      toast({
        title: "Selección requerida",
        description: "Debe seleccionar al menos un empleado para crear la nómina.",
        variant: "destructive",
      });
      return;
    }

    const createData: NominaCreate = {
      rango_inicio: formData.rango_inicio,
      rango_fin: formData.rango_fin,
      proyecto_id: formData.proyecto_id,
      items: selectedItemsFiltered.map(item => ({
        empleado_id: item.empleado_id,
        sueldo: item.sueldo,
        bono: item.bono,
        deduccion: item.deduccion,
        impuestos: item.impuestos,
        neto: item.neto,
      })),
    };

    createMutation.mutate(createData);
  };

  const toggleItemSelection = (empleadoId: number) => {
    setSelectedItems(prev => 
      prev.map(item => 
        item.empleado_id === empleadoId 
          ? { ...item, selected: !item.selected }
          : item
      )
    );
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const selectedTotal = selectedItems
    .filter(item => item.selected)
    .reduce((sum, item) => sum + item.neto, 0);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Crear Nueva Nómina</DialogTitle>
          <DialogDescription>
            Asistente para crear y procesar una nueva nómina por periodo.
          </DialogDescription>
        </DialogHeader>

        <Tabs value={currentStep.toString()} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="1" disabled={currentStep < 1}>
              <Calendar className="mr-2 h-4 w-4" />
              Configuración
            </TabsTrigger>
            <TabsTrigger value="2" disabled={currentStep < 2}>
              <Users className="mr-2 h-4 w-4" />
              Empleados
            </TabsTrigger>
            <TabsTrigger value="3" disabled={currentStep < 3}>
              <Calculator className="mr-2 h-4 w-4" />
              Vista Previa
            </TabsTrigger>
          </TabsList>

          <TabsContent value="1">
            <Card>
              <CardHeader>
                <CardTitle>Configuración del Periodo</CardTitle>
                <CardDescription>Define el rango de fechas y proyecto para la nómina</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="rango_inicio">Fecha de Inicio *</Label>
                      <Input
                        id="rango_inicio"
                        type="date"
                        {...form.register("rango_inicio")}
                      />
                      {form.formState.errors.rango_inicio && (
                        <p className="text-sm text-red-500 mt-1">
                          {form.formState.errors.rango_inicio.message}
                        </p>
                      )}
                    </div>
                    <div>
                      <Label htmlFor="rango_fin">Fecha de Fin *</Label>
                      <Input
                        id="rango_fin"
                        type="date"
                        {...form.register("rango_fin")}
                      />
                      {form.formState.errors.rango_fin && (
                        <p className="text-sm text-red-500 mt-1">
                          {form.formState.errors.rango_fin.message}
                        </p>
                      )}
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="proyecto_id">Proyecto (Opcional)</Label>
                    <Select 
                      value={form.watch("proyecto_id")?.toString() || "all"} 
                      onValueChange={(value) => form.setValue("proyecto_id", value === "all" ? undefined : parseInt(value))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar proyecto" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Todos los proyectos</SelectItem>
                        {proyectos?.map((proyecto: any) => (
                          <SelectItem key={proyecto.id} value={proyecto.id.toString()}>
                            {proyecto.nombre}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex justify-end pt-4">
                    <Button 
                      onClick={(e) => {
                        e.preventDefault();
                        const fechaInicio = form.getValues("rango_inicio");
                        const fechaFin = form.getValues("rango_fin");
                        
                        if (!fechaInicio) {
                          form.setError("rango_inicio", { message: "La fecha de inicio es obligatoria" });
                          return;
                        }
                        if (!fechaFin) {
                          form.setError("rango_fin", { message: "La fecha de fin es obligatoria" });
                          return;
                        }
                        
                        setCurrentStep(2);
                      }}
                    >
                      Continuar
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="2">
            <Card>
              <CardHeader>
                <CardTitle>Seleccionar Empleados</CardTitle>
                <CardDescription>Elige los empleados que se incluirán en esta nómina</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {empleados && empleados.length > 0 ? (
                    <div className="space-y-2">
                      {empleados.map((empleado: any) => (
                        <div key={empleado.id} className="flex items-center space-x-2 p-3 border rounded">
                          <Checkbox
                            id={`empleado-${empleado.id}`}
                            checked={form.watch("empleados_seleccionados").includes(empleado.id)}
                            onCheckedChange={(checked) => {
                              const current = form.watch("empleados_seleccionados");
                              if (checked) {
                                form.setValue("empleados_seleccionados", [...current, empleado.id]);
                              } else {
                                form.setValue("empleados_seleccionados", current.filter(id => id !== empleado.id));
                              }
                            }}
                          />
                          <Label htmlFor={`empleado-${empleado.id}`} className="flex-1 cursor-pointer">
                            <div>
                              <p className="font-medium">{empleado.nombre} {empleado.apellido}</p>
                              <p className="text-sm text-muted-foreground">{empleado.cargo} - {empleado.depto}</p>
                            </div>
                          </Label>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-center py-8 text-muted-foreground">
                      No hay empleados disponibles para el proyecto seleccionado
                    </p>
                  )}

                  {form.formState.errors.empleados_seleccionados && (
                    <p className="text-sm text-red-500">
                      {form.formState.errors.empleados_seleccionados.message}
                    </p>
                  )}

                  <div className="flex justify-between pt-4">
                    <Button variant="outline" onClick={() => setCurrentStep(1)}>
                      Anterior
                    </Button>
                    <Button 
                      onClick={form.handleSubmit(onPreview)}
                      disabled={previewMutation.isPending || form.watch("empleados_seleccionados").length === 0}
                    >
                      {previewMutation.isPending ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Calculando...
                        </>
                      ) : (
                        'Generar Vista Previa'
                      )}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="3">
            <Card>
              <CardHeader>
                <CardTitle>Vista Previa de la Nómina</CardTitle>
                <CardDescription>
                  Revisa los cálculos antes de crear la nómina definitiva
                </CardDescription>
              </CardHeader>
              <CardContent>
                {previewData && (
                  <div className="space-y-6">
                    <div className="grid grid-cols-4 gap-4">
                      <Card>
                        <CardContent className="p-4">
                          <p className="text-sm text-muted-foreground">Total Sueldos</p>
                          <p className="text-2xl font-bold">
                            {formatCurrency(previewData.totales.total_sueldos)}
                          </p>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardContent className="p-4">
                          <p className="text-sm text-muted-foreground">Total Bonos</p>
                          <p className="text-2xl font-bold">
                            {formatCurrency(previewData.totales.total_bonos)}
                          </p>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardContent className="p-4">
                          <p className="text-sm text-muted-foreground">Deducciones</p>
                          <p className="text-2xl font-bold">
                            {formatCurrency(previewData.totales.total_deducciones)}
                          </p>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardContent className="p-4">
                          <p className="text-sm text-muted-foreground">Total Neto</p>
                          <p className="text-2xl font-bold text-green-600">
                            {formatCurrency(selectedTotal)}
                          </p>
                        </CardContent>
                      </Card>
                    </div>

                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-12"></TableHead>
                          <TableHead>Empleado</TableHead>
                          <TableHead className="text-right">Sueldo</TableHead>
                          <TableHead className="text-right">Bonos</TableHead>
                          <TableHead className="text-right">Deducciones</TableHead>
                          <TableHead className="text-right">Impuestos</TableHead>
                          <TableHead className="text-right">Neto</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {selectedItems.map((item) => (
                          <TableRow key={item.empleado_id}>
                            <TableCell>
                              <Checkbox
                                checked={item.selected}
                                onCheckedChange={() => toggleItemSelection(item.empleado_id)}
                              />
                            </TableCell>
                            <TableCell className="font-medium">
                              {item.empleado_nombre}
                            </TableCell>
                            <TableCell className="text-right">
                              {formatCurrency(item.sueldo)}
                            </TableCell>
                            <TableCell className="text-right">
                              {formatCurrency(item.bono)}
                            </TableCell>
                            <TableCell className="text-right">
                              {formatCurrency(item.deduccion)}
                            </TableCell>
                            <TableCell className="text-right">
                              {formatCurrency(item.impuestos)}
                            </TableCell>
                            <TableCell className="text-right font-bold">
                              {formatCurrency(item.neto)}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>

                    <div className="flex justify-between pt-4">
                      <Button variant="outline" onClick={() => setCurrentStep(2)}>
                        Anterior
                      </Button>
                      <div className="space-x-2">
                        <Button 
                          variant="outline" 
                          onClick={() => onOpenChange(false)}
                        >
                          Cancelar
                        </Button>
                        <Button 
                          onClick={onConfirm}
                          disabled={createMutation.isPending || selectedItems.filter(i => i.selected).length === 0}
                        >
                          {createMutation.isPending ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Creando...
                            </>
                          ) : (
                            <>
                              <CheckCircle className="mr-2 h-4 w-4" />
                              Crear Nómina
                            </>
                          )}
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {!open && (
          <div className="flex justify-end pt-4">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cerrar
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}