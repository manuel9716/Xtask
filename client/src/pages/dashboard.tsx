import { Briefcase, DollarSign, Clock, Users, Activity } from "lucide-react";
import { StatCard } from "@/components/stat-card";
import { ProjectsTable } from "@/components/projects-table";
import { KanbanBoard } from "@/components/kanban-board";
import { FinancialSummary } from "@/components/financial-summary";
import { TeamMembers } from "@/components/team-members";
import { RecentTransactions } from "@/components/recent-transactions";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ProcessReport } from "@/modules/dashboard/ui/components/ProcessReport";
import { ProcessStats } from "@/modules/dashboard/ui/components/ProcessStats";
import { ProcessChart } from "@/modules/dashboard/ui/components/ProcessChart";
import ActivityFeed from "@/modules/dashboard/ui/components/ActivityFeed";

export default function Dashboard() {
  return (
    <div className="space-y-6">
      {/* Dashboard Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-heading font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-500">¡Bienvenido a XTask! Aquí está todo lo que sucede con tus procesos hoy.</p>
      </div>
      
      {/* Dashboard Tabs */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="bg-muted/50 p-1">
          <TabsTrigger value="overview">Vista General</TabsTrigger>
          <TabsTrigger value="reports">Reportes de Procesos</TabsTrigger>
          <TabsTrigger value="activity">
            <Activity className="mr-2 h-4 w-4" />
            Mi Actividad
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="space-y-6">
          {/* KPI Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <StatCard
              title="Proyectos Activos"
              value="12"
              icon={Briefcase}
              iconColor="text-primary-600"
              iconBgColor="bg-primary-100"
              change={{ value: "8.2%", isPositive: true, text: "desde el mes pasado" }}
            />
            
            <StatCard
              title="Presupuesto Total"
              value="$428,500"
              icon={DollarSign}
              iconColor="text-orange-600"
              iconBgColor="bg-orange-100"
              change={{ value: "12.5%", isPositive: true, text: "desde el mes pasado" }}
            />
            
            <StatCard
              title="Aprobaciones Pendientes"
              value="8"
              icon={Clock}
              iconColor="text-amber-600"
              iconBgColor="bg-amber-100"
              change={{ value: "4.3%", isPositive: false, text: "desde la semana pasada" }}
            />
            
            <StatCard
              title="Miembros del Equipo"
              value="24"
              icon={Users}
              iconColor="text-indigo-600"
              iconBgColor="bg-indigo-100"
              change={{ value: "2.1%", isPositive: true, text: "desde el mes pasado" }}
            />
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column - Projects & Tasks */}
            <div className="lg:col-span-2 space-y-6">
              <ProjectsTable limit={4} />
              <KanbanBoard />
            </div>

            {/* Right Column - Financial & Team */}
            <div className="space-y-6">
              <FinancialSummary />
              <TeamMembers limit={4} />
              <RecentTransactions limit={4} />
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="reports" className="space-y-6">
          {/* Estadísticas de procesos */}
          <ProcessStats />
          
          {/* Reporte de procesos */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Listado y datos */}
            <div className="lg:col-span-2">
              <ProcessReport />
            </div>
            
            {/* Gráficos */}
            <div>
              <ProcessChart />
            </div>
          </div>
          
          {/* Vista de proyectos relacionada */}
          <ProjectsTable limit={4} />
        </TabsContent>
        
        {/* Contenido de Actividad */}
        <TabsContent value="activity" className="space-y-6">
          <div className="grid grid-cols-1 gap-6">
            <ActivityFeed />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
