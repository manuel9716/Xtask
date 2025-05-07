import { Briefcase, DollarSign, Clock, Users } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { useDashboardReports } from "../../application/useDashboardReports";
import { Skeleton } from "@/components/ui/skeleton";

interface StatItemProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  description?: string;
  trend?: {
    value: string;
    positive: boolean;
  };
}

function StatItem({ title, value, icon, description, trend }: StatItemProps) {
  return (
    <div className="p-4 bg-white rounded-lg border border-gray-100 hover:shadow-sm transition-shadow">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-gray-500">{title}</p>
          <p className="text-2xl font-bold mt-1">{value}</p>
          {description && (
            <p className="text-xs text-gray-500 mt-1">{description}</p>
          )}
          {trend && (
            <div className="flex items-center mt-1">
              <span
                className={`text-xs font-medium ${
                  trend.positive ? "text-green-600" : "text-red-600"
                }`}
              >
                {trend.positive ? "↑" : "↓"} {trend.value}
              </span>
            </div>
          )}
        </div>
        <div className="p-2 bg-gray-50 rounded-md">{icon}</div>
      </div>
    </div>
  );
}

export function ProcessStats() {
  const { data, isLoading } = useDashboardReports();

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <Card key={index} className="shadow-sm">
            <CardContent className="p-4">
              <div className="flex justify-between items-start">
                <div>
                  <Skeleton className="h-4 w-24 mb-2" />
                  <Skeleton className="h-7 w-16 mb-1" />
                  <Skeleton className="h-3 w-32" />
                </div>
                <Skeleton className="h-10 w-10 rounded" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <StatItem
        title="Proyectos Activos"
        value={data.activeProjects}
        icon={<Briefcase className="h-5 w-5 text-primary-600" />}
        description={`${data.totalProjects} proyectos en total`}
      />
      
      <StatItem
        title="Presupuestos"
        value={data.totalBudgets}
        icon={<DollarSign className="h-5 w-5 text-amber-600" />}
        description={`${data.pendingBudgets} pendientes de aprobación`}
      />
      
      <StatItem
        title="Equipo"
        value={data.totalEmployees}
        icon={<Users className="h-5 w-5 text-indigo-600" />}
        description="Empleados activos"
      />
      
      <StatItem
        title="Transacciones"
        value={data.totalTransactions}
        icon={<Clock className="h-5 w-5 text-green-600" />}
        description="Registradas en el sistema"
      />
    </div>
  );
}