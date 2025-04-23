import { Briefcase, DollarSign, Clock, Users } from "lucide-react";
import { StatCard } from "@/components/stat-card";
import { ProjectsTable } from "@/components/projects-table";
import { KanbanBoard } from "@/components/kanban-board";
import { FinancialSummary } from "@/components/financial-summary";
import { TeamMembers } from "@/components/team-members";
import { RecentTransactions } from "@/components/recent-transactions";
import { useAuth } from "@/hooks/use-auth";

export default function Dashboard() {
  const { user } = useAuth();
  
  return (
    <div className="space-y-6">
      {/* Dashboard Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-heading font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-500">Welcome back, {user?.fullName || 'User'}! Here's what's happening with your projects today.</p>
      </div>

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard
          title="Active Projects"
          value="12"
          icon={Briefcase}
          iconColor="text-primary-600"
          iconBgColor="bg-primary-100"
          change={{ value: "8.2%", isPositive: true, text: "from last month" }}
        />
        
        <StatCard
          title="Total Budget"
          value="$428,500"
          icon={DollarSign}
          iconColor="text-orange-600"
          iconBgColor="bg-orange-100"
          change={{ value: "12.5%", isPositive: true, text: "from last month" }}
        />
        
        <StatCard
          title="Pending Approvals"
          value="8"
          icon={Clock}
          iconColor="text-amber-600"
          iconBgColor="bg-amber-100"
          change={{ value: "4.3%", isPositive: false, text: "from last week" }}
        />
        
        <StatCard
          title="Team Members"
          value="24"
          icon={Users}
          iconColor="text-indigo-600"
          iconBgColor="bg-indigo-100"
          change={{ value: "2.1%", isPositive: true, text: "from last month" }}
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
    </div>
  );
}
