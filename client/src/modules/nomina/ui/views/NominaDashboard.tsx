import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar, CalendarDays, Users, DollarSign, TrendingUp, Plus, Filter, Download, UserPlus } from "lucide-react";
import { KpiCard } from "../components/KpiCard";
import { Timeline } from "../components/Timeline";
import { EmpleadosList } from "../../components/EmpleadosList";
import { GastosPorProyectoChart } from "../components/GastosPorProyectoChart";
import { SueldosVsBonosChart } from "../components/SueldosVsBonosChart";
import { HistoricoChart } from "../components/HistoricoChart";
import { NewEmployeeModal } from "../../components/NewEmployeeModal";
import { CreatePayrollWizard } from "../../components/CreatePayrollWizard";
import { apiRequest } from "@/lib/queryClient";

interface DashboardData {
  kpis: {
    empleadosActivos: number;
    nominaMensual: number;
    bonificacionesMes: number;
    porcentajePagadas: number;
    proximaFechaPago: Date | null;
  };
  timeline: Array<{
    id: number;
    fecha: Date;
    descripcion: string;
    estado: 'pagado' | 'pendiente' | 'retrasado';
    monto: number;
    proyecto?: string;
  }>;
  charts: {
    gastoPorProyecto: Array<{ proyecto: string; monto: number }>;
    sueldosVsBonos: Array<{ name: string; value: number }>;
    historico6Meses: Array<{ mes: string; sueldos: number; bonos: number }>;
  };
  calendar: Array<{ fecha: Date; tipo: string; descripcion: string }>;
  nominasRecientes: any[];
  empleados: Array<{
    id: number;
    nombre: string;
    apellido: string;
    identificacion: string;
    depto: string;
    cargo: string;
    fecha_ingreso: string;
    estado_contrato: string;
    tipo_contrato: string;
    telefono?: string;
    direccion?: string;
    contacto_emergencia?: string;
    nomina?: {
      sueldo_base: number;
      frecuencia_pago: string;
      metodo_pago: string;
    };
    proyectos?: Array<{
      id: number;
      nombre: string;
      descripcion: string;
    }>;
  }>;
}

