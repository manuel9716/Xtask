import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, BarChart3, AlertTriangle } from "lucide-react";
import { KpiApi } from "../../infrastructure/api/kpiApi";
import { KpiCard } from "../components/KpiCard";
import { BonificacionResumen } from "../components/BonificacionResumen";
import { KpiForm } from "../components/KpiForm";
import { Indicador, EstadoKpi } from "../../domain/entities/Indicador";
import { Bonificacion } from "../../domain/entities/Bonificacion";

const kpiApi = new KpiApi();

/**
 * Vista principal del panel de KPIs
 */
export const PanelKpis: React.FC = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Estado para selección de mes
  const [selectedMonth, setSelectedMonth] = useState(() => {
    // Inicializar con el mes actual
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  });
  
  // Estado para los diálogos
  const [isKpiFormOpen, setIsKpiFormOpen] = useState(false);
  const [isRegisterResultOpen, setIsRegisterResultOpen] = useState(false);
  const [selectedKpi, setSelectedKpi] = useState<Indicador | null>(null);
  const [resultValue, setResultValue] = useState<string>("");
  
  // Estado para el cálculo de bonificación
  const [isBonusDialogOpen, setIsBonusDialogOpen] = useState(false);
  const [salarioBase, setSalarioBase] = useState<string>("1500");
  const [salarioVariable, setSalarioVariable] = useState<string>("500");
  
  // Consultas para obtener KPIs y bonificación
  const {
    data: kpis,
    isLoading: isLoadingKpis,
    error: kpisError
  } = useQuery<Indicador[]>({
    queryKey: ['/api/kpis/mis-kpis', selectedMonth],
    queryFn: () => kpiApi.getKpisByUserAndMonth(0, selectedMonth)
  });
  
  const {
    data: bonificacion,
    isLoading: isLoadingBonificacion
  } = useQuery<Bonificacion | null>({
    queryKey: ['/api/kpis/bonificacion', selectedMonth],
    queryFn: () => kpiApi.getBonificacionByUserAndMonth(selectedMonth),
  });
  
  // Mutaciones
  const createKpiMutation = useMutation({
    mutationFn: (kpi: Omit<Indicador, "id" | "createdAt" | "updatedAt">) => 
      kpiApi.createKpi(kpi),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/kpis/mis-kpis', selectedMonth] });
      setIsKpiFormOpen(false);
      toast({
        title: "KPI creado",
        description: "El indicador se ha creado exitosamente",
      });
    },
    onError: (error) => {
      toast({
        title: "Error al crear KPI",
        description: error.message,
        variant: "destructive",
      });
    }
  });
  
  const registerResultMutation = useMutation({
    mutationFn: ({ id, valor }: { id: number, valor: number }) => 
      kpiApi.evaluarKpi(id, valor),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/kpis/mis-kpis', selectedMonth] });
      setIsRegisterResultOpen(false);
      setSelectedKpi(null);
      toast({
        title: "Resultado registrado",
        description: "El resultado se ha registrado exitosamente",
      });
    },
    onError: (error) => {
      toast({
        title: "Error al registrar resultado",
        description: error.message,
        variant: "destructive",
      });
    }
  });
  
  const calculateBonusMutation = useMutation({
    mutationFn: (data: { mes: string, salarioBase: number, salarioVariable: number }) => 
      kpiApi.calcularBonificacion(data.mes, data.salarioBase, data.salarioVariable),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/kpis/bonificacion', selectedMonth] });
      setIsBonusDialogOpen(false);
      toast({
        title: "Bonificación calculada",
        description: "La bonificación se ha calculado exitosamente",
      });
    },
    onError: (error) => {
      toast({
        title: "Error al calcular bonificación",
        description: error.message,
        variant: "destructive",
      });
    }
  });
  
  // Handlers
  const handleCreateKpi = (data: any) => {
    createKpiMutation.mutate({
      userId: 0, // El ID real se asigna en el servidor
      descripcion: data.descripcion,
      formula: data.formula,
      valorEsperado: data.valorEsperado,
      porcentajePeso: data.porcentajePeso,
      mes: data.mes,
      estado: EstadoKpi.PENDIENTE
    });
  };
  
  const handleOpenRegisterResult = (kpi: Indicador) => {
    setSelectedKpi(kpi);
    setResultValue(kpi.valorObtenido?.toString() || "");
    setIsRegisterResultOpen(true);
  };
  
  const handleRegisterResult = () => {
    if (!selectedKpi) return;
    
    const valor = parseFloat(resultValue);
    if (isNaN(valor)) {
      toast({
        title: "Valor inválido",
        description: "Por favor ingrese un número válido",
        variant: "destructive",
      });
      return;
    }
    
    registerResultMutation.mutate({ 
      id: selectedKpi.id as number, 
      valor: valor 
    });
  };
  
  const handleCalculateBonus = () => {
    const base = parseFloat(salarioBase);
    const variable = parseFloat(salarioVariable);
    
    if (isNaN(base) || isNaN(variable)) {
      toast({
        title: "Valores inválidos",
        description: "Por favor ingrese números válidos para los salarios",
        variant: "destructive",
      });
      return;
    }
    
    calculateBonusMutation.mutate({
      mes: selectedMonth,
      salarioBase: base,
      salarioVariable: variable
    });
  };
  
  // Generar opciones de meses para el selector
  const getMonthOptions = () => {
    const options = [];
    const today = new Date();
    
    // Añadir mes actual y 11 meses anteriores
    for (let i = 0; i < 12; i++) {
      const date = new Date(today.getFullYear(), today.getMonth() - i, 1);
      const value = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      const label = date.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' });
      
      options.push({ value, label });
    }
    
    return options;
  };
  
  // Verificar si podemos calcular la bonificación (todos los KPIs tienen resultados)
  const canCalculateBonus = () => {
    if (!kpis || kpis.length === 0) return false;
    return !kpis.some(kpi => kpi.valorObtenido === undefined);
  };
  
  return (
    <div className="container py-6 space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Panel de KPIs</h1>
          <p className="text-muted-foreground">
            Gestiona tus indicadores de desempeño y bonificaciones mensuales
          </p>
        </div>
        
        <div className="flex gap-2">
          <Select
            value={selectedMonth}
            onValueChange={setSelectedMonth}
          >
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Seleccionar mes" />
            </SelectTrigger>
            <SelectContent>
              {getMonthOptions().map(option => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Button onClick={() => setIsKpiFormOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Nuevo KPI
          </Button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="col-span-1 md:col-span-2">
          <Tabs defaultValue="todos">
            <TabsList className="mb-4">
              <TabsTrigger value="todos">Todos los KPIs</TabsTrigger>
              <TabsTrigger value="pendientes">Pendientes</TabsTrigger>
              <TabsTrigger value="cumplidos">Cumplidos</TabsTrigger>
            </TabsList>
            
            <TabsContent value="todos" className="space-y-4">
              {isLoadingKpis ? (
                <div className="flex justify-center py-12">
                  <div className="animate-spin w-12 h-12 border-t-2 border-b-2 border-primary rounded-full"></div>
                </div>
              ) : kpis && kpis.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {kpis.map(kpi => (
                    <KpiCard
                      key={kpi.id}
                      kpi={kpi}
                      onRegisterResult={() => handleOpenRegisterResult(kpi)}
                    />
                  ))}
                </div>
              ) : (
                <Card>
                  <CardContent className="py-10 text-center">
                    <p className="text-muted-foreground">
                      No hay KPIs definidos para este mes.
                    </p>
                    <Button 
                      variant="outline" 
                      onClick={() => setIsKpiFormOpen(true)}
                      className="mt-4"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Crear Primer KPI
                    </Button>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
            
            <TabsContent value="pendientes" className="space-y-4">
              {isLoadingKpis ? (
                <div className="flex justify-center py-12">
                  <div className="animate-spin w-12 h-12 border-t-2 border-b-2 border-primary rounded-full"></div>
                </div>
              ) : kpis && kpis.filter(k => k.estado === EstadoKpi.PENDIENTE).length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {kpis
                    .filter(k => k.estado === EstadoKpi.PENDIENTE)
                    .map(kpi => (
                      <KpiCard
                        key={kpi.id}
                        kpi={kpi}
                        onRegisterResult={() => handleOpenRegisterResult(kpi)}
                      />
                    ))}
                </div>
              ) : (
                <Card>
                  <CardContent className="py-10 text-center">
                    <p className="text-muted-foreground">
                      No hay KPIs pendientes para este mes.
                    </p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
            
            <TabsContent value="cumplidos" className="space-y-4">
              {isLoadingKpis ? (
                <div className="flex justify-center py-12">
                  <div className="animate-spin w-12 h-12 border-t-2 border-b-2 border-primary rounded-full"></div>
                </div>
              ) : kpis && kpis.filter(k => k.estado === EstadoKpi.CUMPLIDO).length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {kpis
                    .filter(k => k.estado === EstadoKpi.CUMPLIDO)
                    .map(kpi => (
                      <KpiCard
                        key={kpi.id}
                        kpi={kpi}
                      />
                    ))}
                </div>
              ) : (
                <Card>
                  <CardContent className="py-10 text-center">
                    <p className="text-muted-foreground">
                      No hay KPIs cumplidos para este mes.
                    </p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
          </Tabs>
        </div>
        
        <div>
          <BonificacionResumen 
            bonificacion={bonificacion ?? undefined}
            isLoading={isLoadingBonificacion}
            onCalcular={() => setIsBonusDialogOpen(true)}
            canCalculate={canCalculateBonus()}
            mesActual={selectedMonth}
          />
          
          {kpis && kpis.length > 0 && !canCalculateBonus() && (
            <Card className="mt-4 bg-amber-50 border-amber-200">
              <CardContent className="py-4">
                <div className="flex items-start space-x-2">
                  <AlertTriangle className="h-5 w-5 text-amber-600 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-amber-800">
                      Acción requerida
                    </p>
                    <p className="text-xs text-amber-700 mt-1">
                      Para calcular tu bonificación, debes registrar 
                      los resultados de todos tus KPIs.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
      
      {/* Modal para crear nuevo KPI */}
      <Sheet 
        open={isKpiFormOpen}
        onOpenChange={setIsKpiFormOpen}
      >
        <SheetContent className="w-full sm:max-w-2xl overflow-y-auto">
          <SheetHeader>
            <SheetTitle>Crear Nuevo KPI</SheetTitle>
            <SheetDescription>
              Define un nuevo indicador para medir tu desempeño
            </SheetDescription>
          </SheetHeader>
          
          <div className="mt-6">
            <KpiForm 
              onSubmit={handleCreateKpi}
              onCancel={() => setIsKpiFormOpen(false)}
              isLoading={createKpiMutation.isPending}
              defaultValues={{ mes: selectedMonth }}
            />
          </div>
        </SheetContent>
      </Sheet>
      
      {/* Diálogo para registrar resultado */}
      <Dialog 
        open={isRegisterResultOpen}
        onOpenChange={setIsRegisterResultOpen}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Registrar Resultado</DialogTitle>
            <DialogDescription>
              Ingresa el valor obtenido para el indicador: {selectedKpi?.descripcion}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="valor-esperado">Meta establecida</Label>
              <Input
                id="valor-esperado"
                value={selectedKpi?.valorEsperado}
                readOnly
                disabled
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="valor-obtenido">Resultado obtenido</Label>
              <Input
                id="valor-obtenido"
                value={resultValue}
                onChange={(e) => setResultValue(e.target.value)}
                type="number"
                step="0.01"
                placeholder="Ingresa el valor obtenido"
              />
            </div>
          </div>
          
          <div className="flex justify-end space-x-2">
            <Button 
              variant="outline" 
              onClick={() => setIsRegisterResultOpen(false)}
              disabled={registerResultMutation.isPending}
            >
              Cancelar
            </Button>
            <Button 
              onClick={handleRegisterResult}
              disabled={registerResultMutation.isPending}
            >
              {registerResultMutation.isPending ? 'Guardando...' : 'Guardar'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
      
      {/* Diálogo para calcular bonificación */}
      <Dialog 
        open={isBonusDialogOpen}
        onOpenChange={setIsBonusDialogOpen}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Calcular Bonificación</DialogTitle>
            <DialogDescription>
              Ingresa los datos salariales para calcular tu bonificación
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="salario-base">Salario base</Label>
              <Input
                id="salario-base"
                value={salarioBase}
                onChange={(e) => setSalarioBase(e.target.value)}
                type="number"
                step="0.01"
                placeholder="Ingresa tu salario base"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="salario-variable">Salario variable</Label>
              <Input
                id="salario-variable"
                value={salarioVariable}
                onChange={(e) => setSalarioVariable(e.target.value)}
                type="number"
                step="0.01"
                placeholder="Ingresa tu salario variable"
              />
              <p className="text-xs text-muted-foreground">
                Este es el monto máximo de bonificación que puedes recibir con un 100% de cumplimiento.
              </p>
            </div>
          </div>
          
          <div className="flex justify-end space-x-2">
            <Button 
              variant="outline" 
              onClick={() => setIsBonusDialogOpen(false)}
              disabled={calculateBonusMutation.isPending}
            >
              Cancelar
            </Button>
            <Button 
              onClick={handleCalculateBonus}
              disabled={calculateBonusMutation.isPending}
            >
              {calculateBonusMutation.isPending ? 'Calculando...' : 'Calcular'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PanelKpis;