export default function NominaDashboard() {
  const [filtros, setFiltros] = useState({
    proyectoId: "",
    empleadoId: "",
    from: "",
    to: ""
  });
  const [showNewEmployeeModal, setShowNewEmployeeModal] = useState(false);
  const [showCreatePayrollWizard, setShowCreatePayrollWizard] = useState(false);
  const queryClient = useQueryClient();

  const { data: dashboardData, isLoading, error } = useQuery<DashboardData>({
    queryKey: ['/api/nomina-modulo/dashboard', filtros],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filtros.proyectoId) params.append('proyectoId', filtros.proyectoId);
      if (filtros.empleadoId) params.append('empleadoId', filtros.empleadoId);
      if (filtros.from) params.append('from', filtros.from);
      if (filtros.to) params.append('to', filtros.to);
      
      const res = await apiRequest('GET', `/api/nomina-modulo/dashboard?${params.toString()}`);
      return res.json();
    }
  });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(amount);
  };

  // Función para recargar el dashboard después de crear un empleado
  const handleEmployeeCreated = () => {
    queryClient.invalidateQueries({ queryKey: ['/api/nomina-modulo/dashboard'] });
    setShowNewEmployeeModal(false);
  };

  // Verificar si hay datos para mostrar
  const hasEmployees = (dashboardData?.kpis?.empleadosActivos || 0) > 0;
  const hasTimelineData = (dashboardData?.timeline || []).length > 0;
  const hasChartData = (dashboardData?.charts?.historico6Meses || []).length > 0;
  const empleados = dashboardData?.empleados || [];

  if (isLoading) {
    return (
      <div className="flex-1 space-y-4 p-8 pt-6">
        <div className="flex items-center justify-between space-y-2">
          <h2 className="text-3xl font-bold tracking-tight">Módulo de Nómina</h2>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <div className="h-4 w-20 bg-muted rounded animate-pulse" />
                <div className="h-4 w-4 bg-muted rounded animate-pulse" />
              </CardHeader>
              <CardContent>
                <div className="h-8 w-24 bg-muted rounded animate-pulse mb-2" />
                <div className="h-3 w-32 bg-muted rounded animate-pulse" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex-1 space-y-4 p-8 pt-6">
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <h3 className="text-lg font-semibold">Error al cargar los datos</h3>
            <p className="text-muted-foreground">Por favor, intenta nuevamente</p>
          </div>
        </div>
      </div>
    );
  }

  const kpis = dashboardData?.kpis;
  const timeline = (dashboardData?.timeline || []).map(item => ({
    ...item,
    fecha: new Date(item.fecha)
  }));
  const charts = dashboardData?.charts;

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      {/* Header */}
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Módulo de Nómina</h2>
        <div className="flex items-center space-x-2">
          <Button 
            size="sm" 
            variant="outline"
            onClick={() => setShowNewEmployeeModal(true)}
          >
            <UserPlus className="mr-2 h-4 w-4" />
            Nuevo Empleado
          </Button>
          <Button 
            size="sm"
            onClick={() => setShowCreatePayrollWizard(true)}
          >
            <Plus className="mr-2 h-4 w-4" />
            Crear Nómina
          </Button>
          <Button variant="outline" size="sm">
            <Download className="mr-2 h-4 w-4" />
            Exportar
          </Button>
        </div>
      </div>

      {/* Filtros */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Filter className="mr-2 h-5 w-5" />
            Filtros
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Proyecto</label>
              <Select value={filtros.proyectoId || "all"} onValueChange={(value) => setFiltros(prev => ({...prev, proyectoId: value === "all" ? "" : value}))}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar proyecto" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los proyectos</SelectItem>
                  {/* Los proyectos se cargarán dinámicamente desde la API cuando existan */}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Empleado</label>
              <Select value={filtros.empleadoId || "all"} onValueChange={(value) => setFiltros(prev => ({...prev, empleadoId: value === "all" ? "" : value}))}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar empleado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los empleados</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Fecha desde</label>
              <Input 
                type="date" 
                value={filtros.from} 
                onChange={(e) => setFiltros(prev => ({...prev, from: e.target.value}))}
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Fecha hasta</label>
              <Input 
                type="date" 
                value={filtros.to} 
                onChange={(e) => setFiltros(prev => ({...prev, to: e.target.value}))}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* KPIs */}
      {!hasEmployees ? (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-8">
              <Users className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No hay empleados registrados</h3>
              <p className="text-muted-foreground mb-4">
                Los datos de KPIs aparecerán cuando se agreguen empleados al sistema.
              </p>
              <Button onClick={() => setShowNewEmployeeModal(true)}>
                <UserPlus className="mr-2 h-4 w-4" />
                Registrar Primer Empleado
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <KpiCard
            title="Empleados Activos"
            value={kpis?.empleadosActivos || 0}
            icon={<Users className="h-4 w-4" />}
            subtitle="Personal activo"
          />
          <KpiCard
            title="Nómina Mensual"
            value={formatCurrency(kpis?.nominaMensual || 0)}
            icon={<DollarSign className="h-4 w-4" />}
            subtitle="Total mes actual"
          />
          <KpiCard
            title="Bonificaciones"
            value={formatCurrency(kpis?.bonificacionesMes || 0)}
            icon={<TrendingUp className="h-4 w-4" />}
            subtitle="Bonos del mes"
          />
          <KpiCard
            title="Pagos Procesados"
            value={`${kpis?.porcentajePagadas || 0}%`}
            icon={<CalendarDays className="h-4 w-4" />}
            subtitle="Del total programado"
          />
        </div>
      )}

      {/* Sección de Empleados */}
      <div className="w-full">
        <EmpleadosList empleados={empleados} isLoading={isLoading} />
      </div>

      {/* Gráficos inferiores */}
      {charts && (
        <div className="grid gap-4 md:grid-cols-2">
          <SueldosVsBonosChart data={charts.sueldosVsBonos} />
          <HistoricoChart data={charts.historico6Meses} />
        </div>
      )}

      {/* Modales */}
      <NewEmployeeModal 
        open={showNewEmployeeModal} 
        onOpenChange={setShowNewEmployeeModal}
        onEmployeeCreated={handleEmployeeCreated}
      />
      <CreatePayrollWizard 
        open={showCreatePayrollWizard} 
        onOpenChange={setShowCreatePayrollWizard} 
      />
    </div>
  );
}